from pathlib import Path
from typing import Any

import pandas as pd

from .dataset import (
    analyze_feature,
    load_dataset,
)


VALID_LEVELS = {
    "basic": "basic",
    "medium": "medium",
    "advanced": "advanced",
}


def normalize_level(level: str) -> str:
    return VALID_LEVELS.get(
        str(level).strip().lower(),
        "basic",
    )


def _round(value: float) -> float:
    return round(float(value), 4)


def _is_likely_id(
    column: str,
    unique_count: int,
    non_null_count: int,
) -> bool:
    name = str(column).lower()

    name_based = (
        name == "id"
        or name.endswith("_id")
        or name.startswith("id_")
    )

    unique_ratio = (
        unique_count / non_null_count
        if non_null_count > 0
        else 0
    )

    return bool(
        name_based
        or (
            non_null_count >= 20
            and unique_ratio >= 0.98
        )
    )


def _has_id_like_name(column: str) -> bool:
    name = str(column).strip().lower()
    return (
        name == "id"
        or name.endswith("_id")
        or name.startswith("id_")
    )


def _numeric_imputation_why(
    strategy: str,
    analysis: dict[str, Any],
) -> str:
    skewness = float(analysis.get("skewness", 0))
    outlier_percentage = float(
        analysis.get("outlier_percentage", 0)
    )
    outlier_count = int(analysis.get("outlier_count", 0))
    non_null_count = int(analysis.get("non_null_count", 0))
    numeric_kind = str(analysis.get("numeric_kind", "continuous"))

    if strategy == "mean":
        if abs(skewness) <= 0.5 and outlier_percentage < 5:
            profile_reason = (
                f"The observed values are approximately symmetric "
                f"(skewness {_round(skewness)}) and {_round(outlier_percentage)}% "
                "are flagged by the IQR rule, so the mean is a reasonable "
                "simple baseline."
            )
        else:
            profile_reason = (
                f"The observed profile is skewness {_round(skewness)} with "
                f"{_round(outlier_percentage)}% IQR-flagged values. The mean "
                "is sensitive to extreme values, so verify it is appropriate "
                "rather than treating this as a strong data-based preference."
            )
        return (
            f"The mean uses all observed values to calculate an average. "
            f"{profile_reason} The CSV statistics cannot tell why values are "
            "missing or prove that mean imputation is unbiased."
        )

    if strategy == "median":
        if 0 < non_null_count < 8:
            profile_reason = (
                f"Only {non_null_count} observed values are available, so "
                "the sample distribution is too small for a stable skewness "
                "assessment; the median is a conservative simple baseline."
            )
        elif abs(skewness) > 0.5 or outlier_percentage >= 5:
            profile_reason = (
                f"The observed values have skewness {_round(skewness)} and "
                f"{_round(outlier_percentage)}% IQR-flagged values "
                f"({outlier_count} rows). The median is less sensitive to "
                "skewed tails and extreme values than the mean."
            )
        else:
            profile_reason = (
                f"The observed values are approximately symmetric "
                f"(skewness {_round(skewness)}) with "
                f"{_round(outlier_percentage)}% IQR-flagged values. The "
                "median is a valid robust baseline, but these statistics "
                "alone do not show that it will outperform the mean."
            )
        return (
            f"The median is the middle observed value and is less affected "
            f"by extremes than the mean. {profile_reason} The CSV statistics "
            "cannot identify why values are missing."
        )

    if strategy == "most_frequent":
        return (
            "This numeric feature has a small set of integer-valued "
            "observations and is treated as discrete/count-like. Filling "
            "with the mode (most frequent observed value) keeps replacements on "
            "an existing count or rating instead of creating fractions. "
            "It may increase the frequency of that value, so compare with "
            "other choices when missingness may carry information."
        )

    if strategy == "drop_column":
        return (
            "There are no observed numeric values from which to estimate "
            "a mean, median, or mode. Review the source data and the "
            "feature's importance before dropping it."
        )

    if strategy == "none":
        return (
            "No imputation is recommended because this feature has no "
            "missing values. This only addresses missingness; it does not "
            "mean the feature is useful or appropriate for modeling."
        )

    return (
        "Choose an imputation method based on the observed distribution "
        "and the meaning of missing values; the CSV alone cannot establish "
        "which method is unbiased."
    )


def _categorical_imputation_why(
    strategy: str,
    unique_count: int,
) -> str:
    if strategy == "most_frequent":
        return (
            f"The feature has {unique_count} observed categories. Filling "
            "with the most frequent category preserves an existing label "
            "and is a simple baseline; it can over-represent that category. "
            "If missingness has meaning, compare an explicit 'Unknown' "
            "category and validate the choice on training data."
        )
    if strategy == "none":
        return (
            "No imputation is recommended because this categorical feature "
            "has no missing values. This does not establish whether its "
            "categories are useful or correctly labeled."
        )
    return (
        "For missing categories, compare mode imputation with an explicit "
        "'Unknown' category. The CSV statistics do not explain why values "
        "are missing, so select based on the field's meaning and validate "
        "using training data."
    )


def _missing_severity(
    percentage: float,
) -> str:
    if percentage == 0:
        return "none"

    if percentage < 5:
        return "low"

    if percentage < 20:
        return "moderate"

    if percentage < 50:
        return "high"

    return "very_high"


# ─────────────────────────────────────────────────────────────────────────────
#  NUMERIC RECOMMENDATIONS
# ─────────────────────────────────────────────────────────────────────────────

