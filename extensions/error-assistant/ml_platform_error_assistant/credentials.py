import keyring
import keyring.errors
import logging

log = logging.getLogger(__name__)

KEYRING_SERVICE = "ModelMind Notebook"
GEMINI_KEY_NAME = "Gemini API Key"

# Errors thrown when macOS Keychain blocks access (user denied or keychain
# is locked). We treat these as "no stored key" so the UI stays responsive
# and lets the user enter their API key manually.
_KEYCHAIN_ERRORS = (
    keyring.errors.KeyringLocked,
    keyring.errors.KeyringError,
)


def _safe_keyring_get() -> str | None:
    """Return the stored Gemini key, or None if the keychain is inaccessible."""
    try:
        return keyring.get_password(KEYRING_SERVICE, GEMINI_KEY_NAME)
    except _KEYCHAIN_ERRORS as e:
        log.debug("Keychain access unavailable (%s); no stored key will be used.", e)
        return None
    except Exception as e:  # noqa: BLE001 – unexpected backend errors
        log.debug("Unexpected keyring error (%s); treating as no stored key.", e)
        return None


def get_stored_gemini_api_key() -> str | None:
    return _safe_keyring_get()


def store_gemini_api_key(api_key: str) -> None:
    try:
        keyring.set_password(KEYRING_SERVICE, GEMINI_KEY_NAME, api_key)
    except Exception as e:  # noqa: BLE001
        log.warning("Could not store API key in keychain: %s", e)


def delete_stored_gemini_api_key() -> None:
    try:
        keyring.delete_password(KEYRING_SERVICE, GEMINI_KEY_NAME)
    except (keyring.errors.PasswordDeleteError, Exception):
        pass
