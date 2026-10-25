from pathlib import Path
from typing import Any

import pandas as pd

from .dataset import analyze_feature, load_dataset, parse_numeric_text


SUPPORTED_NUMERICAL_STRATEGIES = {
    "mean",
    "median",
    "most_frequent",
    "constant",
    "standard_scaler",
    "minmax_scaler",
    "robust_scaler",
    "cap_outliers_iqr",
}

SUPPORTED_CATEGORICAL_STRATEGIES = {
    "most_frequent",
    "unknown",
}


def _normalize_strategy(
    strategy: str,
) -> str:
    return (
        str(strategy)
        .strip()
        .lower()
        .replace("-", "_")
        .replace(" ", "_")
    )


def _json_safe(
    value: Any,
) -> Any:
    if pd.isna(value):
        return None

    if hasattr(value, "item"):
        try:
            return value.item()
        except Exception:
            pass

    return value


def _save_dataset(
    df: pd.DataFrame,
    path: Path,
) -> None:
    """
    Save the dataframe using the original
    dataset file format.
    """

    suffix = path.suffix.lower()

    if suffix == ".csv":
        df.to_csv(
            path,
            index=False,
        )
        return

    if suffix in {".xlsx", ".xls"}:
        df.to_excel(
            path,
            index=False,
        )
        return

    if suffix == ".json":
        df.to_json(
            path,
            orient="records",
            indent=2,
        )
        return

    raise ValueError(
        f"Unsupported dataset format: {suffix}"
    )


def _backup_path(
    path: Path,
) -> Path:
    """
    One original backup is preserved.

    Example:
    students.csv
        ->
    students.modelmind-original.csv
    """

    return path.with_name(
        f"{path.stem}.modelmind-original"
        f"{path.suffix}"
    )


def _create_backup(
    path: Path,
) -> Path:
    backup = _backup_path(path)

    # Preserve the FIRST original dataset.
    # Later preprocessing operations must not
    # overwrite the original backup.
    if not backup.exists():
        backup.write_bytes(
            path.read_bytes()
        )

    return backup


def _apply_mean(
    series: pd.Series,
) -> tuple[pd.Series, Any]:
    numeric = pd.to_numeric(
        series,
        errors="coerce",
    )

    value = numeric.mean()

    if pd.isna(value):
        raise ValueError(
            "Mean imputation cannot be applied "
            "because this feature has no usable "
            "numerical values."
        )

    return (
        numeric.fillna(value),
        _json_safe(value),
    )


def _apply_median(
    series: pd.Series,
) -> tuple[pd.Series, Any]:
    numeric = pd.to_numeric(
        series,
        errors="coerce",
    )

    value = numeric.median()

    if pd.isna(value):
        raise ValueError(
            "Median imputation cannot be applied "
            "because this feature has no usable "
            "numerical values."
        )

    return (
        numeric.fillna(value),
        _json_safe(value),
    )


def _apply_most_frequent(
    series: pd.Series,
) -> tuple[pd.Series, Any]:
    modes = series.dropna().mode()

    if modes.empty:
        raise ValueError(
            "Most-frequent imputation cannot be "
            "applied because this feature has "
            "no observed values."
        )

    value = modes.iloc[0]

    return (
        series.fillna(value),
        _json_safe(value),
    )


def _apply_unknown(
    series: pd.Series,
) -> tuple[pd.Series, str]:
    value = "Unknown"

    return (
        series.fillna(value),
        value,
    )


def _apply_numeric_most_frequent(series: pd.Series) -> tuple[pd.Series, Any]:
    modes = series.dropna().mode()
    if modes.empty:
        raise ValueError(
            "Most-frequent imputation cannot be applied because this feature has no usable numeric values."
        )
    value = modes.iloc[0]
    return series.fillna(value), _json_safe(value)


