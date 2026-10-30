/**
 * Source-level catalog for the ModelMind visualizer.
 *
 * A match identifies code that references an algorithm; it never implies that
 * the estimator was fitted or that its outputs were measured.
 */
export interface AlgorithmVisualizationDefinition {
  id: string;
  name: string;
  category: string;
  patterns: RegExp[];
  requireAllPatterns?: boolean;
  process: string[];
  limits: string[];
}

export const MODEL_VISUALIZATION_CATALOG: AlgorithmVisualizationDefinition[] = [
  { id: 'pca', name: 'PCA', category: 'Dimensionality reduction', patterns: [/\bPCA\s*\(/], process: ['Center numeric features when configured', 'Find principal directions from fitted data', 'Project rows into the selected component space'], limits: ['Explained variance, component loadings, and projected rows require a fitted PCA estimator.'] },
  { id: 'kmeans', name: 'K-Means', category: 'Clustering', patterns: [/\bKMeans\s*\(/], process: ['Initialize cluster centers', 'Assign each row to a nearest center', 'Update centers and repeat until stopping'], limits: ['Centers, assignments, cluster sizes, and inertia require fitting on data.'] },
  { id: 'random-forest', name: 'Random Forest', category: 'Classification', patterns: [/\bRandomForest(?:Classifier|Regressor)\s*\(/], process: ['Build trees from bootstrap samples when enabled', 'Consider feature splits in each tree', 'Aggregate tree outputs for a prediction'], limits: ['Tree structure, feature importance, and predictions require a fitted forest.'] },
  { id: 'xgboost', name: 'XGBoost', category: 'Boosting', patterns: [/\bXGB(?:Classifier|Regressor)\s*\(/], process: ['Add a tree to the ensemble', 'Fit the next tree to the configured objective and residual signal', 'Combine the trees for a prediction'], limits: ['Boosting rounds, split gains, and predictions require a fitted booster.'] },
  { id: 'decision-tree', name: 'Decision Tree', category: 'Classification', patterns: [/\bDecisionTree(?:Classifier|Regressor)\s*\(/], process: ['Evaluate candidate feature splits', 'Follow a learned branch for each row', 'Return the value or class stored at a leaf'], limits: ['Feature tests, thresholds, branches, and leaf values require a fitted tree.'] },
  { id: 'perceptron', name: 'Perceptron', category: 'Classification', patterns: [/\bPerceptron\s*\(/], process: ['Compute a weighted linear score', 'Compare the score with the decision boundary', 'Update weights during training when configured'], limits: ['Learned weights, boundary, and predictions require fitting and inspection.'] },
  { id: 'gradient-boosting', name: 'Gradient Boosting', category: 'Boosting', patterns: [/\b(?:GradientBoosting|HistGradientBoosting)(?:Classifier|Regressor)\s*\(/], process: ['Start with an initial prediction', 'Fit each weak learner to the current loss gradient', 'Add learners sequentially using the configured learning rate'], limits: ['Stage-wise predictions and fitted tree structure require a trained estimator.'] },
  { id: 'mlp', name: 'Multi-Layer Perceptron', category: 'Deep learning', patterns: [/\bMLP(?:Classifier|Regressor)\s*\(/], process: ['Pass inputs through configured hidden layers', 'Apply learned weights and activation functions', 'Produce the configured output'], limits: ['Weights, activations, loss history, and predictions require a fitted network.'] },
  { id: 'gradient-descent', name: 'Gradient Descent', category: 'Optimization', patterns: [/\b(?:SGDRegressor|SGDClassifier)\s*\(/, /\b(?:gradient_descent|gradient descent)\b/i], process: ['Compute an objective or loss gradient', 'Update parameters in the opposite gradient direction', 'Repeat until the stopping rule is met'], limits: ['Parameter trajectories and convergence require executed optimization with recorded values.'] },
  { id: 'linear-regression', name: 'Linear Regression', category: 'Regression', patterns: [/\bLinearRegression\s*\(/], process: ['Combine feature values with learned coefficients', 'Add the intercept when configured', 'Return a numeric prediction'], limits: ['Coefficients, intercept, residuals, and predictions require a fitted estimator and data.'] },
  { id: 'multiple-linear-regression', name: 'Multiple Linear Regression', category: 'Regression', patterns: [/\bLinearRegression\s*\(/, /\bX\s*=\s*[^\n]*\[\s*[^\]]*,[^\]]*\]/], requireAllPatterns: true, process: ['Read multiple feature columns', 'Combine them with learned coefficients and an intercept', 'Return a numeric prediction'], limits: ['The source alone cannot establish feature meaning, coefficients, or model quality.'] },
  { id: 'logistic-regression', name: 'Logistic Regression', category: 'Classification', patterns: [/\bLogisticRegression\s*\(/], process: ['Compute a linear class score', 'Map scores to class probabilities', 'Choose classes using the configured decision rule'], limits: ['Fitted coefficients, calibrated probabilities, thresholds, and metrics require model evaluation.'] },
  { id: 'multiclass-logistic-regression', name: 'Multiclass Logistic Regression', category: 'Classification', patterns: [/\bLogisticRegression\s*\(/, /\b(?:multi_class|OneVsRestClassifier|OneVsOneClassifier)\b/], requireAllPatterns: true, process: ['Compute class scores', 'Convert scores into class probabilities or pairwise decisions', 'Select a class under the configured strategy'], limits: ['The realized class strategy and predictions depend on fitted data and library configuration.'] },
  { id: 'knn', name: 'K-Nearest Neighbors', category: 'Classification', patterns: [/\bKNeighbors(?:Classifier|Regressor)\s*\(/], process: ['Measure distance from the query row to stored training rows', 'Select the configured number of neighbors', 'Vote or average their target values'], limits: ['Neighbor identities and predictions require training rows and a query row.'] },
  { id: 'svm', name: 'Support Vector Machine', category: 'Classification', patterns: [/\b(?:SVC|SVR|LinearSVC|LinearSVR)\s*\(/], process: ['Represent the decision function using support vectors', 'Choose a margin and kernel behavior from configuration', 'Classify or estimate a value from the fitted decision function'], limits: ['Support vectors, margins, and predictions require a fitted estimator.'] },
  { id: 'naive-bayes', name: 'Naive Bayes', category: 'Classification', patterns: [/\b(?:GaussianNB|MultinomialNB|BernoulliNB|CategoricalNB|ComplementNB)\s*\(/], process: ['Estimate class prior probabilities', 'Estimate per-feature likelihoods under the selected variant', 'Combine likelihoods to score candidate classes'], limits: ['Learned priors, likelihoods, and predictions require fitting on labeled data.'] },
  { id: 'catboost', name: 'CatBoost', category: 'Boosting', patterns: [/\bCatBoost(?:Classifier|Regressor)\s*\(/], process: ['Build gradient-boosted trees', 'Apply CatBoost handling for configured categorical features', 'Combine stages for a prediction'], limits: ['The fitted trees, categorical statistics, and predictions are not available from a declaration.'] },
  { id: 'lightgbm', name: 'LightGBM', category: 'Boosting', patterns: [/\bLGBM(?:Classifier|Regressor)\s*\(/], process: ['Grow gradient-boosted trees with configured leaf-wise controls', 'Optimize each stage for the selected loss', 'Combine stages for a prediction'], limits: ['Fitted leaf structure, feature importance, and predictions require training data.'] },
  { id: 'regularization', name: 'Regularization', category: 'Model fitting', patterns: [/\b(?:Ridge|Lasso|ElasticNet)\s*\(/, /\balpha\s*=/], requireAllPatterns: true, process: ['Add a penalty to the fitted objective', 'Trade fit against coefficient size or complexity', 'Estimate parameters under the configured penalty'], limits: ['The source does not establish whether regularization improves generalization on unseen data.'] },
  { id: 'polynomial-regression', name: 'Polynomial Regression', category: 'Regression', patterns: [/\bPolynomialFeatures\s*\(/], process: ['Expand input features into polynomial terms', 'Fit a regression estimator to the expanded matrix', 'Evaluate predictions in the original target scale'], limits: ['The realized feature expansion and curve depend on degree, input columns, and fitted coefficients.'] },
  { id: 'adaboost', name: 'AdaBoost', category: 'Boosting', patterns: [/\bAdaBoost(?:Classifier|Regressor)\s*\(/], process: ['Fit a weak learner', 'Increase emphasis on errors according to the configured algorithm', 'Combine learners using learned weights'], limits: ['Sample weights, learner sequence, and predictions require a fitted ensemble.'] },
  { id: 'voting-stacking', name: 'Voting and Stacking', category: 'Ensemble', patterns: [/\b(?:VotingClassifier|VotingRegressor|StackingClassifier|StackingRegressor)\s*\(/], process: ['Fit the configured base estimators', 'Combine their outputs or train a meta-estimator', 'Return the combined prediction'], limits: ['Base-estimator outputs and the fitted meta-model require trained estimators.'] },
  { id: 'ensemble-lab', name: 'Ensemble Lab', category: 'Ensemble', patterns: [], process: ['Select compatible base estimators', 'Compare bagging, boosting, or voting strategies', 'Evaluate each strategy on a consistent validation split'], limits: ['An interactive comparison requires explicit model runs on a selected dataset.'] },
  { id: 'bagging', name: 'Bagging Lab', category: 'Ensemble', patterns: [/\b(?:BaggingClassifier|BaggingRegressor)\s*\(/], process: ['Draw bootstrap samples when enabled', 'Fit base estimators independently', 'Aggregate their predictions'], limits: ['Bootstrap samples, estimator diversity, and variance changes require fitted models and data.'] },
  { id: 'boosting', name: 'Boosting', category: 'Boosting', patterns: [/\b(?:AdaBoost|GradientBoosting|HistGradientBoosting|XGB|LGBM|CatBoost)/], process: ['Fit a sequence of weak learners', 'Update later stages from the configured objective', 'Combine stages for a prediction'], limits: ['The source declaration does not show fitted stages, training trajectory, or generalization.'] }
];

/** Report overlay catalog. Capability labels keep source facts separate from runtime evidence. */
export const CODE_VISUALIZATION_OVERLAYS = [
  ['C01', 'Control-flow graph', 'Static branch structure; conditions are not evaluated.'],
  ['C02', 'Step-through execution trace', 'Available after the user clicks Run & trace.'],
  ['C03', 'Variables and memory state', 'Simple captured values are shown only after Run & trace.'],
  ['C04', 'Call stack', 'Function frames require a captured execution trace.'],
  ['C05', 'Recursion tree', 'Recursive calls require a captured execution trace.'],
  ['C06', 'Loop animator', 'Executed loop iterations require a captured execution trace.'],
  ['C07', 'Array and vector transforms', 'Shapes and values require executed source or explicit data inspection.'],
  ['C08', 'Linked-list pointers', 'Requires recognized linked-node data and runtime values.'],
  ['C09', 'Stack and queue', 'Requires recognized operations and runtime values.'],
  ['C10', 'Sorting animation', 'Requires executed input and output values.'],
  ['C11', 'Binary-search walkthrough', 'Requires a sorted input and a query value.'],
  ['C12', 'Time and space complexity', 'Static explanation only; no runtime benchmark is inferred.'],
  ['D01', 'Error-location highlight', 'Available when traceback source lines are supplied.'],
  ['D02', 'Traceback flow', 'Available when a traceback is supplied.'],
  ['D03', 'Variable state delta', 'Requires captured values before and after a step.'],
  ['D04', 'Expected versus actual output', 'Requires an expected value and captured output.'],
  ['D05', 'Shape mismatch', 'Requires observed array or dataframe shapes.'],
  ['D06', 'Overfit and underfit view', 'Requires train and validation trajectories or scores.'],
  ['D07', 'Residual and prediction plot', 'Requires target values and model predictions.'],
  ['D08', 'Fix diff and checks', 'Uses the existing validated-fix workflow when a proposed patch is available.'],
  ['P01', 'Dataset preview and distributions', 'Available through the existing dataset profiler.'],
  ['P02', 'Missing and outlier map', 'Available through the existing dataset and preprocessing profilers.'],
  ['P03', 'Preprocessing comparison', 'Available when before and after previews are generated.'],
  ['P04', 'Pipeline and ColumnTransformer', 'Static branch and stage view is available from selected source.']
] as const;

/** Resolve only IDs present in the source catalog or overlay registry. */
export function getVisualizationLabel(id: string): string | undefined {
  const model = MODEL_VISUALIZATION_CATALOG.find(item => item.id === id);
  if (model) return model.name;
  return CODE_VISUALIZATION_OVERLAYS.find(([overlayId]) => overlayId === id)?.[1];
}
