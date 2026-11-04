"""Static, source-grounded visual summaries for supported ML code patterns.

This module deliberately parses Python with ``ast`` and never imports or runs
user code. The initial visualizer supports scikit-learn Pipeline and
ColumnTransformer declarations, which are common and useful in ModelMind.
"""

import ast
import json
import re


MAX_SOURCE_CHARS = 20_000
MAX_STAGES = 40
MAX_CONTROL_NODES = 120
MAX_ARRAY_STEPS = 80
CODE_VIEW_CATALOG = {
    "pipeline-flow": "Shows declared scikit-learn Pipeline steps and linked ColumnTransformer branches found in the source.",
    "code-structure-map": "Counts imports, definitions, conditions, loops, common data operations, and outputs in the source.",
    "control-flow-map": "Shows source-declared branches, loops, exception paths, and nested blocks without claiming which path ran.",
    "array-shape-flow": "Maps source-declared ML array splits, reshapes, transformations, combinations, and predictions without inventing runtime dimensions.",
    "shape-mismatch": "Visualizes dimensions explicitly stated by a supported traceback, distinguishing expected/received from unlabeled operands.",
}


def _call_name(node):
    if isinstance(node, ast.Call):
        node = node.func
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        return node.attr
    return "expression"


def _name(node):
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        prefix = _name(node.value)
        return f"{prefix}.{node.attr}" if prefix else node.attr
    if isinstance(node, ast.Call):
        return _call_name(node)
    return "expression"


def _keyword(node, key):
    if not isinstance(node, ast.Call):
        return None
    return next((kw.value for kw in node.keywords if kw.arg == key), None)


def _string(node, fallback):
    try:
        value = ast.literal_eval(node)
    except (ValueError, TypeError):
        return fallback
    return value if isinstance(value, str) else fallback


def _sequence(node):
    return node.elts if isinstance(node, (ast.List, ast.Tuple)) else []


def _pipeline_stages(call, source_lines):
    steps = _keyword(call, "steps")
    if steps is None and isinstance(call, ast.Call) and call.args:
        steps = call.args[0]
    output = []
    for item in _sequence(steps)[:MAX_STAGES]:
        if not isinstance(item, (ast.Tuple, ast.List)) or len(item.elts) < 2:
            continue
        label = _string(item.elts[0], "stage")
        estimator = item.elts[1]
        output.append({
            "name": label[:80],
            "estimator": _name(estimator)[:100],
            "line": getattr(item, "lineno", 1),
            "source": source_lines[getattr(item, "lineno", 1) - 1].strip()[:240]
            if 0 < getattr(item, "lineno", 1) <= len(source_lines) else "",
        })
    return output


def _column_branches(call, source_lines):
    transformers = _keyword(call, "transformers")
    if transformers is None and isinstance(call, ast.Call) and call.args:
        transformers = call.args[0]
    branches = []
    for item in _sequence(transformers)[:MAX_STAGES]:
        if not isinstance(item, (ast.Tuple, ast.List)) or len(item.elts) < 3:
            continue
        line = getattr(item, "lineno", 1)
        branches.append({
            "name": _string(item.elts[0], "transformer")[:80],
            "estimator": _name(item.elts[1])[:100],
            "columns": ast.unparse(item.elts[2])[:180],
            "line": line,
            "source": source_lines[line - 1].strip()[:240]
            if 0 < line <= len(source_lines) else "",
        })
    remainder = _keyword(call, "remainder")
    return branches, ast.unparse(remainder)[:100] if remainder is not None else None


