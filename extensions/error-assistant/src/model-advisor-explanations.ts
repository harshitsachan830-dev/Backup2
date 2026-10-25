export interface MeasuredModelContext {
  name: string;
  task: 'classification' | 'regression';
  metric: string;
  score?: number;
  scoreStd?: number;
  rank: number;
  finalistCount: number;
  candidateCount?: number;
  cvFolds?: number;
}

export interface ModelExplanation {
  why: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string;
  trainingSpeed: string;
  complexity: string;
  interpretability: string;
}

interface ModelProfile {
  classification: string;
  regression: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string;
  trainingSpeed: string;
  complexity: string;
  interpretability: string;
}

const MODEL_PROFILES: Record<string, ModelProfile> = {
  'linear regression': {
    classification:
      'Fits a linear combination of features to predict a numeric target.',
    regression:
      'Fits a linear relationship between the input features and numeric target, providing a clear baseline.',
    strengths: [
      'Simple, fast baseline',
      'Coefficients are straightforward to inspect'
    ],
    weaknesses: [
      'Cannot model nonlinear patterns without feature engineering',
      'Sensitive to outliers and correlated features'
    ],
    bestFor: 'Numeric targets with approximately linear feature relationships.',
    trainingSpeed: 'Fast',
    complexity: 'Low',
    interpretability: 'High'
  },
  'ridge regression': {
    classification: 'Uses L2-regularized linear scores to separate classes.',
    regression:
      'Adds L2 regularization to linear regression, shrinking coefficients to stabilize correlated or numerous features.',
    strengths: [
      'Regularization can stabilize correlated features',
      'Fast linear baseline'
    ],
    weaknesses: [
      'Still assumes a linear relationship',
      'Does not usually remove features entirely'
    ],
    bestFor:
      'Numeric targets with mostly linear structure and correlated features.',
    trainingSpeed: 'Fast',
    complexity: 'Low',
    interpretability: 'High'
  },
  'lasso regression': {
    classification: 'Uses L1-regularized linear scores to separate classes.',
    regression:
      'Uses L1 regularization, which can shrink weak linear coefficients to zero and produce a sparse model.',
    strengths: ['Can create sparse feature sets', 'Fast linear model'],
    weaknesses: [
      'May be unstable with strongly correlated features',
      'Cannot learn nonlinear relationships by itself'
    ],
    bestFor:
      'Approximately linear numeric targets where a compact set of predictors is useful.',
    trainingSpeed: 'Fast',
    complexity: 'Low',
    interpretability: 'High'
  },
  'elastic net': {
    classification:
      'Combines L1 and L2 regularization for a linear classification boundary.',
    regression:
      'Combines L1 and L2 regularization to balance sparse coefficients with stability across correlated predictors.',
    strengths: [
      'Balances sparsity and coefficient stability',
      'Useful when predictors are correlated'
    ],
    weaknesses: [
      'Requires tuning regularization strength and mix',
      'Assumes a linear relationship'
    ],
    bestFor: 'Linear numeric problems with many or correlated features.',
    trainingSpeed: 'Fast',
    complexity: 'Low–Medium',
    interpretability: 'High'
  },
  'logistic regression': {
    classification:
      'Estimates class probabilities from a regularized linear decision boundary, making it a strong, efficient classification baseline.',
    regression: 'Uses a linear score for numeric predictions.',
    strengths: [
      'Fast probability-based classification baseline',
      'Coefficients are inspectable'
    ],
    weaknesses: [
      'Linear boundary can miss nonlinear class structure',
      'May need feature scaling and feature engineering'
    ],
    bestFor:
      'Classification with a roughly linear class boundary or when probability estimates are useful.',
    trainingSpeed: 'Fast',
    complexity: 'Low',
    interpretability: 'High'
  },
  'ridge classifier': {
    classification:
      'Applies regularized linear decision functions, which can generalize well when many features contribute modestly.',
    regression: 'Uses regularized linear scores for numeric prediction.',
    strengths: [
      'Regularization helps with many or correlated features',
      'Efficient linear classifier'
    ],
    weaknesses: [
      'Decision boundary is linear',
      'Does not provide calibrated probabilities by default'
    ],
    bestFor:
      'High-dimensional classification with an approximately linear boundary.',
    trainingSpeed: 'Fast',
    complexity: 'Low',
    interpretability: 'High'
  },
  'decision tree': {
    classification:
      'Builds threshold-based if/then splits that can represent nonlinear boundaries and feature interactions without requiring feature scaling.',
    regression:
      'Builds threshold-based if/then splits that can represent nonlinear target patterns without requiring feature scaling.',
    strengths: [
      'Captures nonlinear patterns and interactions',
      'Rules are relatively easy to visualize'
    ],
    weaknesses: [
      'A single tree can vary substantially with small data changes',
      'Deep trees can overfit'
    ],
    bestFor:
      'Nonlinear tabular data when rule-like decisions and little preprocessing are valuable.',
    trainingSpeed: 'Fast',
    complexity: 'Low–Medium',
    interpretability: 'High'
  },
  'random forest': {
    classification:
      'Averages many bootstrapped decision trees, reducing the instability of a single tree while learning nonlinear interactions.',
    regression:
      'Averages many bootstrapped decision trees, reducing the variance of a single tree for nonlinear numeric patterns.',
    strengths: [
      'Captures nonlinear patterns with reduced single-tree variance',
      'Usually works without feature scaling'
    ],
    weaknesses: [
      'Less transparent than one tree',
      'Model size and training time grow with the forest'
    ],
    bestFor:
      'General-purpose nonlinear tabular prediction where robustness is more important than a single compact rule set.',
    trainingSpeed: 'Moderate',
    complexity: 'Medium',
    interpretability: 'Low–Medium'
  },
  'extra trees': {
    classification:
      'Averages trees built with extra-randomized split thresholds; this decorrelation can reduce variance while retaining nonlinear decision boundaries.',
    regression:
      'Averages trees built with extra-randomized split thresholds; the additional randomness can reduce variance in nonlinear regression.',
    strengths: [
      'Randomized trees capture nonlinear patterns',
      'Ensembling can make predictions less sensitive to one tree'
    ],
    weaknesses: [
      'Individual decisions are difficult to explain',
      'Randomized splits can trade some fit for lower variance'
    ],
    bestFor:
      'Nonlinear tabular data where a fast, randomized tree ensemble is worth testing.',
    trainingSpeed: 'Moderate–Fast',
    complexity: 'Medium',
    interpretability: 'Low'
  },
  'gradient boosting': {
    classification:
      'Adds shallow trees sequentially, with later trees correcting errors from earlier ones; this can capture structured nonlinearities.',
    regression:
      'Adds trees sequentially to reduce prior prediction errors, fitting nonlinear numeric patterns through a series of small corrections.',
    strengths: [
      'Learns nonlinear patterns through sequential corrections',
      'Can perform well on structured tabular data'
    ],
    weaknesses: [
      'Learning rate and tree count need care',
      'Can overfit and is usually slower than simple baselines'
    ],
    bestFor:
      'Tabular data with nonlinear structure when a carefully regularized boosted-tree model is useful.',
    trainingSpeed: 'Moderate',
    complexity: 'Medium–High',
    interpretability: 'Low'
  },
  'hist gradient boosting': {
    classification:
      'Uses histogram-binned gradient-boosted trees to model nonlinear patterns efficiently on larger tabular datasets.',
    regression:
      'Uses histogram-binned gradient-boosted trees to model nonlinear numeric patterns efficiently on larger tabular datasets.',
    strengths: [
      'Histogram binning can speed up boosted-tree training',
      'Learns nonlinear feature interactions'
    ],
    weaknesses: [
      'Less transparent than linear models or a shallow tree',
      'Performance depends on depth, leaves, and regularization'
    ],
    bestFor:
      'Medium-to-large tabular datasets with nonlinear relationships where efficient boosting is useful.',
    trainingSpeed: 'Moderate–Fast',
    complexity: 'Medium–High',
    interpretability: 'Low'
  },
  'k nearest neighbors': {
    classification:
      'Predicts from nearby training examples, so it can capture local patterns without fitting a global decision formula.',
    regression:
      'Predicts from nearby training examples, so it can represent local rather than global numeric patterns.',
    strengths: [
      'Simple, flexible local decision rule',
      'Few assumptions about the global shape of the data'
    ],
    weaknesses: [
      'Requires feature scaling',
      'Prediction can be slow and sensitive to irrelevant features'
    ],
    bestFor:
      'Smaller datasets where similarity in a well-scaled feature space is meaningful.',
    trainingSpeed: 'Fast fit; slower predict',
    complexity: 'Low',
    interpretability: 'Medium'
  },
  'linear svm': {
    classification:
      'Finds a maximum-margin linear class boundary, which can be effective when classes separate in a high-dimensional feature space.',
    regression: 'Uses a linear support-vector boundary for numeric prediction.',
    strengths: [
      'Strong linear classifier for many-feature datasets',
      'Margin regularization controls model flexibility'
    ],
    weaknesses: [
      'Cannot learn nonlinear boundaries without feature transformations',
      'Requires feature scaling and careful regularization'
    ],
    bestFor:
      'High-dimensional classification with a roughly linear boundary and scaled features.',
    trainingSpeed: 'Moderate',
    complexity: 'Medium',
    interpretability: 'Low–Medium'
  },
  'rbf svm': {
    classification:
      'Uses a radial-basis kernel to form nonlinear class boundaries when a linear separator is too restrictive.',
    regression:
      'Uses an RBF kernel to fit smooth nonlinear numeric relationships.',
    strengths: [
      'Can model nonlinear boundaries',
      'Effective on small-to-medium datasets with scaled features'
    ],
    weaknesses: [
      'Requires feature scaling and tuning of C/gamma',
      'Training can become costly as row count grows'
    ],
    bestFor:
      'Small-to-medium datasets with nonlinear structure and meaningful scaled distances.',
    trainingSpeed: 'Moderate–Slow',
    complexity: 'Medium–High',
    interpretability: 'Low'
  },
  'support vector regression': {
    classification: 'Uses a support-vector margin for classification.',
    regression:
      'Fits an RBF support-vector function with an epsilon-insensitive loss, allowing nonlinear regression while controlling margin complexity.',
    strengths: [
      'Can model smooth nonlinear numeric patterns',
      'Epsilon loss ignores small residuals'
    ],
    weaknesses: [
      'Requires feature scaling and C/epsilon tuning',
      'Training can be slow on large datasets'
    ],
    bestFor:
      'Small-to-medium numeric datasets with smooth nonlinear relationships.',
    trainingSpeed: 'Moderate–Slow',
    complexity: 'Medium–High',
    interpretability: 'Low'
  },
  'gaussian naive bayes': {
    classification:
      'Estimates class likelihoods under a conditional-independence and per-feature Gaussian assumption, making it a fast probabilistic baseline.',
    regression:
      'Uses a Gaussian likelihood model for classification-style prediction.',
    strengths: [
      'Very fast and works with small datasets',
      'Provides class probabilities'
    ],
    weaknesses: [
      'Conditional-independence and Gaussian assumptions may be inaccurate',
      'Correlated features can reduce effectiveness'
    ],
    bestFor:
      'Fast classification baselines, especially when feature likelihood assumptions are reasonable.',
    trainingSpeed: 'Very fast',
    complexity: 'Low',
    interpretability: 'Medium'
  },
  'xgboost classifier': {
    classification:
      'Uses regularized gradient-boosted trees with efficient histogram training to learn nonlinear class boundaries and feature interactions.',
    regression:
      'Uses regularized gradient-boosted trees for numeric prediction.',
    strengths: [
      'Flexible nonlinear tabular model',
      'Regularization and subsampling offer overfit controls'
    ],
    weaknesses: [
      'More parameters to tune and less transparent than simple models',
      'Requires the optional XGBoost package'
    ],
    bestFor:
      'Structured classification data where a regularized boosted-tree model is worth comparing against simpler baselines.',
    trainingSpeed: 'Moderate–Fast',
    complexity: 'High',
    interpretability: 'Low'
  },
  'xgboost regressor': {
    classification:
      'Uses regularized gradient-boosted trees for classification.',
    regression:
      'Uses regularized gradient-boosted trees to learn nonlinear numeric patterns, with depth, learning rate, and regularization controlling model complexity.',
    strengths: [
      'Flexible nonlinear tabular model',
      'Regularization and subsampling offer overfit controls'
    ],
    weaknesses: [
      'More parameters to tune and less transparent than simple models',
      'Requires the optional XGBoost package'
    ],
    bestFor:
      'Structured numeric prediction where a regularized boosted-tree model is worth comparing against simpler baselines.',
    trainingSpeed: 'Moderate–Fast',
    complexity: 'High',
    interpretability: 'Low'
  }
};