def _numeric_recommendation(
    analysis: dict[str, Any],
    level: str,
) -> dict[str, Any]:

    feature = str(analysis["feature"])
    missing_count = int(analysis.get("missing_count", 0))
    missing_percentage = float(analysis.get("missing_percentage", 0))
    skewness = float(analysis.get("skewness", 0))
    outlier_count = int(analysis.get("outlier_count", 0))
    outlier_percentage = float(analysis.get("outlier_percentage", 0))
    unique_count = int(analysis.get("unique_count", 0))
    non_null_count = int(analysis.get("non_null_count", 0))
    numeric_kind = str(analysis.get("numeric_kind", "continuous"))
    distribution_shape = str(
        analysis.get("distribution_shape", "unknown")
    )
    imputation = str(analysis.get("imputation_strategy", "none"))
    scaling = str(analysis.get("scaling_strategy", "model_dependent"))
    transformation = str(analysis.get("transformation_strategy", "none"))

    warnings: list[str] = []

    if unique_count <= 1:
        warnings.append(
            "This feature is constant or nearly empty "
            "and may provide little predictive information."
        )

    if _has_id_like_name(feature):
        warnings.append(
            "The column name suggests an identifier. Verify its meaning "
            "before using it as a model feature; an ID is not usually a "
            "predictive measurement."
        )

    if missing_percentage >= 50:
        warnings.append(
            "More than half of this feature is missing. "
            "Consider whether the feature should be kept "
            "before choosing an imputation strategy."
        )

    # ── BASIC LEVEL ─────────────────────────────────────────────────────────
    # Focus: Fill missing values only — simple one-liner pandas code
    if level == "basic":
        if imputation == "mean":
            missing_action = (
                "Fill missing values with the column mean."
            )
            missing_code = (
                f'# Step 1: Fill missing values in "{feature}" with the mean\n'
                f'df["{feature}"] = df["{feature}"].fillna(df["{feature}"].mean())\n'
                f'\n'
                f'# Verify no missing values remain\n'
                f'print("Missing values remaining: {{}}".format(df[{feature!r}].isnull().sum()))'
            )
            explanation = (
                f'"{feature}" has {missing_count} missing value(s) '
                f"({_round(missing_percentage)}%). "
                "At the Basic level, we simply fill each gap with the average "
                "value of all non-missing rows. This is the easiest way to "
                "make your dataset ready for most ML models."
            )
            why = (
                _numeric_imputation_why("mean", analysis)
            )
            risks = (
                "Mean imputation can reduce variability and is sensitive to "
                "extreme values. It assumes the observed-value mean is a "
                "useful substitute; the CSV does not reveal the missingness "
                "mechanism. For model evaluation, estimate the mean from "
                "training data only."
            )

        elif imputation == "median":
            missing_action = (
                "Fill missing values with the column median."
            )
            missing_code = (
                f'# Step 1: Fill missing values in "{feature}" with the median\n'
                f'df["{feature}"] = df["{feature}"].fillna(df["{feature}"].median())\n'
                f'\n'
                f'# Verify no missing values remain\n'
                f'print("Missing values remaining: {{}}".format(df[{feature!r}].isnull().sum()))'
            )
            explanation = (
                f'"{feature}" has {missing_count} missing value(s) '
                f"({_round(missing_percentage)}%). "
                "At the Basic level, we fill each gap with the middle value "
                "(median) of the column, which is more robust to extreme numbers."
            )
            why = (
                _numeric_imputation_why("median", analysis)
            )
            risks = (
                "Median imputation still reduces the true spread of data. "
                "The observed distribution does not reveal why values are "
                "missing. For model evaluation, estimate the median from "
                "training data only."
            )

        elif imputation == "most_frequent":
            missing_action = (
                "Fill missing values with the most frequent observed value."
            )
            missing_code = (
                f'# Integer-valued, low-cardinality feature: "{feature}"\n'
                f'df["{feature}"] = df["{feature}"].fillna(df["{feature}"].mode().iloc[0])\n'
                f'print("Missing values remaining: {{}}".format(df[{feature!r}].isnull().sum()))'
            )
            explanation = (
                f'"{feature}" behaves like a discrete or count-like feature. '
                "Mode imputation preserves observed integer categories rather "
                "than introducing fractional values."
            )
            why = _numeric_imputation_why("most_frequent", analysis)
            risks = (
                "The most frequent value can over-represent one category. "
                "For important features, compare this simple baseline with "
                "a model that handles missing values directly."
            )

        elif imputation == "drop_column":
            missing_action = (
                "Review or drop this feature because no observed numeric values "
                "are available for imputation."
            )
            missing_code = (
                f'# No observed values are available for "{feature}".\n'
                f'df = df.drop(columns=["{feature}"])'
            )
            explanation = (
                f'"{feature}" has no observed numeric values, so a reliable '
                "imputation statistic cannot be estimated."
            )
            why = str(analysis.get("imputation_reason", "Review this feature before modeling."))
            risks = (
                "Dropping a feature removes it from downstream analysis. "
                "Confirm it is not an important field that should be recovered "
                "from the source data."
            )

        else:
            missing_action = (
                "No missing values found — no filling is needed."
            )
            missing_code = (
                f'# "{feature}" has no missing values — nothing to fill!\n'
                f'print(f"Missing: {{df[\"{feature}\"].isnull().sum()}}")  # Should print 0'
            )
            explanation = (
                f'"{feature}" is complete with no missing values. '
                "At the Basic level, no action is required for this column."
            )
            why = _numeric_imputation_why("none", analysis)
            risks = "No risks — the column needs no imputation."

    # ── MEDIUM LEVEL ─────────────────────────────────────────────────────────
    # Focus: Fill NA + outlier detection + scaling suggestion
    elif level == "medium":
        strat_label = (
            "mean" if imputation == "mean"
            else "mode" if imputation == "most_frequent"
            else "median"
        )

        if imputation in ("mean", "median", "most_frequent"):
            val_expr = (
                f'df["{feature}"].mean()'
                if imputation == "mean"
                else f'df["{feature}"].mode().iloc[0]'
                if imputation == "most_frequent"
                else f'df["{feature}"].median()'
            )
            missing_action = (
                f"Fill missing values with the {strat_label}, then "
                "detect and cap outliers using the IQR method."
            )
            missing_code = (
                f'import numpy as np\n'
                f'\n'
                f'# ── Step 1: Impute missing values with the {strat_label} ──\n'
                f'{strat_label}_val = {val_expr}\n'
                f'df["{feature}"] = df["{feature}"].fillna({strat_label}_val)\n'
                f'\n'
                f'# ── Step 2: Detect outliers using IQR method ──\n'
                f'Q1 = df["{feature}"].quantile(0.25)\n'
                f'Q3 = df["{feature}"].quantile(0.75)\n'
                f'IQR = Q3 - Q1\n'
                f'lower_bound = Q1 - 1.5 * IQR\n'
                f'upper_bound = Q3 + 1.5 * IQR\n'
                f'outliers = df["{feature}"][(df["{feature}"] < lower_bound) | (df["{feature}"] > upper_bound)]\n'
                f'print(f"Outliers detected: {{len(outliers)}}")\n'
                f'\n'
                f'# ── Step 3: Cap outliers (Winsorization) ──\n'
                f'df["{feature}"] = df["{feature}"].clip(lower=lower_bound, upper=upper_bound)\n'
                f'print(f"Range after capping: {{df[\"{feature}\"].min():.2f}} to {{df[\"{feature}\"].max():.2f}}")'
            )
            explanation = (
                f"Skewness = {_round(skewness)} and "
                f"IQR outliers = {outlier_count} "
                f"({_round(outlier_percentage)}%). "
                "These statistics guided the choice of imputation strategy. "
                + (
                    "Discrete/count-like values are flagged for review but "
                    "are not automatically capped, so valid counts or ratings "
                    "remain intact."
                    if numeric_kind == "discrete"
                    else (
                        "Strongly skewed tails are flagged for review rather "
                        "than automatically capped because they may be valid."
                        if abs(skewness) >= 1
                        else "The IQR example demonstrates capping; verify "
                        "flagged values are errors before changing the data."
                    )
                )
            )
            why = (
                f"{_numeric_imputation_why(imputation, analysis)} "
                f"Before imputation, the profile's IQR rule flagged "
                f"{outlier_count} observed value(s) "
                f"({_round(outlier_percentage)}%). "
                + (
                    "For this discrete or strongly skewed profile, the "
                    "generated Medium example reports potential outliers "
                    "without capping them; its displayed count is recomputed "
                    "after imputation and may differ. IQR flags are not proof "
                    "of errors."
                    if numeric_kind == "discrete" or abs(skewness) >= 1
                    else
                    "The generated Medium example recomputes IQR bounds "
                    "after imputation and clips values outside them, so its "
                    "outlier count may differ. Review flagged observations "
                    "first: IQR flags are not proof of errors, and valid "
                    "extremes should not be removed automatically."
                )
            )
            risks = (
                "IQR flags do not prove data errors. Avoid capping discrete "
                "counts or ratings, and for continuous features validate "
                "capping against domain knowledge using training-set bounds only."
            )
            if numeric_kind == "discrete" or abs(skewness) >= 1:
                missing_action = (
                    f"Fill missing values with the {strat_label}, then flag "
                    + (
                        "IQR outliers for review without capping discrete "
                        "counts or ratings."
                        if numeric_kind == "discrete"
                        else "IQR outliers for review without automatically "
                        "capping the skewed tail."
                    )
                )
                missing_code = (
                    f'# Impute with the recommended {strat_label}\n'
                    f'{strat_label}_val = {val_expr}\n'
                    f'df["{feature}"] = df["{feature}"].fillna({strat_label}_val)\n'
                    f'\n'
                    f'# Review IQR flags; do not alter valid data automatically\n'
                    f'Q1 = df["{feature}"].quantile(0.25)\n'
                    f'Q3 = df["{feature}"].quantile(0.75)\n'
                    f'IQR = Q3 - Q1\n'
                    f'outliers = df[(df["{feature}"] < Q1 - 1.5 * IQR) | (df["{feature}"] > Q3 + 1.5 * IQR)]\n'
                    f'print(f"Potential outliers to review: {{len(outliers)}}")'
                )
                risks = (
                    "IQR flags are not proof of bad data. Review flagged rows "
                    "and preserve valid observations from a naturally skewed tail."
                )

        elif imputation == "drop_column":
            missing_action = (
                "Review or exclude this entirely missing feature; no "
                "statistical imputation value can be estimated."
            )
            missing_code = (
                f'# Review this all-missing feature before modeling\n'
                f'df = df.drop(columns=["{feature}"])'
            )
            explanation = str(
                analysis.get(
                    "imputation_reason",
                    "No observed values are available for this feature."
                )
            )
            why = explanation
            risks = (
                "Dropping a feature removes it from analysis. Check the source "
                "data first in case its values can be recovered."
            )

        else:
            missing_action = (
                "No missing values to fill. Check for outliers and "
                "consider applying feature scaling for ML readiness."
            )
            missing_code = (
                f'# ── Step 1: No missing values in "{feature}" ──\n'
                f'print(f"Missing: {{df[\"{feature}\"].isnull().sum()}}")  # Should print 0\n'
                f'\n'
                f'# ── Step 2: Check for outliers using IQR ──\n'
                f'Q1 = df["{feature}"].quantile(0.25)\n'
                f'Q3 = df["{feature}"].quantile(0.75)\n'
                f'IQR = Q3 - Q1\n'
                f'lower_bound = Q1 - 1.5 * IQR\n'
                f'upper_bound = Q3 + 1.5 * IQR\n'
                f'outliers = df["{feature}"][(df["{feature}"] < lower_bound) | (df["{feature}"] > upper_bound)]\n'
                f'print(f"Outliers in {feature}: {{len(outliers)}}")\n'
                f'\n'
                f'# ── Step 3: Descriptive statistics ──\n'
                f'print(df["{feature}"].describe())'
            )
            explanation = (
                f'"{feature}" has no missing values. '
                f"Skewness = {_round(skewness)}, outliers = {outlier_count} "
                f"({_round(outlier_percentage)}%). "
                "At Medium level, we check for outliers even on complete columns "
                "because outliers can degrade model accuracy."
            )
            why = (
                f"{_numeric_imputation_why('none', analysis)} "
                f"The IQR rule flags {outlier_count} observed value(s) "
                f"({_round(outlier_percentage)}%). The generated Medium "
                "example includes IQR clipping even when values are discrete "
                "or legitimate extremes, so review its flagged rows before "
                "running it; an IQR flag alone is not proof of bad data."
            )
            risks = (
                "Ignoring outliers can distort distance-based models "
                "(e.g., KNN, SVM) and linear regression coefficients."
            )

    # ── ADVANCED LEVEL ───────────────────────────────────────────────────────
    # Focus: Full sklearn Pipeline with ColumnTransformer, StandardScaler, imputer
    else:
        strategy = (
            imputation
            if imputation in ("mean", "median", "most_frequent")
            else "median"
        )
        apply_power_transform = (
            numeric_kind == "continuous"
            and abs(skewness) >= 1
            and unique_count > 2
        )
        transform_step = (
            '    ("power_transform", PowerTransformer(method="yeo-johnson")),\n'
            if apply_power_transform
            else '    ("scaler", StandardScaler()),\n'
        )

        if imputation == "drop_column":
            missing_action = (
                "Review or exclude this entirely missing feature; an imputer "
                "cannot estimate a value without observed data."
            )
            missing_code = (
                f'# No observed values are available for "{feature}".\n'
                f'X = X.drop(columns=["{feature}"])'
            )

        elif imputation == "none":
            missing_action = (
                "No imputation is needed. Use a training-fitted "
                f"{'Yeo-Johnson transform' if apply_power_transform else 'scaler'} "
                "in the numeric ColumnTransformer."
            )
            missing_code = (
                "from sklearn.preprocessing import StandardScaler, PowerTransformer\n"
                "from sklearn.pipeline import Pipeline\n"
                "from sklearn.compose import ColumnTransformer\n"
                "from sklearn.model_selection import train_test_split\n"
                "\n"
                f'X = df[["{feature}"]].copy()\n'
                "X_train, X_test = train_test_split(X, test_size=0.2, random_state=42)\n"
                "\n"
                f'# "{feature}" has no missing values\n'
                "numeric_pipeline = Pipeline(steps=[\n"
                f"{transform_step}"
                "])\n"
                "\n"
                "preprocessor = ColumnTransformer(transformers=[\n"
                f'    ("num", numeric_pipeline, ["{feature}"]),\n'
                "], remainder='passthrough')\n"
                "\n"
                "# Fit on training data only!\n"
                "X_train_transformed = preprocessor.fit_transform(X_train)\n"
                "X_test_transformed  = preprocessor.transform(X_test)"
            )
        else:
            missing_action = (
                f"Use SimpleImputer(strategy='{strategy}') plus "
                f"{'Yeo-Johnson transformation' if apply_power_transform else 'scaling'} "
                "inside a ColumnTransformer pipeline. Fit on training data only."
            )
            missing_code = (
                "from sklearn.impute import SimpleImputer\n"
                "from sklearn.preprocessing import StandardScaler, RobustScaler, PowerTransformer\n"
                "from sklearn.pipeline import Pipeline\n"
                "from sklearn.compose import ColumnTransformer\n"
                "from sklearn.model_selection import train_test_split\n"
                "\n"
                f'X = df[["{feature}"]].copy()\n'
                "X_train, X_test = train_test_split(X, test_size=0.2, random_state=42)\n"
                "\n"
                f'# Advanced pipeline for numerical feature: "{feature}"\n'
                "numeric_pipeline = Pipeline(steps=[\n"
                f"    ('imputer', SimpleImputer(strategy='{strategy}')),\n"
                f"{transform_step}"
                "])\n"
                "\n"
                "# Combine with other columns in a ColumnTransformer\n"
                "preprocessor = ColumnTransformer(transformers=[\n"
                f'    ("num", numeric_pipeline, ["{feature}"]),\n'
                "    # Add more transformers for categorical columns here\n"
                "], remainder='passthrough')\n"
                "\n"
                "# ── Fit ONLY on training data ──\n"
                "X_train_transformed = preprocessor.fit_transform(X_train)\n"
                "X_test_transformed  = preprocessor.transform(X_test)\n"
                'print(f"Train shape: {X_train_transformed.shape}")\n'
                'print(f"Test shape: {X_test_transformed.shape}")'
            )

        explanation = (
            f"Feature type = {numeric_kind}; distribution = {distribution_shape}; "
            f"Skewness = {_round(skewness)}, "
            f"outlier rate = {_round(outlier_percentage)}%. "
            "Advanced level wraps all preprocessing in a scikit-learn Pipeline "
            "inside a ColumnTransformer. This guarantees the imputer and scaler "
            "are fitted on training data only and reused consistently for "
            "validation and test data — preventing data leakage."
        )
        why = (
            _numeric_imputation_why(
                "drop_column"
                if imputation == "drop_column"
                else imputation if missing_count > 0 else "none",
                analysis,
            )
            + (
                " The generated code drops this all-missing feature, so it "
                "does not fit an imputer or scaler for it."
                if imputation == "drop_column"
                else (
                    " Because this continuous feature is strongly skewed, "
                    "the generated pipeline uses Yeo-Johnson after imputation; "
                    "it supports zero and negative values and estimates the "
                    "transformation on training rows."
                    if apply_power_transform
                    else
                    " The generated pipeline uses StandardScaler after "
                    "imputation (or scaling alone when no values are missing). "
                    "It learns its mean and standard deviation from training "
                    "rows and can help scale-sensitive models."
                )
                + " The Pipeline and ColumnTransformer keep fitted "
                "preprocessing parameters consistent between training and "
                "test data when the shown train-only fit/transform pattern "
                "is followed. The recommendation itself uses descriptive "
                "statistics from the uploaded CSV, so validate the choice "
                "inside cross-validation; these statistics cannot explain "
                "why values are missing."
            )
        )
        risks = (
            "Fitting the pipeline on the full dataset (instead of only "
            "training data) causes data leakage, inflating evaluation scores. "
            "Always use fit_transform() on X_train and transform() on X_test."
        )

    return {
        "feature": feature,
        "feature_type": "numerical",
        "dtype": analysis.get("dtype"),
        "missing_count": missing_count,
        "missing_pct": _round(missing_percentage),
        "missing_percentage": _round(missing_percentage),
        "missing_severity": _missing_severity(missing_percentage),
        "unique_count": unique_count,
        "numeric_kind": numeric_kind,
        "skewness": _round(skewness),
        "distribution_shape": analysis.get("distribution_shape"),
        "outlier_count": outlier_count,
        "outlier_percentage": _round(outlier_percentage),
        "outlier_pct": _round(outlier_percentage),
        "imputation_strategy": imputation,
        "imputation_reason": analysis.get("imputation_reason"),
        "profile_summary": (
            f"{numeric_kind.title()}-like feature; "
            f"{distribution_shape.replace('_', ' ')} distribution "
            f"(skewness {_round(skewness)}); "
            f"{_round(outlier_percentage)}% IQR outliers."
        ),
        "scaling_strategy": scaling,
        "scaling_reason": analysis.get("scaling_reason"),
        "transformation_strategy": transformation,
        "transformation_reason": analysis.get("transformation_reason"),
        "recommended_action": missing_action,
        "why": why,
        "risks": risks,
        "explanation": explanation,
        "example_code": missing_code,
        "warnings": warnings,
    }


