import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { isCodeCellModel } from '@jupyterlab/cells';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IMainMenu } from '@jupyterlab/mainmenu';
import type { IError, IOutput } from '@jupyterlab/nbformat';
import {
  INotebookTracker,
  NotebookActions,
  NotebookPanel
} from '@jupyterlab/notebook';
import { ITranslator } from '@jupyterlab/translation';
import { Widget } from '@lumino/widgets';

import modelMindLogo from '../style/modelmind-logo.png';

import { applyFixToCellModel } from './fix-utils';
import { requestAPI } from './request';
import { createModelMindStudioWidget } from './modelmind-studio';
import { createFAB as createTutorFAB, loadTutorExplanation } from './debugger-tutor';
import {
  createAIChatbotPanel,
  type CodeTraceEvent,
  type DecisionTreeView,
  type NeuralNetworkView,
  type TrainingResult,
  type TrainingSource
} from './ai-chatbot';
import { createAPIKeySettingsWidget } from './api-key-settings';
import { MODEL_MIND_NOTEBOOK_TYPE } from './notebook-mode';
import type { ModelMindNotebookRole } from './notebook-mode';

const COMMAND_ID = '@ml-platform/error-assistant:open';
const MAX_CODE_LENGTH = 20_000;
const MAX_TRACEBACK_LENGTH = 12_000;

function setModelMindFavicon(): void {
  document.querySelectorAll('link[rel~="icon"]').forEach(link => {
    link.remove();
  });

  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/png';
  favicon.setAttribute('sizes', '256x256');
  favicon.href = modelMindLogo;
  document.head.appendChild(favicon);
}

function removeJupyterSplashOrbitAnimation(): void {
  const style = document.createElement('style');
  style.id = 'modelmind-splash-branding';
  style.textContent = `
    #jupyterlab-splash #moon1,
    #jupyterlab-splash #moon2,
    #jupyterlab-splash #moon3 {
      display: none !important;
      animation: none !important;
    }
  `;
  document.head.appendChild(style);
}

// Apply while the splash is visible, before JupyterLab activates plugins.
setModelMindFavicon();
removeJupyterSplashOrbitAnimation();

type CapturedError = {
  cell_id: string;
  code: string;
  error_type: string;
  error_message: string;
  traceback: string;
};

type NotebookCell = NonNullable<INotebookTracker['activeCell']>;

type FixCandidate = {
  summary: string;
  candidate_code: string;
  provider?: 'ollama' | 'gemini';
};

type FixActions = {
  suggestFix: () => Promise<FixCandidate>;
  applyFix: (fix: FixCandidate) => Promise<void>;
};

function getTargetCell(notebooks: INotebookTracker): NotebookCell | null {
  const active =
    notebooks.activeCell ?? notebooks.currentWidget?.content.activeCell ?? null;
  if (active && captureActiveError(active)) {
    return active;
  }
  const currentWidget = notebooks.currentWidget;
  if (currentWidget) {
    const cells = currentWidget.content.widgets;
    for (let i = cells.length - 1; i >= 0; i--) {
      const cell = cells[i];
      if (cell && captureActiveError(cell)) {
        return cell;
      }
    }
  }
  return active;
}

function captureActiveError(cell: NotebookCell | null): CapturedError | null {
  if (!cell || !isCodeCellModel(cell.model)) {
    return null;
  }

  let errorOutput: IError | undefined;
  for (const output of cell.model.outputs.toJSON().reverse()) {
    if (isErrorOutput(output)) {
      errorOutput = output;
      break;
    }
  }
  if (!errorOutput) {
    return null;
  }

  const source = cell.model.toJSON().source;
  const code = Array.isArray(source) ? source.join('') : source;
  return {
    cell_id: cell.model.id.slice(0, 256),
    code: code.slice(0, MAX_CODE_LENGTH),
    error_type: errorOutput.ename.slice(0, 200),
    error_message: errorOutput.evalue.slice(0, 2_000),
    traceback: errorOutput.traceback.join('\n').slice(0, MAX_TRACEBACK_LENGTH)
  };
}

function getAdjacentNotebookCode(
  notebook: NonNullable<INotebookTracker['currentWidget']>,
  targetCell: NotebookCell
): string {
  const cells = notebook.content.widgets;
  const targetIndex = cells.indexOf(targetCell);
  if (targetIndex < 0) {
    return '';
  }

  return cells
    .slice(Math.max(0, targetIndex - 1), targetIndex + 2)
    .filter(cell => cell !== targetCell && isCodeCellModel(cell.model))
    .map(cell => {
      const source = cell.model.toJSON().source;
      return Array.isArray(source) ? source.join('') : source;
    })
    .join('\n')
    .slice(0, 12_000);
}

function isErrorOutput(output: IOutput): output is IError {
  return (
    output.output_type === 'error' &&
    'ename' in output &&
    typeof output.ename === 'string' &&
    'evalue' in output &&
    typeof output.evalue === 'string' &&
    'traceback' in output &&
    Array.isArray(output.traceback) &&
    output.traceback.every((line: unknown) => typeof line === 'string')
  );
}

function createStatusPill(label: string, tone: 'default' | 'success' | 'warn') {
  const pill = document.createElement('div');
  pill.className = `ml-assistant-status-pill ml-assistant-status-${tone}`;
  pill.textContent = label;
  return pill;
}

