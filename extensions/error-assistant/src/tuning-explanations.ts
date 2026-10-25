const PARAMETER_EXPLANATIONS: Record<string, string> = {
  alpha:
    'Controls coefficient regularization; larger values penalize model complexity more strongly.',
  ccp_alpha:
    'Controls cost-complexity pruning; larger values prune more of the tree.',
  C: 'Inverse regularization strength; smaller values apply stronger regularization.',
  class_weight:
    'Can give minority classes more influence when class frequencies are uneven.',
  colsample_bytree:
    'Controls the fraction of input features sampled for each boosted tree.',
  epsilon: 'Sets the error-insensitive margin in support-vector regression.',
  gamma:
    'Controls the reach of the RBF kernel; larger values make its influence more local.',
  l1_ratio: 'Sets the blend between L1 sparsity and L2 coefficient shrinkage.',
  learning_rate:
    'Controls each boosting step; smaller steps often need more trees.',
  max_depth:
    'Limits tree depth and therefore the complexity of learned decision rules.',
  max_features:
    'Limits the features considered for a tree split, affecting diversity and fit.',
  max_iter: 'Sets the number of boosting iterations or optimization steps.',
  max_leaf_nodes: 'Limits the number of leaves and therefore tree complexity.',
  max_samples:
    'Controls the number or fraction of training rows sampled for an ensemble.',
  min_samples_leaf:
    'Requires a minimum number of examples at each leaf, which can smooth predictions.',
  min_samples_split:
    'Requires a minimum number of examples before a node can split.',
  n_estimators: 'Sets how many trees are combined in the ensemble.',
  n_neighbors:
    'Sets how many nearby training examples contribute to a K-nearest-neighbor prediction.',
  p: 'Chooses the Minkowski distance: 1 is Manhattan distance and 2 is Euclidean distance.',
  reg_lambda: 'Controls L2 regularization of boosted-tree weights.',
  subsample:
    'Controls the fraction of training rows sampled for each boosting step.',
  var_smoothing:
    'Adds stability to small feature variances in Gaussian Naive Bayes.',
  weights:
    'Distance weighting gives closer neighbors more influence than equally weighted neighbors.'
};

export function explainTuningParameter(parameter: string): string {
  return (
    PARAMETER_EXPLANATIONS[parameter] ??
    'This setting controls model fit or complexity; its displayed value was selected by the measured cross-validation comparison.'
  );
}