function formatMetric(context: MeasuredModelContext): string {
  if (typeof context.score !== 'number' || !Number.isFinite(context.score)) {
    return '';
  }

  const classification = context.task === 'classification';
  const isPercent =
    classification && /accuracy|precision|recall|f1|auc/i.test(context.metric);
  const value = isPercent
    ? `${(context.score * 100).toFixed(2)}%`
    : context.score.toFixed(4);

  let variation = '';
  if (
    typeof context.scoreStd === 'number' &&
    Number.isFinite(context.scoreStd)
  ) {
    variation = isPercent
      ? `; fold-to-fold SD ${(context.scoreStd * 100).toFixed(2)} percentage points`
      : `; fold-to-fold SD ${context.scoreStd.toFixed(4)}`;
  }

  return `${context.metric} ${value}${variation}`;
}

export function buildMeasuredModelExplanation(
  context: MeasuredModelContext
): ModelExplanation {
  const normalizedName = context.name.trim().toLowerCase();
  const profile = MODEL_PROFILES[normalizedName];
  const algorithmReason = profile
    ? profile[context.task]
    : 'Provides a distinct model family to compare against the other evaluated candidates.';

  const rankEvidence =
    `It ranked #${context.rank} of ${context.finalistCount} successfully evaluated ` +
    'finalists';
  const metric = formatMetric(context);
  const measurement = metric
    ? `, with a mean ${metric}${context.cvFolds ? ` across ${context.cvFolds}-fold CV` : ''}`
    : context.cvFolds
      ? ` using ${context.cvFolds}-fold CV`
      : '';
  const direction =
    context.task === 'classification'
      ? ' (higher balanced accuracy is better)'
      : ' (lower RMSE is better)';
  const screening =
    typeof context.candidateCount === 'number' &&
    context.candidateCount > context.finalistCount
      ? ` selected from ${context.candidateCount} screened candidates`
      : '';

  return {
    why:
      `${algorithmReason} ${rankEvidence}${screening}${measurement}${direction}. ` +
      'This is evidence from the selected dataset, not a promise of better results on unseen data.',
    strengths: profile?.strengths ?? [
      'Evaluated with the selected dataset and metric',
      'Preprocessing was fitted within CV folds'
    ],
    weaknesses: profile?.weaknesses ?? [
      'Performance may change on new data',
      'The final holdout score can differ from cross-validation'
    ],
    bestFor:
      profile?.bestFor ??
      'Compare this model when its inductive bias fits the data and evaluation goal.',
    trainingSpeed: profile?.trainingSpeed ?? 'Dataset dependent',
    complexity: profile?.complexity ?? 'Model dependent',
    interpretability: profile?.interpretability ?? 'Model dependent'
  };
}
