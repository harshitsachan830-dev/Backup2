"""Private, container-isolated grader for ModelMind coding exercises.

This process must never be exposed directly to the internet. The web app calls
it over a private network using a shared deployment secret. Docker/host policy
provides the isolation boundary; the AST check and resource limits are only
defence in depth.
"""

import ast
import hmac
import json
import os
import shutil
import subprocess
import sys
import tempfile
import textwrap
import time
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

import test_cases

app = FastAPI(title="ModelMind Private Practice Judge", version="1.0.0")

MAX_CODE_LENGTH = 30_000
TIMEOUT_SECONDS = 8
MAX_AST_NODES = 6_000
BLOCKED_IMPORTS = {
    "asyncio", "ctypes", "ftplib", "http", "importlib", "multiprocessing",
    "os", "pathlib", "requests", "shutil", "socket", "subprocess", "sys", "test_cases",
    "threading", "urllib",
}
BLOCKED_CALLS = {"__import__", "compile", "eval", "exec", "open"}
BLOCKED_ATTRIBUTES = {"getenv", "popen", "remove", "rmtree", "spawn", "system", "unlink", "walk"}
SETUP_IN_STUDENT_CODE = {"numpy-basic-001", "pandas-basic-001", "pandas-medium-001"}


class Submission(BaseModel):
    questionId: str = Field(min_length=1, max_length=160)
    code: str = Field(min_length=1, max_length=MAX_CODE_LENGTH)
    mode: str = "submit"


def require_private_token(authorization: str | None) -> None:
    expected = os.environ.get("PRACTICE_JUDGE_TOKEN", "")
    supplied = authorization.removeprefix("Bearer ") if authorization else ""
    if not expected or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Private judge authentication failed.")


def validate_code(code: str) -> None:
    try:
        tree = ast.parse(code, mode="exec")
    except SyntaxError as error:
        raise ValueError(f"SyntaxError: {error.msg} (line {error.lineno})") from error
    nodes = list(ast.walk(tree))
    if len(nodes) > MAX_AST_NODES:
        raise ValueError("Code is too large or complex for this exercise.")
    for node in nodes:
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name.split(".")[0] in BLOCKED_IMPORTS:
                    raise ValueError(f"Import '{alias.name}' is not allowed in practice submissions.")
        elif isinstance(node, ast.ImportFrom):
            if (node.module or "").split(".")[0] in BLOCKED_IMPORTS:
                raise ValueError(f"Import '{node.module}' is not allowed in practice submissions.")
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in BLOCKED_CALLS:
            raise ValueError(f"Call '{node.func.id}()' is not allowed in practice submissions.")
        elif isinstance(node, ast.Attribute) and node.attr in BLOCKED_ATTRIBUTES:
            raise ValueError(f"Attribute '.{node.attr}' is not allowed in practice submissions.")


def runner_source(question_id: str, student_code: str, mode: str) -> str:
    public_count = min(test_cases.PUBLIC_TEST_COUNT.get(question_id, 2), len(test_cases.TEST_CASES[question_id]["tests"]))
    tests = list(test_cases.TEST_CASES[question_id]["tests"])
    selected_names = tests[:public_count] if mode == "run" else tests
    setup_code = "" if question_id in SETUP_IN_STUDENT_CODE else test_cases.build_setup(question_id)
    return textwrap.dedent(
        f"""
        import json
        import resource
        import sys
        from pathlib import Path
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        import test_cases

        def restrict(kind, requested):
            if sys.platform == "darwin" and kind == resource.RLIMIT_AS:
                return
            soft, hard = resource.getrlimit(kind)
            limit = requested if hard < 0 else min(requested, hard)
            soft_limit = limit if soft < 0 else min(soft, limit)
            # macOS does not permit lowering several hard limits in a child
            # process. The deployed judge runs Linux containers, where both
            # limits are fixed; local macOS validation still applies the soft
            # limit while Docker supplies the hard isolation boundary.
            resource.setrlimit(kind, (soft_limit, hard if sys.platform == "darwin" else limit))

        restrict(resource.RLIMIT_CPU, 6)
        restrict(resource.RLIMIT_AS, 512 * 1024 * 1024)
        restrict(resource.RLIMIT_FSIZE, 1 * 1024 * 1024)
        restrict(resource.RLIMIT_NOFILE, 32)

        result = {{"status": "failed", "score": 0, "passed": 0, "total": {len(selected_names)}, "tests": [], "error": None}}
        namespace = {{"__name__": "__main__"}}
        test_items = [(name, test_cases.TEST_CASES[{question_id!r}]["tests"][name]) for name in {selected_names!r}]
        try:
            setup_code = {setup_code!r}
            if setup_code.strip():
                exec(compile(setup_code, "<exercise-setup>", "exec"), namespace, namespace)
            student_code = {student_code!r}
            exec(compile(student_code, "<learner-submission>", "exec"), namespace, namespace)
            for test_name, test_function in test_items:
                try:
                    test_function(namespace)
                    result["passed"] += 1
                    result["tests"].append({{"name": test_name, "passed": True}})
                except AssertionError as error:
                    result["tests"].append({{"name": test_name, "passed": False, "error": str(error) or "Assertion failed"}})
                except Exception as error:
                    result["tests"].append({{"name": test_name, "passed": False, "error": f"{{type(error).__name__}}: {{error}}"}})
            result["score"] = round(result["passed"] / result["total"] * 100) if result["total"] else 0
            result["status"] = "passed" if result["passed"] == result["total"] else "failed"
        except Exception as error:
            result["error"] = f"{{type(error).__name__}}: {{error}}"
        print("__MODELMIND_RESULT__" + json.dumps(result))
        """
    )