function renderAssistantResult(
  container: HTMLElement,
  payload: {
    errorType: string;
    errorMessage: string;
    traceback: string;
    summary: string;
    details: string[];
    fix: string;
  },
  fixActions?: FixActions,
  suggestImmediately = false
) {
  container.replaceChildren();

  const header = document.createElement('div');
  header.className = 'ml-assistant-result-header';

  const banner = document.createElement('div');
  banner.className = 'ml-assistant-error-banner';
  const errorIcon = document.createElement('span');
  errorIcon.className = 'ml-assistant-error-icon';
  errorIcon.setAttribute('aria-hidden', 'true');
  errorIcon.textContent = '!';
  const errorText = document.createElement('div');
  errorText.className = 'ml-assistant-error-copy';
  const errorTitle = document.createElement('div');
  errorTitle.className = 'ml-assistant-error-title';
  errorTitle.textContent = payload.errorType;
  const errorMessage = document.createElement('div');
  errorMessage.className = 'ml-assistant-error-message';
  errorMessage.textContent = payload.errorMessage;
  errorText.append(errorTitle, errorMessage);
  banner.append(errorIcon, errorText);

  const traceback = document.createElement('div');
  traceback.className = 'ml-assistant-traceback';
  const tracebackDetails = document.createElement('details');
  const tracebackSummary = document.createElement('summary');
  tracebackSummary.textContent = 'View traceback';
  const tracebackContent = document.createElement('pre');
  tracebackContent.textContent = payload.traceback;
  tracebackDetails.append(tracebackSummary, tracebackContent);
  traceback.append(tracebackDetails);

  const explanation = document.createElement('div');
  explanation.className = 'ml-assistant-card ml-assistant-card-blue';
  const explanationTitle = document.createElement('div');
  explanationTitle.className = 'ml-assistant-card-title';
  explanationTitle.textContent = 'Explanation';
  const explanationSummary = document.createElement('p');
  explanationSummary.textContent = payload.summary;
  const explanationDetails = document.createElement('ul');
  payload.details.forEach(detail => {
    const item = document.createElement('li');
    item.textContent = detail;
    explanationDetails.appendChild(item);
  });
  explanation.append(explanationTitle, explanationSummary, explanationDetails);

  const fixCard = document.createElement('div');
  fixCard.className = 'ml-assistant-card ml-assistant-card-green';
  const fixTitle = document.createElement('div');
  fixTitle.className = 'ml-assistant-card-title';
  fixTitle.textContent = 'Possible solution';
  const fixSummary = document.createElement('p');
  fixSummary.textContent = payload.fix;
  const fixCode = document.createElement('div');
  fixCode.className = 'ml-assistant-code-block';
  fixCode.textContent = 'Generate a suggestion to see corrected code here.';
  let currentFix: FixCandidate | null = null;
  fixCard.append(fixTitle, fixSummary, fixCode);

  const actions = document.createElement('div');
  actions.className = 'ml-assistant-actions';
  const suggestButton = document.createElement('button');
  suggestButton.type = 'button';
  suggestButton.textContent = 'Suggest Fix';
  suggestButton.disabled = !fixActions;
  const applyButton = document.createElement('button');
  applyButton.type = 'button';
  applyButton.textContent = 'Apply Fix';
  applyButton.disabled = !fixActions;
  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.textContent = 'Copy Code';
  copyButton.className = 'ml-assistant-secondary-button';

  const generateFix = async (): Promise<FixCandidate> => {
    if (!fixActions) {
      throw new Error('No fix action is available');
    }
    if (currentFix) {
      return currentFix;
    }
    suggestButton.disabled = true;
    applyButton.disabled = true;
    suggestButton.textContent = 'Generating...';
    try {
      currentFix = await fixActions.suggestFix();
      fixSummary.textContent =
        currentFix.provider === 'gemini'
          ? `Gemini suggestion: ${currentFix.summary}`
          : currentFix.summary;
      fixCode.textContent = currentFix.candidate_code;
      copyButton.disabled = false;
      return currentFix;
    } finally {
      suggestButton.textContent = 'Suggest Fix';
      suggestButton.disabled = false;
      applyButton.disabled = false;
    }
  };

  suggestButton.addEventListener('click', async () => {
    suggestButton.disabled = true;
    suggestButton.textContent = 'Generating...';
    try {
      await generateFix();
    } catch (error) {
      fixSummary.textContent =
        error instanceof Error ? error.message : 'Could not generate a fix';
    } finally {
      suggestButton.disabled = false;
      suggestButton.textContent = 'Suggest Fix';
    }
  });

  applyButton.addEventListener('click', async () => {
    if (!fixActions) {
      return;
    }
    applyButton.disabled = true;
    suggestButton.disabled = true;
    applyButton.textContent = currentFix ? 'Applying...' : 'Generating...';
    try {
      const fix = await generateFix();
      await fixActions.applyFix(fix);
      applyButton.textContent = 'Fixed and ran';
    } catch (error) {
      applyButton.textContent =
        error instanceof Error ? error.message : 'Could not apply fix';
    } finally {
      suggestButton.disabled = false;
    }
    window.setTimeout(() => {
      applyButton.textContent = 'Apply Fix';
      applyButton.disabled = false;
    }, 2500);
  });

  copyButton.addEventListener('click', async () => {
    if (!currentFix) {
      return;
    }
    try {
      await navigator.clipboard.writeText(currentFix.candidate_code);
      copyButton.textContent = 'Copied';
    } catch {
      copyButton.textContent = 'Copy failed';
    }

    window.setTimeout(() => {
      copyButton.textContent = 'Copy Code';
    }, 1200);
  });

  copyButton.disabled = true;
  suggestButton.classList.add('ml-assistant-action-wide');
  actions.append(suggestButton, applyButton, copyButton);

  header.append(banner, traceback);
  container.append(header, explanation, fixCard, actions);
  if (suggestImmediately && fixActions) {
    suggestButton.click();
  }
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: '@ml-platform/error-assistant:plugin',
  description: 'JupyterLab error assistant frontend and server extension',
  autoStart: true,
  requires: [IMainMenu, INotebookTracker, ITranslator, IDocumentManager],
  activate: (
    app: JupyterFrontEnd,
    mainMenu: IMainMenu,
    notebooks: INotebookTracker,
    translator: ITranslator,
    documentManager: IDocumentManager
  ) => {
    const trans = translator.load('@ml-platform/error-assistant');

    const panel = new Widget();
    panel.id = 'ml-platform-error-assistant-panel';
    panel.title.label = 'Error Assistant';
    panel.title.caption = 'Notebook error assistant';
    panel.addClass('ml-platform-error-assistant-panel');

    const shell = document.createElement('div');
    shell.className = 'ml-assistant-shell';

    const header = document.createElement('div');
    header.className = 'ml-assistant-header';
    const heading = document.createElement('h2');
    heading.textContent = 'AI Assistant';
    const controls = document.createElement('div');
    controls.className = 'ml-assistant-header-controls';
    const installButton = document.createElement('button');
    installButton.type = 'button';
    installButton.className = 'ml-assistant-primary-button';
    installButton.textContent = 'Install Ollama';
    installButton.disabled = true;
    const cloudOption = document.createElement('label');
    cloudOption.className = 'ml-assistant-cloud-option';
    cloudOption.title =
      'When enabled, the failed cell, traceback, and nearby code may be sent to Google Gemini, either directly or as a fallback.';
    const geminiFallbackToggle = document.createElement('input');
    geminiFallbackToggle.type = 'checkbox';
    geminiFallbackToggle.disabled = true;
    const cloudOptionText = document.createElement('span');
    cloudOptionText.textContent = 'Allow Gemini use';
    cloudOption.append(geminiFallbackToggle, cloudOptionText);

    const statusRow = document.createElement('div');
    statusRow.className = 'ml-assistant-status-row';
    const localStatus = createStatusPill('Ollama (Local AI)', 'success');
    const cloudStatus = createStatusPill('Cloud disabled', 'default');
    const providerRow = document.createElement('label');
    providerRow.className = 'ml-assistant-provider-row';
    providerRow.textContent = 'Fix provider';
    const providerSelect = document.createElement('select');
    providerSelect.className = 'ml-assistant-provider-select';
    const ollamaOption = document.createElement('option');
    ollamaOption.value = 'ollama';
    ollamaOption.textContent = 'Ollama (local)';
    const geminiOption = document.createElement('option');
    geminiOption.value = 'gemini';
    geminiOption.textContent = 'Gemini (cloud)';
    providerSelect.append(ollamaOption, geminiOption);
    providerRow.appendChild(providerSelect);

    const tabRow = document.createElement('div');
    tabRow.className = 'ml-assistant-tab-row';
    const tabs = ['Explain Error', 'Suggest Fix', 'Code Help', 'Ask AI'];
    const tabButtons = new Map<string, HTMLButtonElement>();
    tabs.forEach((tabText, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `ml-assistant-tab ${index === 0 ? 'active' : ''}`;
      btn.textContent = tabText;
      tabRow.appendChild(btn);
      tabButtons.set(tabText, btn);
    });

    // Error tracking
    let _lastCapturedError: CapturedError | null = null;

    const ctaWrap = document.createElement('div');
    ctaWrap.className = 'ml-assistant-cta-row';
    const captureButton = document.createElement('button');
    captureButton.type = 'button';
    captureButton.className = 'ml-assistant-cta-button';
    captureButton.textContent = 'Analyze Error';
    ctaWrap.appendChild(captureButton);

    const content = document.createElement('div');
    content.className = 'ml-assistant-content';

    const makePlaceholder = () => {
      const empty = document.createElement('div');
      empty.className = 'ml-assistant-empty';
      empty.textContent = 'Select a failed code cell to capture its error.';
      return empty;
    };

    let analysisMode: 'explain' | 'suggest' = 'explain';
    let ollamaConnected = false;

    content.appendChild(makePlaceholder());

    header.append(heading, controls);
    controls.append(installButton, cloudOption);
    statusRow.append(localStatus, cloudStatus);
    shell.append(header, statusRow, providerRow, tabRow, ctaWrap, content);
    panel.node.append(shell);

    const setStatus = async () => {
      try {
        const health = await requestAPI<{
          status: string;
          cloud_fallback: string;
          gemini_fallback_available: boolean;
        }>('api/health', app.serviceManager.serverSettings);
        localStatus.textContent =
          health.status === 'ok' ? 'Ollama (Local AI)' : 'Platform unavailable';
        localStatus.className =
          health.status === 'ok'
            ? 'ml-assistant-status-pill ml-assistant-status-success'
            : 'ml-assistant-status-pill ml-assistant-status-warn';
        geminiFallbackToggle.disabled = !health.gemini_fallback_available;
        geminiOption.disabled = !health.gemini_fallback_available;
        if (geminiOption.disabled && providerSelect.value === 'gemini') {
          providerSelect.value = 'ollama';
        }
        cloudStatus.textContent = health.gemini_fallback_available
          ? 'Gemini available (opt-in)'
          : health.cloud_fallback === 'enabled'
            ? 'Gemini API key missing'
            : 'Cloud disabled by server';
        cloudStatus.className = health.gemini_fallback_available
          ? 'ml-assistant-status-pill ml-assistant-status-success'
          : 'ml-assistant-status-pill ml-assistant-status-default';
      } catch {
        localStatus.textContent = 'Platform unavailable';
        localStatus.className =
          'ml-assistant-status-pill ml-assistant-status-warn';
        geminiFallbackToggle.disabled = true;
        cloudStatus.textContent = 'Cloud status unavailable';
        cloudStatus.className =
          'ml-assistant-status-pill ml-assistant-status-warn';
      }

      try {
        const ollama = await requestAPI<{
          status: string;
          version: string | null;
          model_status: 'available' | 'missing' | 'unavailable' | 'not_checked';
          model_id: string;
        }>('api/local-ai/status', app.serviceManager.serverSettings);
        if (
          ollama.status === 'connected' &&
          ollama.model_status === 'available'
        ) {
          ollamaConnected = true;
          localStatus.textContent = 'Ollama (Local AI)';
          localStatus.className =
            'ml-assistant-status-pill ml-assistant-status-success';
          installButton.textContent = 'Model ready';
          installButton.disabled = true;
        } else if (ollama.status === 'connected') {
          ollamaConnected = true;
          localStatus.textContent = 'Model missing';
          localStatus.className =
            'ml-assistant-status-pill ml-assistant-status-warn';
          installButton.textContent = 'Install recommended model';
          installButton.disabled = false;
        } else {
          ollamaConnected = false;
          localStatus.textContent = 'Ollama not detected';
          localStatus.className =
            'ml-assistant-status-pill ml-assistant-status-warn';
          installButton.textContent = 'Get Ollama';
          installButton.disabled = false;
        }
      } catch {
        ollamaConnected = false;
        localStatus.textContent = 'Local AI unavailable';
        localStatus.className =
          'ml-assistant-status-pill ml-assistant-status-warn';
        installButton.textContent = 'Get Ollama';
        installButton.disabled = false;
      }
    };

    captureButton.addEventListener('click', async () => {
      const targetCell = getTargetCell(notebooks);
      const notebookPanel = notebooks.currentWidget;
      const error = captureActiveError(targetCell);
      if (!error) {
        renderAssistantResult(content, {
          errorType: 'No error detected',
          errorMessage: 'The active code cell has no error output.',
          traceback: 'No traceback available.',
          summary: 'Select a cell that produced an actual runtime error.',
          details: ['The selected cell is not currently failing.'],
          fix: 'print("Select a failing cell and retry.")'
        });
        return;
      }

      content.innerHTML = '';
      captureButton.disabled = true;
      const loading = document.createElement('div');
      loading.className = 'ml-assistant-empty';
      loading.textContent = 'Capturing error...';
      content.appendChild(loading);

      // ── Also auto-trigger the Tutor for every error ──
      if (error) {
        _lastCapturedError = error;
        void loadTutorExplanation(
          {
            error_type: error.error_type,
            error_message: error.error_message,
            traceback: error.traceback,
            code: error.code,
          },
          app.serviceManager.serverSettings
        );
      }

      try {
        const result = await requestAPI<{
          status: string;
          analysis: {
            summary: string;
            details: string[];
            is_sufficient: boolean;
          };
        }>('api/error/analyze', app.serviceManager.serverSettings, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(error)
        });

        if (result.status !== 'analyzed') {
          throw new Error('analysis unavailable');
        }

        let explanationSummary = result.analysis.summary;
        let explanationDetails = result.analysis.details;
        const suggestFix = async (): Promise<FixCandidate> => {
          if (!targetCell || !notebookPanel) {
            throw new Error('Select a notebook cell first');
          }

          const suggestion = await requestAPI<{
            status: string;
            summary?: string;
            candidate_code?: string;
            model_id?: string;
            provider?: 'ollama' | 'gemini';
            message?: string;
          }>('api/ai/fix', app.serviceManager.serverSettings, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              error,
              notebook_context: getAdjacentNotebookCode(
                notebookPanel,
                targetCell
              ),
              provider: providerSelect.value,
              allow_gemini_fallback: geminiFallbackToggle.checked
            })
          });
          if (suggestion.status !== 'suggested' || !suggestion.candidate_code) {
            throw new Error(
              suggestion.message ||
                (suggestion.status === 'gemini_disabled'
                  ? 'Gemini fallback is disabled by server policy'
                  : suggestion.status === 'gemini_opt_in_required'
                    ? 'Check Allow Gemini use before selecting Gemini'
                    : suggestion.status === 'gemini_unconfigured'
                      ? 'Save a Gemini API key in JupyterLab using the API Key tab in the right sidebar'
                      : suggestion.status === 'gemini_unavailable'
                        ? 'Gemini is temporarily unavailable; try again later'
                        : suggestion.status === 'model_missing'
                          ? `Install ${suggestion.model_id || 'the local Ollama model'} first`
                          : suggestion.status === 'incomplete_model_response' ||
                              suggestion.status === 'incomplete_gemini_response'
                            ? 'The AI returned only part of the cell. Nothing was applied; try again or enable Gemini fallback.'
                            : 'Neither local Ollama nor the enabled Gemini fallback produced a valid fix')
            );
          }

          return {
            summary: suggestion.summary || 'A fix candidate is ready.',
            candidate_code: suggestion.candidate_code,
            provider: suggestion.provider || 'ollama'
          };
        };

        const applyFix = async (suggestion: FixCandidate): Promise<void> => {
          if (!targetCell || !notebookPanel) {
            throw new Error('Select a notebook cell first');
          }
          if (
            !applyFixToCellModel(targetCell.model, suggestion.candidate_code)
          ) {
            throw new Error('Could not update the failed cell');
          }

          const executed = await NotebookActions.runCells(
            notebookPanel.content,
            [targetCell],
            notebookPanel.sessionContext
          );
          if (!executed) {
            throw new Error('Fix applied; cell could not be run');
          }
          if (
            !isCodeCellModel(targetCell.model) ||
            targetCell.model.outputs.toJSON().some(isErrorOutput)
          ) {
            throw new Error('Fix applied, but the cell still reports an error');
          }
        };
        const fixActions = { suggestFix, applyFix };

        if (result.analysis.is_sufficient) {
          renderAssistantResult(
            content,
            {
              errorType: error.error_type,
              errorMessage: error.error_message,
              traceback: error.traceback,
              summary: explanationSummary,
              details: explanationDetails,
              fix: 'A corrected cell will be generated locally when you apply the fix.'
            },
            fixActions,
            analysisMode === 'suggest'
          );
          return;
        }

        const explanation = await requestAPI<{
          status: string;
          model_id?: string;
          explanation?: {
            summary: string;
            details: string[];
            confidence: string;
          };
        }>('api/ai/explain', app.serviceManager.serverSettings, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(error)
        });

        if (explanation.status === 'explained' && explanation.explanation) {
          explanationSummary = explanation.explanation.summary;
          explanationDetails = explanation.explanation.details;
        }

        renderAssistantResult(
          content,
          {
            errorType: error.error_type,
            errorMessage: error.error_message,
            traceback: error.traceback,
            summary: explanationSummary,
            details: explanationDetails,
            fix: 'A corrected cell will be generated locally when you apply the fix.'
          },
          fixActions,
          analysisMode === 'suggest'
        );
      } catch {
        renderAssistantResult(content, {
          errorType: 'Error analysis unavailable',
          errorMessage: 'The platform could not diagnose this error.',
          traceback: 'The backend returned no valid analysis.',
          summary: 'The local platform could not validate the notebook error.',
          details: ['Check the notebook output and retry the analysis.'],
          fix: 'print("Review the failing cell and confirm the variable or column exists.")'
        });
      } finally {
        captureButton.disabled = false;
      }
    });

    const showCodeHelp = (): void => {
      const targetCell = getTargetCell(notebooks);
      if (!targetCell || !isCodeCellModel(targetCell.model)) {
        const message = document.createElement('div');
        message.className = 'ml-assistant-empty';
        message.textContent =
          'Select a code cell to ask local Ollama about it.';
        content.replaceChildren(message);
        return;
      }

      const source = targetCell.model.toJSON().source;
      const code = (Array.isArray(source) ? source.join('') : source).slice(
        0,
        MAX_CODE_LENGTH
      );
      const notebookPanel = notebooks.currentWidget;
      const questionInput = document.createElement('textarea');
      questionInput.className = 'ml-assistant-question-input';
      questionInput.maxLength = 1_000;
      questionInput.value = 'Explain this cell and point out potential issues.';
      const questionLabel = document.createElement('label');
      questionLabel.className = 'ml-assistant-question-label';
      questionLabel.textContent = 'Ask a question about this cell';
      questionLabel.appendChild(questionInput);

      const askButton = document.createElement('button');
      askButton.type = 'button';
      askButton.className = 'ml-assistant-cta-button';
      askButton.textContent = 'Ask Local Ollama';
      const answer = document.createElement('div');
      answer.className = 'ml-assistant-code-help-answer';
      content.replaceChildren(questionLabel, askButton, answer);

      askButton.addEventListener('click', async () => {
        const question = questionInput.value.trim();
        if (!question) {
          answer.textContent = 'Enter a question about this code first.';
          return;
        }

        askButton.disabled = true;
        answer.textContent = 'Asking local Ollama...';
        try {
          const result = await requestAPI<{
            status: string;
            model_id?: string;
            explanation?: {
              summary: string;
              details: string[];
            };
          }>('api/ai/code-help', app.serviceManager.serverSettings, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code,
              question,
              notebook_context:
                notebookPanel && targetCell
                  ? getAdjacentNotebookCode(notebookPanel, targetCell)
                  : ''
            })
          });

          answer.replaceChildren();
          if (result.status !== 'explained' || !result.explanation) {
            answer.textContent =
              result.status === 'model_missing'
                ? `Install ${result.model_id || 'the local Ollama model'} first.`
                : 'Local Ollama could not answer this code question.';
            return;
          }

          const summary = document.createElement('p');
          summary.textContent = result.explanation.summary;
          const details = document.createElement('ul');
          result.explanation.details.forEach(detail => {
            const item = document.createElement('li');
            item.textContent = detail;
            details.appendChild(item);
          });
          answer.append(summary, details);
        } catch {
          answer.textContent = 'Local code help is unavailable right now.';
        } finally {
          askButton.disabled = false;
        }
      });
    };

    tabButtons.forEach((tabButton, tabText) => {
      tabButton.addEventListener('click', () => {
        tabButtons.forEach(button => button.classList.remove('active'));
        tabButton.classList.add('active');

        if (tabText === 'Code Help' || tabText === 'Ask AI') {
          analysisMode = 'explain';
          showCodeHelp();
          return;
        }
        analysisMode = tabText === 'Suggest Fix' ? 'suggest' : 'explain';
        void captureButton.click();
      });
    });

    installButton.addEventListener('click', async () => {
      if (!ollamaConnected) {
        window.open('https://ollama.com/download', '_blank', 'noopener,noreferrer');
        return;
      }

      installButton.disabled = true;
      try {
        const result = await requestAPI<{
          status: string;
          model_id?: string;
          message?: string;
        }>('api/local-ai/install', app.serviceManager.serverSettings, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ allow_download: true })
        });
        if (result.status === 'installed') {
          await setStatus();
          renderAssistantResult(content, {
            errorType: 'Model installed',
            errorMessage: result.message || 'Local model ready',
            traceback: 'Installation completed successfully.',
            summary:
              'The recommended local model is available for notebook error explanations.',
            details: ['The local Ollama path is now active.'],
            fix: 'print("Model ready. Re-run the failing cell to explain the error.")'
          });
          return;
        }
        renderAssistantResult(content, {
          errorType: 'Local model installation failed',
          errorMessage: result.message || 'The recommended Ollama model could not be installed.',
          traceback: 'No notebook code was sent to a cloud service.',
          summary: 'ModelMind could not finish downloading the local model.',
          details: [
            'Check that Ollama is running and that this computer has an internet connection.',
            'Retry after resolving the issue; the model is not installed until Ollama confirms it.'
          ],
          fix: 'Restart Ollama and retry the model installation.'
        });
      } catch (error) {
        renderAssistantResult(content, {
          errorType: 'Local model installation failed',
          errorMessage:
            error instanceof Error ? error.message : 'The local model request failed.',
          traceback: 'No notebook code was sent to a cloud service.',
          summary: 'ModelMind could not finish downloading the local model.',
          details: ['Check the local Jupyter server and Ollama status, then retry.'],
          fix: 'Restart the local ModelMind services and retry.'
        });
      } finally {
        await setStatus();
      }
    });

    app.shell.add(panel, 'right', { rank: 900 });

    // ── Redirect listener: switch to AI Assistant when requested by Tutor (<70% confidence) ──
    window.addEventListener('modelmind:open-ai-assistant', (e: any) => {
      app.shell.activateById(panel.id);
      const mode = e?.detail?.mode === 'suggest' ? 'Suggest Fix' : 'Explain Error';
      const targetTab = tabButtons.get(mode) || tabButtons.get('Explain Error');
      if (targetTab) {
        targetTab.click();
      } else {
        void captureButton.click();
      }
    });

    // ── Initialise the AI Debugger Tutor FAB (bottom-right slide panel) ──
    createTutorFAB(app.serviceManager.serverSettings);

    // ═══════════════════════════════════════════════════════════
    // RIGHT SIDEBAR — AI Chatbot Panel
    // ═══════════════════════════════════════════════════════════
    const chatbotWidget = new Widget();
    chatbotWidget.id = 'mm-ai-chatbot-panel';
    chatbotWidget.title.label = '💬 AI Chat';
    chatbotWidget.title.caption = 'AI Chatbot — powered by Ollama & Gemini';
    chatbotWidget.addClass('mm-chatbot-widget');

    // Context getters: provide live notebook context to chatbot
    const getActiveCodeForChat = (): string => {
      const cell = getTargetCell(notebooks);
      if (!cell || !isCodeCellModel(cell.model)) return '';
      const src = cell.model.toJSON().source;
      return (Array.isArray(src) ? src.join('') : src).slice(0, MAX_CODE_LENGTH);
    };

    const getActiveErrorForChat = () => {
      const cell = getTargetCell(notebooks);
      return captureActiveError(cell) || _lastCapturedError;
    };

    const runCodeTraceForChat = async (source: string): Promise<{
      events: CodeTraceEvent[];
      output: string;
      error?: string;
    }> => {
      const kernel = notebooks.currentWidget?.sessionContext.session?.kernel;
      if (!kernel || kernel.isDisposed) {
        throw new Error('Start a notebook kernel before capturing an execution trace.');
      }

      const marker = `__MODELMIND_TRACE_${Date.now()}__:`;
      const wrappedCode = `
import json as _mm_json
def _mm_trace_runner(_mm_source):
    import sys as _mm_sys
    import ast as _mm_ast
    _mm_tracked_names = {node.id for node in _mm_ast.walk(_mm_ast.parse(_mm_source)) if isinstance(node, _mm_ast.Name)}
    _mm_events = []
    _mm_filename = '<modelmind-execution-trace>'
    def _mm_trace(frame, event, arg):
        if frame.f_code.co_filename != _mm_filename:
            return None
        if event == 'line':
            if len(_mm_events) >= 1000:
                raise RuntimeError('Trace stopped after 1,000 Python line events.')
            _mm_variables = {}
            for _mm_name, _mm_value in frame.f_locals.items():
                if _mm_name not in _mm_tracked_names:
                    continue
                if isinstance(_mm_value, (str, int, float, bool, type(None))):
                    _mm_value_text = repr(_mm_value)
                elif isinstance(_mm_value, (list, tuple, dict)) and len(_mm_value) <= 8:
                    if all(isinstance(_mm_item, (str, int, float, bool, type(None))) for _mm_item in (_mm_value.values() if isinstance(_mm_value, dict) else _mm_value)):
                        _mm_value_text = repr(_mm_value)
                    else:
                        continue
                elif type(_mm_value).__module__.startswith('pandas') and hasattr(_mm_value, 'shape'):
                    _mm_value_text = '<' + type(_mm_value).__name__ + ' shape=' + str(_mm_value.shape) + '>'
                elif type(_mm_value).__module__.startswith('numpy') and hasattr(_mm_value, 'item'):
                    try:
                        _mm_value_text = repr(_mm_value.item())
                    except Exception:
                        continue
                else:
                    continue
                _mm_variables[_mm_name] = _mm_value_text[:100]
                if len(_mm_variables) >= 12:
                    break
            _mm_events.append({'line': frame.f_lineno, 'functionName': frame.f_code.co_name, 'variables': _mm_variables})
        return _mm_trace

    _mm_previous_trace = _mm_sys.gettrace()
    try:
        _mm_sys.settrace(_mm_trace)
        try:
            exec(compile(_mm_source, _mm_filename, 'exec'), get_ipython().user_ns, get_ipython().user_ns)
            return _mm_events, None
        except BaseException as _mm_exc:
            return _mm_events, type(_mm_exc).__name__ + ': ' + str(_mm_exc)
    finally:
        _mm_sys.settrace(_mm_previous_trace)

_mm_events, _mm_error = _mm_trace_runner(${JSON.stringify(source)})
print(${JSON.stringify(marker)} + _mm_json.dumps({'events': _mm_events, 'error': _mm_error}))
del _mm_events, _mm_error, _mm_trace_runner, _mm_json
`;
      let capturedOutput = '';
      const future = kernel.requestExecute({
        code: wrappedCode,
        silent: false,
        store_history: false,
        allow_stdin: false,
        stop_on_error: true
      });
      future.onIOPub = message => {
        if (message.header.msg_type === 'stream') {
          capturedOutput += (message.content as { text?: string }).text ?? '';
        }
      };
      await future.done;

      const markerIndex = capturedOutput.lastIndexOf(marker);
      if (markerIndex < 0) {
        throw new Error('The kernel did not return a trace. Check that it is responsive, then try again.');
      }
      const output = capturedOutput.slice(0, markerIndex).trim();
      const payload = JSON.parse(capturedOutput.slice(markerIndex + marker.length).trim()) as {
        events?: CodeTraceEvent[];
        error?: string | null;
      };
      return {
        events: Array.isArray(payload.events) ? payload.events : [],
        output,
        error: payload.error || undefined
      };
    };

    const loadDecisionTreesForChat = async (): Promise<DecisionTreeView[]> => {
      const kernel = notebooks.currentWidget?.sessionContext.session?.kernel;
      if (!kernel || kernel.isDisposed) {
        throw new Error('Start a notebook kernel and fit a decision tree before opening this view.');
      }
      const marker = `__MODELMIND_TREES_${Date.now()}__:`;
      const code = `
import json as _mm_json
def _mm_describe_tree(_mm_name, _mm_estimator, _mm_namespace):
    _mm_tree = _mm_estimator.tree_
    _mm_task = 'classification' if hasattr(_mm_estimator, 'classes_') else 'regression'
    _mm_class_values = getattr(_mm_estimator, 'classes_', [])
    if hasattr(_mm_class_values, 'tolist'):
        _mm_class_values = _mm_class_values.tolist()
    _mm_feature_names = getattr(_mm_estimator, 'feature_names_in_', [])
    if hasattr(_mm_feature_names, 'tolist'):
        _mm_feature_names = _mm_feature_names.tolist()
    if not _mm_feature_names:
        for _mm_data_name in ('X_train', 'X', 'features'):
            _mm_data = _mm_namespace.get(_mm_data_name)
            if hasattr(_mm_data, 'columns'):
                _mm_feature_names = [str(_mm_column) for _mm_column in _mm_data.columns]
                break
    _mm_depths = [0] * _mm_tree.node_count
    _mm_stack = [(0, 0)]
    while _mm_stack:
        _mm_index, _mm_depth = _mm_stack.pop()
        if _mm_index >= _mm_tree.node_count:
            continue
        _mm_depths[_mm_index] = _mm_depth
        _mm_left = int(_mm_tree.children_left[_mm_index])
        _mm_right = int(_mm_tree.children_right[_mm_index])
        if _mm_left != _mm_right:
            _mm_stack.append((_mm_right, _mm_depth + 1))
            _mm_stack.append((_mm_left, _mm_depth + 1))
    _mm_nodes = []
    for _mm_index in range(int(_mm_tree.node_count)):
        if _mm_depths[_mm_index] > 10:
            continue
        _mm_left = int(_mm_tree.children_left[_mm_index])
        _mm_right = int(_mm_tree.children_right[_mm_index])
        _mm_leaf = _mm_left == _mm_right
        _mm_feature_index = int(_mm_tree.feature[_mm_index])
        _mm_feature = str(_mm_feature_names[_mm_feature_index]) if 0 <= _mm_feature_index < len(_mm_feature_names) else 'feature_' + str(_mm_feature_index)
        _mm_values = _mm_tree.value[_mm_index][0].tolist()
        if _mm_task == 'classification' and _mm_values:
            _mm_prediction_index = max(range(len(_mm_values)), key=lambda _mm_i: _mm_values[_mm_i])
            _mm_prediction = str(_mm_class_values[_mm_prediction_index]) if _mm_prediction_index < len(_mm_class_values) else 'class ' + str(_mm_prediction_index)
        else:
            _mm_prediction = str(_mm_values[0]) if _mm_values else 'unknown'
        _mm_nodes.append({
            'id': _mm_index,
            'depth': _mm_depths[_mm_index],
            'left': None if _mm_leaf else _mm_left,
            'right': None if _mm_leaf else _mm_right,
            'feature': _mm_feature,
            'threshold': None if _mm_leaf else float(_mm_tree.threshold[_mm_index]),
            'samples': int(_mm_tree.n_node_samples[_mm_index]),
            'impurity': float(_mm_tree.impurity[_mm_index]),
            'prediction': _mm_prediction
        })
    return {
        'modelName': _mm_name,
        'task': _mm_task,
        'criterion': str(getattr(_mm_estimator, 'criterion', 'tree split')),
        'nodeCount': int(_mm_tree.node_count),
        'maxDepth': int(_mm_tree.max_depth),
        'nodes': _mm_nodes
    }

_mm_namespace = get_ipython().user_ns
_mm_trees = []
_mm_seen = set()
for _mm_name, _mm_object in list(_mm_namespace.items()):
    # IPython stores the previous cell result under _, __, and ___. These can
    # point at an older fitted tree and should not appear as named user models.
    if _mm_name.startswith('_') or _mm_name in ('In', 'Out'):
        continue
    _mm_candidates = [(_mm_name, _mm_object)]
    for _mm_step_name, _mm_step in getattr(_mm_object, 'steps', []) or []:
        _mm_candidates.append((_mm_name + '.' + str(_mm_step_name), _mm_step))
    for _mm_candidate_name, _mm_candidate in _mm_candidates:
        try:
            _mm_tree_id = id(_mm_candidate)
            if _mm_tree_id in _mm_seen or not hasattr(_mm_candidate, 'tree_'):
                continue
            _mm_seen.add(_mm_tree_id)
            _mm_trees.append(_mm_describe_tree(_mm_candidate_name, _mm_candidate, _mm_namespace))
        except Exception:
            continue
    if len(_mm_trees) >= 10:
        break
print(${JSON.stringify(marker)} + _mm_json.dumps(_mm_trees))
for _mm_cleanup_name in ('_mm_describe_tree', '_mm_namespace', '_mm_trees', '_mm_seen', '_mm_name', '_mm_object', '_mm_candidates', '_mm_candidate_name', '_mm_candidate', '_mm_step_name', '_mm_step', '_mm_tree_id', '_mm_json'):
    get_ipython().user_ns.pop(_mm_cleanup_name, None)
`;
      let capturedOutput = '';
      const future = kernel.requestExecute({ code, silent: false, store_history: false, allow_stdin: false, stop_on_error: true });
      future.onIOPub = message => {
        if (message.header.msg_type === 'stream') {
          capturedOutput += (message.content as { text?: string }).text ?? '';
        }
      };
      await future.done;
      const markerIndex = capturedOutput.lastIndexOf(marker);
      if (markerIndex < 0) {
        throw new Error('Could not read a fitted tree from the current kernel. Confirm the model was fitted with scikit-learn.');
      }
      return JSON.parse(capturedOutput.slice(markerIndex + marker.length).trim()) as DecisionTreeView[];
    };

    const loadNeuralNetworksForChat = async (): Promise<NeuralNetworkView[]> => {
      const kernel = notebooks.currentWidget?.sessionContext.session?.kernel;
      if (!kernel || kernel.isDisposed) {
        throw new Error('Start a notebook kernel and fit a neural network before opening this view.');
      }
      const marker = `__MODELMIND_NEURAL_NETWORKS_${Date.now()}__:`;
      const code = `
import json as _mm_json
def _mm_even_samples(_mm_size, _mm_limit=12):
    if _mm_size <= _mm_limit:
        return list(range(_mm_size))
    return sorted(set(round(_mm_i * (_mm_size - 1) / (_mm_limit - 1)) for _mm_i in range(_mm_limit)))
_mm_namespace = get_ipython().user_ns
_mm_networks = []
_mm_seen = set()
for _mm_name, _mm_object in list(_mm_namespace.items()):
    if _mm_name.startswith('_') or _mm_name in ('In', 'Out'):
        continue
    _mm_parent_features = getattr(_mm_object, 'feature_names_in_', [])
    if hasattr(_mm_parent_features, 'tolist'):
        _mm_parent_features = _mm_parent_features.tolist()
    _mm_candidates = [(_mm_name, _mm_object, _mm_parent_features)]
    for _mm_step_name, _mm_step in getattr(_mm_object, 'steps', []) or []:
        _mm_candidates.append((_mm_name + '.' + str(_mm_step_name), _mm_step, _mm_parent_features))
    for _mm_candidate_name, _mm_model, _mm_parent_feature_names in _mm_candidates:
        try:
            _mm_kind = type(_mm_model).__name__
            if _mm_kind not in ('MLPClassifier', 'MLPRegressor') or not hasattr(_mm_model, 'coefs_'):
                continue
            if id(_mm_model) in _mm_seen:
                continue
            _mm_seen.add(id(_mm_model))
            _mm_coefs = _mm_model.coefs_
            _mm_sizes = [int(_mm_coefs[0].shape[0])] + [int(_mm_matrix.shape[1]) for _mm_matrix in _mm_coefs]
            _mm_indices = [_mm_even_samples(_mm_size) for _mm_size in _mm_sizes]
            _mm_features = getattr(_mm_model, 'feature_names_in_', [])
            if hasattr(_mm_features, 'tolist'):
                _mm_features = _mm_features.tolist()
            if len(_mm_features) != _mm_sizes[0]:
                _mm_features = _mm_parent_feature_names
            if len(_mm_features) != _mm_sizes[0]:
                _mm_features = []
                for _mm_data_name in ('X_train_scaled', 'X_train', 'X', 'features'):
                    _mm_data = _mm_namespace.get(_mm_data_name)
                    if hasattr(_mm_data, 'columns') and len(_mm_data.columns) == _mm_sizes[0]:
                        _mm_features = [str(_mm_column) for _mm_column in _mm_data.columns]
                        break
            _mm_classes = getattr(_mm_model, 'classes_', [])
            if hasattr(_mm_classes, 'tolist'):
                _mm_classes = _mm_classes.tolist()
            _mm_layers = []
            for _mm_layer_index, _mm_size in enumerate(_mm_sizes):
                if _mm_layer_index == 0:
                    _mm_label = 'Input'
                elif _mm_layer_index == len(_mm_sizes) - 1:
                    _mm_label = 'Output'
                else:
                    _mm_label = 'Hidden ' + str(_mm_layer_index)
                _mm_nodes = []
                for _mm_node_index in _mm_indices[_mm_layer_index]:
                    _mm_node_label = 'unit ' + str(_mm_node_index)
                    if _mm_layer_index == 0 and len(_mm_features) == _mm_size:
                        _mm_node_label = str(_mm_features[_mm_node_index])
                    elif _mm_layer_index == len(_mm_sizes) - 1 and len(_mm_classes) == _mm_size:
                        _mm_node_label = str(_mm_classes[_mm_node_index])
                    _mm_nodes.append({'index': int(_mm_node_index), 'label': _mm_node_label})
                _mm_layers.append({'label': _mm_label, 'size': _mm_size, 'nodes': _mm_nodes})
            _mm_connections = []
            for _mm_layer_index, _mm_matrix in enumerate(_mm_coefs):
                for _mm_from_index in _mm_indices[_mm_layer_index]:
                    for _mm_to_index in _mm_indices[_mm_layer_index + 1]:
                        _mm_connections.append({
                            'fromLayer': _mm_layer_index,
                            'fromNode': int(_mm_from_index),
                            'toNode': int(_mm_to_index),
                            'weight': float(_mm_matrix[_mm_from_index, _mm_to_index])
                        })
            _mm_networks.append({
                'modelName': _mm_candidate_name,
                'modelType': _mm_kind,
                'task': 'classification' if _mm_kind == 'MLPClassifier' else 'regression',
                'activation': str(getattr(_mm_model, 'activation', 'unknown')),
                'outputActivation': str(getattr(_mm_model, 'out_activation_', 'unknown')),
                'loss': str(getattr(_mm_model, 'loss_', 'unknown')),
                'epochs': int(getattr(_mm_model, 'n_iter_', 0)),
                'layers': _mm_layers,
                'connections': _mm_connections,
                'classes': [str(_mm_class) for _mm_class in _mm_classes]
            })
        except Exception:
            continue
    if len(_mm_networks) >= 10:
        break
print(${JSON.stringify(marker)} + _mm_json.dumps(_mm_networks))
for _mm_cleanup_name in ('_mm_even_samples', '_mm_namespace', '_mm_networks', '_mm_seen', '_mm_name', '_mm_object', '_mm_parent_features', '_mm_candidates', '_mm_step_name', '_mm_step', '_mm_candidate_name', '_mm_model', '_mm_parent_feature_names', '_mm_kind', '_mm_coefs', '_mm_sizes', '_mm_indices', '_mm_features', '_mm_data_name', '_mm_data', '_mm_column', '_mm_classes', '_mm_layers', '_mm_layer_index', '_mm_size', '_mm_label', '_mm_nodes', '_mm_node_index', '_mm_node_label', '_mm_connections', '_mm_matrix', '_mm_from_index', '_mm_to_index', '_mm_json'):
    get_ipython().user_ns.pop(_mm_cleanup_name, None)
`;
      let capturedOutput = '';
      const future = kernel.requestExecute({ code, silent: false, store_history: false, allow_stdin: false, stop_on_error: true });
      future.onIOPub = message => {
        if (message.header.msg_type === 'stream') {
          capturedOutput += (message.content as { text?: string }).text ?? '';
        }
      };
      await future.done;
      const markerIndex = capturedOutput.lastIndexOf(marker);
      if (markerIndex < 0) {
        throw new Error('Could not inspect fitted neural networks. Fit a scikit-learn MLPClassifier or MLPRegressor first.');
      }
      return JSON.parse(capturedOutput.slice(markerIndex + marker.length).trim()) as NeuralNetworkView[];
    };

    const loadTrainingSourcesForChat = async (): Promise<TrainingSource[]> => {
      const kernel = notebooks.currentWidget?.sessionContext.session?.kernel;
      if (!kernel || kernel.isDisposed) {
        throw new Error('Start a notebook kernel and define feature and target variables before training.');
      }
      const marker = `__MODELMIND_TRAINING_SOURCES_${Date.now()}__:`;
      const code = `
import json as _mm_json
from sklearn.utils.multiclass import type_of_target as _mm_type_of_target
_mm_ns = get_ipython().user_ns
_mm_pairs = [
    ('X_train', 'y_train', 'X_test', 'y_test'),
    ('X_train_scaled', 'y_train', 'X_test_scaled', 'y_test'),
    ('X', 'y', None, None),
    ('features', 'target', None, None)
]
_mm_sources = []
_mm_seen = set()
for _mm_x_name, _mm_y_name, _mm_x_test_name, _mm_y_test_name in _mm_pairs:
    _mm_key = (_mm_x_name, _mm_y_name)
    if _mm_key in _mm_seen:
        continue
    _mm_seen.add(_mm_key)
    _mm_x = _mm_ns.get(_mm_x_name)
    _mm_y = _mm_ns.get(_mm_y_name)
    if _mm_x is None or _mm_y is None:
        continue
    try:
        _mm_rows = len(_mm_x)
        _mm_features = int(_mm_x.shape[1])
        if _mm_rows < 5 or _mm_features < 1 or len(_mm_y) != _mm_rows:
            continue
        _mm_target_kind = _mm_type_of_target(_mm_y)
        if _mm_target_kind in ('binary', 'multiclass'):
            _mm_task = 'classification'
        elif _mm_target_kind in ('continuous', 'continuous-multioutput'):
            _mm_task = 'regression'
        else:
            continue
        _mm_has_test = bool(_mm_x_test_name and _mm_y_test_name and _mm_ns.get(_mm_x_test_name) is not None and _mm_ns.get(_mm_y_test_name) is not None)
        _mm_sources.append({
            'id': _mm_x_name + '|' + _mm_y_name,
            'featuresName': _mm_x_name,
            'targetName': _mm_y_name,
            'testFeaturesName': _mm_x_test_name if _mm_has_test else None,
            'testTargetName': _mm_y_test_name if _mm_has_test else None,
            'rows': _mm_rows,
            'featureCount': _mm_features,
            'task': _mm_task
        })
    except Exception:
        continue
print(${JSON.stringify(marker)} + _mm_json.dumps(_mm_sources))
for _mm_cleanup in ('_mm_type_of_target', '_mm_ns', '_mm_pairs', '_mm_sources', '_mm_seen', '_mm_x_name', '_mm_y_name', '_mm_x_test_name', '_mm_y_test_name', '_mm_key', '_mm_x', '_mm_y', '_mm_rows', '_mm_features', '_mm_target_kind', '_mm_task', '_mm_has_test', '_mm_json'):
    get_ipython().user_ns.pop(_mm_cleanup, None)
`;
      let capturedOutput = '';
      const future = kernel.requestExecute({ code, silent: false, store_history: false, allow_stdin: false, stop_on_error: true });
      future.onIOPub = message => {
        if (message.header.msg_type === 'stream') capturedOutput += (message.content as { text?: string }).text ?? '';
      };
      await future.done;
      const markerIndex = capturedOutput.lastIndexOf(marker);
      if (markerIndex < 0) throw new Error('Could not inspect feature/target variables in the current kernel.');
      return JSON.parse(capturedOutput.slice(markerIndex + marker.length).trim()) as TrainingSource[];
    };

    const trainModelInNotebook = async (sourceId: string, modelType: string): Promise<TrainingResult> => {
      const kernel = notebooks.currentWidget?.sessionContext.session?.kernel;
      if (!kernel || kernel.isDisposed) throw new Error('Start a notebook kernel before training a model.');
      const [featuresName, targetName] = sourceId.split('|');
      if (!featuresName || !targetName) throw new Error('Choose a valid feature and target pair.');
      if (!['decision_tree', 'random_forest', 'neural_network'].includes(modelType)) throw new Error('Choose a supported model type.');
      const marker = `__MODELMIND_TRAINED_MODEL_${Date.now()}__:`;
      const params = JSON.stringify({ featuresName, targetName, modelType });
      const code = `
import json as _mm_json
import numpy as _mm_np
from sklearn.model_selection import train_test_split as _mm_train_test_split
from sklearn.utils.multiclass import type_of_target as _mm_type_of_target
from sklearn.metrics import accuracy_score as _mm_accuracy, f1_score as _mm_f1, mean_absolute_error as _mm_mae, mean_squared_error as _mm_mse, r2_score as _mm_r2
from sklearn.tree import DecisionTreeClassifier as _mm_DTC, DecisionTreeRegressor as _mm_DTR
from sklearn.ensemble import RandomForestClassifier as _mm_RFC, RandomForestRegressor as _mm_RFR
from sklearn.neural_network import MLPClassifier as _mm_MLPC, MLPRegressor as _mm_MLPR
from sklearn.pipeline import make_pipeline as _mm_make_pipeline
from sklearn.preprocessing import StandardScaler as _mm_StandardScaler
_mm_args = _mm_json.loads(${JSON.stringify(params)})
_mm_ns = get_ipython().user_ns
_mm_X = _mm_ns.get(_mm_args['featuresName'])
_mm_y = _mm_ns.get(_mm_args['targetName'])
if _mm_X is None or _mm_y is None:
    raise ValueError('The selected feature/target variables are no longer available. Run their notebook cells again.')
if len(_mm_X) != len(_mm_y):
    raise ValueError('Features and target have different row counts.')
if hasattr(_mm_X, 'select_dtypes'):
    _mm_bad = list(_mm_X.select_dtypes(include=['object', 'string', 'category']).columns)
    if _mm_bad:
        raise ValueError('Encode categorical feature columns first (for example, with pd.get_dummies(X)).')
elif getattr(_mm_X, 'dtype', None) is not None and _mm_X.dtype.kind not in 'biufc':
    raise ValueError('Encode categorical feature columns first (for example, with pd.get_dummies(X)).')
_mm_target_kind = _mm_type_of_target(_mm_y)
if _mm_target_kind in ('binary', 'multiclass'):
    _mm_task = 'classification'
elif _mm_target_kind in ('continuous', 'continuous-multioutput'):
    _mm_task = 'regression'
else:
    raise ValueError('This target type is not supported. Use a one-dimensional classification or regression target.')
_mm_X_test = None
_mm_y_test = None
_mm_test_x_name = _mm_args['featuresName'].replace('X_train_scaled', 'X_test_scaled').replace('X_train', 'X_test')
_mm_test_y_name = _mm_args['targetName'].replace('y_train', 'y_test')
if _mm_args['featuresName'] in ('X_train', 'X_train_scaled') and _mm_test_x_name != _mm_args['featuresName']:
    _mm_X_test = _mm_ns.get(_mm_test_x_name)
    _mm_y_test = _mm_ns.get(_mm_test_y_name)
if _mm_X_test is not None and _mm_y_test is not None:
    _mm_X_train, _mm_y_train = _mm_X, _mm_y
    if len(_mm_X_test) != len(_mm_y_test):
        raise ValueError('The existing test features and target have different row counts.')
else:
    _mm_stratify = None
    if _mm_task == 'classification':
        _mm_values, _mm_counts = _mm_np.unique(_mm_y, return_counts=True)
        if len(_mm_counts) > 1 and _mm_counts.min() >= 2:
            _mm_stratify = _mm_y
    _mm_X_train, _mm_X_test, _mm_y_train, _mm_y_test = _mm_train_test_split(
        _mm_X, _mm_y, test_size=0.2, random_state=42, stratify=_mm_stratify
    )
_mm_type = _mm_args['modelType']
if _mm_task == 'classification':
    if _mm_type == 'decision_tree': _mm_estimator = _mm_DTC(max_depth=6, random_state=42)
    elif _mm_type == 'random_forest': _mm_estimator = _mm_RFC(n_estimators=150, random_state=42, n_jobs=-1)
    else: _mm_estimator = _mm_make_pipeline(_mm_StandardScaler(with_mean=False), _mm_MLPC(hidden_layer_sizes=(32, 16), max_iter=500, random_state=42))
else:
    if _mm_type == 'decision_tree': _mm_estimator = _mm_DTR(max_depth=6, random_state=42)
    elif _mm_type == 'random_forest': _mm_estimator = _mm_RFR(n_estimators=150, random_state=42, n_jobs=-1)
    else: _mm_estimator = _mm_make_pipeline(_mm_StandardScaler(with_mean=False), _mm_MLPR(hidden_layer_sizes=(32, 16), max_iter=500, random_state=42))
_mm_estimator.fit(_mm_X_train, _mm_y_train)
_mm_prediction = _mm_estimator.predict(_mm_X_test)
if _mm_task == 'classification':
    _mm_primary = float(_mm_accuracy(_mm_y_test, _mm_prediction))
    _mm_metric = 'Accuracy'
    _mm_secondary = [{'label': 'Macro F1', 'value': float(_mm_f1(_mm_y_test, _mm_prediction, average='macro', zero_division=0))}]
else:
    _mm_primary = float(_mm_r2(_mm_y_test, _mm_prediction))
    _mm_metric = 'R²'
    _mm_secondary = [
        {'label': 'MAE', 'value': float(_mm_mae(_mm_y_test, _mm_prediction))},
        {'label': 'RMSE', 'value': float(_mm_np.sqrt(_mm_mse(_mm_y_test, _mm_prediction)))}
    ]
_mm_ns['modelmind_trained_model'] = _mm_estimator
_mm_result = {
    'modelName': 'modelmind_trained_model',
    'modelType': _mm_type.replace('_', ' ').title(),
    'task': _mm_task,
    'trainRows': int(len(_mm_X_train)),
    'testRows': int(len(_mm_X_test)),
    'featureCount': int(_mm_X.shape[1]),
    'primaryMetric': _mm_metric,
    'primaryScore': _mm_primary,
    'secondaryMetrics': _mm_secondary
}
print(${JSON.stringify(marker)} + _mm_json.dumps(_mm_result))
for _mm_cleanup in ('_mm_args', '_mm_ns', '_mm_X', '_mm_y', '_mm_bad', '_mm_target_kind', '_mm_task', '_mm_X_test', '_mm_y_test', '_mm_test_x_name', '_mm_test_y_name', '_mm_stratify', '_mm_values', '_mm_counts', '_mm_X_train', '_mm_y_train', '_mm_type', '_mm_estimator', '_mm_prediction', '_mm_primary', '_mm_metric', '_mm_secondary', '_mm_result', '_mm_json', '_mm_np', '_mm_train_test_split', '_mm_type_of_target', '_mm_accuracy', '_mm_f1', '_mm_mae', '_mm_mse', '_mm_r2', '_mm_DTC', '_mm_DTR', '_mm_RFC', '_mm_RFR', '_mm_MLPC', '_mm_MLPR', '_mm_make_pipeline', '_mm_StandardScaler'):
    get_ipython().user_ns.pop(_mm_cleanup, None)
`;
      let capturedOutput = '';
      let executionError = '';
      const future = kernel.requestExecute({ code, silent: false, store_history: false, allow_stdin: false, stop_on_error: true });
      future.onIOPub = message => {
        if (message.header.msg_type === 'stream') capturedOutput += (message.content as { text?: string }).text ?? '';
        if (message.header.msg_type === 'error') executionError = (message.content as { evalue?: string }).evalue ?? 'Python training failed.';
      };
      await future.done;
      const markerIndex = capturedOutput.lastIndexOf(marker);
      if (markerIndex < 0) throw new Error(executionError || 'Python training did not return evaluation results.');
      // The kernel can emit a warning or other stream text after our result marker.
      // The trainer serializes its payload as one compact JSON line, so parse that line only.
      const payloadLine = capturedOutput.slice(markerIndex + marker.length).replace(/^\s+/, '').split(/\r?\n/, 1)[0];
      return JSON.parse(payloadLine) as TrainingResult;
    };

    const chatbotRoot = createAIChatbotPanel(
      app.serviceManager.serverSettings,
      getActiveCodeForChat,
      getActiveErrorForChat,
      runCodeTraceForChat,
      loadDecisionTreesForChat,
      loadNeuralNetworksForChat,
      loadTrainingSourcesForChat,
      trainModelInNotebook
    );
    chatbotWidget.node.style.cssText = 'height:100%;overflow:hidden;';
    chatbotWidget.node.appendChild(chatbotRoot);
    app.shell.add(chatbotWidget, 'right', { rank: 800 });

    // ═══════════════════════════════════════════════════════════
    // AUTO-TRIGGER: Fire the Tutor immediately when any cell fails
    // No click required — the moment a cell produces an error,
    // the Tutor panel opens and explains it automatically.
    // ═══════════════════════════════════════════════════════════
    NotebookActions.executed.connect((_, args) => {
      const { cell, success } = args;
      if (success) return; // only handle failures

      setTimeout(() => {
        const error = captureActiveError(cell as NotebookCell);
        if (error) {
          _lastCapturedError = error;
          void loadTutorExplanation(
            {
              error_type: error.error_type,
              error_message: error.error_message,
              traceback: error.traceback,
              code: error.code,
            },
            app.serviceManager.serverSettings
          );
        }
      }, 75);
    });

    // ═══════════════════════════════════════════════════════════
    // LEFT SIDEBAR — Unified ModelMind Studio Panel (Single Slide Bar)
    // ═══════════════════════════════════════════════════════════
    const studioWidget = createModelMindStudioWidget(app, notebooks);
    app.shell.add(studioWidget, 'left', { rank: 300 });

    const apiKeyWidget = createAPIKeySettingsWidget(
      app.serviceManager.serverSettings,
      trans
    );
    apiKeyWidget.title.label = '🔑 API Key';
    apiKeyWidget.title.caption = trans.__(
      'Save Gemini credentials in this computer’s credential store'
    );
    app.shell.add(apiKeyWidget, 'right', { rank: 700 });

    const STUDIO_COMMAND = 'modelmind:open-studio';
    app.commands.addCommand(STUDIO_COMMAND, {
      label: 'Open ModelMind Studio',
      caption: 'Open the unified ModelMind ML Studio slide bar in the left panel',
      execute: () => {
        app.shell.activateById(studioWidget.id);
      }
    });
    mainMenu.viewMenu.addGroup([{ command: STUDIO_COMMAND }], 899);

    const createNotebook = async (
      role: ModelMindNotebookRole
    ): Promise<void> => {
      const notebook = await documentManager.newUntitled({
        type: 'notebook'
      });
      const widget = documentManager.open(notebook.path);
      if (!widget) {
        throw new Error(`Could not open the new ${role} notebook.`);
      }
      if (!(widget instanceof NotebookPanel)) {
        throw new Error(`The new ${role} document is not a notebook.`);
      }
      await widget.context.ready;
      widget.context.model.setMetadata(MODEL_MIND_NOTEBOOK_TYPE, role);
      studioWidget.refreshNotebookMode();
    };

    const MODEL_MIND_NOTEBOOK_COMMAND = 'modelmind:create-modelmind-notebook';
    app.commands.addCommand(MODEL_MIND_NOTEBOOK_COMMAND, {
      label: 'ModelMind Notebook',
      execute: () => createNotebook('modelmind')
    });

    const TRAINER_NOTEBOOK_COMMAND = 'modelmind:create-trainer-notebook';
    app.commands.addCommand(TRAINER_NOTEBOOK_COMMAND, {
      label: 'Trainer Notebook',
      execute: () => createNotebook('trainer')
    });

    mainMenu.fileMenu.newMenu.addGroup(
      [
        { command: MODEL_MIND_NOTEBOOK_COMMAND },
        { command: TRAINER_NOTEBOOK_COMMAND }
      ],
      899
    );

    // ─── Inject CSS for all left panels ───
    if (!document.getElementById('mm-left-panel-styles')) {
      const s = document.createElement('style');
      s.id = 'mm-left-panel-styles';
      s.textContent = `
        /* Sidebar icon SVG stubs */
        .mm-sidebar-icon { background-size: 16px; background-repeat: no-repeat; background-position: center; }
        .mm-icon-xray::before  { content: '🔬'; font-size:16px; }
        .mm-icon-prep::before  { content: '🧠'; font-size:16px; }
        .mm-icon-lab::before   { content: '⚗️'; font-size:16px; }

        .mm-left-panel { overflow: hidden; }
        .mm-left-panel-root {
          height: 100%; overflow-y: auto; padding: 0;
          background: #0f172a; color: #e2e8f0;
          font-family: 'Segoe UI', system-ui, sans-serif;
          display: flex; flex-direction: column;
        }

        .mm-left-panel-header {
          padding: 14px 14px 10px;
          background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
          border-bottom: 1px solid rgba(167,139,250,.2);
          flex-shrink: 0;
        }
        .mm-left-panel-title {
          font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 6px;
          background: linear-gradient(90deg, #a78bfa, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .mm-left-panel-sub { font-size: 10px; opacity: .5; margin-top: 3px; }

        .mm-left-panel-input-wrap {
          padding: 10px 12px 6px; display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;
        }
        .mm-left-panel-input {
          background: #1e293b; border: 1px solid rgba(255,255,255,.12);
          color: #e2e8f0; padding: 7px 10px; border-radius: 7px; font-size: 11px;
          outline: none; width: 100%;
        }
        .mm-left-panel-input:focus { border-color: #a78bfa; }
        .mm-left-panel-note {
          padding: 0 12px 6px; font-size: 10px; opacity: .4; flex-shrink: 0;
        }
        .mm-left-panel-btn {
          padding: 8px 14px; border-radius: 7px; border: none; cursor: pointer;
          font-size: 12px; font-weight: 700; width: 100%; transition: all .15s;
        }
        .mm-btn-primary { background: linear-gradient(135deg,#7c3aed,#4f46e5); color:#fff; }
        .mm-btn-primary:hover { opacity:.85; transform:translateY(-1px); }

        .mm-left-level-row {
          display: flex; gap: 5px; padding: 4px 12px 8px; flex-shrink: 0;
        }
        .mm-level-btn {
          flex: 1; padding: 4px 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,.12);
          background: transparent; color: #94a3b8; font-size: 10px; cursor: pointer;
          transition: all .15s;
        }
        .mm-level-btn.active {
          border-color: #a78bfa; background: rgba(167,139,250,.18); color: #a78bfa; font-weight: 700;
        }

        .mm-left-panel-content {
          flex: 1; overflow-y: auto; padding: 8px 10px;
        }
        .mm-left-empty {
          text-align: center; opacity: .45; font-size: 12px; padding: 20px 0;
        }

        /* Model Lab cards */
        .mm-model-card {
          margin: 8px 10px; border: 1px solid rgba(255,255,255,.08);
          border-radius: 10px; padding: 12px;
          background: rgba(255,255,255,.03); transition: all .2s;
        }
        .mm-model-card:not(.mm-model-soon):hover {
          border-color: rgba(167,139,250,.4); background: rgba(167,139,250,.07);
        }
        .mm-model-soon { opacity: .45; }
        .mm-model-card-top {
          display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px;
        }
        .mm-model-icon { font-size: 18px; }
        .mm-model-name { font-size: 12px; font-weight: 700; }
        .mm-model-cat { font-size: 9px; opacity: .5; letter-spacing:.5px; margin-top: 2px; }
        .mm-model-desc { font-size: 11px; opacity: .65; line-height: 1.4; }
        .mm-soon-tag {
          display: inline-block; font-size: 8px; padding: 1px 5px; border-radius: 99px;
          background: rgba(100,116,139,.2); color: #94a3b8; vertical-align: middle; margin-left: 4px;
        }
      `;
      document.head.appendChild(s);
    }

    app.commands.addCommand(COMMAND_ID, {
      label: 'Open Error Assistant',
      execute: () => {
        app.shell.activateById(panel.id);
        void setStatus();
      }
    });
    const helpMenu = mainMenu.helpMenu as unknown as Widget;
    mainMenu.viewMenu.addGroup([{ command: COMMAND_ID }], 900);
    helpMenu.hide();
    void setStatus();

    // ── Setup Left Sidebar Section Names for the 5 tabs ──
    setupLeftSidebarSectionLabels();
  }
};

