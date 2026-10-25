import { ServerConnection } from '@jupyterlab/services';

import { applyFixToCellModel } from '../fix-utils';
import { buildFullPreprocessingCode } from '../preprocessing-code-utils';
import {
  IAdvisorModelCode,
  applyTunedModelCode,
  removeModelAdvisorRaiseGuards,
  resetTunedModelCode
} from '../model-code-utils';
import { buildMeasuredModelExplanation } from '../model-advisor-explanations';
import { explainTuningParameter } from '../tuning-explanations';
import { requestAPI } from '../request';
import {
  canUseNotebookCodeAction,
  getModelMindNotebookRole,
  MODEL_MIND_NOTEBOOK_TYPE
} from '../notebook-mode';

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

  it('detects notebook roles and limits Trainer code actions to preview', () => {
    const trainerModel = {
      getMetadata: jest.fn((key: string) =>
        key === MODEL_MIND_NOTEBOOK_TYPE ? 'trainer' : undefined
      )
    };
    const modelMindModel = {
      getMetadata: jest.fn(() => undefined)
    };

    expect(getModelMindNotebookRole(trainerModel)).toBe('trainer');
    expect(getModelMindNotebookRole(modelMindModel)).toBe('modelmind');
    expect(getModelMindNotebookRole()).toBe('modelmind');

    expect(canUseNotebookCodeAction('trainer', 'preview')).toBe(true);
    expect(canUseNotebookCodeAction('trainer', 'copy')).toBe(false);
    expect(canUseNotebookCodeAction('trainer', 'insert')).toBe(false);
    expect(canUseNotebookCodeAction('modelmind', 'preview')).toBe(true);
    expect(canUseNotebookCodeAction('modelmind', 'copy')).toBe(true);
    expect(canUseNotebookCodeAction('modelmind', 'insert')).toBe(true);
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

  it('uses the selected skill-level preprocessing example for code actions', () => {
    const code = buildFullPreprocessingCode(
      '/workspace/students.csv',
      {
        feature: 'city',
        feature_type: 'categorical',
        missing_count: 2,
        missing_pct: 10,
        missing_severity: 'low',
        unique_count: 4,
        imputation_strategy: 'most_frequent_or_unknown',
        recommended_action: 'Fill missing values and encode categories',
        explanation: 'Use one-hot encoding.',
        example_code: ''
      },
      'most_frequent',
      'df = pd.get_dummies(df, columns=["city"], drop_first=True)'
    );

    expect(code).toContain('df = pd.read_csv("/workspace/students.csv")');
    expect(code).toContain(
      'df = pd.get_dummies(df, columns=["city"], drop_first=True)'
    );
    expect(code).not.toContain('fillna(fill_value)');
  });

  it('explains model-specific rationale using the measured CV result', () => {
    const extraTrees = buildMeasuredModelExplanation({
      name: 'Extra Trees',
      task: 'classification',
      metric: 'Balanced accuracy',
      score: 0.7613,
      scoreStd: 0.0249,
      rank: 2,
      finalistCount: 5,
      candidateCount: 12,
      cvFolds: 3
    });
    const decisionTree = buildMeasuredModelExplanation({
      name: 'Decision Tree',
      task: 'classification',
      metric: 'Balanced accuracy',
      score: 0.72,
      rank: 3,
      finalistCount: 5,
      cvFolds: 3
    });

    expect(extraTrees.why).toContain('extra-randomized split thresholds');
    expect(extraTrees.why).toContain(
      '#2 of 5 successfully evaluated finalists'
    );
    expect(extraTrees.why).toContain('76.13%');
    expect(extraTrees.why).toContain('2.49 percentage points');
    expect(extraTrees.why).toContain('12 screened candidates');
    expect(extraTrees.why).toContain('not a promise');
    expect(decisionTree.why).toContain('if/then splits');
    expect(decisionTree.why).not.toBe(extraTrees.why);
  });

  it('explains selected tuning parameters and supports unlisted settings', () => {
    expect(explainTuningParameter('max_depth')).toContain(
      'complexity of learned decision rules'
    );
    expect(explainTuningParameter('n_estimators')).toContain(
      'how many trees are combined'
    );
    expect(explainTuningParameter('custom_setting')).toContain(
      'measured cross-validation comparison'
    );
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
      applyTunedModelCode(models, [{ model: 'Linear SVM', code: tunedCode }])
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
