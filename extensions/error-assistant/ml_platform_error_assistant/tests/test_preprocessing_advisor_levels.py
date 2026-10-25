import ast

import pandas as pd

from ml_platform_error_assistant.preprocessing_advisor import analyze_preprocessing


def test_preprocessing_levels_generate_distinct_code_and_advanced_encoders(tmp_path):
    dataset_path = tmp_path / "students.csv"
    pd.DataFrame(
        {
            "hours": [float(index) if index != 2 else None for index in range(30)],
            "group": ["A" if index % 2 else "B" for index in range(30)],
            "student_name": [f"student-{index}" for index in range(30)],
            "target": [index % 2 for index in range(30)],
        }
    ).to_csv(dataset_path, index=False)

    basic = analyze_preprocessing(dataset_path, level="basic")
    medium = analyze_preprocessing(dataset_path, level="medium")
    advanced = analyze_preprocessing(dataset_path, level="advanced")

    basic_numeric = next(
        item for item in basic["recommendations"] if item["feature"] == "hours"
    )
    medium_numeric = next(
        item for item in medium["recommendations"] if item["feature"] == "hours"
    )
    advanced_numeric = next(
        item for item in advanced["recommendations"] if item["feature"] == "hours"
    )
    medium_category = next(
        item for item in medium["recommendations"] if item["feature"] == "group"
    )
    advanced_category = next(
        item for item in advanced["recommendations"] if item["feature"] == "group"
    )
    advanced_high_cardinality = next(
        item
        for item in advanced["recommendations"]
        if item["feature"] == "student_name"
    )

    assert "fillna" in basic_numeric["example_code"]
    assert "clip(lower=lower_bound" in medium_numeric["example_code"]
    assert "ColumnTransformer" in advanced_numeric["example_code"]
    assert "pd.get_dummies" in medium_category["example_code"]
    assert "OneHotEncoder" in advanced_category["example_code"]
    assert "OrdinalEncoder" in advanced_high_cardinality["example_code"]

    pipeline_code = advanced["pipeline_code"]
    assert "OneHotEncoder" in pipeline_code
    assert "OrdinalEncoder" in pipeline_code
    assert "ColumnTransformer" in pipeline_code

    for result in (basic, medium, advanced):
        for recommendation in result["recommendations"]:
            ast.parse(recommendation["example_code"], feature_version=(3, 10))
    ast.parse(pipeline_code, feature_version=(3, 10))

    for recommendation in advanced["recommendations"]:
        feature_namespace = {"df": pd.read_csv(dataset_path)}
        exec(recommendation["example_code"], feature_namespace)
        assert feature_namespace["X_train_transformed"].shape[0] == 24
        assert feature_namespace["X_test_transformed"].shape[0] == 6
        assert feature_namespace["X_train_transformed"].shape[1] > 0
        assert feature_namespace["X_test_transformed"].shape[1] > 0

    pipeline_namespace = {"df": pd.read_csv(dataset_path)}
    exec(pipeline_code, pipeline_namespace)
    assert pipeline_namespace["X_train_transformed"].shape[1] > 0
    assert pipeline_namespace["X_test_transformed"].shape[1] > 0

    supervised_pipeline = pipeline_code.replace(
        "target_column = None",
        "target_column = 'target'",
    )
    supervised_namespace = {"df": pd.read_csv(dataset_path)}
    exec(supervised_pipeline, supervised_namespace)
    assert "target" not in supervised_namespace["X_train"].columns
    assert supervised_namespace["y_train"].shape[0] == 24


def test_numeric_imputation_uses_shape_and_discrete_profile(tmp_path):
    dataset_path = tmp_path / "numeric_profiles.csv"
    pd.DataFrame(
        {
            "symmetric": [-3.4, -2.2, -1.1, 1.1, 2.2, 3.4, 4.3, 5.2, None],
            "right_skewed": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 10.25, None],
            "count": [0, 0, 1, 1, 2, 2, None, 1, 0],
            "empty": [None] * 9,
        }
    ).to_csv(dataset_path, index=False)

    result = analyze_preprocessing(dataset_path, level="advanced")
    recommendations = {
        item["feature"]: item for item in result["recommendations"]
    }

    symmetric = recommendations["symmetric"]
    assert symmetric["numeric_kind"] == "continuous"
    assert symmetric["distribution_shape"] == "approximately_symmetric"
    assert symmetric["imputation_strategy"] == "mean"
    assert "symmetric" in symmetric["imputation_reason"]
    assert "mean imputation" in symmetric["imputation_reason"].lower()

    skewed = recommendations["right_skewed"]
    assert skewed["imputation_strategy"] == "median"
    assert skewed["distribution_shape"] == "strongly_right_skewed"
    assert "PowerTransformer" in skewed["example_code"]
    assert "fit_transform(X_train)" in skewed["example_code"]
    assert "transform(X_test)" in skewed["example_code"]

    medium = analyze_preprocessing(dataset_path, level="medium")
    medium_skewed = next(
        item for item in medium["recommendations"]
        if item["feature"] == "right_skewed"
    )
    medium_count = next(
        item for item in medium["recommendations"]
        if item["feature"] == "count"
    )
    assert ".clip(" not in medium_skewed["example_code"]
    assert "without automatically" in medium_skewed["recommended_action"]
    assert ".clip(" not in medium_count["example_code"]
    assert "without capping discrete" in medium_count["recommended_action"]
    assert "mode" in medium_count["why"].lower()

    count = recommendations["count"]
    assert count["numeric_kind"] == "discrete"
    assert count["imputation_strategy"] == "most_frequent"
    assert "SimpleImputer(strategy='most_frequent')" in count["example_code"]

    basic = analyze_preprocessing(dataset_path, level="basic")
    basic_count = next(
        item for item in basic["recommendations"] if item["feature"] == "count"
    )
    assert ".mode().iloc[0]" in basic_count["example_code"]

    empty = recommendations["empty"]
    assert empty["imputation_strategy"] == "drop_column"
    assert "No observed numeric values" in empty["imputation_reason"]

    pipeline_code = result["pipeline_code"]
    assert "PowerTransformer" in pipeline_code
    assert 'SimpleImputer(strategy="most_frequent")' in pipeline_code
    pipeline_namespace = {"df": pd.read_csv(dataset_path)}
    exec(pipeline_code, pipeline_namespace)
    assert pipeline_namespace["X_train_transformed"].shape[0] == 7
    assert pipeline_namespace["X_test_transformed"].shape[0] == 2

    for recommendation in recommendations.values():
        ast.parse(recommendation["example_code"], feature_version=(3, 10))
