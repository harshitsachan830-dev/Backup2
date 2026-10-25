from pathlib import Path

import pandas as pd

from ml_platform_error_assistant.preprocessing_advisor import (
    analyze_preprocessing,
)


def _recommendations(path: Path, level: str) -> dict[str, dict]:
    result = analyze_preprocessing(path, level)
    return {
        recommendation["feature"]: recommendation
        for recommendation in result["recommendations"]
    }


def _make_dataset(path: Path) -> None:
    pd.DataFrame({
        "Age": [
            18.1, 20.1, 21.1, 22.1, 23.1, 24.1, 25.1, 26.1, 27.1, 28.1,
            None, 29.1, 30.1, 31.1, 32.1, 33.1, 34.1, 35.1, 36.1, 37.1, 38.1,
        ],
        "Annual_Income": [
            20_000, 22_000, 24_000, 25_000, 26_000,
            27_000, 28_000, 30_000, 32_000, 35_000,
            40_000, 50_000, 70_000, 100_000.5, 250_000,
            21_000, 23_000, 29_000, 36_000, 60_000, None,
        ],
        "Visit_Count": [
            0, 1, 1, 2, 2, 2, 3, 3, 4, 4, None,
            1, 1, 2, 2, 3, 3, 4, 4, 5, 5,
        ],
        "Customer_ID": list(range(1001, 1022)),
        "Complete_Value": [index + 0.25 for index in range(21)],
        "Region": [
            "North", "South", "East", "North", "South",
            None, "East", "North", "South", "East", "North",
            "North", "South", "East", "North", "South",
            "East", "North", "South", "East", "North",
        ],
    }).to_csv(path, index=False)


def test_numeric_reasons_follow_observed_profile_without_id_false_positive(
    tmp_path: Path,
) -> None:
    path = tmp_path / "reasons.csv"
    _make_dataset(path)

    basic = _recommendations(path, "basic")
    assert "skewness" in basic["Age"]["why"]
    assert "cannot tell why values are missing" in basic["Age"]["why"]
    assert "safe, quick default" not in basic["Age"]["why"]

    income = basic["Annual_Income"]
    assert income["imputation_strategy"] == "median"
    assert "skewness" in income["why"]
    assert "less sensitive" in income["why"]
    assert not any(
        "identifier" in warning.lower()
        for warning in income["warnings"]
    )

    visits = basic["Visit_Count"]
    assert visits["imputation_strategy"] == "most_frequent"
    assert "discrete/count-like" in visits["why"]
    assert "fractions" in visits["why"]

    customer_id = basic["Customer_ID"]
    assert any(
        "column name suggests an identifier" in warning.lower()
        for warning in customer_id["warnings"]
    )

    advanced = _recommendations(path, "advanced")
    assert "no missing values" in advanced["Complete_Value"]["why"]
    assert "median" not in advanced["Complete_Value"]["why"]


def test_categorical_reasons_explain_mode_tradeoff(tmp_path: Path) -> None:
    path = tmp_path / "categories.csv"
    _make_dataset(path)

    basic = _recommendations(path, "basic")
    region_why = basic["Region"]["why"]

    assert "preserves an existing label" in region_why
    assert "over-represent" in region_why
    assert "missingness has meaning" in region_why
    assert "safest beginner-friendly approach" not in basic["Region"]["explanation"]
    advanced = _recommendations(path, "advanced")
    assert "OneHotEncoder represents" in advanced["Region"]["why"]
    assert "separate indicators" in advanced["Region"]["why"]
    assert "training rows" in advanced["Region"]["why"]


def test_revised_reasons_leave_basic_medium_advanced_code_paths_intact(
    tmp_path: Path,
) -> None:
    path = tmp_path / "code-levels.csv"
    _make_dataset(path)

    basic = _recommendations(path, "basic")
    medium = _recommendations(path, "medium")
    advanced = _recommendations(path, "advanced")

    basic_code = basic["Age"]["example_code"]
    medium_code = medium["Age"]["example_code"]
    advanced_code = advanced["Age"]["example_code"]

    assert '.fillna(df["Age"].mean())' in basic_code
    assert "quantile(0.25)" in medium_code
    assert '.clip(lower=lower_bound, upper=upper_bound)' in medium_code
    assert "SimpleImputer" in advanced_code
    assert "Pipeline" in advanced_code
    assert "ColumnTransformer" in advanced_code
    assert "preprocessor.fit_transform(X_train)" in advanced_code
    assert len({basic_code, medium_code, advanced_code}) == 3

    basic_category_code = basic["Region"]["example_code"]
    medium_category_code = medium["Region"]["example_code"]
    advanced_category_code = advanced["Region"]["example_code"]

    assert '.fillna(most_common)' in basic_category_code
    assert "pd.get_dummies" in medium_category_code
    assert "OneHotEncoder" in advanced_category_code
    assert "ColumnTransformer" in advanced_category_code