/**
 * Enhances the JupyterLab left activity bar tabs with clear, readable section names
 * so new users immediately know where to upload datasets, find ML Studio, etc.
 */
function setupLeftSidebarSectionLabels(): void {
  const SECTIONS: {
    match: (id: string, title: string) => boolean;
    shortName: string;
    fullName: string;
    description: string;
  }[] = [
    {
      match: (id, title) => id === 'filebrowser' || title.toLowerCase().includes('file browser'),
      shortName: 'Upload / Files',
      fullName: 'Upload Dataset & Files',
      description: 'Upload CSV, Excel datasets & manage notebook files'
    },
    {
      match: (id, title) => id === 'jp-running-sessions' || title.toLowerCase().includes('running'),
      shortName: 'Running',
      fullName: 'Active Kernels & Sessions',
      description: 'Monitor active kernels, terminals & running sessions'
    },
    {
      match: (id, title) => id.includes('modelmind') || title.toLowerCase().includes('modelmind'),
      shortName: 'ML Studio',
      fullName: 'ModelMind ML Studio & Preprocessing',
      description: 'Dataset Intelligence, Preprocessing Advisor & Model Selection'
    },
    {
      match: (id, title) => id.includes('api-key') || title.toLowerCase().includes('api key'),
      shortName: 'API Key',
      fullName: 'ModelMind API Key Settings',
      description: 'Store Gemini credentials in the computer’s credential store'
    },
    {
      match: (id, title) => id === 'table-of-contents' || title.toLowerCase().includes('table of contents') || title.toLowerCase().includes('outline'),
      shortName: 'Outline',
      fullName: 'Notebook Outline',
      description: 'Table of contents, markdown headers & notebook outline'
    },
    {
      match: (id, title) => id.includes('extension') || title.toLowerCase().includes('extension'),
      shortName: 'Extensions',
      fullName: 'Extensions & Tools',
      description: 'Manage JupyterLab extensions and platform plugins'
    }
  ];

  let isUpdating = false;

  const updateTabs = () => {
    if (isUpdating) return;
    isUpdating = true;

    try {
      const tabs = document.querySelectorAll<HTMLElement>(
        '.jp-SideBar.jp-mod-left .lm-TabBar-tab'
      );
      if (!tabs || tabs.length === 0) return;

      tabs.forEach(tab => {
        const dataId = tab.getAttribute('data-id') || '';
        const tabTitle = tab.getAttribute('title') || '';

        const matched = SECTIONS.find(s => s.match(dataId, tabTitle));
        if (!matched) return;

        // Set informative title attribute only once
        const expectedTitle = `${matched.fullName} — ${matched.description}`;
        if (tab.title !== expectedTitle) {
          tab.title = expectedTitle;
        }

        // Check or create our custom label element
        let labelEl = tab.querySelector<HTMLElement>('.mm-sidebar-tab-label');
        if (!labelEl) {
          labelEl = document.createElement('div');
          labelEl.className = 'mm-sidebar-tab-label';
          tab.appendChild(labelEl);
        }
        if (labelEl.textContent !== matched.shortName) {
          labelEl.textContent = matched.shortName;
        }

        // Hide default rotated label if present
        const luminoLabel = tab.querySelector<HTMLElement>('.lm-TabBar-tabLabel');
        if (luminoLabel && luminoLabel.style.display !== 'none') {
          luminoLabel.style.display = 'none';
        }
      });
    } finally {
      isUpdating = false;
    }
  };

  // Run on startup and staggered intervals
  updateTabs();
  const intervals = [100, 300, 700, 1500, 3000, 5000];
  intervals.forEach(ms => setTimeout(updateTabs, ms));

  // Observe ONLY direct child additions on the tab bar content list (NO attributes, NO subtree)
  const tabContentList = document.querySelector('.jp-SideBar.jp-mod-left .lm-TabBar-content');
  if (tabContentList) {
    const observer = new MutationObserver(() => updateTabs());
    observer.observe(tabContentList, { childList: true });
  } else {
    setTimeout(() => {
      const lateList = document.querySelector('.jp-SideBar.jp-mod-left .lm-TabBar-content');
      if (lateList) {
        const observer = new MutationObserver(() => updateTabs());
        observer.observe(lateList, { childList: true });
      }
    }, 1000);
  }
}

export default plugin;
