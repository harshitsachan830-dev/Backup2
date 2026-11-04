/**
 * ModelMind — Inline Cell Error Highlighter & Diagnostic Banner
 *
 * When a cell fails execution:
 * 1. Highlights the exact failing line in the code editor with a red background,
 *    red text, and a gutter marker with an error badge.
 * 2. Renders a clean diagnostic banner immediately beneath the code editor:
 *    - Error Type & Line Number (e.g., "ZeroDivisionError — Line 6")
 *    - Friendly human-readable explanation (e.g., "Cannot divide a number by zero.")
 *    - Actionable fix tip (e.g., "Check the denominator before performing division.")
 * 3. Automatically clears the highlight and banner as soon as the student edits
 *    the cell or the cell executes successfully.
 */

import type { INotebookTracker } from '@jupyterlab/notebook';

export interface ErrorExplanation {
  explanation: string;
  tip: string;
}

export interface CellErrorDetails {
  line: number | null;
  errorType: string;
  message: string;
  explanation: string;
  tip: string;
}

/**
 * Injects CSS styles for line highlighting, gutter icons, and the below-editor error banner.
 */
export function ensureErrorHighlightStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById('mm-error-highlight-styles')) return;

  const style = document.createElement('style');
  style.id = 'mm-error-highlight-styles';
  style.textContent = `
    /* ── Code Line Error Highlight ── */
    .mm-code-error-line {
      background: rgba(239, 68, 68, 0.16) !important;
      border-left: 3px solid #ef4444 !important;
      padding-left: 4px !important;
      border-radius: 2px !important;
      box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.22) !important;
    }
    .mm-code-error-line,
    .mm-code-error-line span {
      color: #ef4444 !important;
    }

    body[data-jp-theme-light="false"] .mm-code-error-line,
    body.jp-theme-dark .mm-code-error-line {
      background: rgba(239, 68, 68, 0.22) !important;
      box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.35) !important;
    }
    body[data-jp-theme-light="false"] .mm-code-error-line,
    body[data-jp-theme-light="false"] .mm-code-error-line span,
    body.jp-theme-dark .mm-code-error-line,
    body.jp-theme-dark .mm-code-error-line span {
      color: #f87171 !important;
    }

    /* ── Gutter Error Marker ── */
    .mm-code-error-gutter {
      color: #ef4444 !important;
      font-weight: 750 !important;
      background: rgba(239, 68, 68, 0.14) !important;
      position: relative !important;
      border-radius: 2px 0 0 2px !important;
    }
    .mm-code-error-gutter::before {
      content: "⊗ ";
      color: #ef4444;
      font-weight: 900;
      font-size: 11px;
      display: inline-block;
      margin-right: 2px;
    }

    /* ── Below-Editor Diagnostic Card ── */
    .mm-cell-error-row {
      margin: 6px 0 8px 0 !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: row !important;
      overflow: visible !important;
    }

    .mm-cell-error-card {
      margin: 0 !important;
      padding: 10px 14px;
      border-radius: 6px;
      background: #fff5f5;
      border: 1px solid #fca5a5;
      border-left: 4px solid #ef4444 !important;
      box-shadow: 0 1px 4px rgba(239, 68, 68, 0.08);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      width: 100% !important;
      box-sizing: border-box !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      animation: mm-error-slide-in 0.18s ease-out;
      position: relative;
      z-index: 2;
    }

    @keyframes mm-error-slide-in {
      from { opacity: 0; transform: translateY(-3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .mm-cell-error-card .mm-card-icon {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.12);
      border: 1.5px solid #ef4444;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 900;
      margin-top: 1px;
    }

    .mm-cell-error-card .mm-card-body {
      flex: 1;
      min-width: 0;
    }

    .mm-cell-error-card .mm-card-title {
      font-size: 13px;
      font-weight: 750;
      color: #991b1b;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mm-cell-error-card .mm-card-desc {
      font-size: 12px;
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 3px;
      line-height: 1.45;
    }

    .mm-cell-error-card .mm-card-tip {
      font-size: 11.5px;
      color: #64748b;
      line-height: 1.4;
    }

    .mm-cell-error-card .mm-card-dismiss {
      background: transparent;
      border: none;
      color: #9ca3af;
      font-size: 14px;
      line-height: 1;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      transition: color 0.15s ease;
    }
    .mm-cell-error-card .mm-card-dismiss:hover {
      color: #ef4444;
    }

    /* ── Dark Theme Overrides ── */
    body[data-jp-theme-light="false"] .mm-cell-error-card,
    body.jp-theme-dark .mm-cell-error-card {
      background: #1c1917 !important;
      border: 1px solid rgba(239, 68, 68, 0.35) !important;
      border-left: 4px solid #ef4444 !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45) !important;
    }
    body[data-jp-theme-light="false"] .mm-cell-error-card .mm-card-title,
    body.jp-theme-dark .mm-cell-error-card .mm-card-title {
      color: #ffffff !important;
    }
    body[data-jp-theme-light="false"] .mm-cell-error-card .mm-card-desc,
    body.jp-theme-dark .mm-cell-error-card .mm-card-desc {
      color: #f1f5f9 !important;
    }
    body[data-jp-theme-light="false"] .mm-cell-error-card .mm-card-tip,
    body.jp-theme-dark .mm-cell-error-card .mm-card-tip {
      color: #94a3b8 !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Parses the failing line number from a Python execution traceback.
 */
export function parseErrorLine(traceback: string, code: string): number | null {
  if (!traceback) return null;

  const lines = code ? code.split('\n') : [];
  const maxLine = lines.length > 0 ? lines.length : 10000;

  // 1. Check for IPython 8+ / Jupyter "Cell In[N], line X"
  const cellInRegex = /Cell In\[\d+\],\s*line\s*(\d+)/gi;
  let cellMatches: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = cellInRegex.exec(traceback)) !== null) {
    const val = parseInt(m[1], 10);
    if (!isNaN(val) && val > 0) {
      cellMatches.push(val);
    }
  }
  if (cellMatches.length > 0) {
    const candidate = cellMatches[cellMatches.length - 1];
    if (candidate <= maxLine) return candidate;
  }

  // 2. Check for "<ipython-input-...", line X
  const ipyRegex = /<ipython-input-[^>]+>.*?line\s*(\d+)/gi;
  let ipyMatches: number[] = [];
  while ((m = ipyRegex.exec(traceback)) !== null) {
    const val = parseInt(m[1], 10);
    if (!isNaN(val) && val > 0) {
      ipyMatches.push(val);
    }
  }
  if (ipyMatches.length > 0) {
    const candidate = ipyMatches[ipyMatches.length - 1];
    if (candidate <= maxLine) return candidate;
  }

  // 3. Check for execution pointer arrows: "----> 6" or "---> 6"
  const arrowRegex = /-{2,4}>\s*(\d+)/g;
  let arrowMatches: number[] = [];
  while ((m = arrowRegex.exec(traceback)) !== null) {
    const val = parseInt(m[1], 10);
    if (!isNaN(val) && val > 0) {
      arrowMatches.push(val);
    }
  }
  if (arrowMatches.length > 0) {
    const candidate = arrowMatches[arrowMatches.length - 1];
    if (candidate <= maxLine) return candidate;
  }

  // 4. Fallback: generic "line X"
  const genericRegex = /\bline\s*(\d+)/gi;
  let genericMatches: number[] = [];
  while ((m = genericRegex.exec(traceback)) !== null) {
    const val = parseInt(m[1], 10);
    if (!isNaN(val) && val > 0) {
      genericMatches.push(val);
    }
  }
  if (genericMatches.length > 0) {
    for (let i = genericMatches.length - 1; i >= 0; i--) {
      if (genericMatches[i] <= maxLine) {
        return genericMatches[i];
      }
    }
    return genericMatches[genericMatches.length - 1];
  }

  return null;
}

/**
 * Returns a human-friendly explanation and actionable fix tip for common Python & ML errors.
 */
export function parseErrorExplanation(
  errorType: string,
  errorMessage: string,
  errorLine: number | null
): ErrorExplanation {
  const normType = (errorType || '').trim();
  const msg = (errorMessage || '').trim();
  const lineStr = errorLine ? `Line ${errorLine}` : 'this line';

  switch (normType) {
    case 'ZeroDivisionError':
      return {
        explanation: 'Cannot divide a number by zero.',
        tip: 'Check the denominator before performing division, or guard with an if-condition.'
      };

    case 'SyntaxError': {
      if (msg.includes("')' was never closed") || msg.includes("'(' was never closed")) {
        return {
          explanation: "Unclosed parenthesis: '(' was never closed.",
          tip: "Add the closing parenthesis ')' to complete the function call or expression."
        };
      }
      if (msg.includes("']' was never closed") || msg.includes("'[' was never closed")) {
        return {
          explanation: "Unclosed bracket: '[' was never closed.",
          tip: "Add the closing bracket ']' to close the list or index slice."
        };
      }
      if (msg.includes("'}' was never closed") || msg.includes("'{' was never closed")) {
        return {
          explanation: "Unclosed brace: '{' was never closed.",
          tip: "Add the closing brace '}' to close the dictionary or set."
        };
      }
      if (msg.includes('invalid syntax') || msg.includes("expected ':'")) {
        return {
          explanation: 'Invalid syntax on or near this line.',
          tip: "Check for a missing colon ':' at the end of an if/for/def statement, or typos in keywords."
        };
      }
      if (msg.includes('unterminated string literal')) {
        return {
          explanation: 'Unterminated string literal: missing matching quote.',
          tip: "Ensure opening quotes (' or \") have a corresponding closing quote on the same line."
        };
      }
      return {
        explanation: msg ? `Python syntax error: ${msg}.` : 'Python could not parse this line of code.',
        tip: 'Check for unmatched parentheses, brackets, quotes, or a missing colon.'
      };
    }

    case 'NameError': {
      const match = msg.match(/name '([^']+)' is not defined/);
      const varName = match ? `'${match[1]}'` : 'Variable or name';
      return {
        explanation: `${varName} is not defined in this notebook session.`,
        tip: `Check for spelling typos, or execute the cell where ${varName} is defined or imported first.`
      };
    }

    case 'TypeError': {
      if (msg.includes('unsupported operand type')) {
        return {
          explanation: 'Unsupported operand type: incompatible types cannot be combined.',
          tip: 'Convert data types explicitly using int(), float(), or str(), or check types with type().'
        };
      }
      if (msg.includes('takes') && msg.includes('positional argument')) {
        return {
          explanation: 'Function called with an incorrect number of arguments.',
          tip: 'Check the function signature or documentation for required parameters.'
        };
      }
      if (msg.includes("'NoneType' object")) {
        return {
          explanation: 'Variable is None instead of an expected object or function.',
          tip: 'Check if a preceding function returned None or if an assignment was missed.'
        };
      }
      if (msg.includes('not callable')) {
        return {
          explanation: 'Object is not callable: attempting to call a non-function as a function.',
          tip: 'Check if a function name was overwritten by a variable assignment (e.g. str = "abc").'
        };
      }
      return {
        explanation: msg ? `Type error: ${msg}.` : 'Incompatible data type passed to operation.',
        tip: 'Verify variable data types before performing this operation.'
      };
    }

    case 'ValueError':
      return {
        explanation: msg ? `Value error: ${msg}.` : 'Inappropriate value passed to an operation or function.',
        tip: 'Check input values, array dimensions, or valid parameter ranges.'
      };

    case 'KeyError': {
      const keyMatch = msg.match(/['"]([^'"]+)['"]/);
      const keyName = keyMatch ? `'${keyMatch[1]}'` : 'Key';
      return {
        explanation: `Key or DataFrame column ${keyName} was not found.`,
        tip: 'Check df.columns or dict.keys() to confirm the exact name and capitalization.'
      };
    }

    case 'IndexError':
      return {
        explanation: 'List or sequence index is out of range.',
        tip: 'Check the length using len() to ensure the index is between 0 and len - 1.'
      };

    case 'AttributeError': {
      const attrMatch = msg.match(/'([^']+)' object has no attribute '([^']+)'/);
      if (attrMatch) {
        return {
          explanation: `'${attrMatch[1]}' object has no attribute or method '${attrMatch[2]}'.`,
          tip: `Check spelling or use dir(${attrMatch[1]}) to list all available methods and attributes.`
        };
      }
      return {
        explanation: msg ? `Attribute error: ${msg}.` : 'The object does not have the specified attribute.',
        tip: 'Check the object type and verify available attributes and methods.'
      };
    }

    case 'ModuleNotFoundError':
    case 'ImportError': {
      const modMatch = msg.match(/No module named '([^']+)'/);
      const modName = modMatch ? modMatch[1] : 'package';
      return {
        explanation: `Module '${modName}' is not installed or cannot be imported.`,
        tip: `Install it by running !pip install ${modName} in a new cell, then re-run this cell.`
      };
    }

    case 'FileNotFoundError':
      return {
        explanation: 'The specified file or directory path does not exist.',
        tip: 'Check the file path spelling, or use os.path.exists() and os.getcwd() to locate it.'
      };

    case 'IndentationError':
      return {
        explanation: 'Indentation is misaligned or unexpected.',
        tip: "Use consistent 4-space indentation for every code block after a line ending in ':'."
      };

    default:
      return {
        explanation: msg || `An error occurred during execution on ${lineStr}.`,
        tip: `Inspect line ${errorLine ?? ''} in the active cell and verify preceding variable values.`
      };
  }
}

/**
 * Creates the clean diagnostic banner element matching the user's design.
 */
export function createErrorBannerElement(details: {
  errorType: string;
  errorLine: number | null;
  explanation: string;
  tip: string;
  onDismiss?: () => void;
}): HTMLElement {
  const card = document.createElement('div');
  card.className = 'mm-cell-error-card';

  const icon = document.createElement('div');
  icon.className = 'mm-card-icon';
  icon.textContent = '!';

  const body = document.createElement('div');
  body.className = 'mm-card-body';

  const title = document.createElement('div');
  title.className = 'mm-card-title';
  const lineLabel = details.errorLine ? ` — Line ${details.errorLine}` : '';
  title.textContent = `${details.errorType}${lineLabel}`;

  const desc = document.createElement('div');
  desc.className = 'mm-card-desc';
  desc.textContent = details.explanation;

  const tip = document.createElement('div');
  tip.className = 'mm-card-tip';
  tip.textContent = details.tip;

  body.append(title, desc, tip);

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'mm-card-dismiss';
  dismiss.textContent = '✕';
  dismiss.title = 'Dismiss error banner';
  dismiss.addEventListener('click', () => {
    details.onDismiss?.();
    card.remove();
  });

  card.append(icon, body, dismiss);
  return card;
}

// Map to track active mutation observers and cleanup callbacks per cell node
const _activeCellObservers = new WeakMap<HTMLElement, MutationObserver>();
const _activeCellCleanups = new WeakMap<any, () => void>();

/**
 * Applies error line styling and the diagnostic banner to a notebook cell.
 */
export function highlightCellError(
  cell: any,
  error: {
    error_type: string;
    error_message: string;
    traceback: string;
    code: string;
  }
): void {
  if (!cell || !cell.node) return;
  ensureErrorHighlightStyles();

  // Clear any existing error state on this cell first
  clearCellError(cell);

  const errorLine = parseErrorLine(error.traceback, error.code);
  const { explanation, tip } = parseErrorExplanation(
    error.error_type,
    error.error_message,
    errorLine
  );

  const cellNode: HTMLElement = cell.node;

  // ── 1. Apply code line highlighting in CodeMirror ──
  const applyHighlights = (shouldScroll = false) => {
    if (!errorLine || errorLine <= 0) return;

    const content = cellNode.querySelector('.cm-content');
    if (!content) return;

    const lines = Array.from(content.querySelectorAll(':scope > .cm-line'));
    if (lines.length === 0) return;

    const targetIndex = errorLine - 1;
    let targetLine: Element | null = null;

    if (targetIndex >= 0 && targetIndex < lines.length) {
      targetLine = lines[targetIndex];
    } else {
      // Fallback matching by line text
      const codeLines = (error.code || '').split('\n');
      const targetText = (codeLines[targetIndex] ?? '').trim();
      if (targetText) {
        targetLine =
          lines.find(l => (l.textContent || '').trim() === targetText) ?? null;
      }
    }

    if (targetLine) {
      if (!targetLine.classList.contains('mm-code-error-line')) {
        cellNode.querySelectorAll('.mm-code-error-line').forEach(el => {
          if (el !== targetLine) el.classList.remove('mm-code-error-line');
        });
        targetLine.classList.add('mm-code-error-line');
      }

      // ONLY scroll on initial error notification, NEVER during user scrolling
      if (shouldScroll) {
        try {
          targetLine.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        } catch {
          // ignore scroll error
        }
      }
    }

    // Update gutter element only if not already active
    const gutterContainer = cellNode.querySelector('.cm-gutter.cm-lineNumbers');
    if (gutterContainer) {
      const activeGutter = gutterContainer.querySelector('.mm-code-error-gutter');
      if (
        !activeGutter ||
        (activeGutter.textContent || '').trim() !== String(errorLine)
      ) {
        if (activeGutter) {
          activeGutter.classList.remove('mm-code-error-gutter');
        }
        const gutterElements = Array.from(
          gutterContainer.querySelectorAll('.cm-gutterElement')
        );
        for (const gutterEl of gutterElements) {
          if ((gutterEl.textContent || '').trim() === String(errorLine)) {
            gutterEl.classList.add('mm-code-error-gutter');
            break;
          }
        }
      }
    }
  };

  // Run once immediately on execution error (with instant one-time scrollIntoView)
  applyHighlights(true);

  // Throttled observer that only runs when CodeMirror adds/removes elements, NEVER scrolls
  const content = cellNode.querySelector('.cm-content');
  if (content) {
    let rafPending = false;
    const observer = new MutationObserver(() => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        applyHighlights(false);
      });
    });
    observer.observe(content, { childList: true });
    _activeCellObservers.set(cellNode, observer);
  }

  // ── 2. Render diagnostic banner aligned properly with editor borders ──
  const banner = createErrorBannerElement({
    errorType: error.error_type,
    errorLine,
    explanation,
    tip,
    onDismiss: () => {
      clearCellError(cell);
    }
  });

  const outputArea =
    cellNode.querySelector('.jp-Cell-outputArea') ||
    cellNode.querySelector('.jp-OutputArea');
  const inputWrapper = cellNode.querySelector('.jp-Cell-inputWrapper');

  if (outputArea) {
    const row = document.createElement('div');
    row.className = 'jp-OutputArea-child mm-cell-error-row';
    row.style.cssText =
      'margin: 6px 0 8px 0; width: 100%; display: flex; flex-direction: row;';

    const prompt = document.createElement('div');
    prompt.className = 'jp-OutputPrompt';
    prompt.style.cssText = 'visibility: hidden;';

    const outputBody = document.createElement('div');
    outputBody.className = 'jp-OutputArea-output';
    outputBody.style.cssText =
      'flex: 1 1 auto; padding: 0; min-width: 0; overflow: visible;';
    outputBody.appendChild(banner);

    row.append(prompt, outputBody);
    outputArea.insertBefore(row, outputArea.firstChild);
  } else if (inputWrapper && inputWrapper.parentNode) {
    const row = document.createElement('div');
    row.className = 'jp-Cell-inputWrapper mm-cell-error-row';
    row.style.cssText =
      'margin: 6px 0 8px 0; width: 100%; display: flex; flex-direction: row;';

    const prompt = document.createElement('div');
    prompt.className = 'jp-InputPrompt';
    prompt.style.cssText = 'visibility: hidden;';

    const body = document.createElement('div');
    body.style.cssText = 'flex: 1 1 auto; padding: 0; min-width: 0;';
    body.appendChild(banner);

    row.append(prompt, body);
    inputWrapper.parentNode.insertBefore(row, inputWrapper.nextSibling);
  }

  // ── 3. Register auto-cleanup when the student modifies the cell content ──
  if (cell.model && cell.model.contentChanged) {
    const onContentChanged = () => {
      clearCellError(cell);
    };
    cell.model.contentChanged.connect(onContentChanged);
    _activeCellCleanups.set(cell, () => {
      try {
        cell.model.contentChanged.disconnect(onContentChanged);
      } catch {
        // disconnected
      }
    });
  }
}

/**
 * Removes all error highlights, gutter badges, and diagnostic banners from a cell.
 */
export function clearCellError(cell: any): void {
  if (!cell || !cell.node) return;
  const cellNode: HTMLElement = cell.node;

  // Disconnect MutationObserver
  const observer = _activeCellObservers.get(cellNode);
  if (observer) {
    observer.disconnect();
    _activeCellObservers.delete(cellNode);
  }

  // Disconnect contentChanged signal listener
  const cleanup = _activeCellCleanups.get(cell);
  if (cleanup) {
    cleanup();
    _activeCellCleanups.delete(cell);
  }

  // Remove line and gutter classes
  cellNode.querySelectorAll('.mm-code-error-line').forEach(el => {
    el.classList.remove('mm-code-error-line');
  });
  cellNode.querySelectorAll('.mm-code-error-gutter').forEach(el => {
    el.classList.remove('mm-code-error-gutter');
  });

  // Remove error row and card
  cellNode
    .querySelectorAll('.mm-cell-error-row, .mm-cell-error-card')
    .forEach(el => {
      el.remove();
    });
}

/**
 * Initializes error line highlighting across all notebook cells in ModelMind Notebook.
 */
export function initCellErrorHighlighter(
  notebooks: INotebookTracker,
  notebookActions?: any
): void {
  ensureErrorHighlightStyles();

  if (notebookActions && notebookActions.executed) {
    notebookActions.executed.connect((_: any, args: any) => {
      const { cell, success } = args;
      if (!cell) return;

      if (success) {
        clearCellError(cell);
        return;
      }

      // Execution failed: extract error and highlight
      setTimeout(() => {
        const model = (cell as any).model;
        if (!model || !model.outputs) return;

        let errorOutput: any = null;
        const outputs = model.outputs.toJSON();
        for (let i = outputs.length - 1; i >= 0; i--) {
          if (outputs[i].output_type === 'error') {
            errorOutput = outputs[i];
            break;
          }
        }

        if (errorOutput) {
          const source = model.toJSON().source;
          const code = Array.isArray(source) ? source.join('') : String(source || '');
          highlightCellError(cell, {
            error_type: String(errorOutput.ename || 'RuntimeError'),
            error_message: String(errorOutput.evalue || ''),
            traceback: Array.isArray(errorOutput.traceback)
              ? errorOutput.traceback.join('\n')
              : String(errorOutput.traceback || ''),
            code
          });
        }
      }, 40);
    });
  }
}
