
"""
Independent background Fast Tuning tests.

Run as a Python script, not inside an interactive Python shell,
because Windows multiprocessing uses spawn.
"""

import json
import tempfile
import time
from unittest.mock import patch

from pathlib import Path

import pandas as pd
from sklearn.datasets import make_classification

from ml_platform_error_assistant.fast_tuning_jobs import (
    FastTuningJobManager,
    _tuning_worker,
)


class _CaptureConnection:
    def __init__(self):
        self.message = None

    def send(self, message):
        self.message = message

    def close(self):
        pass


def test_legacy_worker_options_fail_with_restart_guidance():
    connection = _CaptureConnection()
    _tuning_worker(
        connection,
        "unused.csv",
        {
            "model_names": ["Decision Tree"],
            "target_column": "target",
            "feature_columns": ["feature"],
            "task": "classification",
        },
    )

    assert connection.message is not None
    assert connection.message["ok"] is False
    assert "scoring" in connection.message["error"]
    assert "Restart JupyterLab" in connection.message["error"]


def test_worker_returns_code_with_selected_tuned_parameters():
    connection = _CaptureConnection()
    frame = pd.DataFrame({
        "feature": [0, 1, 2, 3],
        "target": [0, 0, 1, 1],
    })

    with tempfile.TemporaryDirectory() as temporary:
        path = Path(temporary) / "conversion.csv"
        frame.to_csv(path, index=False)

        tuning_result = {
            "results": [{
                "model": "Linear SVM",
                "recommendation_status": (
                    "parameter_changes_recommended"
                ),
                "best": {
                    "parameters": {
                        "C": 0.01,
                        "class_weight": "balanced",
                        "max_iter": 3000,
                    },
                },
            }],
        }

        with patch(
            "ml_platform_error_assistant.fast_hyperparameter_tuner.tune_top_five",
            return_value=tuning_result,
        ):
            _tuning_worker(
                connection,
                str(path),
                {
                    "model_names": ["Linear SVM"],
                    "target_column": "target",
                    "feature_columns": ["feature"],
                    "task": "classification",
                    "scoring": "balanced_accuracy",
                    "higher_is_better": True,
                    "metric": "Balanced accuracy",
                    "random_state": 42,
                    "cv_folds": 3,
                    "max_rows": 2000,
                    "time_budget_seconds": 20,
                    "level": "basic",
                },
            )

    assert connection.message is not None
    assert connection.message["ok"] is True
    result = connection.message["result"]["results"][0]
    assert result["code_error"] is None
    assert "LinearSVC(" in result["code"]
    assert "C=0.01" in result["code"]
    assert "class_weight='balanced'" in result["code"]


def wait_for_job(manager, job_id, owner, timeout=60):
    started = time.monotonic()

    while time.monotonic() - started < timeout:
        state = manager.get(job_id, owner=owner)

        if state is None:
            raise AssertionError("Job unexpectedly missing.")

        if state["status"] in {
            "completed", "failed", "cancelled", "timed_out"
        }:
            return state

        time.sleep(0.1)

    raise TimeoutError("Test job did not finish.")


def main():
    test_legacy_worker_options_fail_with_restart_guidance()
    print("STALE SERVER OPTIONS DIAGNOSTIC PASSED")

    X, y = make_classification(
        n_samples=150,
        n_features=6,
        n_informative=4,
        n_redundant=0,
        random_state=42,
    )

    features = [f"feature_{i}" for i in range(6)]

    frame = pd.DataFrame(X, columns=features)
    frame["target"] = y

    with tempfile.TemporaryDirectory() as temporary:
        path = Path(temporary) / "test_dataset.csv"
        frame.to_csv(path, index=False)

        manager = FastTuningJobManager(
            max_pending=3,
            timeout_seconds=45,
        )

        try:
            job_id = manager.submit(
                path,
                owner="student_a",
                model_names=[
                    "Logistic Regression",
                    "Decision Tree",
                    "Random Forest",
                    "K-Nearest Neighbors",
                    "Gaussian Naive Bayes",
                ],
                target_column="target",
                feature_columns=features,
                task="classification",
                time_budget_seconds=20,
            )

            assert len(job_id) == 32

            # A different authenticated user must not see this job.
            assert manager.get(
                job_id, owner="student_b"
            ) is None

            assert manager.cancel(
                job_id, owner="student_b"
            ) is None

            state = wait_for_job(
                manager, job_id, "student_a"
            )

            print("JOB STATUS:", state["status"])

            if state["status"] != "completed":
                raise AssertionError(
                    f"Worker failed: {state['error']}"
                )

            result = state["result"]

            assert result["success"]
            assert result["models_attempted"] == 5
            assert result["winner"] is not None
            assert result["metric"] == "Balanced accuracy"
            assert result["scoring"] == "balanced_accuracy"
            assert result["cv_folds"] == 3
            assert result["rows_evaluated"] == len(frame)

            json.dumps(result, allow_nan=False)

            print(
                "BEST TUNED MODEL:",
                result["winner"]["model"],
            )
            print(
                "BEST PARAMETER CHANGES:",
                result["winner"]["best"]["changes"],
            )
            print(
                "TUNING TIME:",
                result["elapsed_seconds"],
            )

            print("OWNER ISOLATION PASSED")
            print("BACKGROUND EXECUTION PASSED")

            cancelled_id = manager.submit(
                path,
                owner="student_a",
                model_names=["Random Forest"],
                target_column="target",
                feature_columns=features,
                task="classification",
                time_budget_seconds=20,
            )

            cancelled = manager.cancel(
                cancelled_id,
                owner="student_a",
            )

            assert cancelled is not None

            cancelled_state = wait_for_job(
                manager, cancelled_id, "student_a"
            )

            assert cancelled_state["status"] in {
                "cancelled",
                "completed",
            }

            print(
                "CANCELLATION TEST:",
                cancelled_state["status"],
            )
            print("ALL BACKGROUND TESTS PASSED")

        finally:
            manager.shutdown()


if __name__ == "__main__":
    main()