def apply_preprocessing(
    path: Path,
    feature: str,
    strategy: str,
) -> dict[str, Any]:
    """
    Apply ONE explicitly requested preprocessing
    operation to ONE feature.

    This function modifies the runtime copy of the
    dataset only after it has been explicitly called.

    The original runtime dataset is backed up before
    the first modification so it can be restored.
    """

    if not path.exists():
        raise ValueError(
            "Dataset does not exist."
        )

    df = load_dataset(path)

    if feature not in df.columns:
        raise ValueError(
            f'Feature "{feature}" was not found '
            "in the dataset."
        )

    normalized_strategy = (
        _normalize_strategy(strategy)
    )

    original_series = (
        df[feature].copy()
    )

    analysis = analyze_feature(path, feature)
    is_numeric = bool(analysis.get("is_numeric", False))
    numeric_conversion_required = bool(analysis.get("numeric_conversion_required", False))
    transformed_source = parse_numeric_text(original_series) if is_numeric else original_series
    missing_before = int(transformed_source.isna().sum())

    if missing_before == 0 and not numeric_conversion_required:
        return {
            "handled": True,
            "source": "modelmind-local",
            "engine":
                "preprocessing-apply",
            "filename": path.name,
            "feature": feature,
            "strategy":
                normalized_strategy,
            "applied": False,
            "changed_count": 0,
            "message": (
                "No preprocessing was applied "
                "because this feature has no "
                "missing values."
            ),
        }

    if is_numeric:
        if (
            normalized_strategy
            not in
            SUPPORTED_NUMERICAL_STRATEGIES
        ):
            raise ValueError(
                "Unsupported numerical strategy. "
                "Choose mean, median, most_frequent, constant, a supported scaler, or cap_outliers_iqr."
            )

        if normalized_strategy == "mean":
            transformed, fill_value = (
                _apply_mean(
                    transformed_source
                )
            )
        elif normalized_strategy == "median":
            transformed, fill_value = (
                _apply_median(
                    transformed_source
                )
            )
        elif normalized_strategy == "most_frequent":
            transformed, fill_value = _apply_numeric_most_frequent(transformed_source)
        elif normalized_strategy == "constant":
            transformed, fill_value = transformed_source.fillna(0), 0
        elif normalized_strategy == "cap_outliers_iqr":
            observed = transformed_source.dropna()
            if observed.empty:
                raise ValueError("IQR capping needs at least one observed numeric value.")
            q1, q3 = float(observed.quantile(0.25)), float(observed.quantile(0.75))
            spread = q3 - q1
            lower, upper = q1 - 1.5 * spread, q3 + 1.5 * spread
            transformed = transformed_source.clip(lower=lower, upper=upper)
            fill_value = {"lower": lower, "upper": upper}
        else:
            filled = transformed_source.fillna(transformed_source.median())
            if normalized_strategy == "standard_scaler":
                center, scale = float(filled.mean()), float(filled.std(ddof=0))
            elif normalized_strategy == "minmax_scaler":
                center, scale = float(filled.min()), float(filled.max() - filled.min())
            else:
                center = float(filled.median())
                scale = float(filled.quantile(0.75) - filled.quantile(0.25))
            transformed = (filled - center) / scale if scale else filled * 0
            fill_value = {"center": center, "scale": scale}

    else:
        if (
            normalized_strategy
            not in
            SUPPORTED_CATEGORICAL_STRATEGIES
        ):
            raise ValueError(
                "Unsupported categorical strategy. "
                "Supported strategies are "
                "most_frequent and unknown."
            )

        if (
            normalized_strategy
            == "most_frequent"
        ):
            transformed, fill_value = (
                _apply_most_frequent(
                    original_series
                )
            )
        else:
            transformed, fill_value = (
                _apply_unknown(
                    original_series
                )
            )

    missing_after = int(
        transformed.isna().sum()
    )

    original_text = original_series.astype("string").fillna("<NA>")
    transformed_text = transformed.astype("string").fillna("<NA>")
    changed_count = int(original_text.ne(transformed_text).sum())

    if changed_count <= 0:
        return {
            "handled": True,
            "source": "modelmind-local",
            "engine": "preprocessing-apply",
            "filename": path.name,
            "feature": feature,
            "strategy": normalized_strategy,
            "applied": False,
            "changed_count": 0,
            "message": "No values changed for this strategy, so the dataset was left untouched.",
        }

    # IMPORTANT:
    # Backup BEFORE changing the runtime dataset.
    backup = _create_backup(path)

    df[feature] = transformed

    _save_dataset(
        df,
        path,
    )

    return {
        "handled": True,
        "source": "modelmind-local",
        "engine":
            "preprocessing-apply",

        "filename": path.name,
        "feature": feature,
        "strategy":
            normalized_strategy,

        "fill_value":
            fill_value,

        "applied": True,

        "changed_count":
            changed_count,

        "missing_before":
            missing_before,

        "actual_missing_before": int(analysis.get("actual_missing_count", original_series.isna().sum())),
        "parse_failure_count": int(analysis.get("parse_failure_count", 0)),

        "missing_after":
            missing_after,

        "backup_created":
            backup.exists(),

        "backup_filename":
            backup.name,

        "message": (
            f'Applied "{normalized_strategy}" '
            f'to "{feature}". '
            f"Updated {changed_count} value(s); {missing_after} gap(s) remain."
        ),
    }


def undo_preprocessing(
    path: Path,
) -> dict[str, Any]:
    """
    Restore the dataset to the original backup
    created before the first preprocessing change.
    """

    if not path.exists():
        raise ValueError(
            "Dataset does not exist."
        )

    backup = _backup_path(path)

    if not backup.exists():
        raise ValueError(
            "No preprocessing backup is available "
            "for this dataset."
        )

    path.write_bytes(
        backup.read_bytes()
    )

    return {
        "handled": True,
        "source": "modelmind-local",
        "engine":
            "preprocessing-undo",

        "filename": path.name,

        "restored": True,

        "backup_filename":
            backup.name,

        "message": (
            "The runtime dataset was restored "
            "to its original state."
        ),
    }
