from pathlib import Path
import math
from typing import Any

import pandas as pd
import numpy as np

from .dataset import (
    analyze_feature,
    load_dataset,
)


SUPPORTED_NUMERICAL_STRATEGIES = {
    "mean",
    "median",
    "most_frequent",
}

SUPPORTED_CATEGORICAL_STRATEGIES = {
    "most_frequent",
    "unknown",
}


def _round(value: Any) -> float | None:
    """
    Safely round a numerical value.
    """
    if value is None:
        return None
    try:
        number = float(value)
        return round(number, 4) if math.isfinite(number) else None
    except (TypeError, ValueError):
        return None


def _round_density(value: Any) -> float | None:
    """Keep enough precision for small probability-density values."""
    try:
        number = float(value)
        return round(number, 10) if math.isfinite(number) else None
    except (TypeError, ValueError):
        return None

def _safe_value(value: Any) -> Any:
    """
    Convert pandas / numpy values into JSON-safe values.
    """
    if pd.isna(value):
        return None

    if hasattr(value, "item"):
        try:
            return value.item()
        except Exception:
            pass

    return value


def _sample_values(
    series: pd.Series,
    limit: int = 8,
) -> list[Any]:
    """
    Return a small JSON-safe sample.
    """
    values = series.head(limit).tolist()

    return [
        _safe_value(value)
        for value in values
    ]


def _numeric_stats(
    series: pd.Series,
) -> dict[str, Any]:
    """
    Calculate before/after statistics for a numerical feature.
    """
    numeric = pd.to_numeric(
        series,
        errors="coerce",
    )

    non_null = numeric.dropna()

    if non_null.empty:
        return {
            "missing_count": int(
                numeric.isna().sum()
            ),
            "missing_percentage": (
                round(
                    float(
                        numeric.isna().mean()
                        * 100
                    ),
                    4,
                )
                if len(numeric) > 0
                else 0.0
            ),
            "mean": None,
            "median": None,
            "std": None,
            "skewness": None,
            "min": None,
            "max": None,
        }

    return {
        "missing_count": int(
            numeric.isna().sum()
        ),
        "missing_percentage": round(
            float(
                numeric.isna().mean()
                * 100
            ),
            4,
        ),
        "mean": _round(
            non_null.mean()
        ),
        "median": _round(
            non_null.median()
        ),
        "std": _round(
            non_null.std()
        ),
        "skewness": _round(non_null.skew()),
        "min": _round(
            non_null.min()
        ),
        "max": _round(
            non_null.max()
        ),
    }


def _histogram_pdf(
    series: pd.Series,
    minimum: float,
    maximum: float,
    bins: int = 16,
) -> dict[str, Any]:
    """Return a density-normalized histogram on shared bin edges."""
    values = pd.to_numeric(series, errors="coerce").dropna()
    if values.empty:
        return {"edges": [], "density": [], "counts": [], "sample_count": 0}

    lower = float(minimum)
    upper = float(maximum)
    if not upper > lower:
        # A constant feature still needs a visible, non-zero-width x-axis.
        half_width = max(abs(lower) * 0.05, 0.5)
        lower -= half_width
        upper += half_width

    width = (upper - lower) / bins
    counts = [0] * bins
    for value in values:
        index = min(bins - 1, max(0, int((float(value) - lower) / width)))
        counts[index] += 1

    sample_count = int(len(values))
    density = [count / (sample_count * width) for count in counts]
    edges = [lower + index * width for index in range(bins + 1)]
    return {
        "edges": [_round(edge) for edge in edges],
        "density": [_round_density(value) for value in density],
        "counts": counts,
        "sample_count": sample_count,
    }


def _gaussian_kde(
    series: pd.Series,
    grid: np.ndarray,
    bandwidth: float,
    max_samples: int = 2000,
) -> dict[str, Any]:
    """Evaluate a Gaussian-kernel density estimate on a shared grid."""
    values = pd.to_numeric(series, errors="coerce").dropna().to_numpy(dtype=float)
    values = values[np.isfinite(values)]
    if values.size == 0:
        return {"x": [], "density": [], "sample_count": 0}

    # Deterministic evenly-spaced sampling bounds work on large uploaded files.
    if values.size > max_samples:
        indices = np.linspace(0, values.size - 1, max_samples, dtype=int)
        values = values[indices]

    standardized = (grid[:, None] - values[None, :]) / bandwidth
    density = np.exp(-0.5 * standardized * standardized).mean(axis=1)
    density /= bandwidth * np.sqrt(2 * np.pi)
    return {
        "x": [_round(value) for value in grid],
        "density": [_round_density(value) for value in density],
        "sample_count": int(len(pd.to_numeric(series, errors="coerce").dropna())),
        "bandwidth": _round(bandwidth),
    }


