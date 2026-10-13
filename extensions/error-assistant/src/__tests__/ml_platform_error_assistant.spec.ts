import { ServerConnection } from '@jupyterlab/services';

import { applyFixToCellModel } from '../fix-utils';
import { buildFullPreprocessingCode } from '../preprocessing-code-utils';
import {
  IAdvisorModelCode,
  applyTunedModelCode,
  removeModelAdvisorRaiseGuards,
  resetTunedModelCode
} from '../model-code-utils';
import { requestAPI } from '../request';

describe('@ml-platform/error-assistant', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the Jupyter base URL and returns the server JSON response', async () => {
    const settings = { baseUrl: '/user/test/' } as ServerConnection.ISettings;
    const response = {
      ok: true,
      text: async () => JSON.stringify({ status: 'ok' })
    } as Response;
    const makeRequest = jest
      .spyOn(ServerConnection, 'makeRequest')
      .mockResolvedValue(response);

    await expect(requestAPI('api/health', settings)).resolves.toEqual({
      status: 'ok'
    });
    expect(makeRequest).toHaveBeenCalledWith(
      '/user/test/api/health',
      {},
      settings
    );
  });

  it('writes the suggested code through the cell shared model', () => {
    const setSource = jest.fn();
    const model = { sharedModel: { setSource } };

    expect(applyFixToCellModel(model, 'import matplotlib.pyplot as plt')).toBe(
      true
    );
    expect(setSource).toHaveBeenCalledWith('import matplotlib.pyplot as plt');
  });

  it('rejects a missing cell model or empty code suggestion', () => {
    expect(applyFixToCellModel(null, 'print(1)')).toBe(false);
    expect(
      applyFixToCellModel({ sharedModel: { setSource: jest.fn() } }, ' ')
    ).toBe(false);
  });

  it('loads the selected dataset directly and inserts readable preprocessing code', () => {
    const code = buildFullPreprocessingCode(
      '/workspace/customer data.csv',
      {
        feature: 'Annual Income',
        feature_type: 'numerical',
        missing_count: 2,
        missing_pct: 10,
        missing_severity: 'low',
        unique_count: 18,
        imputation_strategy: 'median',
        recommended_action: 'Fill missing values',
        explanation: 'Use the median.',
        example_code: ''
      },
      'median'
    );

    expect(code).toContain('df = pd.read_csv("/workspace/customer data.csv")');
    expect(code).toContain(
      'df["Annual Income"] = df["Annual Income"].fillna(df["Annual Income"].median())'
    );
    expect(code).not.toMatch(/^\s*raise\s+(?:ValueError|NameError)\b/m);
    expect(code).not.toContain('_mm_available');
  });

  it('removes generated Model Advisor raise guards but keeps normal code', () => {
    const code = [
      'if missing_columns:',
      '    raise ValueError("Missing columns: " + str(missing_columns))',
      '',
      'if len(df) < 10:',
      '    raise ValueError("At least 10 target-complete rows are required.")',
      '',
      'if not np.isfinite(y.to_numpy(dtype=float)).all():',
      '    raise ValueError(',
      '        "Regression targets must be finite numbers."',
      '    )',
      '',
      'if len(target_encoder.classes_) < 2:',
      '    raise ValueError("Classification needs at least two classes.")',
      '',
      'if _modelmind_importlib.find_spec("xgboost") is None:',
      '    raise ImportError(',
      '        "XGBoost is unavailable in this kernel."',
      '    )',
      '',
      'y = pd.to_numeric(y, errors="raise")',
      'pipeline.fit(X_train, y_train)'
    ].join('\n');

    const result = removeModelAdvisorRaiseGuards(code);

    expect(result).not.toMatch(/^\s*raise\b/m);
    expect(result).not.toContain('if missing_columns:');
    expect(result).not.toContain('if len(df) < 10:');
    expect(result).not.toContain('if not np.isfinite');
    expect(result).not.toContain('if len(target_encoder.classes_) < 2:');
    expect(result).not.toContain('if _modelmind_importlib.find_spec');
    expect(result).toContain('y = pd.to_numeric(y, errors="raise")');
    expect(result).toContain('pipeline.fit(X_train, y_train)');
  });

  it('preserves baseline code and stores tuned code in tuned_code', () => {
    const refreshCode = jest.fn();
    const models: IAdvisorModelCode[] = [
      {
        name: 'Linear SVM',
        code: 'LinearSVC(max_iter=3000)',
        defaultCode: 'LinearSVC(max_iter=3000)',
        refreshCode
      }
    ];
    const tunedCode = 'LinearSVC(C=0.01, class_weight="balanced")';

    expect(
      applyTunedModelCode(models, [
        { model: 'Linear SVM', code: tunedCode }
      ])
    ).toEqual({ updated: 1, errors: [] });
    // Baseline code must be preserved for "Insert into Notebook"
    expect(models[0].code).toBe('LinearSVC(max_iter=3000)');
    expect(models[0].tuned_code).toBe(tunedCode);
    expect(models[0].tuned_configuration_applied).toBe(true);
    expect(refreshCode).toHaveBeenCalledTimes(1);

    resetTunedModelCode(models);
    expect(models[0].code).toBe('LinearSVC(max_iter=3000)');
    expect(models[0].tuned_code).toBeUndefined();
    expect(models[0].tuned_configuration_applied).toBe(false);
    expect(refreshCode).toHaveBeenCalledTimes(2);
  });
});
