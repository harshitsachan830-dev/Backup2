import pandas as pd

from ml_platform_error_assistant.preprocessing_preview import preview_preprocessing


def test_numeric_preview_returns_skewness_and_shared_probability_density(tmp_path):
    path = tmp_path / "skewed.csv"
    pd.DataFrame(
        {
            "Monthly_Spending": [
                10, 12, 13, 14, 15, 16, 17, 18, 20, 24, 30, 45, 90, None,
            ],
            "Visit_Count": [0, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 1, 2, None],
        }
    ).to_csv(path, index=False)

    preview = preview_preprocessing(path, "Monthly_Spending", "median")
    before = preview["before"]["statistics"]
    after = preview["after"]["statistics"]

    assert before["skewness"] > 0.5
    assert before["pdf"]["edges"] == after["pdf"]["edges"]
    assert before["kde"]["x"] == after["kde"]["x"]
    assert before["kde"]["bandwidth"] == after["kde"]["bandwidth"]
    assert len(before["kde"]["density"]) == 320
    assert all(value is not None and value >= 0 for value in before["kde"]["density"])
    kde_area = sum(
        (before["kde"]["density"][index] + before["kde"]["density"][index + 1])
        * (before["kde"]["x"][index + 1] - before["kde"]["x"][index]) / 2
        for index in range(len(before["kde"]["x"]) - 1)
    )
    assert abs(kde_area - 1.0) < 0.08
    assert len(before["pdf"]["density"]) == 16
    assert len(after["pdf"]["density"]) == 16
    for stats in (before, after):
        edges = stats["pdf"]["edges"]
        density = stats["pdf"]["density"]
        area = sum(density[i] * (edges[i + 1] - edges[i]) for i in range(len(density)))
        assert abs(area - 1.0) < 0.03


def test_numeric_mode_preview_handles_discrete_counts(tmp_path):
    path = tmp_path / "counts.csv"
    pd.DataFrame({"Visit_Count": [0, 1, 1, 2, 2, 2, 3, None]}).to_csv(path, index=False)

    preview = preview_preprocessing(path, "Visit_Count", "most_frequent")

    assert preview["after"]["statistics"]["missing_count"] == 0
    assert preview["after"]["statistics"]["pdf"]["sample_count"] == 8
    assert "mode" in preview["explanation"].lower()


def test_categorical_preview_returns_shared_before_after_frequency_data(tmp_path):
    path = tmp_path / "categories.csv"
    pd.DataFrame(
        {"Region": ["North", "South", None, "East", "North", "South", None, "East"]}
    ).to_csv(path, index=False)

    preview = preview_preprocessing(path, "Region", "most_frequent")
    before = preview["before"]["statistics"]["category_distribution"]
    after = preview["after"]["statistics"]["category_distribution"]

    assert preview["feature_type"] == "categorical"
    assert before["categories"] == after["categories"]
    assert set(before["categories"]) == {"North", "South", "East"}
    assert before["sample_count"] == 6
    assert after["sample_count"] == 8
    assert before["counts"] == [2, 2, 2]
    assert sorted(after["counts"]) == [2, 2, 4]
    assert abs(sum(before["percentages"]) - 100) < 0.01
    assert abs(sum(after["percentages"]) - 100) < 0.01