def _shared_kde_grid(series: pd.Series, points: int = 320) -> tuple[np.ndarray, float] | None:
    """Choose a stable Scott-rule bandwidth and grid for both preview curves."""
    values = pd.to_numeric(series, errors="coerce").dropna().to_numpy(dtype=float)
    values = values[np.isfinite(values)]
    if values.size < 2:
        return None

    std = float(np.std(values, ddof=1))
    iqr = float(np.quantile(values, 0.75) - np.quantile(values, 0.25))
    robust_scale = iqr / 1.34
    scale = min(std, robust_scale) if robust_scale > 0 and std > 0 else std
    if not math.isfinite(scale) or scale <= 0:
        scale = max(abs(float(np.median(values))) * 0.01, 0.5)

    bandwidth = 0.9 * scale * values.size ** (-0.2)
    if not math.isfinite(bandwidth) or bandwidth <= 0:
        return None
    lower = float(values.min()) - 3 * bandwidth
    upper = float(values.max()) + 3 * bandwidth
    return np.linspace(lower, upper, points), bandwidth


def _categorical_stats(
    series: pd.Series,
) -> dict[str, Any]:
    """
    Calculate before/after statistics for a categorical feature.
    """
    missing_count = int(
        series.isna().sum()
    )

    missing_percentage = (
        round(
            float(
                series.isna().mean()
                * 100
            ),
            4,
        )
        if len(series) > 0
        else 0.0
    )

    non_null = series.dropna()

    mode_value = None

    if not non_null.empty:
        modes = non_null.mode()

        if not modes.empty:
            mode_value = _safe_value(
                modes.iloc[0]
            )

    return {
        "missing_count":
            missing_count,
        "missing_percentage":
            missing_percentage,
        "unique_count": int(
            non_null.nunique()
        ),
        "most_frequent_value":
            mode_value,
    }


def _categorical_distribution(
    series: pd.Series,
    categories: list[str] | None = None,
) -> dict[str, Any]:
    """Return category counts and percentages for a before/after bar chart."""
    values = series.dropna().astype(str)
    counts = values.value_counts(dropna=True)
    if categories is None:
        categories = [str(value) for value in counts.index.tolist()]
    total = int(len(values))
    shown = set(categories) - {"Other (remaining)"}
    category_counts = [
        int(counts.drop(labels=list(shown), errors="ignore").sum())
        if category == "Other (remaining)"
        else int(counts.get(category, 0))
        for category in categories
    ]
    return {
        "categories": categories,
        "counts": category_counts,
        "percentages": [
            round(float(count) / total * 100, 6) if total else 0.0
            for count in category_counts
        ],
        "sample_count": total,
    }


def _shared_category_labels(
    before: pd.Series,
    after: pd.Series,
    limit: int = 8,
) -> list[str]:
    """Select common category labels once, so both bars use the same rows."""
    before_counts = before.dropna().astype(str).value_counts()
    after_counts = after.dropna().astype(str).value_counts()
    combined = before_counts.add(after_counts, fill_value=0).sort_values(ascending=False)
    labels = [str(value) for value in combined.index[:limit].tolist()]
    if len(combined) > limit:
        labels.append("Other (remaining)")
    return labels


def _preview_mean(
    series: pd.Series,
) -> tuple[pd.Series, Any]:
    numeric = pd.to_numeric(
        series,
        errors="coerce",
    )

    value = numeric.mean()

    if pd.isna(value):
        raise ValueError(
            "Mean imputation cannot be previewed "
            "because the feature has no usable "
            "numerical values."
        )

    return (
        numeric.fillna(value),
        _safe_value(value),
    )


def _preview_median(
    series: pd.Series,
) -> tuple[pd.Series, Any]:
    numeric = pd.to_numeric(
        series,
        errors="coerce",
    )

    value = numeric.median()

    if pd.isna(value):
        raise ValueError(
            "Median imputation cannot be previewed "
            "because the feature has no usable "
            "numerical values."
        )

    return (
        numeric.fillna(value),
        _safe_value(value),
    )


def _preview_most_frequent(
    series: pd.Series,
) -> tuple[pd.Series, Any]:
    modes = series.dropna().mode()

    if modes.empty:
        raise ValueError(
            "Most-frequent imputation cannot be "
            "previewed because the feature has "
            "no observed values."
        )

    value = modes.iloc[0]

    return (
        series.fillna(value),
        _safe_value(value),
    )


def _preview_unknown(
    series: pd.Series,
) -> tuple[pd.Series, str]:
    value = "Unknown"

    return (
        series.fillna(value),
        value,
    )


