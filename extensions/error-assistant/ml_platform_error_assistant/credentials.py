import json
import logging
import os
import sys
from pathlib import Path

log = logging.getLogger(__name__)

KEYRING_SERVICE = "ModelMind Notebook"
GEMINI_KEY_NAME = "Gemini API Key"


def _get_credentials_path() -> Path:
    user_data = os.environ.get("MODELMIND_USER_DATA_DIR")
    if user_data:
        base = Path(user_data)
    elif sys.platform == "win32":
        base = Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming")) / "ModelMind"
    elif sys.platform == "darwin":
        base = Path.home() / "Library" / "Application Support" / "ModelMind"
    else:
        base = Path.home() / ".config" / "ModelMind"
    base.mkdir(parents=True, exist_ok=True)
    return base / "credentials.json"


def _read_credentials_file() -> dict[str, str]:
    cred_file = _get_credentials_path()
    if not cred_file.is_file():
        return {}
    try:
        content = cred_file.read_text(encoding="utf-8")
        parsed = json.loads(content)
        if isinstance(parsed, dict):
            return parsed
        return {}
    except Exception as e:
        log.debug("Could not read credentials file: %s", e)
        return {}


def _write_credentials_file(data: dict[str, str]) -> None:
    cred_file = _get_credentials_path()
    try:
        cred_file.write_text(json.dumps(data, indent=2), encoding="utf-8")
        try:
            cred_file.chmod(0o600)
        except OSError:
            pass
    except Exception as e:
        log.warning("Could not write credentials file: %s", e)


def get_stored_gemini_api_key() -> str | None:
    # 1. Read from dedicated ModelMind credentials store (safe, fast, never triggers OS dialogs)
    data = _read_credentials_file()
    if data.get(GEMINI_KEY_NAME):
        return data[GEMINI_KEY_NAME]

    # 2. On platforms other than macOS, fallback to system keyring if available
    if sys.platform != "darwin":
        try:
            import keyring
            return keyring.get_password(KEYRING_SERVICE, GEMINI_KEY_NAME)
        except Exception:
            return None

    return None


def store_gemini_api_key(api_key: str) -> None:
    data = _read_credentials_file()
    data[GEMINI_KEY_NAME] = api_key
    _write_credentials_file(data)

    if sys.platform != "darwin":
        try:
            import keyring
            keyring.set_password(KEYRING_SERVICE, GEMINI_KEY_NAME, api_key)
        except Exception as e:
            log.warning("Could not store API key in system keyring: %s", e)


def delete_stored_gemini_api_key() -> None:
    data = _read_credentials_file()
    if GEMINI_KEY_NAME in data:
        del data[GEMINI_KEY_NAME]
        _write_credentials_file(data)

    if sys.platform != "darwin":
        try:
            import keyring
            keyring.delete_password(KEYRING_SERVICE, GEMINI_KEY_NAME)
        except Exception:
            pass
