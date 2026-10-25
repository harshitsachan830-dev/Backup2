
"""
ModelMind Fast Tune Top 5 — Stage 2 tests.

Tests the separate tuning engine only.
Does not modify existing AutoML or notebook features.
"""

import json
import math
import time

import pandas as pd
import pytest

from sklearn.datasets import make_classification, make_regression

from ml_platform_error_assistant.fast_hyperparameter_tuner import (
    _meaningful_improvement,
    tune_top_five,
)
from ml_platform_error_assistant.model_evaluator import evaluate_models


TOP_FIVE_CASES = [
    (
        "classification",
        [
            "Logistic Regression",
            "Decision Tree",
            "Random Forest",
            "K-Nearest Neighbors",
            "Gaussian Naive Bayes",
        ],
    ),
    (
        "regression",
        [
            "Linear Regression",
            "Ridge Regression",
            "Decision Tree",
            "Random Forest",
            "K-Nearest Neighbors",
        ],
    ),
]


def build_data(task):
    if task == "classification":
        X, y = make_classification(
            n_samples=150,
            n_features=6,
            n_informative=4,
            n_redundant=0,
            random_state=42,
        )
    else:
        X, y = make_regression(
            n_samples=150,
            n_features=6,
            noise=8,
            random_state=42,
        )

    columns = [f"feature_{i}" for i in range(6)]
    frame = pd.DataFrame(X, columns=columns)
    frame["target"] = y

    return frame, columns


@pytest.mark.parametrize(("task", "names"), TOP_FIVE_CASES)
def test_top_five(task, names):
    frame, features = build_data(task)

    start = time.perf_counter()

    result = tune_top_five(
        frame,
        model_names=names,
        target_column="target",
        feature_columns=features,
        task=task,
        time_budget_seconds=20,
    )

    elapsed = time.perf_counter() - start

    assert result["success"], result
    assert result["models_attempted"] <= 5
    assert result["cv_folds"] == 3
    assert len(result["results"]) <= 5
    assert result["winner"] is not None

    seen = set()

    for item in result["results"]:
        assert item["model"] in names
        assert item["model"] not in seen
        seen.add(item["model"])
        assert 1 <= item["configurations_tested"] <= 8
        if item["baseline_score"] is not None:
            if result["higher_is_better"]:
                assert item["best_score"] >= item["baseline_score"]
            else:
                assert item["best_score"] <= item["baseline_score"]
        if item["recommendation_status"] in {
            "parameter_changes_recommended",
            "partial_parameter_changes",
        }:
            assert item["selected_configuration"] == "tuned"
            assert item["best_params"]
            assert item["improvement_over_default"] > 0
        elif item["recommendation_status"] in {
            "defaults_recommended",
            "partial_defaults_recommended",
            "insufficient_validation",
        }:
            assert item["selected_configuration"] == "defaults"
            assert item["best_params"] == {}

        for attempt in item["attempts"]:
            if attempt["status"] == "success":
                assert attempt["score"] is not None
                assert math.isfinite(attempt["score"])
                assert isinstance(attempt["parameters"], dict)

    # The eventual API needs serializable results.
    json.dumps(result, allow_nan=False)

    ranking = result["ranking"]

    for earlier, later in zip(ranking, ranking[1:]):
        first = earlier["best"]["score"]
        second = later["best"]["score"]

        if result["higher_is_better"]:
            assert first >= second
        else:
            assert first <= second

    print(f"\n{task.upper()} TOP-5 TEST PASSED")
    print("Requested:", len(names))
    print("Attempted:", result["models_attempted"])
    print("Completed:", result["models_completed"])
    print("Timed out:", result["timed_out"])
    print("Winner:", result["winner"]["model"])
    print("Best score:", result["winner"]["best"]["score"])
    print("Best parameter changes:",
          result["winner"]["best"]["changes"])
    print("Elapsed:", round(elapsed, 3), "seconds")


def test_validation():
    frame, features = build_data("classification")

    def request(**overrides):
        kwargs = {
            "model_names": ["Decision Tree"],
            "target_column": "target",
            "feature_columns": features,
            "task": "classification",
            "time_budget_seconds": 5,
        }
        kwargs.update(overrides)
        return tune_top_five(frame, **kwargs)

    invalid_requests = [
        {"model_names": []},
        {"model_names": ["Decision Tree"] * 2},
        {"model_names": ["Unknown Model"]},
        {"model_names": ["Decision Tree"] * 6},
        {"feature_columns": ["target"]},
        {"feature_columns": ["nonexistent_feature"]},
        {"target_column": "missing_target"},
        {"task": "unknown"},
        {"time_budget_seconds": 0},
        {"cv_folds": 1},
    ]

    for params in invalid_requests:
        try:
            request(**params)
        except (TypeError, ValueError):
            pass
        else:
            raise AssertionError(
                f"Invalid request was accepted: {params}"
            )

    print("\nINPUT VALIDATION PASSED")

    two_fold = tune_top_five(
        frame,
        model_names=["Decision Tree"],
        target_column="target",
        feature_columns=features,
        task="classification",
        cv_folds=2,
        time_budget_seconds=5,
    )
    assert two_fold["results"][0]["recommendation_status"] == (
        "insufficient_validation"
    )
    assert two_fold["results"][0]["best_params"] == {}
    print("LOW-FOLD CONSERVATIVE RECOMMENDATION PASSED")


def test_matches_model_advisor_baselines():
    frame, features = build_data("classification")
    advisor = evaluate_models(
        frame,
        target_column="target",
        feature_columns=features,
        task="classification",
        cv_folds=3,
    )
    finalists = advisor["ranking"][:2]

    tuned = tune_top_five(
        frame,
        model_names=[item["model"] for item in finalists],
        target_column="target",
        feature_columns=features,
        task="classification",
        scoring="balanced_accuracy",
        higher_is_better=True,
        metric="Balanced accuracy",
        random_state=advisor["random_state"],
        cv_folds=advisor["cv_folds"],
        max_rows=advisor["rows_evaluated"],
        level="basic",
        time_budget_seconds=20,
    )

    actual_baselines = {
        item["model"]: item["baseline_score"]
        for item in tuned["results"]
    }
    expected_baselines = {
        item["model"]: item["mean_score"]
        for item in finalists
    }

    assert actual_baselines == expected_baselines
    assert tuned["metric"] == advisor["metric"]
    assert tuned["rows_evaluated"] == advisor["rows_evaluated"]
    assert tuned["cv_folds"] == advisor["cv_folds"]

    print("\nMODEL ADVISOR BASELINE MATCH PASSED")


def test_tuning_requires_consistent_practical_improvement():
    assert _meaningful_improvement(
        0.80,
        0.82,
        task="classification",
        higher_is_better=True,
        baseline_fold_scores=[0.78, 0.80, 0.82],
        candidate_fold_scores=[0.80, 0.82, 0.84],
    )

    assert not _meaningful_improvement(
        0.50,
        0.5263,
        task="classification",
        higher_is_better=True,
        baseline_fold_scores=[0.50, 0.50, 0.50],
        candidate_fold_scores=[0.54, 0.54, 0.499],
    )

    assert not _meaningful_improvement(
        0.80,
        0.805,
        task="classification",
        higher_is_better=True,
        baseline_fold_scores=[0.79, 0.80, 0.81],
        candidate_fold_scores=[0.795, 0.805, 0.815],
    )


if __name__ == "__main__":
    for case in TOP_FIVE_CASES:
        test_top_five(*case)

    test_validation()
    test_matches_model_advisor_baselines()

    print("\nALL STAGE-2 TOP-5 TESTS PASSED")