def visualize_ml_pipeline(source):
    """Return a bounded, source-derived sklearn pipeline summary."""
    if not isinstance(source, str) or not source.strip():
        return {"status": "empty", "message": "Select a code cell with an ML pipeline first."}
    if len(source) > MAX_SOURCE_CHARS:
        return {"status": "too_large", "message": "This cell is too large to inspect safely (20,000 character limit)."}
    try:
        tree = ast.parse(source)
    except (SyntaxError, ValueError, TypeError) as error:
        return {"status": "syntax_error", "message": f"Python source could not be parsed: {error.msg if isinstance(error, SyntaxError) else 'invalid source'}"}

    lines = source.splitlines()
    candidates = []
    for node in ast.walk(tree):
        if not isinstance(node, (ast.Assign, ast.AnnAssign)):
            continue
        value = node.value
        if not isinstance(value, ast.Call) or _call_name(value) != "Pipeline":
            continue
        targets = node.targets if isinstance(node, ast.Assign) else [node.target]
        variable = next((_name(target) for target in targets if isinstance(target, (ast.Name, ast.Attribute))), "Pipeline")
        stages = _pipeline_stages(value, lines)
        if not stages:
            continue
        candidates.append((node.lineno, variable, value, stages))

    if not candidates:
        return {
            "status": "unsupported",
            "message": "No scikit-learn Pipeline with a readable steps list was found. This view supports Pipeline(steps=[(name, transformer), ...]) declarations.",
        }

    candidates.sort(key=lambda item: item[0])
    _, variable, pipeline_call, stages = candidates[-1]
    branches = []
    remainder = None
    stage_estimators = {stage["estimator"] for stage in stages}
    for node in ast.walk(tree):
        if not isinstance(node, (ast.Assign, ast.AnnAssign)):
            continue
        call = node.value
        if not isinstance(call, ast.Call) or _call_name(call) != "ColumnTransformer":
            continue
        targets = node.targets if isinstance(node, ast.Assign) else [node.target]
        names = {_name(target) for target in targets if isinstance(target, (ast.Name, ast.Attribute))}
        if names.intersection(stage_estimators):
            branches, remainder = _column_branches(call, lines)
            if branches:
                break

    if not branches:
        for node in ast.walk(pipeline_call):
            if isinstance(node, ast.Call) and _call_name(node) == "ColumnTransformer":
                branches, remainder = _column_branches(node, lines)
                if branches:
                    break

    return {
        "status": "visualized",
        "viewType": "sklearn-pipeline",
        "name": variable[:100],
        "stages": stages,
        "branches": branches,
        "remainder": remainder,
        "sourceLines": len(lines),
        "basis": "static Python source; no code was executed and no fitted result was inspected",
    }