# ─────────────────────────────────────────────────────────────────────────────
#  CATEGORICAL RECOMMENDATIONS
# ─────────────────────────────────────────────────────────────────────────────

def _categorical_recommendation(
    analysis: dict[str, Any],
    level: str,
) -> dict[str, Any]:

    feature = str(analysis["feature"])
    missing_count = int(analysis.get("missing_count", 0))
    missing_percentage = float(analysis.get("missing_percentage", 0))
    unique_count = int(analysis.get("unique_count", 0))
    non_null_count = int(analysis.get("non_null_count", 0))

    unique_ratio = (
        unique_count / non_null_count
        if non_null_count > 0
        else 0
    )

    warnings: list[str] = []

    likely_id = _is_likely_id(feature, unique_count, non_null_count)

    if likely_id:
        warnings.append(
            "The name or near-unique values suggest this may be an "
            "identifier. Verify the field's meaning before encoding; "
            "encoding an ID can create misleading patterns."
        )

    if unique_count <= 1:
        warnings.append(
            "This feature has one or fewer observed "
            "categories and may not provide useful "
            "predictive information."
        )

    if unique_count >= 50 or (
        unique_count >= 20
        and unique_ratio >= 0.5
    ):
        warnings.append(
            "This feature has high cardinality. "
            "One-hot encoding may create many columns. "
            "Consider ordinal encoding or target encoding."
        )

    if missing_percentage >= 50:
        warnings.append(
            "More than half of this feature is missing. "
            "Review whether the feature is useful before "
            "automatically filling the missing values."
        )

    # Determine encoding hint
    is_high_cardinality = unique_count >= 10
    use_ordinal_hint = is_high_cardinality

    # ── BASIC LEVEL ─────────────────────────────────────────────────────────
    # Focus: Fill missing values only — simple fillna with mode
    if level == "basic":
        if missing_count > 0:
            action = (
                "Fill missing categories with the most frequent value (mode)."
            )
            code = (
                f'# Step 1: Find the most common category in "{feature}"\n'
                f'most_common = df["{feature}"].mode()[0]\n'
                f'print(f"Most common value: {{most_common}}")\n'
                f'\n'
                f'# Step 2: Fill missing values with the most common category\n'
                f'df["{feature}"] = df["{feature}"].fillna(most_common)\n'
                f'\n'
                f'# Step 3: Verify no missing values remain\n'
                f'print(f"Missing remaining: {{df[\"{feature}\"].isnull().sum()}}")'
            )
            explanation = (
                f'"{feature}" has {missing_count} missing value(s) '
                f"({_round(missing_percentage)}%). "
                "At the Basic level, we simply replace each empty cell with "
                "the category that appears most often. This is a simple "
                "baseline; check whether missingness itself carries meaning."
            )
            why = _categorical_imputation_why("most_frequent", unique_count)
            risks = (
                "Using the mode may over-represent one category and reduce "
                "the diversity of your data. The CSV cannot reveal whether "
                "missingness itself is meaningful; compare an explicit "
                "'Unknown' category when appropriate."
            )

        else:
            action = "No missing values found — no filling is needed."
            code = (
                f'# "{feature}" has no missing values — nothing to fill!\n'
                f'print(f"Unique categories: {{df[\"{feature}\"].nunique()}}")\n'
                f'print(df["{feature}"].value_counts())'
            )
            explanation = (
                f'"{feature}" is complete with {unique_count} unique categories. '
                "At the Basic level, no filling is required."
            )
            why = _categorical_imputation_why("none", unique_count)
            risks = "No risks — the column needs no imputation at this level."

    # ── MEDIUM LEVEL ─────────────────────────────────────────────────────────
    # Focus: Fill NA + label encoding / one-hot encoding with pandas
    elif level == "medium":
        if missing_count > 0:
            action = (
                "Fill missing values with mode or 'Unknown', then apply "
                "one-hot encoding (low cardinality) or label encoding (high cardinality)."
            )
            if not use_ordinal_hint:
                code = (
                    f'# ── Step 1: Fill missing values ──\n'
                    f'mode_value = df["{feature}"].mode()[0]\n'
                    f'df["{feature}"] = df["{feature}"].fillna(mode_value)\n'
                    f'# Alternative: use "Unknown" if missingness has meaning\n'
                    f'# df["{feature}"] = df["{feature}"].fillna("Unknown")\n'
                    f'\n'
                    f'# ── Step 2: One-Hot Encoding (for low cardinality) ──\n'
                    f'# Creates one binary column per category\n'
                    f'df = pd.get_dummies(df, columns=["{feature}"], drop_first=True)\n'
                    f'print(f"Columns after encoding: {{list(df.columns)}}")'
                )
            else:
                code = (
                    f'# ── Step 1: Fill missing values ──\n'
                    f'mode_value = df["{feature}"].mode()[0]\n'
                    f'df["{feature}"] = df["{feature}"].fillna(mode_value)\n'
                    f'\n'
                    f'# ── Step 2: Label Encoding (for high cardinality = {unique_count} categories) ──\n'
                    f'# Converts each category to an integer\n'
                    f'df["{feature}_encoded"] = df["{feature}"].astype("category").cat.codes\n'
                    f'print(df[["{feature}", "{feature}_encoded"]].drop_duplicates().head(10))'
                )
            explanation = (
                f'"{feature}" has {unique_count} unique categories and '
                f"{_round(missing_percentage)}% missing values. "
                "At Medium level, we fill the gaps then encode categories "
                "into numbers so ML algorithms can process them. "
                f"{'Low cardinality → one-hot encoding.' if not use_ordinal_hint else f'High cardinality ({unique_count} categories) → label encoding.'}"
            )
            why = (
                _categorical_imputation_why(
                    "most_frequent",
                    unique_count,
                )
                + " "
                + (
                    "One-hot encoding represents each category with an "
                    "indicator column without imposing an order; the "
                    "feature's low cardinality keeps the added columns limited."
                    if not use_ordinal_hint
                    else
                    "Integer label codes are compact for this higher-cardinality "
                    "feature, but they impose an arbitrary order unless the "
                    "categories are genuinely ordinal. Check whether the "
                    "selected model can interpret those codes appropriately."
                )
            )
            risks = (
                "One-hot encoding on high-cardinality features creates too many columns (curse of dimensionality). "
                "Label encoding implies ordinal order which may not exist. "
                "For production code, fit encoders only on training data."
            )

        else:
            action = (
                "No missing values. Apply one-hot or label encoding "
                "to convert categories to numbers."
            )
            if not use_ordinal_hint:
                code = (
                    f'# No missing values — apply One-Hot Encoding directly\n'
                    f'df = pd.get_dummies(df, columns=["{feature}"], drop_first=True)\n'
                    f'print(f"Columns after encoding: {{list(df.columns)}}")'
                )
            else:
                code = (
                    f'# No missing values — apply Label Encoding (high cardinality: {unique_count} categories)\n'
                    f'df["{feature}_encoded"] = df["{feature}"].astype("category").cat.codes\n'
                    f'print(df[["{feature}", "{feature}_encoded"]].drop_duplicates().head(10))'
                )
            explanation = (
                f'"{feature}" has {unique_count} categories and no missing values. '
                "At Medium level, we encode categories as numbers for ML compatibility."
            )
            why = (
                "No filling is needed because this column has no missing "
                "values. "
                + (
                    "One-hot encoding creates an indicator column for each "
                    "category without implying an order."
                    if not use_ordinal_hint
                    else
                    "The generated label codes are compact for a higher-cardinality "
                    "feature, but imply an arbitrary order unless the categories "
                    "are genuinely ordinal."
                )
            )
            risks = (
                "Encoding applied to the full dataset (not just training data) "
                "can cause data leakage. Use sklearn encoders in a pipeline for production."
            )

    # ── ADVANCED LEVEL ───────────────────────────────────────────────────────
    # Focus: sklearn Pipeline + ColumnTransformer + OneHotEncoder/OrdinalEncoder
    else:
        if unique_count <= 15 or not use_ordinal_hint:
            # Low cardinality → OneHotEncoder
            encoder_name = "OneHotEncoder"
            encoder_args = 'handle_unknown="ignore", sparse_output=False'
            encoder_note = "OneHotEncoder is best for low-cardinality features (≤15 categories)."
        else:
            # High cardinality → OrdinalEncoder
            encoder_name = "OrdinalEncoder"
            encoder_args = 'handle_unknown="use_encoded_value", unknown_value=-1'
            encoder_note = (
                f"OrdinalEncoder keeps the {unique_count} categories compact, "
                "but its integer codes imply an order. Use it only when that "
                "order is meaningful; otherwise consider another encoding."
            )

        if missing_count > 0:
            action = (
                f"Use SimpleImputer + {encoder_name} inside a ColumnTransformer pipeline. "
                "Fit preprocessing on training data only."
            )

        else:
            action = (
                f"No imputation needed. Use {encoder_name} inside a "
                "ColumnTransformer for production-safe encoding."
            )

        pipeline_steps = []
        if missing_count > 0:
            pipeline_steps.append(
                '    ("imputer", SimpleImputer(strategy="most_frequent")),\n'
            )
        pipeline_steps.append(
            f'    ("encoder", {encoder_name}({encoder_args})),\n'
        )
        code = (
            "from sklearn.impute import SimpleImputer\n"
            f"from sklearn.preprocessing import {encoder_name}\n"
            "from sklearn.pipeline import Pipeline\n"
            "from sklearn.compose import ColumnTransformer\n"
            "from sklearn.model_selection import train_test_split\n"
            "\n"
            f'X = df[["{feature}"]].copy()\n'
            "X_train, X_test = train_test_split(X, test_size=0.2, random_state=42)\n"
            "\n"
            f'# Advanced categorical pipeline for: "{feature}"\n'
            f"# {encoder_note}\n"
            "categorical_pipeline = Pipeline(steps=[\n"
            + "".join(pipeline_steps)
            + "])\n"
            "\n"
            "preprocessor = ColumnTransformer(transformers=[\n"
            f'    ("cat", categorical_pipeline, ["{feature}"]),\n'
            "], remainder='drop')\n"
            "\n"
            "# Fit preprocessing on training rows only.\n"
            "X_train_transformed = preprocessor.fit_transform(X_train)\n"
            "X_test_transformed = preprocessor.transform(X_test)\n"
            'print(f"Train shape: {X_train_transformed.shape}")\n'
            'print(f"Test shape: {X_test_transformed.shape}")'
        )

        explanation = (
            f"Cardinality = {unique_count} categories; unique ratio = "
            f"{_round(unique_ratio)}. {encoder_note} "
            "Advanced level wraps all preprocessing in a scikit-learn Pipeline "
            "inside a ColumnTransformer, guaranteeing the encoder is fitted "
            "only on training data and applied consistently to test data. "
            "This is a common pattern for avoiding leakage from fitted "
            "preprocessing steps."
        )
        encoder_reason = (
            f"OneHotEncoder represents the {unique_count} categories with "
            "separate indicators and does not impose an order."
            if encoder_name == "OneHotEncoder"
            else
            f"OrdinalEncoder keeps the {unique_count} categories compact, "
            "but assigns integer codes that imply an order. Use it only when "
            "that ordering is meaningful for the feature/model; otherwise "
            "consider one-hot or another encoding strategy."
        )
        why = (
            (
                _categorical_imputation_why(
                    "most_frequent",
                    unique_count,
                )
                + " "
                if missing_count > 0
                else _categorical_imputation_why("none", unique_count)
                + " "
            )
            + encoder_reason
            + " The Pipeline and ColumnTransformer fit the "
            + ("imputer and encoder " if missing_count > 0 else "encoder ")
            + "on training rows and apply the fitted mapping to test rows. "
            "The encoder choice is initially based on category count in the "
            "uploaded CSV, so validate it inside cross-validation and "
            "against the feature's meaning."
        )
        risks = (
            "Fitting encoders on the full dataset before the train/test split "
            "causes data leakage. Always split first, then fit the pipeline "
            "on X_train only. Use transform() (not fit_transform()) on X_test."
        )

    return {
        "feature": feature,
        "feature_type": "categorical",
        "dtype": analysis.get("dtype"),
        "missing_count": missing_count,
        "missing_pct": _round(missing_percentage),
        "missing_percentage": _round(missing_percentage),
        "missing_severity": _missing_severity(missing_percentage),
        "unique_count": unique_count,
        "unique_ratio": _round(unique_ratio),
        "imputation_strategy": (
            "none" if missing_count == 0 else "most_frequent_or_unknown"
        ),
        "recommended_action": action,
        "why": why,
        "risks": risks,
        "explanation": explanation,
        "example_code": code,
        "warnings": warnings,
    }


