# ml_platform_error_assistant

[![Github Actions Status](/workflows/Build/badge.svg)](/actions/workflows/build.yml)

JupyterLab error assistant frontend and server extension

This extension is composed of a Python package named `ml_platform_error_assistant`
for the server extension and a NPM package named `@ml-platform/error-assistant`
for the frontend extension.

## Requirements

- JupyterLab >= 4.0.0

## Notebook modes

Use **File → New → ModelMind Notebook** for the full ML Studio workflow.
Choose **File → New → Trainer Notebook** for a teaching-focused workflow:
ML Studio keeps code preview available but hides code copy and insertion
actions. Existing notebooks without a saved notebook mode continue to use the
full ModelMind workflow.

## ML Studio preprocessing

The Preprocessing tab offers separate Basic, Medium, and Advanced examples:
simple missing-value filling, pandas-based filling and encoding, and
scikit-learn pipelines with a `ColumnTransformer`. The **Why** explanation is
based on observed feature statistics such as skewness, IQR-flagged outliers,
discrete/count-like values, missingness, and categorical cardinality. It
describes method trade-offs and does not claim that a CSV reveals why values
are missing or proves a recommendation is optimal. In particular, IQR flags
are not proof of bad data, and ordinal codes may imply an artificial order.

## Fast hyperparameter tuning

After a successful Model Advisor evaluation, ModelMind Studio can optionally
search the measured Top 5 models. Basic mode tests up to 8 configurations per
model; Advanced tests up to 20. The feature accepts CSV datasets and verifies
the authenticated evaluation owner, the selected model/features, and the
dataset path and contents before starting a bounded background job. Tuning
reuses the completed evaluation's metric, CV folds, evaluated row count, and
random seed; parameter changes must beat the default baseline by a practical
margin and exceed paired fold-to-fold variation.

These settings make each finalist's default score directly comparable with
its measured Model Advisor score. Selecting the best configuration on those
same folds can still overfit the CV estimate, so validate the final choice on
a separate test set before deployment.

After Fast Tune completes, the corresponding Model Advisor code cards use the
selected estimator configuration for code preview, copy, and notebook
insertion. If tuned-code generation fails for a model, the result reports the
error and that card keeps its original generated code.

Dataset bindings are kept in memory. If Jupyter Server restarts, run Model
Advisor again before starting a tuning job.

## Install

To install the extension, execute:

```bash
pip install ml_platform_error_assistant
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall ml_platform_error_assistant
```

## Troubleshoot

If you are seeing the frontend extension, but it is not working, check
that the server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is installed and enabled, but you are not seeing
the frontend extension, check the frontend extension is installed:

```bash
jupyter labextension list
```

## Contributing

If you would like to contribute to this extension, please refer to the [Contributing Guide](CONTRIBUTING.md).
