import json
from pathlib import Path

import pandas as pd

from ml_platform_error_assistant.preprocessing_preview import (
    preview_preprocessing,
)


def test_numeric_preview_returns_comparable_pdf_and_skewness(
    tmp_path: Path,
) -> None:
    dataset_path = tmp_path / "numeric.csv"
    pd.DataFrame(
        {"value": [1, 2, 3, 4, 5, 6, 100, None]}
    ).to_csv(dataset_path, index=False)

    result = preview_preprocessing(dataset_path, "value", "median")
    distribution = result["distribution"]

    assert (
        result["before"]["statistics"]["skewness"]
        > 0.5
    )
    assert (
        result["before"]["statistics"]["distribution_shape"]
        in {"right_skewed", "strongly_right_skewed"}
    )
    assert (
        result["after"]["statistics"]["skewness"]
        != result["before"]["statistics"]["skewness"]
    )
    assert result["before"]["statistics"]["missing_count"] == 1
    assert result["after"]["statistics"]["missing_count"] == 0
    assert distribution["kind"] == "numerical"
    assert len(distribution["bins"]) == 30
    assert len(distribution["x_edges"]) == 31
    assert all(
        first["end"] == second["start"]
        for first, second in zip(
            distribution["bins"],
            distribution["bins"][1:],
        )
    )
    assert all(
        bin_data["start"] < bin_data["end"]
        for bin_data in distribution["bins"]
    )
    assert len(distribution["before_density"]) == 100
    assert len(distribution["after_density"]) == 100

    for series_name in ("before_density", "after_density"):
        histogram_area = sum(
            item[series_name] * (item["end"] - item["start"])
            for item in distribution["bins"]
        )
        assert abs(histogram_area - 1.0) < 1e-6

    json.dumps(result, allow_nan=False)


def test_numeric_preview_identifies_symmetric_distribution(
    tmp_path: Path,
) -> None:
    dataset_path = tmp_path / "symmetric.csv"
    pd.DataFrame(
        {"value": [-3, -2, -1, 1, 2, 3, None]}
    ).to_csv(dataset_path, index=False)

    result = preview_preprocessing(dataset_path, "value", "median")

    assert (
        result["before"]["statistics"]["distribution_shape"]
        == "approximately_symmetric"
    )
    assert (
        abs(result["before"]["statistics"]["skewness"])
        < 0.01
    )
    assert result["distribution"]["kind"] == "numerical"


def test_categorical_preview_includes_missing_value_bar(
    tmp_path: Path,
) -> None:
    dataset_path = tmp_path / "categorical.csv"
    pd.DataFrame(
        {"category": ["blue", "red", None, "blue", "green", None]}
    ).to_csv(dataset_path, index=False)

    result = preview_preprocessing(
        dataset_path,
        "category",
        "most_frequent",
    )
    distribution = result["distribution"]
    missing_bar = next(
        item
        for item in distribution["categories"]
        if item["label"] == "(Missing)"
    )

    assert distribution["kind"] == "categorical"
    assert missing_bar["before_count"] == 2
    assert missing_bar["after_count"] == 0
    assert result["after"]["statistics"]["missing_count"] == 0
    json.dumps(result, allow_nan=False)
