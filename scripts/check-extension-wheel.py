#!/usr/bin/env python3
"""Fail if the bundled ModelMind wheel is older than the source extension."""

from __future__ import annotations

import json
import argparse
from importlib.metadata import PackageNotFoundError, version
import sys
import zipfile
from email.parser import Parser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "extensions" / "error-assistant" / "package.json"
SOURCE_BUNDLE = (
    ROOT
    / "extensions"
    / "error-assistant"
    / "ml_platform_error_assistant"
    / "labextension"
)
WHEEL_DIR = ROOT / "wheels"


def fail(message: str) -> None:
    print(f"Extension wheel check failed: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--installed",
        type=Path,
        help="compare an installed JupyterLab extension directory with source",
    )
    args = parser.parse_args()

    package = json.loads(PACKAGE.read_text())
    source_manifest_path = SOURCE_BUNDLE / "package.json"
    if not source_manifest_path.is_file():
        fail("the built JupyterLab extension manifest is missing")
    source_manifest = json.loads(source_manifest_path.read_text())
    source_version = package["version"]
    source_load = source_manifest.get("jupyterlab", {}).get("_build", {}).get("load")
    if source_manifest.get("version") != source_version:
        fail("source package and built JupyterLab extension versions differ")
    if not source_load or not (SOURCE_BUNDLE / source_load).is_file():
        fail("the source package's JupyterLab entry bundle is missing")

    if args.installed:
        try:
            installed_version = version("ml_platform_error_assistant")
        except PackageNotFoundError:
            fail("the ModelMind Python extension is not installed")
        if installed_version != source_version:
            fail(
                f"installed Python extension {installed_version} does not match source {source_version}"
            )
        installed_root = args.installed
        for source_file in SOURCE_BUNDLE.rglob("*"):
            if not source_file.is_file():
                continue
            relative = source_file.relative_to(SOURCE_BUNDLE)
            installed_file = installed_root / relative
            if not installed_file.is_file() or installed_file.read_bytes() != source_file.read_bytes():
                fail(f"installed JupyterLab asset is missing or outdated: {relative}")
        print(f"Installed extension matches source: {source_version}")
        return

    wheels = sorted(WHEEL_DIR.glob("ml_platform_error_assistant-*.whl"))
    if len(wheels) != 1:
        fail(f"expected exactly one bundled wheel, found {len(wheels)}")

    with zipfile.ZipFile(wheels[0]) as wheel:
        metadata_files = [name for name in wheel.namelist() if name.endswith(".dist-info/METADATA")]
        manifests = [
            name
            for name in wheel.namelist()
            if name.endswith("/labextension/package.json")
        ]
        if len(metadata_files) != 1 or len(manifests) != 1:
            fail("wheel metadata or bundled JupyterLab manifest is missing")
        metadata = Parser().parsestr(wheel.read(metadata_files[0]).decode("utf-8"))
        wheel_manifest = json.loads(wheel.read(manifests[0]).decode("utf-8"))
        if metadata.get("Version") != source_version:
            fail(
                f"wheel version {metadata.get('Version')} does not match source {source_version}"
            )
        wheel_build = wheel_manifest.get("jupyterlab", {}).get("_build", {})
        if wheel_manifest.get("version") != source_version or wheel_build.get("load") != source_load:
            fail("wheel JupyterLab assets do not match the current source build")
        wheel_bundle_root = manifests[0].rsplit("/", 1)[0]
        for source_file in SOURCE_BUNDLE.rglob("*"):
            if not source_file.is_file():
                continue
            relative = source_file.relative_to(SOURCE_BUNDLE).as_posix()
            wheel_file = f"{wheel_bundle_root}/{relative}"
            if wheel_file not in wheel.namelist() or wheel.read(wheel_file) != source_file.read_bytes():
                fail(f"wheel JupyterLab asset is missing or outdated: {relative}")

    print(f"Bundled extension wheel is current: {wheels[0].name}")


if __name__ == "__main__":
    main()
