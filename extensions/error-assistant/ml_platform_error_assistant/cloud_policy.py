import os

from .credentials import get_stored_gemini_api_key

DEFAULT_CLOUD_FALLBACK_MODE = "disabled"
VALID_CLOUD_FALLBACK_MODES = {"disabled", "local_only", "enabled"}


def cloud_fallback_mode():
    """Return the configured cloud fallback mode.

    If ML_PLATFORM_CLOUD_FALLBACK is set, use it.
    If a Gemini API key is configured by the user, automatically enable cloud fallback.
    Otherwise return DEFAULT_CLOUD_FALLBACK_MODE.
    """
    mode = os.getenv("ML_PLATFORM_CLOUD_FALLBACK")
    if mode is not None:
        normalized = str(mode).strip().lower()
        if normalized in VALID_CLOUD_FALLBACK_MODES:
            return normalized
    if gemini_api_key_configured():
        return "enabled"
    return DEFAULT_CLOUD_FALLBACK_MODE


def gemini_fallback_enabled():
    return cloud_fallback_mode() == "enabled"


def gemini_api_key_configured():
    return bool(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or get_stored_gemini_api_key())


def health_policy_status():
    mode = cloud_fallback_mode()
    key_ready = gemini_api_key_configured()
    return {
        "cloud_fallback": mode,
        "gemini_fallback_available": mode == "enabled" and key_ready,
    }