def run_submission(question_id: str, code: str, mode: str) -> dict:
    started = time.perf_counter()
    with tempfile.TemporaryDirectory(prefix="modelmind-practice-") as directory:
        runner = Path(directory) / "runner.py"
        shutil.copy2(Path(__file__).with_name("test_cases.py"), Path(directory) / "test_cases.py")
        runner.write_text(runner_source(question_id, code, mode), encoding="utf-8")
        environment = {"PATH": os.environ.get("PATH", ""), "PYTHONNOUSERSITE": "1", "PYTHONDONTWRITEBYTECODE": "1"}
        process = subprocess.run(
            [sys.executable, "-I", str(runner)], cwd=directory, stdin=subprocess.DEVNULL,
            capture_output=True, text=True, timeout=TIMEOUT_SECONDS, env=environment, check=False,
        )
    elapsed = round((time.perf_counter() - started) * 1000)
    marker = "__MODELMIND_RESULT__"
    markers = [line[len(marker):] for line in process.stdout.splitlines() if line.startswith(marker)]
    output = markers[-1] if markers else None
    if output is None:
        return {"status": "failed", "score": 0, "passed": 0, "total": 0, "tests": [], "error": "The isolated judge could not produce a valid result.", "executionTimeMs": elapsed}
    try:
        result = json.loads(output)
    except json.JSONDecodeError:
        return {"status": "failed", "score": 0, "passed": 0, "total": 0, "tests": [], "error": "The isolated judge returned malformed output.", "executionTimeMs": elapsed}
    if mode == "submit":
        public_count = min(test_cases.PUBLIC_TEST_COUNT.get(question_id, 2), len(test_cases.TEST_CASES[question_id]["tests"]))
        for index, test in enumerate(result.get("tests", [])):
            if index >= public_count:
                result["tests"][index] = {"name": f"Hidden test {index - public_count + 1}", "passed": bool(test.get("passed")), "hidden": True}
    result["executionTimeMs"] = elapsed
    return result


@app.get("/health")
def health():
    return {"status": "ok", "public": False, "test_sets": len(test_cases.TEST_CASES)}


@app.post("/v1/submissions")
def submit(submission: Submission, authorization: str | None = Header(default=None)):
    require_private_token(authorization)
    if submission.questionId not in test_cases.TEST_CASES:
        raise HTTPException(status_code=404, detail="No isolated test set is available for this exercise.")
    if submission.mode not in {"run", "submit"}:
        raise HTTPException(status_code=400, detail="mode must be run or submit")
    try:
        validate_code(submission.code)
    except ValueError as error:
        return {"status": "failed", "score": 0, "passed": 0, "total": 0, "tests": [], "error": str(error), "executionTimeMs": 0}
    try:
        return run_submission(submission.questionId, submission.code, submission.mode)
    except subprocess.TimeoutExpired:
        return {"status": "failed", "score": 0, "passed": 0, "total": 0, "tests": [], "error": f"Execution timed out after {TIMEOUT_SECONDS} seconds.", "executionTimeMs": TIMEOUT_SECONDS * 1000}