def preview_preprocessing(
    path: Path,
    feature: str,
    strategy: str,
) -> dict[str, Any]:
    """
    Preview a preprocessing operation.

    IMPORTANT:
    This function NEVER writes the transformed
    dataframe back to disk.

    The returned "after" values exist only in memory.
    """

    df = load_dataset(path)

    if feature not in df.columns:
        raise ValueError(
            f'Feature "{feature}" was not found '
            "in the dataset."
        )

    normalized_strategy = (
        str(strategy)
        .strip()
        .lower()
        .replace("-", "_")
        .replace(" ", "_")
    )

    analysis = analyze_feature(
        path,
        feature,
    )

    is_numeric = bool(
        analysis.get(
            "is_numeric",
            False,
        )
    )

    original_series = (
        df[feature].copy()
    )

    before_sample = _sample_values(
        original_series
    )

    if is_numeric:
        if (
            normalized_strategy
            not in
            SUPPORTED_NUMERICAL_STRATEGIES
        ):
            raise ValueError(
                "Unsupported numerical preview "
                f'strategy: "{strategy}". '
                "Supported strategies are mean, median, "
                "and most_frequent."
            )

        before_stats = _numeric_stats(
            original_series
        )

        if normalized_strategy == "mean":
            transformed_series, fill_value = (
                _preview_mean(
                    original_series
                )
            )

            explanation = (
                "Missing numerical values are "
                "temporarily replaced with the "
                "feature mean for this preview."
            )

        elif normalized_strategy == "median":
            transformed_series, fill_value = (
                _preview_median(
                    original_series
                )
            )

            explanation = (
                "Missing numerical values are "
                "temporarily replaced with the "
                "feature median for this preview."
            )

        else:
            transformed_series, fill_value = (
                _preview_most_frequent(
                    original_series
                )
            )
            explanation = (
                "Missing discrete numeric values are temporarily replaced "
                "with the most frequent observed value (mode). This keeps "
                "imputed counts or ratings on observed values."
            )

        after_stats = _numeric_stats(
            transformed_series
        )

        # Use identical bin edges before and after so the density comparison
        # shows the effect of the selected strategy rather than two unrelated
        # histogram scales.
        combined = pd.concat(
            [pd.to_numeric(original_series, errors="coerce"), transformed_series]
        ).dropna()
        if not combined.empty:
            histogram_min = float(combined.min())
            histogram_max = float(combined.max())
            before_stats["pdf"] = _histogram_pdf(
                original_series, histogram_min, histogram_max
            )
            after_stats["pdf"] = _histogram_pdf(
                transformed_series, histogram_min, histogram_max
            )
            kde_grid = _shared_kde_grid(combined)
            if kde_grid is not None:
                grid, bandwidth = kde_grid
                before_stats["kde"] = _gaussian_kde(
                    original_series, grid, bandwidth
                )
                after_stats["kde"] = _gaussian_kde(
                    transformed_series, grid, bandwidth
                )

    else:
        if (
            normalized_strategy
            not in
            SUPPORTED_CATEGORICAL_STRATEGIES
        ):
            raise ValueError(
                "Unsupported categorical preview "
                f'strategy: "{strategy}". '
                "Supported strategies are "
                "most_frequent and unknown."
            )

        before_stats = (
            _categorical_stats(
                original_series
            )
        )

        if (
            normalized_strategy
            == "most_frequent"
        ):
            transformed_series, fill_value = (
                _preview_most_frequent(
                    original_series
                )
            )

            explanation = (
                "Missing categorical values are "
                "temporarily replaced with the "
                "most frequent observed category."
            )

        else:
            transformed_series, fill_value = (
                _preview_unknown(
                    original_series
                )
            )

            explanation = (
                "Missing categorical values are "
                "temporarily represented by the "
                "'Unknown' category."
            )

        after_stats = (
            _categorical_stats(
                transformed_series
            )
        )
        labels = _shared_category_labels(original_series, transformed_series)
        before_stats["category_distribution"] = _categorical_distribution(
            original_series, labels
        )
        after_stats["category_distribution"] = _categorical_distribution(
            transformed_series, labels
        )

    after_sample = _sample_values(
        transformed_series
    )

    changed_count = int(
        original_series.isna().sum()
        - transformed_series.isna().sum()
    )

    return {
        "handled": True,
        "source": "modelmind-local",
        "engine":
            "preprocessing-preview",

        "filename": path.name,

        "feature": feature,

        "feature_type": (
            "numerical"
            if is_numeric
            else "categorical"
        ),

        "strategy":
            normalized_strategy,

        "fill_value":
            fill_value,

        "changed_count":
            changed_count,

        "explanation":
            explanation,

        "before": {
            "sample":
                before_sample,
            "statistics":
                before_stats,
        },

        "after": {
            "sample":
                after_sample,
            "statistics":
                after_stats,
        },

        "safety": {
            "preview_only": True,
            "dataset_modified": False,
            "written_to_disk": False,
            "message": (
                "This is an in-memory preview. "
                "The uploaded dataset was not "
                "modified."
            ),
        },
    }
