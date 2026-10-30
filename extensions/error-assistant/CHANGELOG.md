# Changelog

<!-- <START NEW CHANGELOG ENTRY> -->

## 0.1.4

- Add a clean Plain ModelMind Notebook mode that hides ModelMind side panels and restores the previous layout when switching back.
- Name the notebook and its visible controls consistently; preserve existing practice notebook content when migrating its filename.

## 0.1.3

- Refresh an installed notebook extension when its Python package version or JupyterLab frontend assets are stale.
- Keep the installed Python package and bundled chatbot UI matched across macOS and Windows upgrades.
- Verify the distributable wheel contains the current prebuilt frontend assets.

## 0.1.2

- Explain measured model recommendations using the selected target, class balance, CV scores, fold variation, sample size, screening, and preprocessing evidence.
- Clarify close model rankings and validation limits without presenting the top result as a guarantee.
- Keep cloud fallback disabled by default unless the user explicitly enables it.

## 0.1.1

- Recognize numeric measurements stored as text in preprocessing advice and previews.
- Separate blank cells from unparseable nonblank values and warn users to review source data.
- Keep generated preprocessing code and dataset summaries consistent with the parsed values.

<!-- <END NEW CHANGELOG ENTRY> -->