# ─────────────────────────────────────────────────────────────────────────────
#  FULL-DATASET ADVANCED PIPELINE SUMMARY
# ─────────────────────────────────────────────────────────────────────────────

def _build_advanced_pipeline_summary(
    df: pd.DataFrame,
    numeric_cols: list[str],
    categorical_cols: list[str],
) -> str:
    """Generate a suggested full ColumnTransformer pipeline for all columns."""
    numeric_groups: dict[tuple[str, bool], list[str]] = {}
    omitted_numeric_cols: list[str] = []
    for column in numeric_cols:
        values = pd.to_numeric(df[column], errors="coerce").dropna()
        if values.empty:
            omitted_numeric_cols.append(column)
            continue

        discrete = bool((values % 1 == 0).all()) and int(values.nunique()) <= 20
        skewness = float(values.skew()) if len(values) > 2 else 0.0
        if pd.isna(skewness):
            skewness = 0.0
        q1 = float(values.quantile(0.25))
        q3 = float(values.quantile(0.75))
        iqr = q3 - q1
        outlier_rate = (
            float(((values < q1 - 1.5 * iqr) | (values > q3 + 1.5 * iqr)).mean())
            * 100
        )
        strategy = (
            "most_frequent" if discrete
            else "median" if len(values) < 8
            else "mean" if abs(skewness) <= 0.5 and outlier_rate < 5
            else "median"
        )
        power_transform = not discrete and abs(skewness) >= 1 and values.nunique() > 2
        numeric_groups.setdefault((strategy, power_transform), []).append(column)

    ordinal_cols = [
        column
        for column in categorical_cols
        if int(df[column].nunique(dropna=True)) > 15
    ]
    one_hot_cols = [
        column
        for column in categorical_cols
        if column not in ordinal_cols
    ]
    code = [
        "# ═══════════════════════════════════════════════════════\n"
        "# Suggested Full Pipeline (ColumnTransformer)\n"
        "# ═══════════════════════════════════════════════════════\n"
        "from sklearn.impute import SimpleImputer\n"
        "from sklearn.preprocessing import StandardScaler, PowerTransformer, OneHotEncoder, OrdinalEncoder\n"
        "from sklearn.pipeline import Pipeline\n"
        "from sklearn.compose import ColumnTransformer\n"
        "from sklearn.model_selection import train_test_split\n"
        "\n"
        f"numerical_cols = {numeric_cols!r}\n"
        f"all_missing_numerical_cols = {omitted_numeric_cols!r}\n"
        f"one_hot_cols = {one_hot_cols!r}\n"
        f"ordinal_cols = {ordinal_cols!r}\n"
        "\n"
        "# Set a label column for supervised ML; leave None to preprocess every column.\n"
        "target_column = None\n"
        "if target_column is not None:\n"
        "    if target_column not in df.columns:\n"
        "        raise ValueError(f'Target column {target_column!r} was not found in df.')\n"
        "    X = df.drop(columns=[target_column]).copy()\n"
        "    y = df[target_column].copy()\n"
        "else:\n"
        "    X = df.copy()\n"
        "    y = None\n"
        "\n"
        "if X.shape[1] == 0:\n"
        "    raise ValueError('No feature columns are available to preprocess.')\n"
        "\n"
        "numerical_cols = [column for column in numerical_cols if column in X.columns]\n"
        "one_hot_cols = [column for column in one_hot_cols if column in X.columns]\n"
        "ordinal_cols = [column for column in ordinal_cols if column in X.columns]\n"
    ]

    transformers: list[str] = []
    for index, ((strategy, power_transform), columns) in enumerate(numeric_groups.items()):
        columns_name = f"numeric_group_{index}_cols"
        pipeline_name = f"numeric_group_{index}_pipeline"
        code.append(
            f"\n{columns_name} = "
            f"[column for column in {columns!r} if column in X.columns]\n"
            f"{pipeline_name} = Pipeline(steps=[\n"
            f'    ("imputer", SimpleImputer(strategy="{strategy}")),\n'
        )
        if power_transform:
            code.append(
                '    ("power_transform", PowerTransformer(method="yeo-johnson", standardize=True)),\n'
            )
        else:
            code.append('    ("scaler", StandardScaler()),\n')
        code.append("])\n")
        transformers.append(
            f'    ("num_{index}", {pipeline_name}, {columns_name})'
        )

    if one_hot_cols:
        code.append(
            "\n# Low-cardinality categorical columns\n"
            "one_hot_pipeline = Pipeline(steps=[\n"
            '    ("imputer", SimpleImputer(strategy="most_frequent")),\n'
            '    ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),\n'
            "])\n"
        )
        transformers.append(
            '    ("one_hot", one_hot_pipeline, one_hot_cols)'
        )

    if ordinal_cols:
        code.append(
            "\n# High-cardinality categorical columns\n"
            "ordinal_pipeline = Pipeline(steps=[\n"
            '    ("imputer", SimpleImputer(strategy="most_frequent")),\n'
            '    ("encoder", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1)),\n'
            "])\n"
        )
        transformers.append(
            '    ("ordinal", ordinal_pipeline, ordinal_cols)'
        )

    code.extend([
        f"\n# Entirely missing numeric columns excluded from fitting: {omitted_numeric_cols!r}\n"
        "if not numerical_cols and not one_hot_cols and not ordinal_cols:\n"
        "    raise ValueError('No observed feature columns are available to preprocess.')\n"
        "\n# ColumnTransformer combines the profile-specific pipelines\n"
        "preprocessor = ColumnTransformer(transformers=[\n"
        + ",\n".join(transformers)
        + "\n], remainder='drop')\n"
        "\n"
        "# Fit transforms on training rows only.\n"
        "if len(X) < 2:\n"
        "    raise ValueError('At least two rows are required for a train/test split.')\n"
        "if y is None:\n"
        "    X_train, X_test = train_test_split(\n"
        "        X, test_size=0.2, random_state=42\n"
        "    )\n"
        "else:\n"
        "    X_train, X_test, y_train, y_test = train_test_split(\n"
        "        X, y, test_size=0.2, random_state=42\n"
        "    )\n"
        "\n"
        "X_train_transformed = preprocessor.fit_transform(X_train)\n"
        "X_test_transformed = preprocessor.transform(X_test)\n"
        'print(f"Train shape: {X_train_transformed.shape}")\n'
        'print(f"Test shape: {X_test_transformed.shape}")'
    ])
    return "".join(code)


