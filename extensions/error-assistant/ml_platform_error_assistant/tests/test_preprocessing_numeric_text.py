from pathlib import Path

import pandas as pd

from ml_platform_error_assistant.dataset import analyze_dataset, analyze_feature, analyze_target
from ml_platform_error_assistant.preprocessing_advisor import analyze_preprocessing
from ml_platform_error_assistant.preprocessing_apply import apply_preprocessing
from ml_platform_error_assistant.preprocessing_preview import preview_preprocessing


def _rec_map(path: Path, level: str = "basic") -> dict[str, dict]:
    result = analyze_preprocessing(path, level)
    return {item["feature"]: item for item in result["recommendations"]}


def test_messy_numeric_text_gets_numeric_recommendations_and_honest_why():
    path = Path(__file__).resolve().parents[4] / "messy_preprocessing_dataset.csv"
    assert path.exists()
    recs = _rec_map(path)

    for column in ("age", "cgpa", "weight", "height", "salary", "projects"):
        rec = recs[column]
        assert rec["feature_type"] == "numerical"
        assert rec["numeric_conversion_required"] is True
        assert rec["parse_failure_count"] > 0
        assert "stored as text" in rec["why"]
        assert "unparseable" in rec["why"]
        assert "Inspect" in " ".join(rec["warnings"])
        compile(rec["example_code"], f"{column}-basic", "exec")

    assert recs["gender"]["feature_type"] == "categorical"
    assert recs["name"]["feature_type"] == "categorical"
    assert recs["email"]["feature_type"] == "categorical"

    code_scope = {"df": pd.read_csv(path)}
    exec(recs["cgpa"]["example_code"], code_scope)
    assert pd.api.types.is_numeric_dtype(code_scope["df"]["cgpa"])
    assert code_scope["df"]["cgpa"].isna().sum() == 0


def test_advanced_pipeline_parses_text_before_train_only_fitted_steps():
    path = Path(__file__).resolve().parents[4] / "messy_preprocessing_dataset.csv"
    pipeline = analyze_preprocessing(path, "advanced")["pipeline_code"]
    assert "numeric_text_cols" in pipeline
    assert "flags=re.IGNORECASE" in pipeline
    scope = {"df": pd.read_csv(path)}
    exec(pipeline, scope)
    assert scope["X_train_transformed"].shape[0] == 40
    assert scope["X_test_transformed"].shape[0] == 10


def test_dataset_and_target_views_share_numeric_text_inference():
    path = Path(__file__).resolve().parents[4] / "messy_preprocessing_dataset.csv"
    overview = analyze_dataset(path)
    assert len(overview["numeric_columns"]) == 7
    assert len(overview["categorical_columns"]) == 7
    assert "cgpa" in overview["numeric_columns"]
    assert "join_date" in overview["categorical_columns"]

    target = analyze_target(path, "salary")
    assert target["is_numeric"] is True
    assert target["is_numeric_text"] is True
    assert target["parse_failure_count"] == 3


def test_numeric_text_detection_preserves_codes_and_dates(tmp_path: Path):
    path = tmp_path / "types.csv"
    pd.DataFrame({
        "student_id": ["10001", "10002", "10003", "unknown", "10005", "10006", "10007", "10008"],
        "gender_code": ["0", "1", "0", "M", "1", "0", "1", "0"],
        "join_date": ["2024-01-02", "2024-02-03", "2024-03-04", "2024-04-05", "2024-05-06", "2024-06-07", "2024-07-08", "2024-08-09"],
        "salary": ["$1,200", "$1,500", "$1,700", "$1,900", "$2,000", "$2,100", "bad", None],
    }).to_csv(path, index=False)

    assert analyze_feature(path, "student_id")["is_numeric"] is False
    assert analyze_feature(path, "gender_code")["is_numeric"] is False
    assert analyze_feature(path, "join_date")["is_numeric"] is False
    salary = analyze_feature(path, "salary")
    assert salary["is_numeric"] is True
    assert salary["actual_missing_count"] == 1
    assert salary["parse_failure_count"] == 1


def test_preview_uses_parsed_numeric_distribution_and_distinguishes_bad_cells(tmp_path: Path):
    path = tmp_path / "measurements.csv"
    pd.DataFrame({"weight": ["50 kg", "60 kg", "70 kg", "80 kg", "bad", None]}).to_csv(path, index=False)

    preview = preview_preprocessing(path, "weight", "median")
    before = preview["before"]["statistics"]
    after = preview["after"]["statistics"]

    assert preview["feature_type"] == "numerical"
    assert preview["actual_missing_count"] == 1
    assert preview["parse_failure_count"] == 1
    assert before["missing_count"] == 2
    assert before["mean"] == 65
    assert after["missing_count"] == 0
    assert "unparseable" in preview["explanation"]
    assert before["pdf"]["edges"] == after["pdf"]["edges"]


def test_apply_converts_numeric_text_then_imputes_and_keeps_undo_backup(tmp_path: Path):
    path = tmp_path / "measurements.csv"
    pd.DataFrame({"weight": ["50 kg", "60 kg", "70 kg", "80 kg", "bad", None]}).to_csv(path, index=False)

    result = apply_preprocessing(path, "weight", "median")
    transformed = pd.read_csv(path)

    assert result["applied"] is True
    assert result["actual_missing_before"] == 1
    assert result["parse_failure_count"] == 1
    assert result["missing_before"] == 2
    assert result["missing_after"] == 0
    assert result["backup_created"] is True
    assert pd.api.types.is_numeric_dtype(transformed["weight"])
    assert transformed["weight"].tolist() == [50, 60, 70, 80, 65, 65]
