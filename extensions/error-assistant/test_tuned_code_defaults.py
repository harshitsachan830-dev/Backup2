import ast

import pandas as pd

from ml_platform_error_assistant.automl_code_adapter import (
    MODEL_IDS,
    generate_tuned_model_code,
)
from ml_platform_error_assistant.model_evaluator import (
    get_candidate_models,
)
from ml_platform_error_assistant.verified_model_code import (
    generate_verified_model_code,
)


def _generated_estimator(code: str) -> ast.Call:
    tree = ast.parse(code)
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        if not isinstance(node.func, ast.Name) or node.func.id != "Pipeline":
            continue
        if not node.args or not isinstance(node.args[0], (ast.List, ast.Tuple)):
            continue

        for step in node.args[0].elts:
            if (
                isinstance(step, (ast.List, ast.Tuple))
                and len(step.elts) == 2
                and isinstance(step.elts[0], ast.Constant)
                and step.elts[0].value == "model"
                and isinstance(step.elts[1], ast.Call)
            ):
                return step.elts[1]

    raise AssertionError("Generated pipeline has no model estimator step.")


def test_generated_model_code_uses_the_evaluated_default_parameters():
    frame = pd.DataFrame({
        "feature": [0.0, 1.0, 2.0, 3.0],
        "target": [0, 0, 1, 1],
    })

    for task in ("classification", "regression"):
        for model_name, estimator, _ in get_candidate_models(task):
            if task == "regression":
                frame["target"] = [0.0, 1.0, 2.0, 3.0]
            else:
                frame["target"] = [0, 0, 1, 1]

            code = generate_tuned_model_code(
                model_name,
                task,
                frame,
                target_column="target",
                feature_columns=["feature"],
                csv_path="dataset.csv",
                estimator_parameters={},
            )
            baseline_code = generate_verified_model_code(
                MODEL_IDS[task][model_name],
                target_column="target",
                numeric_columns=["feature"],
                categorical_columns=[],
                csv_path="dataset.csv",
            )
            assert ast.dump(_generated_estimator(code)) == ast.dump(
                _generated_estimator(baseline_code)
            ), (
                model_name,
                "No-change tuned code must use the baseline estimator.",
            )

            generated = _generated_estimator(code)

            assert isinstance(generated.func, ast.Name)
            assert generated.func.id == type(estimator).__name__

            evaluator_parameters = estimator.get_params(deep=False)
            for keyword in generated.keywords:
                if keyword.arg is None:
                    raise AssertionError("Estimator code uses keyword expansion.")

                generated_value = ast.literal_eval(keyword.value)
                assert generated_value == evaluator_parameters[keyword.arg], (
                    model_name,
                    keyword.arg,
                    generated_value,
                    evaluator_parameters[keyword.arg],
                )