# ─────────────────────────────────────────────────────────────────────────────
#  MAIN ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────

def analyze_preprocessing(
    path: Path,
    level: str = "Basic",
) -> dict[str, Any]:

    normalized_level = normalize_level(level)
    df = load_dataset(path)

    rows = int(df.shape[0])
    columns = int(df.shape[1])
    duplicate_rows = int(df.duplicated().sum())
    total_missing = int(df.isnull().sum().sum())

    recommendations: list[dict[str, Any]] = []
    numerical_count = 0
    categorical_count = 0
    warning_count = 0
    numeric_cols: list[str] = []
    categorical_cols: list[str] = []

    for column in df.columns:
        feature_analysis = analyze_feature(path, str(column))

        if feature_analysis.get("is_numeric"):
            numerical_count += 1
            recommendation = _numeric_recommendation(feature_analysis, normalized_level)
            if feature_analysis.get("imputation_strategy") != "drop_column":
                numeric_cols.append(str(column))
        else:
            categorical_count += 1
            categorical_cols.append(str(column))
            recommendation = _categorical_recommendation(feature_analysis, normalized_level)

        warning_count += len(recommendation["warnings"])
        recommendations.append(recommendation)

    dataset_warnings: list[str] = []

    if duplicate_rows > 0:
        dataset_warnings.append(
            f"{duplicate_rows} duplicate rows were "
            "detected. Review whether they represent "
            "real repeated observations before removing them."
        )

    if rows == 0:
        dataset_warnings.append("The dataset contains no rows.")

    if columns == 0:
        dataset_warnings.append("The dataset contains no columns.")

    # For advanced level, attach a full pipeline suggestion
    pipeline_code: str | None = None
    if normalized_level == "advanced":
        pipeline_code = _build_advanced_pipeline_summary(
            df, numeric_cols, categorical_cols
        )

    return {
        "handled": True,
        "source": "modelmind-local",
        "engine": "preprocessing-advisor",
        "level": normalized_level,
        "filename": path.name,
        "rows": rows,
        "columns": columns,
        "numerical_features": numerical_count,
        "categorical_features": categorical_count,
        "total_missing_values": total_missing,
        "duplicate_rows": duplicate_rows,
        "feature_warning_count": warning_count,
        "dataset_warnings": dataset_warnings,
        "recommendations": recommendations,
        "pipeline_code": pipeline_code,
        "safety": {
            "dataset_modified": False,
            "automatic_apply": False,
            "message": (
                "ModelMind generated recommendations only. "
                "The dataset was not modified."
            ),
        },
    }