def visualize_control_flow(source):
    """Create a bounded syntax outline for Python control-flow statements."""
    if not isinstance(source, str) or not source.strip():
        return {"status": "empty", "message": "Select a Python code cell first."}
    if len(source) > MAX_SOURCE_CHARS:
        return {"status": "too_large", "message": "This cell exceeds the 20,000-character limit."}
    try:
        tree = ast.parse(source)
    except (SyntaxError, ValueError, TypeError) as error:
        detail = error.msg if isinstance(error, SyntaxError) else "invalid source"
        return {"status": "syntax_error", "message": f"Python source could not be parsed: {detail}"}

    control_types = (ast.If, ast.For, ast.AsyncFor, ast.While, ast.Try)
    if not any(isinstance(node, control_types) for node in ast.walk(tree)):
        return {
            "status": "unsupported",
            "message": "No if/else, loop, or try/except structure was found in this source.",
        }

    nodes = []
    truncated = False

    def add_block(statements, parent_id=None, level=0, branch=None):
        nonlocal truncated
        if level > 8 or len(nodes) >= MAX_CONTROL_NODES:
            truncated = True
            return
        for statement in statements:
            if len(nodes) >= MAX_CONTROL_NODES:
                truncated = True
                return
            line = getattr(statement, "lineno", 1)
            if isinstance(statement, ast.If):
                kind, label = "condition", f"if {ast.unparse(statement.test)}"
            elif isinstance(statement, (ast.For, ast.AsyncFor)):
                kind, label = "loop", f"for {ast.unparse(statement.target)} in {ast.unparse(statement.iter)}"
            elif isinstance(statement, ast.While):
                kind, label = "loop", f"while {ast.unparse(statement.test)}"
            elif isinstance(statement, ast.Try):
                kind, label = "exception", "try"
            elif isinstance(statement, (ast.FunctionDef, ast.AsyncFunctionDef)):
                kind, label = "function", f"def {statement.name}(…)"
            elif isinstance(statement, ast.ClassDef):
                kind, label = "class", f"class {statement.name}"
            elif isinstance(statement, ast.Return):
                kind, label = "return", "return" + (f" {ast.unparse(statement.value)}" if statement.value else "")
            elif isinstance(statement, ast.Break):
                kind, label = "loop-control", "break"
            elif isinstance(statement, ast.Continue):
                kind, label = "loop-control", "continue"
            else:
                kind, label = "statement", ast.unparse(statement)
            label = " ".join(label.split())[:180]
            node_id = len(nodes) + 1
            nodes.append({
                "id": node_id,
                "parentId": parent_id,
                "level": level,
                "kind": kind,
                "label": label,
                "line": line,
                "branch": branch,
            })

            if isinstance(statement, ast.If):
                add_block(statement.body, node_id, level + 1, "If true")
                if statement.orelse:
                    add_block(statement.orelse, node_id, level + 1, "Else / elif")
            elif isinstance(statement, (ast.For, ast.AsyncFor, ast.While)):
                add_block(statement.body, node_id, level + 1, "Loop body · may repeat")
                if statement.orelse:
                    add_block(statement.orelse, node_id, level + 1, "Loop else · if not broken")
            elif isinstance(statement, ast.Try):
                add_block(statement.body, node_id, level + 1, "Try path")
                for handler in statement.handlers:
                    error_type = ast.unparse(handler.type) if handler.type else "any exception"
                    add_block(handler.body, node_id, level + 1, f"Except {error_type}"[:100])
                if statement.orelse:
                    add_block(statement.orelse, node_id, level + 1, "Else · no exception")
                if statement.finalbody:
                    add_block(statement.finalbody, node_id, level + 1, "Finally · always")
            elif isinstance(statement, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                add_block(statement.body, node_id, level + 1, "Definition body · runs when called/created")

    add_block(tree.body)
    return {
        "status": "visualized",
        "viewType": "python-control-flow",
        "nodes": nodes,
        "truncated": truncated,
        "basis": "static source outline; branch conditions were not evaluated and no code was executed",
    }


def _target_names(node):
    if isinstance(node, ast.Name):
        return [node.id]
    if isinstance(node, (ast.Tuple, ast.List)):
        return [name for item in node.elts for name in _target_names(item)]
    return []


def _array_operation(call):
    name = _call_name(call)
    allowed = {
        "train_test_split": "Split data",
        "reshape": "Reshape array",
        "fit_transform": "Fit transformer and transform",
        "transform": "Transform data",
        "to_numpy": "Convert to NumPy array",
        "array": "Create NumPy array",
        "asarray": "Convert to NumPy array",
        "concatenate": "Concatenate arrays",
        "stack": "Stack arrays",
        "hstack": "Join arrays horizontally",
        "vstack": "Join arrays vertically",
        "column_stack": "Join columns",
        "transpose": "Transpose array",
        "predict": "Generate predictions",
        "predict_proba": "Generate class probabilities",
    }
    return (name, allowed[name]) if name in allowed else None


def visualize_array_shape_flow(source):
    """Map relevant ML array operations from source, never infer runtime shapes."""
    if not isinstance(source, str) or not source.strip():
        return {"status": "empty", "message": "Select a Python code cell first."}
    if len(source) > MAX_SOURCE_CHARS:
        return {"status": "too_large", "message": "This cell exceeds the 20,000-character limit."}
    try:
        tree = ast.parse(source)
    except (SyntaxError, ValueError, TypeError) as error:
        detail = error.msg if isinstance(error, SyntaxError) else "invalid source"
        return {"status": "syntax_error", "message": f"Python source could not be parsed: {detail}"}

    steps = []
    for statement in ast.walk(tree):
        if not isinstance(statement, (ast.Assign, ast.AnnAssign, ast.Expr)):
            continue
        value = statement.value if not isinstance(statement, ast.Expr) else statement.value
        if value is None:
            continue
        targets = []
        if isinstance(statement, ast.Assign):
            targets = [name for target in statement.targets for name in _target_names(target)]
        elif isinstance(statement, ast.AnnAssign):
            targets = _target_names(statement.target)
        if not targets:
            continue

        calls = [node for node in ast.walk(value) if isinstance(node, ast.Call) and _array_operation(node)]
        # In chained calls, keep the outermost recognized operation so the
        # displayed output corresponds to the assigned expression.
        for call in sorted(calls, key=lambda node: (node.lineno, -node.col_offset)):
            operation = _array_operation(call)
            if not operation:
                continue
            call_name, title = operation
            if call_name in {"train_test_split", "concatenate", "stack", "hstack", "vstack", "column_stack", "array", "asarray"}:
                inputs = [ast.unparse(arg)[:120] for arg in call.args[:4]]
            elif call_name in {"fit_transform", "transform", "predict", "predict_proba"}:
                inputs = [ast.unparse(arg)[:120] for arg in call.args[:3]]
                if not inputs and isinstance(call.func, ast.Attribute):
                    inputs = [ast.unparse(call.func.value)[:120]]
            elif isinstance(call.func, ast.Attribute):
                inputs = [ast.unparse(call.func.value)[:120]]
            else:
                inputs = [ast.unparse(arg)[:120] for arg in call.args[:3]]
            if call_name == "train_test_split":
                outputs = targets
            elif call_name in {"concatenate", "stack", "hstack", "vstack", "column_stack", "array", "asarray"}:
                outputs = targets
            else:
                outputs = targets
            requested_shape = None
            if call_name == "reshape":
                requested_shape = "(" + ", ".join(ast.unparse(arg) for arg in call.args[1:]) + ")"
                if not call.args[1:]:
                    requested_shape = "shape argument supplied by source"
            steps.append({
                "operation": title,
                "method": call_name,
                "inputs": inputs,
                "outputs": outputs,
                "line": getattr(call, "lineno", getattr(statement, "lineno", 1)),
                "requested_shape": requested_shape,
                "source": ast.unparse(statement)[:260],
            })
            # Only one operation per assignment: use the first/outermost
            # meaningful call, avoiding duplicate rows for nested expressions.
            break
        if len(steps) >= MAX_ARRAY_STEPS:
            break

    if not steps:
        return {
            "status": "unsupported",
            "message": "No supported array split, reshape, conversion, transformation, combination, or prediction operation was found.",
        }
    steps.sort(key=lambda item: item["line"])
    return {
        "status": "visualized",
        "viewType": "ml-array-shape-flow",
        "steps": steps,
        "truncated": len(steps) >= MAX_ARRAY_STEPS,
        "basis": "source-derived operations; actual array dimensions and values were not evaluated",
    }


def visualize_shape_mismatch(error_type, error_message, traceback=""):
    """Extract only explicit dimension evidence from common Python ML errors."""
    if not isinstance(error_message, str) or not error_message.strip():
        return {"status": "unsupported", "message": "No error message is available to inspect."}
    evidence = "\n".join(str(value)[:12_000] for value in (error_type, error_message, traceback) if value)

    match = re.search(
        r"X has (\d+) features?, but .*? is expecting (\d+) features?",
        evidence,
        re.IGNORECASE,
    )
    if match:
        actual, expected = (int(match.group(1)), int(match.group(2)))
        return {
            "status": "visualized",
            "viewType": "expected-actual-features",
            "title": "Feature count mismatch",
            "leftLabel": "Received from X",
            "leftValue": f"{actual} features",
            "rightLabel": "Expected by estimator",
            "rightValue": f"{expected} features",
            "relationship": "These counts must match for prediction or transformation.",
            "basis": "Counts copied from the error text; no data was inspected.",
        }

    match = re.search(r"inconsistent numbers of samples:\s*\[([^\]]+)\]", evidence, re.IGNORECASE)
    if match:
        counts = [int(value) for value in re.findall(r"\d+", match.group(1))[:8]]
        if len(counts) >= 2:
            return {
                "status": "visualized",
                "viewType": "sample-counts",
                "title": "Sample count mismatch",
                "items": [{"label": f"Input {index + 1}", "value": f"{count} rows"} for index, count in enumerate(counts)],
                "relationship": "Features and targets passed together usually need the same number of rows.",
                "basis": "Counts copied from the error text; input names were not inferred.",
            }

    match = re.search(r"operands could not be broadcast together with shapes\s+(\([^)]*\))\s+(\([^)]*\))", evidence, re.IGNORECASE)
    if match:
        return {
            "status": "visualized",
            "viewType": "unlabeled-operands",
            "title": "Broadcast shape mismatch",
            "leftLabel": "Operand A",
            "leftValue": match.group(1),
            "rightLabel": "Operand B",
            "rightValue": match.group(2),
            "relationship": "NumPy could not align these dimensions for the requested operation.",
            "basis": "Operand shapes copied from the error text; roles and data values are unknown.",
        }

    match = re.search(r"shapes\s+\((\d+)\s*,\s*(\d+)\)\s+and\s+\((\d+)\s*,\s*(\d+)\)\s+not aligned", evidence, re.IGNORECASE)
    if match:
        left = (int(match.group(1)), int(match.group(2)))
        right = (int(match.group(3)), int(match.group(4)))
        return {
            "status": "visualized",
            "viewType": "unlabeled-operands",
            "title": "Matrix multiplication shape mismatch",
            "leftLabel": "Left operand",
            "leftValue": str(left),
            "rightLabel": "Right operand",
            "rightValue": str(right),
            "relationship": f"Inner dimensions must match; source error reports {left[1]} and {right[0]}.",
            "basis": "Operand dimensions copied from the error text; no matrix was inspected.",
        }

    match = re.search(r"mat1 and mat2 shapes cannot be multiplied\s*\((\d+)\s*x\s*(\d+)\)\s*and\s*\((\d+)\s*x\s*(\d+)\)", evidence, re.IGNORECASE)
    if match:
        left = (int(match.group(1)), int(match.group(2)))
        right = (int(match.group(3)), int(match.group(4)))
        return {
            "status": "visualized",
            "viewType": "unlabeled-operands",
            "title": "Matrix multiplication shape mismatch",
            "leftLabel": "mat1",
            "leftValue": str(left),
            "rightLabel": "mat2",
            "rightValue": str(right),
            "relationship": f"Inner dimensions must match; source error reports {left[1]} and {right[0]}.",
            "basis": "Operand dimensions copied from the error text; no matrix was inspected.",
        }

    return {
        "status": "unsupported",
        "message": "This error does not match a supported shape-mismatch pattern. The original traceback remains available in Error Assistant.",
    }


def validate_code_visualization_reply(reply, source, error_context=None):
    """Validate provider JSON and expose only views the client can render."""
    if not isinstance(reply, str):
        return None
    text = reply.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
        if text.endswith("```"):
            text = text[:-3].strip()
    try:
        payload = json.loads(text)
    except (ValueError, TypeError):
        return None
    if not isinstance(payload, dict):
        return None
    explanation = payload.get("explanation")
    suggestions = payload.get("visualization_ids")
    if not isinstance(explanation, str) or not explanation.strip() or not isinstance(suggestions, list):
        return None

    pipeline = visualize_ml_pipeline(source)
    control_flow = visualize_control_flow(source)
    array_flow = visualize_array_shape_flow(source)
    shape_mismatch = visualize_shape_mismatch(
        (error_context or {}).get("error_type", ""),
        (error_context or {}).get("error_message", ""),
        (error_context or {}).get("traceback", ""),
    )
    try:
        ast.parse(source)
        available = {"code-structure-map"}
    except (SyntaxError, ValueError, TypeError):
        available = set()
    if control_flow.get("status") == "visualized":
        available.add("control-flow-map")
    if array_flow.get("status") == "visualized":
        available.add("array-shape-flow")
    if shape_mismatch.get("status") == "visualized":
        available.add("shape-mismatch")
    if pipeline.get("status") == "visualized":
        available.add("pipeline-flow")
    ids = []
    for candidate in suggestions:
        if isinstance(candidate, str) and candidate in CODE_VIEW_CATALOG and candidate in available and candidate not in ids:
            ids.append(candidate)
        if len(ids) == 3:
            break
    return {
        "explanation": explanation.strip()[:8_000],
        "visualization_ids": ids,
        "visualizations": {
            view_id: {
                "label": {
                    "pipeline-flow": "ML pipeline flow",
                    "code-structure-map": "Code structure map",
                    "control-flow-map": "Control-flow outline",
                    "array-shape-flow": "ML array and shape flow",
                    "shape-mismatch": "Shape mismatch diagnosis",
                }[view_id],
                "reason": CODE_VIEW_CATALOG[view_id],
            }
            for view_id in ids
        },
        "pipeline": pipeline if "pipeline-flow" in ids else None,
        "control_flow": control_flow if "control-flow-map" in ids else None,
        "array_flow": array_flow if "array-shape-flow" in ids else None,
        "shape_mismatch": shape_mismatch if "shape-mismatch" in ids else None,
    }
