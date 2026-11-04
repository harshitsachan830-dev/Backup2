export interface MeasuredModelContext {
  name: string;
  task: 'classification' | 'regression';
  metric: string;
  score?: number;
  scoreStd?: number;
  comparisonName?: string;
  comparisonScore?: number;
  comparisonStd?: number;
  rank: number;
  finalistCount: number;
  candidateCount?: number;
  cvFolds?: number;
  screeningFolds?: number;
  screeningRows?: number;
  rowsAvailable?: number;
  rowsTotal?: number;
  rowsEvaluated?: number;
  rowsExcludedMissingTarget?: number;
  targetColumn?: string;
  classDistribution?: Array<{
    label: string;
    count: number;
    share: number;
  }>;
  numericFeatureCount?: number;
  categoricalFeatureCount?: number;
  featureMissingCount?: number;
  scaler?: string;
  warnings?: string[];
}

export interface ModelExplanation {
  why: string;
  reasons: string[];
  evidence: string[];
  confidence: string;
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
      'Applies L2 regularization to a linear decision function, discouraging overly large coefficients while keeping the model fast and relatively simple.',
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
      'A fast linear classification baseline when a simpler decision rule is useful.',
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
      'Finds a linear class boundary with a wide margin; it is a useful comparison when a simple linear separator may fit the task.',
    regression: 'Uses a linear support-vector boundary for numeric prediction.',
    strengths: [
      'Can provide a compact linear decision boundary',
      'Margin regularization controls model flexibility'
    ],
    weaknesses: [
      'Cannot learn nonlinear boundaries without feature transformations',
      'Requires feature scaling and careful regularization'
    ],
    bestFor:
      'Classification where a scaled, linear decision boundary is a reasonable baseline.',
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

const SHORT_MODEL_REASONS: Record<string, string> = {
  'linear regression': 'Fits a simple linear relationship to the target.',
  'ridge regression':
    'Fits a linear relationship with extra protection against unstable weights.',
  'lasso regression':
    'Fits a linear relationship and can remove weak predictors.',
  'elastic net': 'Balances feature selection and stable linear predictions.',
  'logistic regression':
    'Predicts class probabilities with a linear decision boundary.',
  'ridge classifier': 'Uses a regularized linear boundary to separate classes.',
  'decision tree': 'Learns readable if/then rules and nonlinear patterns.',
  'random forest':
    'Combines many trees to learn nonlinear patterns more reliably.',
  'extra trees': 'Combines randomized trees to learn nonlinear patterns.',
  'gradient boosting':
    'Adds small trees that correct earlier prediction errors.',
  'hist gradient boosting':
    'Uses efficient boosted trees to learn nonlinear patterns.',
  'k nearest neighbors': 'Predicts from the most similar training examples.',
  'linear svm': 'Finds a strong linear boundary between classes.',
  'rbf svm': 'Uses a kernel to model nonlinear class boundaries.',
  'support vector regression':
    'Fits a smooth function for numeric predictions.',
  'gaussian naive bayes':
    'Estimates class probabilities from feature distributions.',
  'xgboost classifier':
    'Uses regularized boosted trees to learn class patterns and interactions.',
  'xgboost regressor':
    'Uses regularized boosted trees to learn numeric patterns and interactions.'
};

function formatCompactScore(
  context: MeasuredModelContext,
  score: number
): string {
  const isPercent =
    context.task === 'classification' &&
    /accuracy|precision|recall|f1|auc/i.test(context.metric);
  return isPercent ? `${(score * 100).toFixed(2)}%` : score.toFixed(4);
}

function canonicalModelKey(rawName: string): string {
  const norm = rawName.trim().toLowerCase().replace(/[-_]/g, ' ');
  if (norm.includes('extra tree') || norm.includes('extratrees')) return 'extra trees';
  if (norm.includes('random forest') || norm.includes('randomforest')) return 'random forest';
  if (norm.includes('xgboost classifier') || norm.includes('xgbclassifier')) return 'xgboost classifier';
  if (norm.includes('xgboost regressor') || norm.includes('xgbregressor')) return 'xgboost regressor';
  if (norm.includes('xgboost') || norm.includes('xgb')) return 'xgboost';
  if (norm.includes('hist gradient') || norm.includes('histgradient')) return 'hist gradient boosting';
  if (norm.includes('gradient boost') || norm.includes('gradientboost')) return 'gradient boosting';
  if (norm.includes('decision tree') || norm.includes('decisiontree')) return 'decision tree';
  if (norm.includes('logistic')) return 'logistic regression';
  if (norm.includes('ridge classifier')) return 'ridge classifier';
  if (norm.includes('ridge')) return 'ridge regression';
  if (norm.includes('lasso')) return 'lasso regression';
  if (norm.includes('elastic net') || norm.includes('elasticnet')) return 'elastic net';
  if (norm.includes('linear regression')) return 'linear regression';
  if (norm.includes('linear svm') || norm.includes('linear svc') || norm.includes('linearsvc')) return 'linear svm';
  if (norm.includes('rbf svm') || norm.includes('rbf svc') || norm.includes('svc')) return 'rbf svm';
  if (norm.includes('svr') || norm.includes('support vector regression')) return 'support vector regression';
  if (norm.includes('naive bayes') || norm.includes('gaussiannb')) return 'gaussian naive bayes';
  if (norm.includes('knn') || norm.includes('neighbors') || norm.includes('k nearest')) return 'k nearest neighbors';
  return norm;
}

function formatTargetName(targetColumn?: string): string {
  if (!targetColumn) {
    return 'the target';
  }
  const clean = targetColumn.replace(/[_-]+/g, ' ').trim();
  return `“${clean}”`;
}

export function getModelSelectionReasons(
  modelName: string,
  context: MeasuredModelContext
): string[] {
  const key = canonicalModelKey(modelName);
  const isRegression = context.task === 'regression';
  const targetLabel = formatTargetName(context.targetColumn);

  switch (key) {
    case 'linear regression':
      return [
        `Learns direct linear relationships between input features and ${targetLabel}.`,
        'High interpretability: regression coefficients clearly reveal the direction and magnitude of each feature’s effect.',
        'Exceptionally fast training and inference with minimal computational footprint.',
        'Low model complexity minimizes the risk of overfitting when data is limited or linear patterns dominate.',
        'Serves as a transparent benchmark against which more complex nonlinear models can be evaluated.'
      ];

    case 'ridge regression':
      return [
        `Applies L2 weight penalty to stabilize linear coefficients and prevent overfitting on ${targetLabel}.`,
        'Effectively handles multicollinearity (correlated features) without inflating prediction variance.',
        'Retains linear interpretability while improving out-of-fold generalization on noisy data.',
        'Fast closed-form computation making it ideal for quick iterations on tabular datasets.',
        'Provides a more resilient linear baseline than standard OLS when many features are present.'
      ];

    case 'lasso regression':
      return [
        'Utilizes L1 regularization to automatically drive uninformative feature coefficients to zero.',
        'Performs built-in feature selection, creating a simpler, sparser, and more explainable model.',
        'Constrains total weight magnitude to buffer against overfitting on small or noisy datasets.',
        `High interpretability: zeroes out weak predictors to highlight key drivers of ${targetLabel}.`,
        'Fast linear baseline well-suited when you expect only a subset of features to be predictive.'
      ];

    case 'elastic net':
      return [
        'Combines L1 and L2 regularization to simultaneously perform feature selection and stabilize correlated predictors.',
        'Overcomes Lasso’s limitations by selecting groups of correlated features together.',
        'Balances model sparsity with generalization stability on multi-feature tabular data.',
        'Controls model complexity to guard against overfitting on small-to-medium datasets.'
      ];

    case 'logistic regression':
      return [
        'Directly estimates calibrated class probabilities using a regularized linear decision boundary.',
        'High interpretability: odds ratios and coefficients clearly explain each feature’s contribution to class outcomes.',
        'Fast to train and evaluate with low memory overhead and no risk of complex tree memorization.',
        'Built-in regularization (L2/L1) guards against overfitting on tabular classification tasks.',
        'Serves as the gold-standard linear baseline for binary and multiclass classification.'
      ];

    case 'ridge classifier':
      return [
        'Uses L2-regularized linear decision functions to classify examples rapidly and stably.',
        'Highly resilient against multicollinear features and high dimensionality without exploding weights.',
        'Significantly faster than iterative logistic solvers on large tabular splits.',
        'Low complexity prevents overfitting on small or moderately sized training sets.',
        'Provides a clear linear benchmark to evaluate if complex tree ensembles are truly needed.'
      ];

    case 'decision tree':
      if (isRegression) {
        return [
          `Partitions feature space into piecewise constant regions to capture complex nonlinear trends in ${targetLabel}.`,
          'Highly visual and interpretability: every prediction can be verified step-by-step from root to leaf.',
          'Requires no feature scaling and remains invariant to monotonic feature transformations.',
          'Naturally models multi-feature interaction effects without requiring interaction terms.',
          'Serves as an intuitive nonlinear baseline for tabular regression.'
        ];
      }
      return [
        'Learns human-readable if/then decision rules that make predictions transparent and easy to trace.',
        'Naturally captures nonlinear decision boundaries and hierarchical feature interactions without manual transformations.',
        'Requires zero feature scaling, normalization, or centering of numeric columns.',
        'Handles mixed numeric and categorical inputs with intuitive hierarchical splits.',
        'Provides clear feature importance rankings based on split impurity reduction.'
      ];

    case 'random forest':
      if (isRegression) {
        return [
          `Captures nonlinear relationships between input features and ${targetLabel}.`,
          'Handles complex interactions between multiple features without manual transformations.',
          'Requires relatively little feature scaling or normalization.',
          'Is a strong baseline for structured tabular datasets.',
          'Aggregates diverse decision trees via bagging to reduce variance and provide feature importance estimates.'
        ];
      }
      return [
        'Captures nonlinear decision boundaries and feature interactions without manual transformation.',
        'Ensembles hundreds of decision trees via bagging to suppress variance and avoid single-tree overfitting.',
        'Requires minimal feature scaling and handles numeric and encoded categorical features smoothly.',
        'Robust against noise, outliers, and varying class distributions in tabular data.',
        'Provides reliable class probabilities and interpretable feature importance rankings.'
      ];

    case 'extra trees':
      if (isRegression) {
        return [
          'Ensembles deeply randomized decision trees, creating smoother response surfaces than standard bagging.',
          'Reduces model variance and combats overfitting through randomized split thresholds.',
          'Trains faster than standard Random Forest because optimal split thresholds are drawn at random.',
          'Requires no feature scaling and is highly robust against extreme numeric outliers.',
          'Captures intricate nonlinear feature interactions across tabular columns.'
        ];
      }
      return [
        'Combines randomized decision trees to learn complex nonlinear class boundaries.',
        'Randomized split thresholds further suppress variance and reduce the risk of overfitting.',
        'Trains faster than standard bagging while maintaining competitive classification accuracy.',
        'Requires minimal feature scaling and is robust against noisy features.',
        'Computes robust out-of-fold predictions and feature importance estimates.'
      ];

    case 'gradient boosting':
      if (isRegression) {
        return [
          'Sequentially builds trees that directly correct the residual prediction errors of previous trees.',
          `Excels at capturing subtle nonlinear relationships and continuous response curves for ${targetLabel}.`,
          'Employs shrinkage (learning rate) and subsampling to achieve strong generalization accuracy.',
          'Learns complex multi-way feature interactions automatically.',
          'Proven, high-accuracy benchmark for structured tabular regression.'
        ];
      }
      return [
        'Iteratively corrects misclassified samples and residual errors with targeted sequential trees.',
        'Learns intricate nonlinear decision boundaries and high-order feature interactions.',
        'Learning rate shrinkage and tree depth limits help guard against overfitting.',
        'Consistently delivers superior predictive performance on tabular classification problems.',
        'Generates fine-grained class probabilities and feature importance metrics.'
      ];

    case 'hist gradient boosting':
      if (isRegression) {
        return [
          'Discretizes continuous features into 256 histogram bins, accelerating training speed by 10x–50x.',
          'Native out-of-the-box handling of missing values without requiring manual imputation pipelines.',
          `Captures complex nonlinear curves and multi-feature interaction effects with high accuracy for ${targetLabel}.`,
          'Low memory footprint and early stopping make it highly scalable for larger tabular datasets.'
        ];
      }
      return [
        'Uses histogram-based feature binning for dramatically faster training on tabular data.',
        'Built-in native support for missing values in features during both training and inference.',
        'Learns complex nonlinear interactions while maintaining state-of-the-art boosted tree accuracy.',
        'Highly memory-efficient and scalable for medium to large-scale classification tasks.'
      ];

    case 'xgboost classifier':
    case 'xgboost':
      if (isRegression) {
        return [
          'Industry-standard boosted tree framework utilizing second-order gradients for precise split finding.',
          'Employs L1 and L2 tree-leaf regularization to penalize model complexity and prevent overfitting.',
          `Captures complex nonlinear patterns and multi-feature interactions in ${targetLabel}.`,
          'Robust to missing values and requires zero monotonic feature scaling.',
          'Consistently achieves top-tier accuracy and generalization on tabular regression benchmarks.'
        ];
      }
      return [
        'State-of-the-art gradient boosting framework with second-order Taylor expansions for optimal splits.',
        'Advanced L1 and L2 regularization across tree leaves actively suppresses overfitting.',
        'Handles complex nonlinear decision boundaries and multi-feature interactions seamlessly.',
        'Native missing value handling and column subsampling enhance resilience against noisy features.',
        'Consistently top-ranking performer for tabular classification in real-world applications.'
      ];

    case 'xgboost regressor':
      return [
        'Industry-standard boosted tree framework utilizing second-order gradients for precise split finding.',
        'Employs L1 and L2 tree-leaf regularization to penalize model complexity and prevent overfitting.',
        `Captures complex nonlinear patterns and multi-feature interactions in ${targetLabel}.`,
        'Robust to missing values and requires zero monotonic feature scaling.',
        'Consistently achieves top-tier accuracy and generalization on tabular regression benchmarks.'
      ];

    case 'k nearest neighbors':
      if (isRegression) {
        return [
          'Predicts continuous values by averaging the target values of the k nearest feature neighbors.',
          'Adapts locally to arbitrary continuous functions without imposing a global functional form.',
          'Zero training phase (lazy learner), making model updates instantaneous when new data arrives.',
          'Effective when similar input profiles reliably correspond to similar target values.'
        ];
      }
      return [
        'Instance-based classification: predicts class labels based on proximity to the k closest training examples.',
        'Makes zero assumptions about the underlying distribution or linearity of the data.',
        'Naturally handles multi-class targets and complex, irregular decision clusters.',
        'Transparent reasoning: predictions can be directly explained by inspecting nearest neighbor samples.'
      ];

    case 'linear svm':
      return [
        'Maximizes the geometric margin between classes, optimizing for best worst-case boundary generalization.',
        'Highly effective in high-dimensional feature spaces with many predictors.',
        'Memory-efficient: decision boundary depends strictly on a small subset of critical support vectors.',
        'Regularization parameter (C) provides explicit control over margin width and outlier tolerance.'
      ];

    case 'rbf svm':
      return [
        'Uses the Radial Basis Function kernel to separate classes with intricate, nonlinear boundaries.',
        'Excels when decision boundaries are curved or form complex geometric clusters in feature space.',
        'Robust against moderate noise when kernel bandwidth and regularization are tuned.',
        'Powerful modeling capability for small to medium-sized structured tabular datasets.'
      ];

    case 'support vector regression':
      return [
        'Uses an epsilon-insensitive loss function: errors within the epsilon tube are ignored, reducing sensitivity to noise.',
        'Effective at modeling smooth nonlinear trends using kernel transformations.',
        'Memory-efficient model defined strictly by key support vectors rather than the entire dataset.',
        'Robust against outliers compared to standard least-squares regression.'
      ];

    case 'gaussian naive bayes':
      return [
        'Extremely fast probabilistic classifier based on Bayes’ theorem with feature independence assumptions.',
        'Requires very small amounts of training data to estimate mean and variance parameters.',
        'Highly immune to the curse of dimensionality with negligible memory and CPU consumption.',
        'Serves as a rapid, lightweight baseline for continuous numeric features.'
      ];

    default:
      return [
        'Evaluated with cross-validation on the selected dataset and evaluation metric.',
        `Learns representative patterns from the input features to predict ${targetLabel}.`,
        'Provides a competitive alternative benchmark among the evaluated model finalists.'
      ];
  }
}

export function buildMeasuredModelExplanation(
  context: MeasuredModelContext
): ModelExplanation {
  const normalizedName = context.name.trim().toLowerCase();
  const profile = MODEL_PROFILES[normalizedName];
  const compactModelReason =
    SHORT_MODEL_REASONS[normalizedName] ??
    'Its measured validation result, rather than its name, determines its rank.';
  const reasons = getModelSelectionReasons(context.name, context);

  const evidence: string[] = [];
  const formattedScore =
    typeof context.score === 'number' && Number.isFinite(context.score)
      ? context.task === 'classification'
        ? `${(context.score * 100).toFixed(2)}% ${context.metric.toLowerCase()}`
        : `${context.metric} ${context.score.toFixed(4)}`
      : '';

  if (formattedScore) {
    evidence.push(
      `${formattedScore} mean across ${context.cvFolds ? `${context.cvFolds}-fold` : ''}` +
        `${context.task === 'classification' ? ' stratified' : ''} cross-validation` +
        `${context.cvFolds ? ` (${context.cvFolds} train/test rotations)` : ''}; ` +
        (context.task === 'classification'
          ? 'class proportions are kept similar in each split, and higher balanced accuracy is better.'
          : 'lower RMSE is better; RMSE measures prediction error in the target’s units and penalizes larger errors more.')
    );
  }

  if (
    context.task === 'classification' &&
    Array.isArray(context.classDistribution) &&
    context.classDistribution.length > 0
  ) {
    const distribution = context.classDistribution
      .filter(
        item => Number.isFinite(item.count) && Number.isFinite(item.share)
      )
      .map(
        item =>
          `${item.label}: ${item.count.toLocaleString()} ` +
          `(${(item.share * 100).toFixed(1)}%)`
      )
      .join('; ');

    if (distribution) {
      evidence.push(
        `Target ${context.targetColumn ? `“${context.targetColumn}” ` : ''}class balance: ${distribution}. ` +
          'Balanced accuracy checks each class equally, so performance on the larger class cannot hide weak results on the smaller class.'
      );

      if (typeof context.score === 'number' && Number.isFinite(context.score)) {
        const reference = 1 / context.classDistribution.length;
        const difference = (context.score - reference) * 100;
        const relation = difference >= 0 ? 'above' : 'below';
        evidence.push(
          `A constant predictor has a ${context.classDistribution.length}-class balanced-accuracy reference of ` +
            `${(reference * 100).toFixed(2)}%; a predictor that always guesses one class gets this reference. ` +
            `This result is ${Math.abs(difference).toFixed(2)} percentage points ${relation} it.`
        );
      }
    }
  }

  if (
    typeof context.rowsEvaluated === 'number' &&
    typeof context.rowsAvailable === 'number'
  ) {
    evidence.push(
      context.rowsEvaluated < context.rowsAvailable
        ? `The final comparison used a reproducible ${context.rowsEvaluated.toLocaleString()}-row sample ` +
            `from ${context.rowsAvailable.toLocaleString()} rows with target values; it did not evaluate every row.`
        : `Final cross-validation used all ${context.rowsAvailable.toLocaleString()} rows with a target value.`
    );
  }

  if (
    typeof context.rowsTotal === 'number' &&
    typeof context.rowsExcludedMissingTarget === 'number' &&
    context.rowsExcludedMissingTarget > 0
  ) {
    evidence.push(
      `${context.rowsExcludedMissingTarget.toLocaleString()} of ${context.rowsTotal.toLocaleString()} ` +
        'rows were excluded because the selected target was missing.'
    );
  }

  if (
    typeof context.candidateCount === 'number' &&
    typeof context.finalistCount === 'number' &&
    context.candidateCount > context.finalistCount
  ) {
    const screeningSize =
      typeof context.screeningRows === 'number'
        ? ` on ${context.screeningRows.toLocaleString()} rows`
        : '';
    evidence.push(
      `A first-pass screen compared ${context.candidateCount} candidates` +
        `${context.screeningFolds ? ` with ${context.screeningFolds}-fold CV` : ''}${screeningSize}; ` +
        `${context.finalistCount} finalists then received the full comparison. ` +
        'Models left out by the first pass were not fully evaluated, so they are not proven worse.'
    );
  }

  if (
    typeof context.numericFeatureCount === 'number' &&
    typeof context.categoricalFeatureCount === 'number'
  ) {
    evidence.push(
      `The inputs contain ${context.numericFeatureCount} numeric and ` +
        `${context.categoricalFeatureCount} category-based features. ` +
        `When values are missing, numeric gaps are filled with the median and categories with the most common value; categories are then one-hot encoded. ` +
        `These preprocessing steps are learned only from the training part of each CV split` +
        `${context.scaler && context.scaler !== 'none' ? `; this model also used ${context.scaler} scaling` : ''}.`
    );
  }

  if (typeof context.featureMissingCount === 'number') {
    evidence.push(
      context.featureMissingCount === 0
        ? 'The selected input features have no missing values, so the fill steps did not change any cells.'
        : `${context.featureMissingCount.toLocaleString()} missing input values were filled using values learned from each training split.`
    );
  }

  for (const warning of context.warnings ?? []) {
    if (warning.toLowerCase().includes('optional python package')) {
      evidence.push(warning);
    }
  }

  let comparison = '';
  if (
    typeof context.score === 'number' &&
    Number.isFinite(context.score) &&
    typeof context.comparisonScore === 'number' &&
    Number.isFinite(context.comparisonScore) &&
    context.comparisonName
  ) {
    const gap = Math.abs(context.score - context.comparisonScore);
    const gapLabel =
      context.task === 'classification'
        ? `${(gap * 100).toFixed(2)} percentage points`
        : `${gap.toFixed(4)} RMSE units`;
    const directionText = context.rank === 1 ? 'ahead of' : 'behind';
    comparison = `It is ${gapLabel} ${directionText} ${context.comparisonName}`;

    const deviations = [
      typeof context.scoreStd === 'number' && Number.isFinite(context.scoreStd)
        ? {
            name: 'this model',
            value: context.scoreStd
          }
        : null,
      typeof context.comparisonStd === 'number' &&
      Number.isFinite(context.comparisonStd)
        ? {
            name: context.comparisonName ?? 'comparison model',
            value: context.comparisonStd
          }
        : null
    ].filter((item): item is { name: string; value: number } => item !== null);

    if (deviations.length > 0) {
      const deviationText = deviations
        .map(item => {
          const value =
            context.task === 'classification'
              ? `${(item.value * 100).toFixed(2)} percentage points`
              : item.value.toFixed(4);
          return `${item.name}: ${value}`;
        })
        .join('; ');
      const noLargerThanAll = deviations.every(item => gap <= item.value);
      const variationRelation = noLargerThanAll
        ? deviations.length === 2
          ? ', both larger than this gap'
          : ', larger than this gap'
        : '';
      comparison +=
        `; the score varied across folds (standard deviations: ${deviationText}` +
        `${variationRelation}). This describes fold-to-fold variation; it is not a confidence interval or significance test.`;
    } else {
      comparison += '.';
    }

    evidence.push(comparison);
  }

  const confidence =
    'Treat this as a shortlist based on the tested finalists, not a guarantee of future performance. ' +
    'The top model was chosen using these same scores, so its score may be optimistic; check it on a separate holdout set before relying on it. ' +
    'If rows repeat people or sites, or represent time periods, use splits that keep those groups or dates separate.';

  const resultLine =
    typeof context.score === 'number' && Number.isFinite(context.score)
      ? `Result: #${context.rank}/${context.finalistCount} · ${context.metric} ${formatCompactScore(context, context.score)}${context.cvFolds ? ` · ${context.cvFolds}-fold CV` : ' · cross-validation'}.`
      : `Result: #${context.rank}/${context.finalistCount} finalists · cross-validation.`;
  const datasetParts: string[] = [];
  const rows = context.rowsEvaluated ?? context.rowsAvailable;
  if (typeof rows === 'number' && Number.isFinite(rows)) {
    datasetParts.push(`${rows.toLocaleString()} rows`);
  }
  if (
    typeof context.numericFeatureCount === 'number' &&
    typeof context.categoricalFeatureCount === 'number'
  ) {
    datasetParts.push(
      `${context.numericFeatureCount} numeric, ${context.categoricalFeatureCount} categorical features`
    );
  }
  if (typeof context.featureMissingCount === 'number') {
    datasetParts.push(
      context.featureMissingCount === 0
        ? 'no missing inputs'
        : `${context.featureMissingCount.toLocaleString()} missing inputs handled`
    );
  }

  const validationParts: string[] = [];
  if (
    typeof context.scoreStd === 'number' &&
    Number.isFinite(context.scoreStd)
  ) {
    const isPercent =
      context.task === 'classification' &&
      /accuracy|precision|recall|f1|auc/i.test(context.metric);
    validationParts.push(
      `fold SD ${isPercent ? `${(context.scoreStd * 100).toFixed(2)} pp` : context.scoreStd.toFixed(4)}`
    );
  }
  if (
    typeof context.score === 'number' &&
    Number.isFinite(context.score) &&
    typeof context.comparisonScore === 'number' &&
    Number.isFinite(context.comparisonScore) &&
    context.comparisonName
  ) {
    const gap = Math.abs(context.score - context.comparisonScore);
    const isPercent =
      context.task === 'classification' &&
      /accuracy|precision|recall|f1|auc/i.test(context.metric);
    const gapText = isPercent
      ? `${(gap * 100).toFixed(2)} pp`
      : `${gap.toFixed(4)} RMSE`;
    const comparisonStd = Math.max(
      context.scoreStd ?? 0,
      context.comparisonStd ?? 0
    );
    const withinFoldVariation = comparisonStd > 0 && gap <= comparisonStd;
    const relativeToComparator = context.rank === 1 ? 'ahead of' : 'behind';
    validationParts.push(
      `${gapText} ${relativeToComparator} ${context.comparisonName}${withinFoldVariation ? ' (within fold variation)' : ''}`
    );
  }

  const decisionLine =
    context.rank === 1
      ? 'Decision: Top-scoring tested finalist; confirm on a separate holdout.'
      : 'Decision: #1 scored higher; use this as a comparison alternative.';

  return {
    why: [
      resultLine,
      `Model fit: ${compactModelReason}`,
      ...(datasetParts.length > 0
        ? [`Data: ${datasetParts.join(' · ')}.`]
        : []),
      ...(validationParts.length > 0
        ? [`Comparison: ${validationParts.join(' · ')}.`]
        : ['Comparison: Cross-validation estimates can vary across splits.']),
      decisionLine
    ].join('\n'),
    reasons,
    evidence,
    confidence,
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
