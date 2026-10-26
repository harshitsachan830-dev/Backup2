
"""
ModelMind - AutoML Result Adapter

Convert measured evaluation results into display-ready
model recommendations.

Supports:
- Regression: lower RMSE is better
- Classification: higher balanced accuracy is better
- Screening and finalist results
- XGBoost
- Failed and skipped candidates

Does not change the original recommender or generated code.

Only the successfully evaluated finalists receive final
performance ranks.
"""

from __future__ import annotations

from typing import Any


def build_automl_recommendations(
    evaluation: dict[str, Any],
) -> dict[str, Any]:
    """
    Convert the result of evaluate_models() into
    an explicit performance-based recommendation list.
    """

    if not isinstance(evaluation, dict):
        raise TypeError(
            "Evaluation must be a dictionary."
        )

    task = evaluation.get("task")

    if task not in {"regression", "classification"}:
        raise ValueError(
            "Evaluation task must be regression or classification."
        )

    metric = evaluation.get("metric")

    higher_is_better = evaluation.get(
        "higher_is_better"
    )

    if not isinstance(higher_is_better, bool):
        raise ValueError(
            "Evaluation must specify higher_is_better."
        )

    screening = evaluation.get(
        "screening_results",
        [],
    )

    finalists = evaluation.get(
        "results",
        [],
    )

    if not isinstance(screening, list):
        raise ValueError(
            "screening_results must be a list."
        )

    if not isinstance(finalists, list):
        raise ValueError(
            "results must be a list."
        )

    screened_by_name: dict[str, dict[str, Any]] = {}

    for item in screening:
        if isinstance(item, dict):
            name = item.get("model")

            if isinstance(name, str):
                screened_by_name[name] = item

    successful = []

    for item in finalists:
        if not isinstance(item, dict):
            continue

        if item.get("status") != "success":
            continue

        score = item.get("mean_score")

        if (
            not isinstance(score, (int, float))
            or isinstance(score, bool)
        ):
            continue

        from math import isfinite

        if not isfinite(float(score)):
            continue

        successful.append(item)

    successful.sort(
        key=lambda item: item["mean_score"],
        reverse=higher_is_better,
    )

    recommendations = []

    for rank, item in enumerate(successful, start=1):
        name = str(item["model"])

        recommendations.append({
            "rank": rank,
            "name": name,
            "evaluation_status": "evaluated",
            "metric": metric,
            "measured_score": item["mean_score"],
            "std_score": item.get("std_score"),
            "fold_scores": item.get("fold_scores", []),
            "scaler": item.get("scaler", "none"),
            "cv_folds": evaluation.get("cv_folds"),
            "screening_score": (
                screened_by_name
                .get(name, {})
                .get("mean_score")
            ),
            "best_tested": rank == 1,
        })

    finalists_by_name = {
        str(item.get("model")): item
        for item in finalists
        if isinstance(item, dict)
        and isinstance(item.get("model"), str)
    }

    not_finalists = []

    for item in screening:
        if not isinstance(item, dict):
            continue

        name = item.get("model")

        if not isinstance(name, str):
            continue

        final = finalists_by_name.get(name)

        if final is None:
            status = (
                "screening_failed"
                if item.get("status") != "success"
                else "screened_out"
            )

            error = item.get("error")

        elif final.get("status") != "success":
            status = "final_evaluation_failed"
            error = final.get("error")

        else:
            continue

        not_finalists.append({
            "name": name,
            "status": status,
            "screening_score": item.get("mean_score"),
            "error": error,
        })

    winner = (
        recommendations[0]
        if recommendations
        else None
    )

    return {
        "success": winner is not None,
        "task": task,
        "metric": metric,
        "higher_is_better": higher_is_better,
        "winner": winner,
        "recommendations": recommendations,
        "not_finalists": not_finalists,
        "candidate_count": evaluation.get(
            "candidate_count",
            len(screening),
        ),
        "finalist_count": len(finalists),
        "screening_folds": evaluation.get(
            "screening_folds",
        ),
        "screening_rows": evaluation.get("screening_rows"),
        "cv_folds": evaluation.get("cv_folds"),
        "rows_available": evaluation.get("rows_available"),
        "rows_total": evaluation.get("rows_total"),
        "rows_evaluated": evaluation.get("rows_evaluated"),
        "rows_excluded_missing_target": evaluation.get(
            "rows_excluded_missing_target"
        ),
        "target_column": evaluation.get("target_column"),
        "class_distribution": evaluation.get(
            "class_distribution", []
        ),
        "numeric_feature_count": evaluation.get(
            "numeric_feature_count"
        ),
        "categorical_feature_count": evaluation.get(
            "categorical_feature_count"
        ),
        "feature_missing_count": evaluation.get(
            "feature_missing_count"
        ),
        "warnings": evaluation.get("warnings", []),
        "note": (
            "Final ranks use measured cross-validation "
            "performance among successfully evaluated "
            "finalists. Screening scores and final scores "
            "must not be interpreted as interchangeable."
        ),
    }
