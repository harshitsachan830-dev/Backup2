import type { PreprocessingRec } from './modelmind-studio';

export function buildDatasetLoadingCode(selectedPath: string): string {
  const datasetPath = JSON.stringify(selectedPath);
  const extension = selectedPath
    .split(/[?#]/, 1)[0]
    .split('.')
    .pop()
    ?.toLowerCase();
  const reader =
    extension === 'xlsx' || extension === 'xls'
      ? 'read_excel'
      : extension === 'json'
        ? 'read_json'
        : 'read_csv';

  return [
    'import pandas as pd',
    '',
    `df = pd.${reader}(${datasetPath})`,
    'print(f"Loaded dataset: {df.shape[0]} rows × {df.shape[1]} columns")'
  ].join('\n');
}

export function buildFullPreprocessingCode(
  selectedPath: string,
  rec: PreprocessingRec,
  selectedStrategy: string,
  recommendedCode?: string
): string {
  if (recommendedCode?.trim()) {
    return [
      '# Recommended preprocessing workflow for the selected skill level',
      buildDatasetLoadingCode(selectedPath),
      '',
      recommendedCode.trim()
    ].join('\n');
  }

  const imports = new Set(['import pandas as pd']);
  let strategy = selectedStrategy;
  if (strategy === 'most_frequent_or_unknown') {
    strategy = 'most_frequent';
  }

  const featureName = JSON.stringify(rec.feature);
  const featureAccess = `df[${featureName}]`;
  let operation: string;
  switch (strategy) {
    case 'mean':
    case 'median':
      operation = [
        `${featureAccess} = pd.to_numeric(${featureAccess}, errors="coerce")`,
        `${featureAccess} = ${featureAccess}.fillna(${featureAccess}.${strategy}())`
      ].join('\n');
      break;
    case 'most_frequent':
      operation = [
        `mode = ${featureAccess}.mode(dropna=True)`,
        `fill_value = mode.iloc[0] if not mode.empty else "Unknown"`,
        `${featureAccess} = ${featureAccess}.fillna(fill_value)`
      ].join('\n');
      break;
    case 'unknown':
      operation = `${featureAccess} = ${featureAccess}.fillna("Unknown")`;
      break;
    case 'constant':
      operation = [
        ...(rec.feature_type === 'numerical'
          ? [
              `${featureAccess} = pd.to_numeric(${featureAccess}, errors="coerce")`
            ]
          : []),
        `${featureAccess} = ${featureAccess}.fillna(${rec.feature_type === 'numerical' ? '0' : '"Unknown"'})`
      ].join('\n');
      break;
    case 'drop_column':
      operation = `df = df.drop(columns=[${featureName}])`;
      break;
    case 'standard_scaler':
    case 'minmax_scaler':
    case 'robust_scaler': {
      const scaler = {
        standard_scaler: 'StandardScaler',
        minmax_scaler: 'MinMaxScaler',
        robust_scaler: 'RobustScaler'
      }[strategy];
      imports.add(`from sklearn.preprocessing import ${scaler}`);
      operation = [
        `${featureAccess} = pd.to_numeric(${featureAccess}, errors="coerce")`,
        `${featureAccess} = ${featureAccess}.fillna(${featureAccess}.median())`,
        `df[[${featureName}]] = ${scaler}().fit_transform(df[[${featureName}]])`
      ].join('\n');
      break;
    }
    case 'cap_outliers_iqr':
      operation = [
        `${featureAccess} = pd.to_numeric(${featureAccess}, errors="coerce")`,
        `q1 = ${featureAccess}.quantile(0.25)`,
        `q3 = ${featureAccess}.quantile(0.75)`,
        'iqr = q3 - q1',
        `${featureAccess} = ${featureAccess}.clip(lower=q1 - 1.5 * iqr, upper=q3 + 1.5 * iqr)`
      ].join('\n');
      break;
    case 'one_hot_encode':
      operation = [
        `${featureAccess} = ${featureAccess}.fillna("Unknown")`,
        `df = pd.get_dummies(df, columns=[${featureName}], prefix=[${featureName}], dtype=int)`
      ].join('\n');
      break;
    case 'ordinal_encode':
      operation = `${featureAccess} = ${featureAccess}.fillna("Unknown").astype("category").cat.codes`;
      break;
    case 'frequency_encode':
      operation = [
        `${featureAccess} = ${featureAccess}.fillna("Unknown")`,
        `frequencies = ${featureAccess}.value_counts(normalize=True)`,
        `${featureAccess} = ${featureAccess}.map(frequencies)`
      ].join('\n');
      break;
    default:
      operation = `# No transformation is needed for ${featureName}.`;
  }

  return [
    '# Complete preprocessing workflow for the analyzed dataset',
    ...Array.from(imports),
    '',
    `df = pd.${getDatasetReader(selectedPath)}(${JSON.stringify(selectedPath)})`,
    'print(f"Loaded dataset: {df.shape[0]} rows × {df.shape[1]} columns")',
    '',
    '# Apply preprocessing only to the selected column',
    operation,
    '',
    '# Check the result',
    'print(f"Dataset shape after preprocessing: {df.shape}")',
    `print("Missing values remaining in " + ${featureName} + ": " + str(${featureAccess}.isna().sum()) if ${featureName} in df.columns else "Selected column was dropped.")`,
    '',
    '# Preview only the selected column or its encoded output columns',
    ...(strategy === 'one_hot_encode'
      ? [
          `print(df.loc[:, [column for column in df.columns if column == ${featureName} or column.startswith(${JSON.stringify(`${rec.feature}_`)})]].head())`
        ]
      : strategy === 'drop_column'
        ? ['print("Selected column was dropped as requested.")']
        : [`print(df[[${featureName}]].head())`])
  ].join('\n');
}

function getDatasetReader(selectedPath: string): string {
  const extension = selectedPath
    .split(/[?#]/, 1)[0]
    .split('.')
    .pop()
    ?.toLowerCase();
  return extension === 'xlsx' || extension === 'xls'
    ? 'read_excel'
    : extension === 'json'
      ? 'read_json'
      : 'read_csv';
}
