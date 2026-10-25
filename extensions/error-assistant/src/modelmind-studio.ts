/**
 * ModelMind Studio — Unified Left Sidebar Panel
 *
 * Combines all ModelMind ML Intelligence features into a single slide bar:
 *  1. 🔬 Dataset X-Ray (Overview, Health, Preview, Column Stats)
 *  2. 🎯 Target Analyzer (ML Task Detection, Class Balance, Regression Stats)
 *  3. 📊 Feature Analyzer (Distribution Plots, Cardinality, Stats)
 *  4. 🧠 Smart Preprocessing Adviser 2.0 (Recommendations, Live Preview, Apply & Undo, Code Gen)
 *  5. ⚗️ Model Visualization Lab (Interactive Gradient Descent, Decision Tree, KNN, K-Means, PCA)
 *  6. 📖 Preprocessing & ML Guide (Educational Best Practices)
 */

import { Widget } from '@lumino/widgets';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { isCodeCellModel } from '@jupyterlab/cells';
import { requestAPI } from './request';
import {
  canUseNotebookCodeAction,
  getModelMindNotebookRole
} from './notebook-mode';
import type { NotebookCodeAction } from './notebook-mode';
import {
  IAdvisorModelCode,
  applyTunedModelCode,
  removeModelAdvisorRaiseGuards,
  resetTunedModelCode
} from './model-code-utils';
import {
  buildDatasetLoadingCode,
  buildFullPreprocessingCode
} from './preprocessing-code-utils';
import { buildMeasuredModelExplanation } from './model-advisor-explanations';
import { explainTuningParameter } from './tuning-explanations';

export interface DatasetSummary {
  supported: boolean;
  message?: string;
  filename?: string;
  rows?: number;
  columns?: number;
  column_names?: string[];
  numeric_columns?: string[];
  categorical_columns?: string[];
  missing_values?: Record<string, number>;
  total_missing_values?: number;
  duplicate_rows?: number;
  likely_id_columns?: string[];
  dtypes?: Record<string, string>;
  preview?: Record<string, unknown>[];
  column_stats?: Array<{
    name: string;
    dtype: string;
    is_numeric: boolean;
    missing_count: number;
    missing_pct: number;
    unique_count: number;
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    std?: number;
    skewness?: number;
  }>;
}

export interface TargetAnalysisResult {
  target_column?: string;
  target?: string;
  task_type?: string;
  task?: string;
  total_rows?: number;
  missing_count?: number;
  missing_percentage?: number;
  unique_count?: number;
  dtype?: string;
  is_numeric?: boolean;
  class_counts?: Record<string, number>;
  class_percentages?: Record<string, number>;
  imbalance_ratio?: number;
  is_imbalanced?: boolean;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
  skewness?: number;
  outlier_count?: number;
  recommendations?: string[];
  target_warnings?: string[];
}

export interface FeatureAnalysisResult {
  feature?: string;
  feature_column?: string;
  type?: 'numerical' | 'categorical';
  feature_type?: 'numerical' | 'categorical';
  total_rows?: number;
  non_null_count?: number;
  missing_count?: number;
  missing_percentage?: number;
  unique_count?: number;
  numeric_kind?: 'continuous' | 'discrete' | 'unknown';
  distribution_shape?: string;
  dtype?: string;
  is_numeric?: boolean;
  mean?: number;
  median?: number;
  std?: number;
  standard_deviation?: number;
  min?: number;
  max?: number;
  minimum?: number;
  maximum?: number;
  q1?: number;
  q3?: number;
  q25?: number;
  q75?: number;
  iqr?: number;
  skewness?: number;
  outlier_count?: number;
  outlier_percentage?: number;
  histogram?: Array<{ bin_start: number; bin_end: number; count: number }>;
  histogram_counts?: number[];
  histogram_edges?: number[];
  value_counts?: Record<string, number>;
  category_distribution?: Array<{ value: string; count: number; percentage: number }>;
  correlations?: Record<string, number>;
  imputation_strategy?: string;
  imputation_reason?: string;
  scaling_strategy?: string;
  scaling_reason?: string;
}

export interface PreprocessingRec {
  feature: string;
  feature_type: 'numerical' | 'categorical';
  missing_count: number;
  missing_pct: number;
  missing_severity: 'none' | 'low' | 'moderate' | 'high' | 'very_high';
  unique_count: number;
  skewness?: number;
  numeric_kind?: 'continuous' | 'discrete' | 'unknown';
  distribution_shape?: string;
  outlier_count?: number;
  outlier_pct?: number;
  outlier_percentage?: number;
  imputation_reason?: string;
  distribution_reason?: string;
  transformation_strategy?: string;
  transformation_reason?: string;
  imputation_strategy: string;
  scaling_strategy?: string;
  recommended_action: string;
  explanation: string;
  example_code: string;
  warnings?: string[];
  why?: string;
  risks?: string;
}

export interface PreprocessingResult {
  handled: boolean;
  error?: string;
  resolved_path?: string;
  level?: string;
  filename?: string;
  rows?: number;
  columns?: number;
  numerical_features?: number;
  categorical_features?: number;
  total_missing_values?: number;
  feature_warning_count?: number;
  duplicate_rows?: number;
  recommendations?: PreprocessingRec[];
  dataset_warnings?: string[];
  pipeline_code?: string;
}

export interface PreviewResult {
  feature: string;
  feature_type?: 'numerical' | 'categorical';
  strategy: string;
  before: {
    missing_count: number;
    sample_values: Array<string | number | null>;
    mean?: number;
    median?: number;
    statistics?: {
      missing_count?: number;
      missing_percentage?: number;
      mean?: number;
      median?: number;
      std?: number | null;
      skewness?: number | null;
      min?: number | null;
      max?: number | null;
      pdf?: { edges: number[]; density: number[]; counts: number[]; sample_count: number };
      kde?: { x: number[]; density: number[]; sample_count: number; bandwidth?: number | null };
      category_distribution?: { categories: string[]; counts: number[]; percentages: number[]; sample_count: number };
    };
  };
  after: {
    missing_count: number;
    sample_values: Array<string | number | null>;
    mean?: number;
    median?: number;
    statistics?: PreviewResult['before']['statistics'];
  };
  details?: string;
}

export class ModelMindStudioWidget extends Widget {
  private _app: JupyterFrontEnd;
  private _notebooks: INotebookTracker;
  private _activeTab: 'xray' | 'target' | 'feature' | 'prep' | 'model-advisor' | 'lab' | 'guide' = 'xray';
  private _currentPath = '50_Startups.csv';
  private _resolvedDatasetPath = '';
  private _dataset: DatasetSummary | null = null;
  private _prepLevel: 'basic' | 'medium' | 'advanced' = 'basic';
  private _trainerMode = false;
  private _preprocessingRequestId = 0;
  private _targetCol = '';
  private _featureCol = '';

  // DOM elements
  private _root: HTMLDivElement;
  private _pathInput!: HTMLInputElement;
  private _statusPill!: HTMLDivElement;
  private _notebookModeLabel!: HTMLDivElement;
  private _tabRow!: HTMLDivElement;
  private _tabButtons: Map<string, HTMLButtonElement> = new Map();
  private _contentArea!: HTMLDivElement;

  constructor(app: JupyterFrontEnd, notebooks: INotebookTracker) {
    super();
    this._app = app;
    this._notebooks = notebooks;
    this._trainerMode = getModelMindNotebookRole(
      notebooks.currentWidget?.context.model
    ) === 'trainer';

    this.id = 'modelmind-studio-sidebar';
    this.title.caption = 'ModelMind Studio';
    this.title.iconClass = 'mm-sidebar-icon mm-icon-modelmind';
    this.addClass('mm-modelmind-panel');

    this._root = document.createElement('div');
    this._root.className = 'mm-studio-root';
    this.node.appendChild(this._root);

    this._buildHeader();
    this._buildTabs();
    this._buildContentArea();
    this._bindNotebookTracker();
    void this._refreshNotebookModeWhenReady();

    // Auto-load initial dataset if present
    setTimeout(() => {
      void this._loadDataset(this._currentPath);
    }, 100);
  }

  // ═════════════════════════════════════════════════════════════════
  // HEADER & DATASET SELECTOR
  // ═════════════════════════════════════════════════════════════════
  private _buildHeader(): void {
    const hdr = document.createElement('div');
    hdr.className = 'mm-studio-header';

    const brand = document.createElement('div');
    brand.className = 'mm-studio-brand';
    brand.innerHTML = `
      <div class="mm-studio-logo">◈</div>
      <div class="mm-studio-title-box">
        <div class="mm-studio-title">ModelMind Studio</div>
        <div class="mm-studio-sub">AI ML Intelligence & Laboratory</div>
      </div>
    `;
    this._notebookModeLabel = document.createElement('div');
    this._notebookModeLabel.className = 'mm-studio-sub';
    this._notebookModeLabel.textContent = this._trainerMode
      ? 'Trainer Notebook · Preview only'
      : 'ModelMind Notebook';
    brand.querySelector('.mm-studio-title-box')?.appendChild(
      this._notebookModeLabel
    );

    // Dataset Path Row
    const pathWrap = document.createElement('div');
    pathWrap.className = 'mm-studio-path-wrap';

    const inputRow = document.createElement('div');
    inputRow.className = 'mm-studio-input-row';

    this._pathInput = document.createElement('input');
    this._pathInput.type = 'text';
    this._pathInput.className = 'mm-studio-input';
    this._pathInput.placeholder = 'e.g. 50_Startups.csv';
    this._pathInput.value = this._currentPath;

    const loadBtn = document.createElement('button');
    loadBtn.type = 'button';
    loadBtn.className = 'mm-studio-btn mm-btn-primary';
    loadBtn.innerHTML = '🔍 Analyze';
    loadBtn.title = 'Analyze Dataset';
    loadBtn.addEventListener('click', () => {
      const p = this._pathInput.value.trim();
      if (p) void this._loadDataset(p);
    });

    inputRow.append(this._pathInput, loadBtn);

    // Quick Select Samples / Auto-detect helper
    const quickRow = document.createElement('div');
    quickRow.className = 'mm-studio-quick-row';

    const autoBtn = document.createElement('button');
    autoBtn.type = 'button';
    autoBtn.className = 'mm-studio-quick-pill';
    autoBtn.innerHTML = '⚡ Auto-Detect';
    autoBtn.title = 'Detect dataset from open notebook cell';
    autoBtn.addEventListener('click', () => this._autoDetectDataset());

    const s1 = document.createElement('button');
    s1.type = 'button';
    s1.className = 'mm-studio-quick-pill';
    s1.textContent = '50_Startups.csv';
    s1.addEventListener('click', () => {
      this._pathInput.value = '50_Startups.csv';
      void this._loadDataset('50_Startups.csv');
    });

    const s2 = document.createElement('button');
    s2.type = 'button';
    s2.className = 'mm-studio-quick-pill';
    s2.textContent = 'test_dataset.csv';
    s2.addEventListener('click', () => {
      this._pathInput.value = 'test_dataset.csv';
      void this._loadDataset('test_dataset.csv');
    });

    quickRow.append(autoBtn, s1, s2);

    this._statusPill = document.createElement('div');
    this._statusPill.className = 'mm-studio-status-pill';
    this._statusPill.textContent = 'Ready to analyze';

    pathWrap.append(inputRow, quickRow, this._statusPill);
    hdr.append(brand, pathWrap);
    this._root.appendChild(hdr);
  }

  // ═════════════════════════════════════════════════════════════════
  // SLIDE BAR TABS
  // ═════════════════════════════════════════════════════════════════
  private _buildTabs(): void {
    this._tabRow = document.createElement('div');
    this._tabRow.className = 'mm-studio-tab-bar';

    const tabsConfig = [
      { id: 'xray',         label: '🔬 X-Ray' },
      { id: 'target',       label: '🎯 Target' },
      { id: 'feature',      label: '📊 Feature' },
      { id: 'prep',         label: '🧠 Preprocessing' },
      { id: 'model-advisor', label: '🤖 Model Advisor' },
      { id: 'lab',          label: '⚗️ Model Lab' },
      { id: 'guide',        label: '📖 Guide' },
    ];

    tabsConfig.forEach(t => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `mm-studio-tab ${t.id === this._activeTab ? 'active' : ''}`;
      btn.textContent = t.label;
      btn.addEventListener('click', () => {
        this._activeTab = t.id as any;
        this._tabButtons.forEach((b, k) => {
          b.classList.toggle('active', k === t.id);
        });
        this._renderCurrentTab();
      });
      this._tabRow.appendChild(btn);
      this._tabButtons.set(t.id, btn);
    });

    this._root.appendChild(this._tabRow);
  }

  private _buildContentArea(): void {
    this._contentArea = document.createElement('div');
    this._contentArea.className = 'mm-studio-content';
    this._root.appendChild(this._contentArea);
  }

  private _bindNotebookTracker(): void {
    this._notebooks.currentChanged.connect(() => {
      void this._refreshNotebookModeWhenReady();
    });
    this._notebooks.activeCellChanged.connect(() => {
      const cell = this._notebooks.activeCell;
      if (!cell || !isCodeCellModel(cell.model)) return;
      const src = cell.model.toJSON().source;
      const code = Array.isArray(src) ? src.join('') : src;
      const match = code.match(/['"]((?:[^'"]+)\.(?:csv|xlsx|xls|json))['"]/);
      if (match) {
        const found = match[1];
        if (found && found !== this._currentPath) {
          this._pathInput.value = found;
        }
      }
    });
  }

  private async _refreshNotebookModeWhenReady(): Promise<void> {
    const notebook = this._notebooks.currentWidget;
    if (notebook) {
      await notebook.context.ready;
      if (notebook !== this._notebooks.currentWidget) {
        return;
      }
    }
    this.refreshNotebookMode();
  }

  refreshNotebookMode(): void {
    const trainerMode =
      getModelMindNotebookRole(this._notebooks.currentWidget?.context.model) ===
      'trainer';
    if (trainerMode === this._trainerMode) {
      return;
    }
    this._trainerMode = trainerMode;
    this._notebookModeLabel.textContent = trainerMode
      ? 'Trainer Notebook · Preview only'
      : 'ModelMind Notebook';
    document.getElementById('mm-code-preview-modal')?.remove();
    this._renderCurrentTab();
  }

  private _canUseCodeAction(action: NotebookCodeAction): boolean {
    return canUseNotebookCodeAction(
      this._trainerMode ? 'trainer' : 'modelmind',
      action
    );
  }

  private _autoDetectDataset(): void {
    const cell = this._notebooks.activeCell;
    if (!cell || !isCodeCellModel(cell.model)) {
      this._showToast('Select a notebook cell containing dataset path.');
      return;
    }
    const src = cell.model.toJSON().source;
    const code = Array.isArray(src) ? src.join('') : src;
    const match = code.match(/['"]((?:[^'"]+)\.(?:csv|xlsx|xls|json))['"]/);
    if (match) {
      this._pathInput.value = match[1];
      void this._loadDataset(match[1]);
      this._showToast(`Auto-detected: ${match[1]}`);
    } else {
      this._showToast('No .csv/.xlsx/.json found in active cell.');
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // DATA LOAD & API CALLS
  // ═════════════════════════════════════════════════════════════════
  private async _loadDataset(path: string): Promise<void> {
    this._currentPath = path;
    this._statusPill.textContent = '⏳ Analyzing dataset...';
    this._statusPill.className = 'mm-studio-status-pill loading';

    try {
      const res = await requestAPI<DatasetSummary>('api/dataset/xray', this._app.serviceManager.serverSettings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: path })
      });

      this._dataset = res;
      if (!res.supported) {
        this._statusPill.textContent = `❌ ${res.message || 'Dataset not supported'}`;
        this._statusPill.className = 'mm-studio-status-pill error';
        this._renderError(res.message || 'Dataset format not supported.');
        return;
      }

      const rows = res.rows ?? 0;
      const cols = res.columns ?? 0;
      const miss = res.total_missing_values ?? 0;
      this._statusPill.textContent = `✓ ${res.filename || path}: ${rows} rows × ${cols} cols • ${miss} missing`;
      this._statusPill.className = 'mm-studio-status-pill success';

      // Set default target & feature column
      if (res.column_names && res.column_names.length > 0) {
        if (!this._targetCol || !res.column_names.includes(this._targetCol)) {
          this._targetCol = res.column_names[res.column_names.length - 1];
        }
        if (!this._featureCol || !res.column_names.includes(this._featureCol)) {
          this._featureCol = res.column_names[0];
        }
      }

      this._renderCurrentTab();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load dataset';
      this._statusPill.textContent = `❌ Error: ${msg}`;
      this._statusPill.className = 'mm-studio-status-pill error';
      this._renderError(msg);
    }
  }

  private _renderError(msg: string): void {
    this._contentArea.replaceChildren();
    const errBox = document.createElement('div');
    errBox.className = 'mm-studio-card mm-card-error';
    errBox.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:6px;">⚠️ Dataset Error</div>
      <div style="font-size:11px; opacity:.9;">${msg}</div>
      <div style="font-size:10px; opacity:.6; margin-top:8px;">Ensure the file exists in the workspace. Supported: .csv, .xlsx, .json</div>
    `;
    this._contentArea.appendChild(errBox);
  }

  private _renderCurrentTab(): void {
    this._contentArea.replaceChildren();

    switch (this._activeTab) {
      case 'xray':
        this._renderXRayTab();
        break;
      case 'target':
        this._renderTargetTab();
        break;
      case 'feature':
        this._renderFeatureTab();
        break;
      case 'prep':
        this._renderPreprocessingTab();
        break;
      case 'model-advisor':
        this._renderModelAdvisorTab();
        break;
      case 'lab':
        this._renderModelLabTab();
        break;
      case 'guide':
        this._renderGuideTab();
        break;
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // VIEW 1: 🔬 DATASET X-RAY
  // ═════════════════════════════════════════════════════════════════
  private _renderXRayTab(): void {
    if (!this._dataset || !this._dataset.supported) {
      this._contentArea.innerHTML = '<div class="mm-studio-empty">Enter a dataset file path above and click 🔍 Analyze.</div>';
      return;
    }

    const d = this._dataset;
    const frag = document.createDocumentFragment();

    // 1. Health Grid
    const healthSec = document.createElement('div');
    healthSec.className = 'mm-studio-section';
    healthSec.innerHTML = `<div class="mm-studio-sec-title"><span>🔬</span> Dataset Health Profile</div>`;

    const grid = document.createElement('div');
    grid.className = 'mm-studio-stats-grid';

    const numCols = d.numeric_columns?.length ?? 0;
    const catCols = d.categorical_columns?.length ?? 0;
    const miss = d.total_missing_values ?? 0;
    const dups = d.duplicate_rows ?? 0;

    grid.appendChild(this._createStatCard('Rows', d.rows ?? 0));
    grid.appendChild(this._createStatCard('Columns', `${d.columns ?? 0} (${numCols}N / ${catCols}C)`));
    grid.appendChild(this._createStatCard('Missing', miss, miss > 0 ? 'warn' : 'ok'));
    grid.appendChild(this._createStatCard('Duplicates', dups, dups > 0 ? 'warn' : 'ok'));
    healthSec.appendChild(grid);

    // Likely ID columns warning
    if (d.likely_id_columns && d.likely_id_columns.length > 0) {
      const idWarn = document.createElement('div');
      idWarn.className = 'mm-studio-alert mm-alert-warning';
      idWarn.innerHTML = `⚠️ <b>Likely ID Column(s):</b> ${d.likely_id_columns.join(', ')} — These should not be used as training features.`;
      healthSec.appendChild(idWarn);
    }
    frag.appendChild(healthSec);

    // 2. Missing Values Breakdown
    if (d.missing_values && Object.keys(d.missing_values).length > 0) {
      const missEntries = Object.entries(d.missing_values).filter(([, c]) => c > 0);
      if (missEntries.length > 0) {
        const missSec = document.createElement('div');
        missSec.className = 'mm-studio-section';
        missSec.innerHTML = `<div class="mm-studio-sec-title"><span>⚠️</span> Missing Values Breakdown</div>`;

        missEntries.forEach(([col, count]) => {
          const pct = d.rows ? Math.round((count / d.rows) * 100) : 0;
          const barRow = document.createElement('div');
          barRow.className = 'mm-studio-bar-row';
          barRow.innerHTML = `
            <div class="mm-studio-bar-label">
              <span>${col}</span>
              <span class="mm-studio-bar-val">${count} (${pct}%)</span>
            </div>
            <div class="mm-studio-bar-track">
              <div class="mm-studio-bar-fill" style="width:${pct}%; background:#f87171;"></div>
            </div>
          `;
          missSec.appendChild(barRow);
        });
        frag.appendChild(missSec);
      }
    }

    // 3. Data Preview Table
    if (d.preview && d.preview.length > 0) {
      const prevSec = document.createElement('div');
      prevSec.className = 'mm-studio-section';
      prevSec.innerHTML = `<div class="mm-studio-sec-title"><span>👁️</span> Data Preview (First 5 Rows)</div>`;

      const tableWrap = document.createElement('div');
      tableWrap.className = 'mm-studio-table-wrap';

      const table = document.createElement('table');
      table.className = 'mm-studio-table';

      const cols = d.column_names || Object.keys(d.preview[0] || {});
      const thead = document.createElement('thead');
      const trh = document.createElement('tr');
      cols.forEach(col => {
        const th = document.createElement('th');
        const dt = d.dtypes?.[col] || '';
        th.innerHTML = `<div>${col}</div><span class="mm-th-dtype">${dt}</span>`;
        trh.appendChild(th);
      });
      thead.appendChild(trh);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      d.preview.slice(0, 5).forEach((row, i) => {
        const tr = document.createElement('tr');
        cols.forEach(col => {
          const td = document.createElement('td');
          const val = row[col];
          td.textContent = val !== null && val !== undefined ? String(val) : '—';
          if (val === null || val === undefined) td.style.color = '#ef4444';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableWrap.appendChild(table);
      prevSec.appendChild(tableWrap);
      frag.appendChild(prevSec);
    }

    // 4. Column Statistics
    if (d.column_stats && d.column_stats.length > 0) {
      const statsSec = document.createElement('div');
      statsSec.className = 'mm-studio-section';
      statsSec.innerHTML = `<div class="mm-studio-sec-title"><span>📋</span> Column Statistics</div>`;

      d.column_stats.forEach(cs => {
        const row = document.createElement('div');
        row.className = 'mm-studio-col-card';
        row.innerHTML = `
          <div class="mm-studio-col-hdr">
            <span class="mm-studio-col-name">${cs.name}</span>
            <span class="mm-studio-badge ${cs.is_numeric ? 'badge-num' : 'badge-cat'}">${cs.dtype}</span>
          </div>
          <div class="mm-studio-col-meta">
            <span>Missing: <b>${cs.missing_count} (${cs.missing_pct}%)</b></span>
            <span>Unique: <b>${cs.unique_count}</b></span>
            ${cs.is_numeric && cs.mean !== undefined ? `<span>Mean: <b>${cs.mean.toFixed(2)}</b></span>` : ''}
            ${cs.is_numeric && cs.min !== undefined ? `<span>Min/Max: <b>${cs.min.toFixed(1)} / ${cs.max?.toFixed(1)}</b></span>` : ''}
          </div>
        `;
        statsSec.appendChild(row);
      });
      frag.appendChild(statsSec);
    }

    this._contentArea.appendChild(frag);
  }

  // ═════════════════════════════════════════════════════════════════
  // VIEW 2: 🎯 TARGET ANALYZER & TARGET HEALTH
  // ═════════════════════════════════════════════════════════════════
  private _renderTargetTab(): void {
    if (!this._dataset || !this._dataset.supported) {
      this._contentArea.innerHTML = '<div class="mm-studio-empty">Analyze a dataset to use Target Intelligence.</div>';
      return;
    }

    const frag = document.createDocumentFragment();

    const pickerSec = document.createElement('div');
    pickerSec.className = 'mm-studio-section';
    pickerSec.innerHTML = `
      <div class="mm-studio-sec-title"><span>🎯</span> Target Variable Analyzer</div>
      <div class="mm-studio-sec-sub">Select the dependent variable you want your ML model to predict.</div>
    `;

    const selectRow = document.createElement('div');
    selectRow.className = 'mm-studio-select-row';

    const select = document.createElement('select');
    select.className = 'mm-studio-select';
    (this._dataset.column_names || []).forEach(col => {
      const opt = document.createElement('option');
      opt.value = col;
      opt.textContent = col;
      if (col === this._targetCol) opt.selected = true;
      select.appendChild(opt);
    });

    const analyzeBtn = document.createElement('button');
    analyzeBtn.type = 'button';
    analyzeBtn.className = 'mm-studio-btn mm-btn-primary';
    analyzeBtn.textContent = '🎯 Inspect Target';

    selectRow.append(select, analyzeBtn);
    pickerSec.appendChild(selectRow);
    frag.appendChild(pickerSec);

    const targetResultDiv = document.createElement('div');
    targetResultDiv.className = 'mm-studio-target-result';
    frag.appendChild(targetResultDiv);

    const runTargetAnalysis = async (col: string) => {
      this._targetCol = col;
      targetResultDiv.innerHTML = '<div class="mm-studio-loading">Analyzing target health...</div>';
      try {
        const res = await requestAPI<TargetAnalysisResult>('api/dataset/target', this._app.serviceManager.serverSettings, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_path: this._currentPath, target_column: col })
        });
        this._displayTargetResult(targetResultDiv, res);
      } catch (err) {
        targetResultDiv.innerHTML = `<div class="mm-studio-alert mm-alert-error">${err instanceof Error ? err.message : 'Target analysis failed.'}</div>`;
      }
    };

    analyzeBtn.addEventListener('click', () => runTargetAnalysis(select.value));
    select.addEventListener('change', () => runTargetAnalysis(select.value));

    this._contentArea.appendChild(frag);

    if (this._targetCol) {
      void runTargetAnalysis(this._targetCol);
    }
  }

  private _displayTargetResult(container: HTMLElement, res: TargetAnalysisResult): void {
    container.replaceChildren();

    // 1. Task Badge & Health summary
    const card = document.createElement('div');
    card.className = 'mm-studio-card';

    const taskColor = res.task === 'classification' ? '#4f46e5' : '#059669';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-weight:700; font-size:14px;">${res.target_column || res.target || this._targetCol || 'Target'}</span>
        <span class="mm-studio-badge" style="background:${res.task === 'classification' ? '#eef2ff' : '#ecfdf5'}; color:${taskColor}; border:1px solid ${res.task === 'classification' ? '#c7d2fe' : '#a7f3d0'}; font-size:11px; font-weight:700;">
          ${(res.task_type || res.task || 'ML').toUpperCase()} TASK
        </span>
      </div>
      <div class="mm-studio-stats-grid">
        <div class="mm-stat-box"><div class="mm-stat-val">${res.unique_count}</div><div class="mm-stat-lbl">Unique Values</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" style="color:${(res.missing_count ?? 0) > 0 ? '#dc2626' : '#059669'}">${res.missing_count ?? 0}</div><div class="mm-stat-lbl">Missing</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${res.dtype}</div><div class="mm-stat-lbl">Data Type</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${res.is_imbalanced ? 'Imbalanced' : 'Healthy'}</div><div class="mm-stat-lbl">Target Health</div></div>
      </div>
    `;

    // Missing target warning
    if ((res.missing_count ?? 0) > 0) {
      const missWarn = document.createElement('div');
      missWarn.className = 'mm-studio-alert mm-alert-error';
      missWarn.style.marginTop = '10px';
      missWarn.innerHTML = `❌ <b>Critical:</b> Target variable has ${res.missing_count} missing values. Supervised models cannot train on missing targets. Drop these rows before fitting.`;
      card.appendChild(missWarn);
    }
    container.appendChild(card);

    // 2. Classification Health (Class Distribution & Imbalance)
    if (res.task === 'classification') {
      const classSec = document.createElement('div');
      classSec.className = 'mm-studio-section';
      classSec.innerHTML = `<div class="mm-studio-sec-title"><span>⚖️</span> Class Distribution & Imbalance</div>`;

      const encodingNotice = document.createElement('div');
      encodingNotice.className = 'mm-studio-alert mm-alert-info';
      encodingNotice.textContent = res.is_numeric
        ? 'This numeric classification target is already encoded. This inspection does not change your data.'
        : 'This is a categorical target. This inspection does not encode or change your data. When you run generated classification code from Model Advisor, LabelEncoder is applied for training, its mapping is shown, and predictions are converted back to the original labels. Encoding does not improve model accuracy; clean inconsistent labels before training.';
      classSec.appendChild(encodingNotice);

      if (res.class_percentages) {
        if (res.imbalance_ratio !== undefined) {
          const imbPill = document.createElement('div');
          imbPill.className = `mm-studio-alert ${res.is_imbalanced ? 'mm-alert-warning' : 'mm-alert-info'}`;
          imbPill.innerHTML = `Imbalance Ratio: <b>${res.imbalance_ratio.toFixed(2)} : 1</b> — ${res.is_imbalanced ? '⚠️ Significant class imbalance detected.' : '✓ Well balanced target.'}`;
          classSec.appendChild(imbPill);
        }

        Object.entries(res.class_percentages).forEach(([cls, pct]) => {
          const count = res.class_counts?.[cls] ?? '';
          const barRow = document.createElement('div');
          barRow.className = 'mm-studio-bar-row';
          barRow.innerHTML = `
            <div class="mm-studio-bar-label">
              <span>Class <b>"${cls}"</b></span>
              <span class="mm-studio-bar-val">${count} (${pct}%)</span>
            </div>
            <div class="mm-studio-bar-track">
              <div class="mm-studio-bar-fill" style="width:${pct}%; background:#818cf8;"></div>
            </div>
          `;
          classSec.appendChild(barRow);
        });
      }
      container.appendChild(classSec);
    }

    // 3. Regression Health (Distribution & Outliers)
    if (res.task === 'regression') {
      const regSec = document.createElement('div');
      regSec.className = 'mm-studio-section';
      regSec.innerHTML = `<div class="mm-studio-sec-title"><span>📈</span> Continuous Target Stats</div>`;

      const statsGrid = document.createElement('div');
      statsGrid.className = 'mm-studio-stats-grid';
      statsGrid.innerHTML = `
        <div class="mm-stat-box"><div class="mm-stat-val">${res.mean?.toFixed(2) ?? '—'}</div><div class="mm-stat-lbl">Mean</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${res.median?.toFixed(2) ?? '—'}</div><div class="mm-stat-lbl">Median</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${res.std?.toFixed(2) ?? '—'}</div><div class="mm-stat-lbl">Std Dev</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${res.skewness?.toFixed(2) ?? '—'}</div><div class="mm-stat-lbl">Skewness</div></div>
      `;
      regSec.appendChild(statsGrid);

      if (res.skewness && Math.abs(res.skewness) > 1.0) {
        const skewAlert = document.createElement('div');
        skewAlert.className = 'mm-studio-alert mm-alert-warning';
        skewAlert.innerHTML = `⚠️ <b>High Skewness (${res.skewness.toFixed(2)}):</b> Target is heavily skewed. Consider applying <code>np.log1p()</code> or Box-Cox transformation.`;
        regSec.appendChild(skewAlert);
      }

      if (res.outlier_count && res.outlier_count > 0) {
        const outAlert = document.createElement('div');
        outAlert.className = 'mm-studio-alert mm-alert-warning';
        outAlert.innerHTML = `⚠️ <b>Outliers (${res.outlier_count}):</b> Target contains ${res.outlier_count} potential outliers (1.5 × IQR rule).`;
        regSec.appendChild(outAlert);
      }
      container.appendChild(regSec);
    }

    // 4. Action Recommendations
    if (res.recommendations && res.recommendations.length > 0) {
      const recSec = document.createElement('div');
      recSec.className = 'mm-studio-section';
      recSec.innerHTML = `<div class="mm-studio-sec-title"><span>💡</span> Target Engineering Advice</div>`;

      const list = document.createElement('ul');
      list.className = 'mm-studio-list';
      res.recommendations.forEach(r => {
        const li = document.createElement('li');
        li.textContent = r;
        list.appendChild(li);
      });
      recSec.appendChild(list);
      container.appendChild(recSec);
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // VIEW 3: 📊 FEATURE ANALYZER & DISTRIBUTION
  // ═════════════════════════════════════════════════════════════════
  private _renderFeatureTab(): void {
    if (!this._dataset || !this._dataset.supported) {
      this._contentArea.innerHTML = '<div class="mm-studio-empty">Analyze a dataset to use Feature Deep-Dive.</div>';
      return;
    }

    const frag = document.createDocumentFragment();

    const pickerSec = document.createElement('div');
    pickerSec.className = 'mm-studio-section';
    pickerSec.innerHTML = `
      <div class="mm-studio-sec-title"><span>📊</span> Feature Deep-Dive & Distribution</div>
      <div class="mm-studio-sec-sub">Examine individual feature distribution, outliers, and correlations.</div>
    `;

    const selectRow = document.createElement('div');
    selectRow.className = 'mm-studio-select-row';

    const select = document.createElement('select');
    select.className = 'mm-studio-select';
    (this._dataset.column_names || []).forEach(col => {
      const opt = document.createElement('option');
      opt.value = col;
      opt.textContent = col;
      if (col === this._featureCol) opt.selected = true;
      select.appendChild(opt);
    });

    const inspectBtn = document.createElement('button');
    inspectBtn.type = 'button';
    inspectBtn.className = 'mm-studio-btn mm-btn-primary';
    inspectBtn.textContent = '📊 Inspect Feature';

    selectRow.append(select, inspectBtn);
    pickerSec.appendChild(selectRow);
    frag.appendChild(pickerSec);

    const featResultDiv = document.createElement('div');
    featResultDiv.className = 'mm-studio-feat-result';
    frag.appendChild(featResultDiv);

    const runFeatureAnalysis = async (col: string) => {
      this._featureCol = col;
      featResultDiv.innerHTML = '<div class="mm-studio-loading">Analyzing feature distribution...</div>';
      try {
        const res = await requestAPI<FeatureAnalysisResult>('api/dataset/feature', this._app.serviceManager.serverSettings, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_path: this._currentPath, feature_column: col })
        });
        this._displayFeatureResult(featResultDiv, res);
      } catch (err) {
        featResultDiv.innerHTML = `<div class="mm-studio-alert mm-alert-error">${err instanceof Error ? err.message : 'Feature analysis failed.'}</div>`;
      }
    };

    inspectBtn.addEventListener('click', () => runFeatureAnalysis(select.value));
    select.addEventListener('change', () => runFeatureAnalysis(select.value));

    this._contentArea.appendChild(frag);

    if (this._featureCol) {
      void runFeatureAnalysis(this._featureCol);
    }
  }

  private _displayFeatureResult(container: HTMLElement, res: FeatureAnalysisResult): void {
    container.replaceChildren();

    // Stats Grid
    const card = document.createElement('div');
    card.className = 'mm-studio-card';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-weight:700; font-size:14px;">${res.feature_column ?? res.feature ?? '—'}</span>
        <span class="mm-studio-badge ${(res.type ?? res.feature_type) === 'numerical' ? 'badge-num' : 'badge-cat'}">${(res.type ?? res.feature_type ?? 'unknown').toUpperCase()}</span>
      </div>
      <div class="mm-studio-stats-grid">
        <div class="mm-stat-box"><div class="mm-stat-val">${res.missing_count ?? 0} (${(res.missing_percentage ?? 0).toFixed(1)}%)</div><div class="mm-stat-lbl">Missing</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${res.unique_count ?? 0}</div><div class="mm-stat-lbl">Unique</div></div>
        ${res.mean !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val">${res.mean.toFixed(2)}</div><div class="mm-stat-lbl">Mean</div></div>` : ''}
        ${res.median !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val">${res.median.toFixed(2)}</div><div class="mm-stat-lbl">Median</div></div>` : ''}
        ${(res.std ?? res.standard_deviation) !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val">${(res.std ?? res.standard_deviation)!.toFixed(2)}</div><div class="mm-stat-lbl">Std Dev</div></div>` : ''}
        ${res.skewness !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val">${res.skewness.toFixed(2)}</div><div class="mm-stat-lbl">Skewness</div></div>` : ''}
        ${res.outlier_count !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val" style="color:${res.outlier_count > 0 ? '#f87171' : 'inherit'}">${res.outlier_count}</div><div class="mm-stat-lbl">Outliers</div></div>` : ''}
      </div>
    `;
    container.appendChild(card);

    // Distribution Histogram / Value counts
    const distSec = document.createElement('div');
    distSec.className = 'mm-studio-section';
    distSec.innerHTML = `<div class="mm-studio-sec-title"><span>📊</span> Distribution</div>`;

    // Backend returns histogram_counts + histogram_edges arrays (numerical)
    // or category_distribution array (categorical), or legacy value_counts dict
    if (res.histogram_counts && res.histogram_edges && res.histogram_counts.length > 0) {
      const counts = res.histogram_counts;
      const edges = res.histogram_edges;
      const maxCount = Math.max(...counts, 1);
      const histDiv = document.createElement('div');
      histDiv.className = 'mm-studio-hist-container';
      counts.forEach((count, i) => {
        const hPct = Math.round((count / maxCount) * 100);
        const colEl = document.createElement('div');
        colEl.className = 'mm-hist-col';
        const lo = (edges[i] ?? 0).toFixed(0);
        const hi = (edges[i + 1] ?? 0).toFixed(0);
        colEl.title = `[${lo} – ${hi}]: ${count}`;
        colEl.innerHTML = `
          <div class="mm-hist-bar" style="height:${Math.max(hPct, 4)}%;"></div>
          <div class="mm-hist-label">${lo}</div>
        `;
        histDiv.appendChild(colEl);
      });
      distSec.appendChild(histDiv);
    } else if (res.histogram && res.histogram.length > 0) {
      // Legacy: histogram as array of {bin_start, bin_end, count}
      const maxCount = Math.max(...res.histogram.map(b => b.count), 1);
      const histDiv = document.createElement('div');
      histDiv.className = 'mm-studio-hist-container';
      res.histogram.forEach(b => {
        const hPct = Math.round((b.count / maxCount) * 100);
        const colEl = document.createElement('div');
        colEl.className = 'mm-hist-col';
        colEl.title = `[${b.bin_start.toFixed(1)} – ${b.bin_end.toFixed(1)}]: ${b.count}`;
        colEl.innerHTML = `
          <div class="mm-hist-bar" style="height:${Math.max(hPct, 4)}%;"></div>
          <div class="mm-hist-label">${b.bin_start.toFixed(0)}</div>
        `;
        histDiv.appendChild(colEl);
      });
      distSec.appendChild(histDiv);
    } else if (res.category_distribution && res.category_distribution.length > 0) {
      // Backend categorical response: array of {value, count, percentage}
      res.category_distribution.slice(0, 10).forEach(item => {
        const pct = Math.round(item.percentage);
        const barRow = document.createElement('div');
        barRow.className = 'mm-studio-bar-row';
        barRow.innerHTML = `
          <div class="mm-studio-bar-label">
            <span>"${item.value}"</span>
            <span class="mm-studio-bar-val">${item.count} (${pct}%)</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${pct}%; background:#38bdf8;"></div>
          </div>
        `;
        distSec.appendChild(barRow);
      });
    } else if (res.value_counts) {
      // Legacy: value_counts dict
      const entries = Object.entries(res.value_counts).slice(0, 8);
      const total = res.total_rows || 1;
      entries.forEach(([cat, cnt]) => {
        const pct = Math.round((cnt / total) * 100);
        const barRow = document.createElement('div');
        barRow.className = 'mm-studio-bar-row';
        barRow.innerHTML = `
          <div class="mm-studio-bar-label">
            <span>"${cat}"</span>
            <span class="mm-studio-bar-val">${cnt} (${pct}%)</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${pct}%; background:#38bdf8;"></div>
          </div>
        `;
        distSec.appendChild(barRow);
      });
    }
    container.appendChild(distSec);

    // Correlations
    if (res.correlations && Object.keys(res.correlations).length > 0) {
      const corrSec = document.createElement('div');
      corrSec.className = 'mm-studio-section';
      corrSec.innerHTML = `<div class="mm-studio-sec-title"><span>🔗</span> Correlations with Other Features</div>`;

      const selfName = res.feature_column ?? res.feature;
      Object.entries(res.correlations!).forEach(([other, r]) => {
        if (other === selfName) return;
        const absR = Math.abs(r);
        const color = r > 0 ? '#059669' : '#dc2626';
        const row = document.createElement('div');
        row.className = 'mm-studio-bar-row';
        row.innerHTML = `
          <div class="mm-studio-bar-label">
            <span>${other}</span>
            <span class="mm-studio-bar-val" style="color:${color}; font-weight:700;">r = ${r.toFixed(3)}</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${Math.round(absR * 100)}%; background:${color};"></div>
          </div>
        `;
        corrSec.appendChild(row);
      });
      container.appendChild(corrSec);
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // VIEW 4: 🧠 SMART PREPROCESSING ADVISER 2.0
  // ═════════════════════════════════════════════════════════════════
  private _renderPreprocessingTab(): void {
    if (!this._dataset || !this._dataset.supported) {
      this._contentArea.innerHTML = '<div class="mm-studio-empty">Analyze a dataset to get Smart Preprocessing recommendations.</div>';
      return;
    }

    this._contentArea.replaceChildren();
    const frag = document.createDocumentFragment();

    // ── Level Selector Header ──
    const topBar = document.createElement('div');
    topBar.className = 'mm-studio-section';

    // Level description banner
    const levelDescriptions: Record<string, string> = {
      basic:    '🟢 Basic — Learn how simple mean, median, or mode filling works, and why the observed values support it.',
      medium:   '🟡 Medium — Impute and inspect distribution / IQR flags; cap only after checking that flagged values are errors.',
      advanced: '🔴 Advanced — Use leakage-safe sklearn Pipelines and ColumnTransformers fitted on training rows only.',
    };

    const lvlRow = document.createElement('div');
    lvlRow.className = 'mm-studio-level-row';
    lvlRow.id = 'mm-prep-level-row';

    const lbl = document.createElement('span');
    lbl.style.cssText = 'font-size:12px; opacity:.8; margin-right:8px; font-weight:700;';
    lbl.textContent = 'Skill Level:';
    lvlRow.appendChild(lbl);

    const levelDescBanner = document.createElement('div');
    levelDescBanner.className = `mm-prep-level-banner mm-prep-level-${this._prepLevel}`;
    levelDescBanner.textContent = levelDescriptions[this._prepLevel];

    const updateLevelUI = () => {
      // Update pill active states
      lvlRow.querySelectorAll('.mm-level-pill').forEach((el) => {
        const btn = el as HTMLButtonElement;
        const isActive = btn.dataset['level'] === this._prepLevel;
        btn.className = `mm-level-pill${isActive ? ' active' : ''}`;
      });
      levelDescBanner.className = `mm-prep-level-banner mm-prep-level-${this._prepLevel}`;
      levelDescBanner.textContent = levelDescriptions[this._prepLevel];
    };

    (['basic', 'medium', 'advanced'] as const).forEach(lvl => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset['level'] = lvl;
      b.className = `mm-level-pill ${this._prepLevel === lvl ? 'active' : ''}`;
      b.textContent = lvl.charAt(0).toUpperCase() + lvl.slice(1);
      b.addEventListener('click', () => {
        this._prepLevel = lvl;
        updateLevelUI();
        void this._loadPreprocessingAdvice(prepCardsContainer);
      });
      lvlRow.appendChild(b);
    });

    topBar.appendChild(lvlRow);
    topBar.appendChild(levelDescBanner);
    frag.appendChild(topBar);

    // Container for cards
    const prepCardsContainer = document.createElement('div');
    prepCardsContainer.className = 'mm-studio-prep-cards';
    frag.appendChild(prepCardsContainer);

    this._contentArea.appendChild(frag);

    void this._loadPreprocessingAdvice(prepCardsContainer);
  }

  private async _loadPreprocessingAdvice(container: HTMLElement): Promise<void> {
    const requestId = ++this._preprocessingRequestId;
    const level = this._prepLevel;
    const datasetPath = this._pathInput.value.trim() || this._currentPath;
    container.innerHTML = '<div class="mm-studio-loading">Generating smart preprocessing recommendations...</div>';

    try {
      const res = await requestAPI<PreprocessingResult>('api/dataset/preprocessing', this._app.serviceManager.serverSettings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: datasetPath, level })
      });

      if (requestId !== this._preprocessingRequestId || !container.isConnected) {
        return;
      }

      this._resolvedDatasetPath = res.resolved_path || datasetPath;
      container.replaceChildren();

      // Warnings banner
      if (res.dataset_warnings && res.dataset_warnings.length > 0) {
        const warnCard = document.createElement('div');
        warnCard.className = 'mm-studio-alert mm-alert-warning';
        warnCard.innerHTML = `<b>Dataset Observations:</b><br/>${res.dataset_warnings.map(w => `• ${w}`).join('<br/>')}`;
        container.appendChild(warnCard);
      }

      if (!res.recommendations || res.recommendations.length === 0) {
        container.innerHTML = '<div class="mm-studio-empty">No preprocessing needed! Dataset is clean.</div>';
        return;
      }

      res.recommendations.forEach(rec => {
        const card = this._createRecommendationCard(rec, res.recommendations!);
        container.appendChild(card);
      });

      // ── Advanced: Show full pipeline suggestion banner ──
      if (level === 'advanced' && res.pipeline_code) {
        const fullPipelineCode = [
          buildDatasetLoadingCode(this._resolvedDatasetPath),
          '',
          res.pipeline_code
        ].join('\n');
        const pipelineSection = document.createElement('div');
        pipelineSection.style.cssText = `
          margin-top:18px; padding:16px; border-radius:12px;
          background:#f0fdf4; border:1px solid #bbf7d0;
        `;
        const pipelineTitle = document.createElement('div');
        pipelineTitle.style.cssText = 'font-size:14px; font-weight:750; margin-bottom:6px; color:#15803d;';
        pipelineTitle.innerHTML = '🚀 Suggested Full ColumnTransformer Pipeline';
        const pipelineSub = document.createElement('div');
        pipelineSub.style.cssText = 'font-size:13px; line-height:1.55; color:#475569; margin-bottom:12px;';
        pipelineSub.textContent = 'This pipeline combines all numerical and categorical columns with proper imputation, scaling, and encoding.';
        const pipelineCode = document.createElement('pre');
        pipelineCode.style.cssText = `
          background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
          padding:14px 16px; font-size:12px; overflow-x:auto; margin:0;
          font-family:ui-monospace,SFMono-Regular,monospace; line-height:1.65; color:#1e293b;
        `;
        pipelineCode.textContent = fullPipelineCode;
        const pipelineBtnRow = document.createElement('div');
        pipelineBtnRow.style.cssText = 'display:flex; gap:8px; margin-top:10px;';
        const pipelineCopyBtn = document.createElement('button');
        pipelineCopyBtn.type = 'button';
        pipelineCopyBtn.className = 'mm-studio-btn mm-btn-sm';
        pipelineCopyBtn.innerHTML = '📋 Copy Pipeline';
        pipelineCopyBtn.addEventListener('click', async () => {
          await navigator.clipboard.writeText(fullPipelineCode);
          pipelineCopyBtn.textContent = 'Copied!';
          setTimeout(() => { pipelineCopyBtn.innerHTML = '📋 Copy Pipeline'; }, 1500);
        });
        const pipelineInsertBtn = document.createElement('button');
        pipelineInsertBtn.type = 'button';
        pipelineInsertBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
        pipelineInsertBtn.innerHTML = '📥 Insert Pipeline';
        pipelineInsertBtn.addEventListener('click', () => {
          const ok = this._insertPreprocessingCode(fullPipelineCode);
          this._showToast(ok ? '✓ Pipeline code inserted!' : 'Open a notebook first.');
        });
        if (!this._canUseCodeAction('insert')) {
          const pipelinePreviewBtn = document.createElement('button');
          pipelinePreviewBtn.type = 'button';
          pipelinePreviewBtn.className = 'mm-studio-btn mm-btn-sm';
          pipelinePreviewBtn.textContent = '🔍 Preview Code';
          pipelinePreviewBtn.addEventListener('click', () => {
            this._showCodePreviewModal(
              'Full preprocessing pipeline',
              fullPipelineCode,
              'advanced'
            );
          });
          pipelineBtnRow.append(pipelinePreviewBtn);
        } else {
          pipelineBtnRow.append(pipelineCopyBtn, pipelineInsertBtn);
        }
        pipelineSection.append(pipelineTitle, pipelineSub, pipelineCode, pipelineBtnRow);
        container.appendChild(pipelineSection);
      }
    } catch (err) {
      if (requestId !== this._preprocessingRequestId || !container.isConnected) {
        return;
      }
      container.innerHTML = `<div class="mm-studio-alert mm-alert-error">${err instanceof Error ? err.message : 'Failed to generate recommendations.'}</div>`;
    }
  }

  private _createRecommendationCard(
    rec: PreprocessingRec,
    recommendations: PreprocessingRec[]
  ): HTMLElement {
    const card = document.createElement('div');
    card.className = 'mm-studio-card mm-prep-card';

    const sevColor = {
      none: '#059669',
      low: '#d97706',
      moderate: '#ea580c',
      high: '#dc2626',
      very_high: '#991b1b',
    }[rec.missing_severity] || '#64748b';

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'mm-prep-hdr';
    hdr.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-weight:700; font-size:13px;">${rec.feature}</span>
        <span class="mm-studio-badge ${rec.feature_type === 'numerical' ? 'badge-num' : 'badge-cat'}">${rec.feature_type.toUpperCase()}</span>
      </div>
      <span class="mm-studio-badge" style="background:${sevColor}22; color:${sevColor}; border:1px solid ${sevColor}44;">
        ${rec.missing_count} MISSING (${rec.missing_pct}%)
      </span>
    `;

    // Action summary
    const act = document.createElement('div');
    act.className = 'mm-prep-action';
    act.innerHTML = `<b>Recommended:</b> ${rec.recommended_action || rec.imputation_strategy}`;

    if (rec.feature_type === 'numerical') {
      const profile = document.createElement('div');
      profile.className = 'mm-prep-profile';
      const kind = rec.numeric_kind === 'discrete'
        ? 'Discrete / count-like'
        : rec.numeric_kind === 'continuous'
          ? 'Continuous-like'
          : 'Numeric type unknown';
      const shape = (rec.distribution_shape || 'unknown')
        .replace(/_/g, ' ');
      const skew = typeof rec.skewness === 'number'
        ? rec.skewness.toFixed(2)
        : 'unavailable';
      const outlierPct = typeof rec.outlier_percentage === 'number'
        ? rec.outlier_percentage
        : rec.outlier_pct;
      profile.textContent =
        `📊 Profile: ${kind} · ${shape} · skewness ${skew} · ` +
        `IQR outliers ${rec.outlier_count ?? 0} (${outlierPct ?? 0}%)`;
      if (
        rec.transformation_strategy &&
        rec.transformation_strategy !== 'none'
      ) {
        const transformNote = document.createElement('div');
        transformNote.style.marginTop = '4px';
        const transformName =
          rec.transformation_strategy === 'log1p_candidate'
            ? 'Log1p candidate'
            : rec.transformation_strategy === 'power_transform_candidate'
              ? 'Yeo-Johnson candidate'
              : rec.transformation_strategy.replace(/_/g, ' ');
        transformNote.textContent =
          `Distribution option: ${transformName}. ` +
          (rec.transformation_reason || 'Validate the transformed shape before using it.');
        profile.appendChild(transformNote);
      }
      card.appendChild(profile);
    }

    // Why & Risks
    const whyEl = document.createElement('div');
    whyEl.className = 'mm-prep-why';
    const whyLabel = document.createElement('b');
    whyLabel.textContent = '✅ Why this choice: ';
    whyEl.append(whyLabel, rec.why || rec.explanation);
    if (rec.feature_type === 'numerical' && rec.imputation_reason) {
      const reason = document.createElement('div');
      reason.style.marginTop = '4px';
      reason.textContent = `Imputation rationale: ${rec.imputation_reason}`;
      whyEl.appendChild(reason);
    }

    const cautions = [
      ...(Array.isArray(rec.warnings) ? rec.warnings : []),
      ...(rec.risks ? [rec.risks] : [])
    ].filter((item, index, all) =>
      item && !/^no risks?\b/i.test(item.trim()) && all.indexOf(item) === index
    );
    const riskEl = cautions.length > 0 ? document.createElement('div') : null;
    if (riskEl) {
      riskEl.className = 'mm-prep-risk-box';
      const riskHeading = document.createElement('strong');
      riskHeading.textContent = '⚠️ Considerations';
      const riskList = document.createElement('ul');
      riskList.style.cssText = 'margin:6px 0 0;padding-left:20px;';
      cautions.forEach(caution => {
        const item = document.createElement('li');
        item.textContent = caution;
        riskList.appendChild(item);
      });
      riskEl.append(riskHeading, riskList);
    }

    // Strategy selector
    const stratWrap = document.createElement('div');
    stratWrap.className = 'mm-prep-strategy-row';

    const stratSelect = document.createElement('select');
    stratSelect.className = 'mm-studio-select mm-select-sm';

    const strategies = rec.feature_type === 'numerical'
      ? ['mean', 'median', 'most_frequent', 'constant', 'standard_scaler', 'minmax_scaler', 'robust_scaler', 'cap_outliers_iqr', 'drop_column']
      : ['most_frequent', 'unknown', 'one_hot_encode', 'ordinal_encode', 'frequency_encode', 'drop_column'];
    const defaultStrategy = strategies.includes(rec.imputation_strategy)
      ? rec.imputation_strategy
      : rec.feature_type === 'numerical'
        ? 'median'
        : strategies[0];

    strategies.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s.replace(/_/g, ' ').toUpperCase();
      if (s === defaultStrategy) opt.selected = true;
      stratSelect.appendChild(opt);
    });
    let strategyCustomized = false;
    stratSelect.addEventListener('change', () => {
      strategyCustomized = true;
    });
    const getCode = () => this._buildFullPreprocessingCode(
      rec,
      stratSelect.value,
      strategyCustomized ? undefined : rec.example_code
    );

    stratWrap.innerHTML = '<span style="font-size:10px; opacity:.7;">Strategy:</span>';
    stratWrap.appendChild(stratSelect);

    // Live preview container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'mm-prep-preview-box';
    previewContainer.style.display = 'none';

    // Toolbar Buttons
    const toolRow = document.createElement('div');
    toolRow.className = 'mm-prep-btn-row';

    // 1. Live Preview Button
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'mm-studio-btn mm-btn-sm';
    prevBtn.innerHTML = '👁️ Preview';
    prevBtn.title = 'Preview before and after';
    prevBtn.addEventListener('click', async () => {
      prevBtn.disabled = true;
      prevBtn.textContent = '⏳ Loading...';
      try {
        const preview = await requestAPI<PreviewResult>('api/dataset/preprocessing/preview', this._app.serviceManager.serverSettings, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_path: this._currentPath,
            feature: rec.feature,
            strategy: stratSelect.value
          })
        });
        this._renderLivePreview(previewContainer, preview, rec, this._prepLevel);
        previewContainer.style.display = 'block';
      } catch (err) {
        previewContainer.innerHTML = `<div class="mm-studio-alert mm-alert-error">${err instanceof Error ? err.message : 'Preview failed.'}</div>`;
        previewContainer.style.display = 'block';
      } finally {
        prevBtn.disabled = false;
        prevBtn.innerHTML = '👁️ Preview';
      }
    });

    // 2. Apply to Dataset
    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-accent';
    applyBtn.innerHTML = '⚡ Apply to File';
    applyBtn.title = 'Apply transformation directly to dataset with backup';
    applyBtn.addEventListener('click', async () => {
      if (!confirm(`Apply '${stratSelect.value}' to column '${rec.feature}' in ${this._currentPath}?\nA .bak backup will be created.`)) return;
      applyBtn.disabled = true;
      applyBtn.textContent = 'Applying...';
      try {
        const applied = await requestAPI<any>('api/dataset/preprocessing/apply', this._app.serviceManager.serverSettings, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_path: this._currentPath,
            feature: rec.feature,
            strategy: stratSelect.value
          })
        });
        this._showToast(`✓ Applied ${stratSelect.value} to ${rec.feature}! Backup created.`);
        if (applied.dataset) this._dataset = applied.dataset;
        void this._loadDataset(this._currentPath);
      } catch (err) {
        this._showToast(`❌ Apply failed: ${err instanceof Error ? err.message : 'Error'}`);
      } finally {
        applyBtn.disabled = false;
        applyBtn.innerHTML = '⚡ Apply to File';
      }
    });

    // 3. Undo
    const undoBtn = document.createElement('button');
    undoBtn.type = 'button';
    undoBtn.className = 'mm-studio-btn mm-btn-sm';
    undoBtn.innerHTML = '↩️ Undo';
    undoBtn.title = 'Restore original dataset from backup';
    undoBtn.addEventListener('click', async () => {
      if (!confirm(`Undo changes and restore ${this._currentPath} from backup?`)) return;
      try {
        const undone = await requestAPI<any>('api/dataset/preprocessing/undo', this._app.serviceManager.serverSettings, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_path: this._currentPath })
        });
        this._showToast('✓ Restored dataset from backup!');
        if (undone.dataset) this._dataset = undone.dataset;
        void this._loadDataset(this._currentPath);
      } catch (err) {
        this._showToast(`❌ Undo failed: ${err instanceof Error ? err.message : 'Error'}`);
      }
    });

    // 4. Insert Code
    const insertBtn = document.createElement('button');
    insertBtn.type = 'button';
    insertBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
    insertBtn.innerHTML = '📥 Insert Code';
    insertBtn.title = 'Insert complete runnable preprocessing code, including loading the selected dataset';
    insertBtn.addEventListener('click', () => {
      const code = getCode();
      const ok = this._insertPreprocessingCode(code);
      if (ok) {
        this._showToast('✓ Full preprocessing code inserted below active cell!');
      } else {
        this._showToast('Please open a notebook first.');
      }
    });

    // 5. Copy Code
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'mm-studio-btn mm-btn-sm';
    copyBtn.innerHTML = '📋 Copy';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(
          getCode()
        );
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.innerHTML = '📋 Copy'; }, 1500);
      } catch {
        copyBtn.textContent = 'Error';
      }
    });

    // 6. Preview Code — show syntax-highlighted code in a modal
    const previewCodeBtn = document.createElement('button');
    previewCodeBtn.type = 'button';
    previewCodeBtn.className = 'mm-studio-btn mm-btn-sm';
    previewCodeBtn.innerHTML = '🔍 Preview Code';
    previewCodeBtn.title = 'View the generated code in a readable panel';
    previewCodeBtn.addEventListener('click', () => {
      this._showCodePreviewModal(
        rec.feature,
        getCode(),
        this._prepLevel
      );
    });

    toolRow.append(prevBtn, applyBtn, undoBtn);
    if (this._canUseCodeAction('insert')) {
      toolRow.append(insertBtn, copyBtn);
    }
    toolRow.append(previewCodeBtn);

    card.append(hdr, act);
    const profileEl = card.querySelector('.mm-prep-profile');
    if (profileEl) card.appendChild(profileEl);
    card.appendChild(whyEl);
    if (riskEl) card.appendChild(riskEl);
    card.append(stratWrap, previewContainer, toolRow);
    return card;
  }

  private _buildFullPreprocessingCode(
    rec: PreprocessingRec,
    selectedStrategy: string,
    recommendedCode?: string
  ): string {
    const selectedPath =
      this._resolvedDatasetPath || this._pathInput.value.trim() || this._currentPath;
    return buildFullPreprocessingCode(
      selectedPath,
      rec,
      selectedStrategy,
      recommendedCode
    );
  }

  // ── Code Preview Modal ────────────────────────────────────────────────────
  private _showCodePreviewModal(feature: string, code: string, level: string): void {
    // Remove existing modal if any
    document.getElementById('mm-code-preview-modal')?.remove();

    const levelColors: Record<string, string> = {
      basic: '#059669',
      medium: '#d97706',
      advanced: '#4f46e5',
    };
    const levelColor = levelColors[level] || '#4f46e5';

    const overlay = document.createElement('div');
    overlay.id = 'mm-code-preview-modal';
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:99999;
      background:rgba(0,0,0,0.75); backdrop-filter:blur(4px);
      display:flex; align-items:center; justify-content:center;
      padding:20px;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background:#ffffff; border:1px solid #dfe3ea; border-radius:12px;
      padding:0; width:min(680px, 95vw); max-height:85vh;
      display:flex; flex-direction:column; box-shadow:0 20px 45px rgba(0,0,0,0.12);
      overflow:hidden; color:#253041;
    `;

    // Modal header
    const modalHdr = document.createElement('div');
    modalHdr.style.cssText = `
      display:flex; align-items:center; gap:10px; padding:16px 20px;
      border-bottom:1px solid #dfe3ea;
      background:#f8fafc;
    `;
    modalHdr.innerHTML = `
      <span style="font-size:16px;">🔍</span>
      <div style="flex:1;">
        <div style="font-size:13px; font-weight:700; color:#172554;">Code Preview — <code style="color:${levelColor};">${feature}</code></div>
        <div style="font-size:10px; color:#64748b; margin-top:2px;">
          Skill Level: <span style="color:${levelColor}; font-weight:600; text-transform:capitalize;">${level}</span>
        </div>
      </div>
    `;
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      background:#f1f5f9; border:1px solid #dfe3ea;
      color:#475569; border-radius:8px; width:28px; height:28px;
      cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center;
    `;
    closeBtn.addEventListener('click', () => overlay.remove());
    modalHdr.appendChild(closeBtn);

    // Code body
    const codeBody = document.createElement('div');
    codeBody.style.cssText = 'flex:1; overflow-y:auto; padding:16px 20px; background:#f8fafc;';

    // Level badge row
    const badgeRow = document.createElement('div');
    badgeRow.style.cssText = 'display:flex; align-items:center; gap:8px; margin-bottom:12px;';
    badgeRow.innerHTML = `
      <span style="
        font-size:9.5px; font-weight:700; padding:3px 9px; border-radius:99px;
        background:${levelColor}15; color:${levelColor}; border:1px solid ${levelColor}35;
        text-transform:uppercase; letter-spacing:0.5px;
      ">${level} level</span>
      <span style="font-size:10.5px; color:#64748b;">Python code for column: ${feature}</span>
    `;

    const pre = document.createElement('pre');
    pre.style.cssText = `
      background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
      padding:16px 18px; font-size:11.5px; line-height:1.7;
      font-family:ui-monospace,SFMono-Regular,'Cascadia Code',monospace;
      color:#1e293b; overflow-x:auto; margin:0; white-space:pre;
    `;
    pre.textContent = code;

    codeBody.append(badgeRow, pre);

    // Modal footer
    const modalFtr = document.createElement('div');
    modalFtr.style.cssText = `
      display:flex; gap:8px; padding:14px 20px;
      border-top:1px solid #dfe3ea;
      background:#ffffff;
    `;

    const ftrCopy = document.createElement('button');
    ftrCopy.type = 'button';
    ftrCopy.className = 'mm-studio-btn mm-btn-sm';
    ftrCopy.innerHTML = '📋 Copy Code';
    ftrCopy.addEventListener('click', async () => {
      await navigator.clipboard.writeText(code);
      ftrCopy.textContent = 'Copied!';
      setTimeout(() => { ftrCopy.innerHTML = '📋 Copy Code'; }, 1500);
    });

    const ftrInsert = document.createElement('button');
    ftrInsert.type = 'button';
    ftrInsert.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
    ftrInsert.innerHTML = '📥 Insert into Notebook';
    ftrInsert.addEventListener('click', () => {
      const ok = this._insertCodeBelow(code);
      this._showToast(ok ? '✓ Code inserted into notebook!' : 'Please open a notebook first.');
      overlay.remove();
    });

    const ftrClose = document.createElement('button');
    ftrClose.type = 'button';
    ftrClose.className = 'mm-studio-btn mm-btn-sm';
    ftrClose.innerHTML = 'Close';
    ftrClose.addEventListener('click', () => overlay.remove());

    if (this._canUseCodeAction('copy')) {
      modalFtr.append(ftrCopy, ftrInsert);
    }
    modalFtr.append(ftrClose);
    modal.append(modalHdr, codeBody, modalFtr);
    overlay.appendChild(modal);

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  private _renderLivePreview(
    container: HTMLElement,
    preview: PreviewResult,
    recommendation: PreprocessingRec,
    level: 'basic' | 'medium' | 'advanced'
  ): void {
    container.replaceChildren();

    const title = document.createElement('div');
    title.style.cssText = 'font-weight:750; font-size:14px; margin-bottom:12px; color:#166534;';
    title.textContent = `👁️ Live Preview: ${preview.strategy.replace(/_/g, ' ')} on ${preview.feature}`;

    const beforeStats = preview.before.statistics;
    const afterStats = preview.after.statistics;
    const beforeMiss = beforeStats?.missing_count ?? preview.before.missing_count ?? 0;
    const afterMiss = afterStats?.missing_count ?? preview.after.missing_count ?? 0;
    const beforeMean = beforeStats?.mean ?? preview.before.mean;
    const afterMean = afterStats?.mean ?? preview.after.mean;
    const beforeSample = (preview.before as any).sample || preview.before.sample_values || [];
    const afterSample = (preview.after as any).sample || preview.after.sample_values || [];

    const grid = document.createElement('div');
    grid.className = 'mm-studio-stats-grid';
    grid.innerHTML = `
      <div class="mm-stat-box">
        <div class="mm-stat-val" style="color:#dc2626;">${beforeMiss}</div>
        <div class="mm-stat-lbl">Missing Before</div>
      </div>
      <div class="mm-stat-box">
        <div class="mm-stat-val" style="color:#059669;">${afterMiss}</div>
        <div class="mm-stat-lbl">Missing After</div>
      </div>
      ${beforeMean !== undefined ? `
        <div class="mm-stat-box">
          <div class="mm-stat-val">${typeof beforeMean === 'number' ? beforeMean.toFixed(2) : beforeMean}</div>
          <div class="mm-stat-lbl">Mean Before</div>
        </div>
      ` : ''}
      ${afterMean !== undefined ? `
        <div class="mm-stat-box">
          <div class="mm-stat-val">${typeof afterMean === 'number' ? afterMean.toFixed(2) : afterMean}</div>
          <div class="mm-stat-lbl">Mean After</div>
        </div>
      ` : ''}
      ${beforeStats?.skewness !== undefined ? `
        <div class="mm-stat-box">
          <div class="mm-stat-val">${beforeStats.skewness === null ? '—' : beforeStats.skewness.toFixed(2)}</div>
          <div class="mm-stat-lbl">Skewness Before</div>
        </div>
      ` : ''}
      ${afterStats?.skewness !== undefined ? `
        <div class="mm-stat-box">
          <div class="mm-stat-val">${afterStats.skewness === null ? '—' : afterStats.skewness.toFixed(2)}</div>
          <div class="mm-stat-lbl">Skewness After</div>
        </div>
      ` : ''}
    `;

    if (beforeStats?.category_distribution && afterStats?.category_distribution) {
      const beforeDistribution = beforeStats.category_distribution;
      const afterDistribution = afterStats.category_distribution;
      const categories = beforeDistribution.categories;
      const chartTitle = document.createElement('div');
      chartTitle.style.cssText = 'font-size:13px;font-weight:750;margin:14px 0 7px;color:#173b2b;';
      chartTitle.textContent = 'Categorical histogram — frequency before vs after';

      const rowHeight = 32;
      const chartHeight = Math.max(130, 38 + categories.length * rowHeight);
      const chart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      chart.setAttribute('viewBox', `0 0 360 ${chartHeight}`);
      chart.setAttribute('role', 'img');
      chart.setAttribute('aria-label', `Categorical histogram for ${preview.feature} before and after ${preview.strategy} imputation`);
      chart.style.cssText = 'width:100%;height:auto;max-height:260px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;';
      const addSvg = (name: string, attrs: Record<string, string>, text?: string) => {
        const element = document.createElementNS('http://www.w3.org/2000/svg', name);
        Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
        if (text) element.textContent = text;
        chart.appendChild(element);
        return element;
      };
      addSvg('rect', { x: '126', y: '9', width: '9', height: '9', rx: '2', fill: '#6366f1' });
      addSvg('text', { x: '140', y: '17', fill: '#475569', 'font-size': '10' }, `Before (n=${beforeDistribution.sample_count})`);
      addSvg('rect', { x: '244', y: '9', width: '9', height: '9', rx: '2', fill: '#10b981' });
      addSvg('text', { x: '258', y: '17', fill: '#475569', 'font-size': '10' }, `After (n=${afterDistribution.sample_count})`);

      const maxPercentage = Math.max(1, ...beforeDistribution.percentages, ...afterDistribution.percentages);
      const barStart = 128;
      const barMaxWidth = 164;
      const label = (value: string) => value.length > 17 ? `${value.slice(0, 16)}…` : value;
      categories.forEach((category, index) => {
        const y = 27 + index * rowHeight;
        addSvg('text', { x: '8', y: String(y + 15), fill: '#334155', 'font-size': '10' }, label(category));
        addSvg('rect', { x: String(barStart), y: String(y + 1), width: String(barMaxWidth), height: '8', rx: '3', fill: '#eef2ff' });
        addSvg('rect', { x: String(barStart), y: String(y + 12), width: String(barMaxWidth), height: '8', rx: '3', fill: '#ecfdf5' });
        const beforeWidth = beforeDistribution.percentages[index] / maxPercentage * barMaxWidth;
        const afterWidth = afterDistribution.percentages[index] / maxPercentage * barMaxWidth;
        const beforeBar = addSvg('rect', { x: String(barStart), y: String(y + 1), width: beforeWidth.toFixed(2), height: '8', rx: '3', fill: '#6366f1' });
        beforeBar.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'title')).textContent =
          `Before · ${beforeDistribution.counts[index]} rows (${beforeDistribution.percentages[index]}%)`;
        const afterBar = addSvg('rect', { x: String(barStart), y: String(y + 12), width: afterWidth.toFixed(2), height: '8', rx: '3', fill: '#10b981' });
        afterBar.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'title')).textContent =
          `After · ${afterDistribution.counts[index]} rows (${afterDistribution.percentages[index]}%)`;
        addSvg('text', { x: String(barStart + barMaxWidth + 5), y: String(y + 8), fill: '#64748b', 'font-size': '9' }, `${beforeDistribution.percentages[index].toFixed(1)}%`);
        addSvg('text', { x: String(barStart + barMaxWidth + 5), y: String(y + 19), fill: '#64748b', 'font-size': '9' }, `${afterDistribution.percentages[index].toFixed(1)}%`);
      });

      const chartNote = document.createElement('div');
      chartNote.className = 'mm-prep-preview-note';
      chartNote.textContent = categories.includes('Other (remaining)')
        ? 'Bars compare category percentages on a shared scale. The eight most common categories are shown; the remaining categories are grouped as Other.'
        : 'Bars compare category percentages on a shared scale. Percentages use each side’s non-missing row count.';

      const whyBox = document.createElement('div');
      whyBox.className = 'mm-prep-preview-rationale';
      const whyHeading = document.createElement('strong');
      whyHeading.textContent = `✅ Why this ${level} choice? `;
      const whyText = document.createElement('span');
      whyText.textContent = recommendation.why || recommendation.explanation;
      whyBox.append(whyHeading, whyText);
      if (recommendation.imputation_reason) {
        const methodReason = document.createElement('div');
        methodReason.style.cssText = 'margin-top:7px;';
        methodReason.textContent = `Method rationale: ${recommendation.imputation_reason}`;
        whyBox.appendChild(methodReason);
      }
      const previewExplanation = document.createElement('div');
      previewExplanation.className = 'mm-prep-preview-note';
      previewExplanation.textContent = preview.details || (preview as any).explanation || '';
      container.append(title, grid, chartTitle, chart, chartNote, whyBox, previewExplanation);
    } else if (beforeStats?.pdf && afterStats?.pdf) {
      const chartTitle = document.createElement('div');
      chartTitle.style.cssText = 'font-size:13px;font-weight:750;margin:14px 0 7px;color:#173b2b;';
      chartTitle.textContent = 'PDF — empirical probability density (shared bins)';
      const chart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      chart.setAttribute('viewBox', '0 0 360 176');
      chart.setAttribute('role', 'img');
      chart.setAttribute('aria-label', `Probability density plot for ${preview.feature} before and after ${preview.strategy} imputation`);
      chart.style.cssText = 'width:100%;height:auto;max-height:190px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;';

      const edges = beforeStats.pdf.edges;
      const beforeDensity = beforeStats.pdf.density;
      const afterDensity = afterStats.pdf.density;
      const binCount = Math.min(beforeDensity.length, afterDensity.length, Math.max(0, edges.length - 1));
      const maxDensity = Math.max(0, ...beforeDensity.slice(0, binCount), ...afterDensity.slice(0, binCount));
      const left = 42, right = 8, top = 24, plotHeight = 112;
      const plotWidth = 360 - left - right;

      const addSvg = (name: string, attrs: Record<string, string>, text?: string) => {
        const element = document.createElementNS('http://www.w3.org/2000/svg', name);
        Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
        if (text) element.textContent = text;
        chart.appendChild(element);
        return element;
      };

      addSvg('line', { x1: String(left), y1: String(top + plotHeight), x2: String(360 - right), y2: String(top + plotHeight), stroke: '#94a3b8', 'stroke-width': '1' });
      addSvg('line', { x1: String(left), y1: String(top), x2: String(left), y2: String(top + plotHeight), stroke: '#94a3b8', 'stroke-width': '1' });

      if (maxDensity > 0 && binCount > 0) {
        const groupWidth = plotWidth / binCount;
        const barWidth = Math.max(2, groupWidth * 0.39);
        for (let index = 0; index < binCount; index += 1) {
          const x = left + index * groupWidth + groupWidth * 0.08;
          const beforeHeight = beforeDensity[index] / maxDensity * plotHeight;
          const afterHeight = afterDensity[index] / maxDensity * plotHeight;
          const beforeRect = addSvg('rect', {
            x: x.toFixed(2), y: (top + plotHeight - beforeHeight).toFixed(2),
            width: barWidth.toFixed(2), height: Math.max(0.5, beforeHeight).toFixed(2),
            rx: '1', fill: '#6366f1', opacity: '0.78'
          });
          beforeRect.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'title')).textContent =
            `Before · ${beforeStats.pdf.counts[index]} rows · density ${beforeDensity[index]}`;
          const afterRect = addSvg('rect', {
            x: (x + barWidth + groupWidth * 0.06).toFixed(2), y: (top + plotHeight - afterHeight).toFixed(2),
            width: barWidth.toFixed(2), height: Math.max(0.5, afterHeight).toFixed(2),
            rx: '1', fill: '#10b981', opacity: '0.78'
          });
          afterRect.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'title')).textContent =
            `After · ${afterStats.pdf.counts[index]} rows · density ${afterDensity[index]}`;
        }
      }

      addSvg('rect', { x: '48', y: '7', width: '9', height: '9', rx: '2', fill: '#6366f1' });
      addSvg('text', { x: '61', y: '15', fill: '#475569', 'font-size': '9' }, `Before (n=${beforeStats.pdf.sample_count})`);
      addSvg('rect', { x: '166', y: '7', width: '9', height: '9', rx: '2', fill: '#10b981' });
      addSvg('text', { x: '179', y: '15', fill: '#475569', 'font-size': '9' }, `After (n=${afterStats.pdf.sample_count})`);
      addSvg('text', { x: String(left), y: '169', fill: '#64748b', 'font-size': '9' }, String(edges[0]));
      addSvg('text', { x: String(360 - right), y: '169', fill: '#64748b', 'font-size': '9', 'text-anchor': 'end' }, String(edges[edges.length - 1]));

      const chartNote = document.createElement('div');
      chartNote.className = 'mm-prep-preview-note';
      chartNote.textContent = 'This empirical PDF is a density-normalized histogram: bar area represents probability, and total area is approximately 1.';

      let kdeTitle: HTMLDivElement | null = null;
      let kdeChart: SVGSVGElement | null = null;
      let kdeNote: HTMLDivElement | null = null;
      if (recommendation.numeric_kind === 'discrete') {
        kdeNote = document.createElement('div');
        kdeNote.className = 'mm-prep-preview-note';
        kdeNote.textContent = 'KDE is omitted because this is a discrete/count-like feature; smoothing it would imply values between valid counts. The PDF above shows its empirical distribution.';
      } else if (beforeStats.kde && afterStats.kde) {
        kdeTitle = document.createElement('div');
        kdeTitle.style.cssText = 'font-size:13px;font-weight:750;margin:14px 0 7px;color:#173b2b;';
        kdeTitle.textContent = 'KDE — smoothed density estimate (before vs after)';
        kdeChart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        kdeChart.setAttribute('viewBox', '0 0 360 176');
        kdeChart.setAttribute('role', 'img');
        kdeChart.setAttribute('aria-label', `Gaussian KDE plot for ${preview.feature} before and after ${preview.strategy} imputation`);
        kdeChart.style.cssText = 'width:100%;height:auto;max-height:190px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;';
        const kdeX = beforeStats.kde.x;
        const beforeKde = beforeStats.kde.density;
        const afterKde = afterStats.kde.density;
        const pointCount = Math.min(kdeX.length, beforeKde.length, afterKde.length);
        const maxKde = Math.max(0, ...beforeKde.slice(0, pointCount), ...afterKde.slice(0, pointCount));
        const kdeLeft = 42, kdeRight = 8, kdeTop = 24, kdeHeight = 112;
        const kdeWidth = 360 - kdeLeft - kdeRight;
        const addKdeSvg = (name: string, attrs: Record<string, string>, text?: string) => {
          const element = document.createElementNS('http://www.w3.org/2000/svg', name);
          Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
          if (text) element.textContent = text;
          kdeChart?.appendChild(element);
          return element;
        };
        addKdeSvg('line', { x1: String(kdeLeft), y1: String(kdeTop + kdeHeight), x2: String(360 - kdeRight), y2: String(kdeTop + kdeHeight), stroke: '#94a3b8', 'stroke-width': '1' });
        addKdeSvg('line', { x1: String(kdeLeft), y1: String(kdeTop), x2: String(kdeLeft), y2: String(kdeTop + kdeHeight), stroke: '#94a3b8', 'stroke-width': '1' });
        if (maxKde > 0 && pointCount > 1) {
          const makePath = (density: number[]) => density.slice(0, pointCount).map((value, index) => {
            const x = kdeLeft + (index / (pointCount - 1)) * kdeWidth;
            const y = kdeTop + kdeHeight - (value / maxKde) * kdeHeight;
            return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
          }).join(' ');
          addKdeSvg('path', { d: makePath(beforeKde), fill: 'none', stroke: '#6366f1', 'stroke-width': '2.5', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
          addKdeSvg('path', { d: makePath(afterKde), fill: 'none', stroke: '#10b981', 'stroke-width': '2.5', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
        }
        addKdeSvg('line', { x1: '48', y1: '12', x2: '58', y2: '12', stroke: '#6366f1', 'stroke-width': '3' });
        addKdeSvg('text', { x: '62', y: '15', fill: '#475569', 'font-size': '9' }, `Before (n=${beforeStats.kde.sample_count})`);
        addKdeSvg('line', { x1: '166', y1: '12', x2: '176', y2: '12', stroke: '#10b981', 'stroke-width': '3' });
        addKdeSvg('text', { x: '180', y: '15', fill: '#475569', 'font-size': '9' }, `After (n=${afterStats.kde.sample_count})`);
        addKdeSvg('text', { x: String(kdeLeft), y: '169', fill: '#64748b', 'font-size': '9' }, String(kdeX[0]));
        addKdeSvg('text', { x: String(360 - kdeRight), y: '169', fill: '#64748b', 'font-size': '9', 'text-anchor': 'end' }, String(kdeX[pointCount - 1]));
        kdeNote = document.createElement('div');
        kdeNote.className = 'mm-prep-preview-note';
        kdeNote.textContent = `Gaussian KDE with shared bandwidth ${beforeStats.kde.bandwidth ?? '—'}; this is a smoothed estimate, while the PDF above shows binned empirical density.`;
      }

      const whyBox = document.createElement('div');
      whyBox.className = 'mm-prep-preview-rationale';
      const whyHeading = document.createElement('strong');
      whyHeading.textContent = `✅ Why this ${level} choice? `;
      const whyText = document.createElement('span');
      whyText.textContent = recommendation.why || recommendation.explanation;
      whyBox.append(whyHeading, whyText);
      if (recommendation.imputation_reason) {
        const methodReason = document.createElement('div');
        methodReason.style.cssText = 'margin-top:7px;';
        methodReason.textContent = `Method rationale: ${recommendation.imputation_reason}`;
        whyBox.appendChild(methodReason);
      }
      const previewExplanation = document.createElement('div');
      previewExplanation.className = 'mm-prep-preview-note';
      previewExplanation.textContent = preview.details || (preview as any).explanation || '';

      container.append(title, grid, chartTitle, chart, chartNote);
      if (kdeTitle && kdeChart && kdeNote) container.append(kdeTitle, kdeChart, kdeNote);
      else if (kdeNote) container.append(kdeNote);
      container.append(whyBox, previewExplanation);
    }

    // Sample Values Comparison
    const sampleBox = document.createElement('div');
    sampleBox.className = 'mm-prep-sample-box';
    const sampleTitle = document.createElement('div');
    sampleTitle.style.cssText = 'font-size:10px;font-weight:600;margin-bottom:4px;opacity:.8;';
    sampleTitle.textContent = 'Sample values (before vs after):';
    const sampleColumns = document.createElement('div');
    sampleColumns.style.cssText = 'display:flex;gap:10px;font-family:monospace;font-size:10px;';
    const beforeColumn = document.createElement('div');
    beforeColumn.style.flex = '1';
    const beforeLabel = document.createElement('div');
    beforeLabel.style.cssText = 'opacity:.6;margin-bottom:2px;';
    beforeLabel.textContent = 'Before:';
    const beforeValues = document.createElement('div');
    beforeValues.style.color = '#dc2626';
    beforeValues.textContent = beforeSample.slice(0, 5).map((v: any) => v === null ? 'NaN' : typeof v === 'number' ? v.toFixed(1) : String(v)).join(', ');
    beforeColumn.append(beforeLabel, beforeValues);
    const afterColumn = document.createElement('div');
    afterColumn.style.flex = '1';
    const afterLabel = document.createElement('div');
    afterLabel.style.cssText = 'opacity:.6;margin-bottom:2px;';
    afterLabel.textContent = 'After:';
    const afterValues = document.createElement('div');
    afterValues.style.color = '#059669';
    afterValues.textContent = afterSample.slice(0, 5).map((v: any) => v === null ? 'NaN' : typeof v === 'number' ? v.toFixed(1) : String(v)).join(', ');
    afterColumn.append(afterLabel, afterValues);
    sampleColumns.append(beforeColumn, afterColumn);
    sampleBox.append(sampleTitle, sampleColumns);

    if (!(beforeStats?.pdf && afterStats?.pdf)) {
      const reason = document.createElement('div');
      reason.className = 'mm-prep-text';
      reason.textContent = recommendation.why || recommendation.explanation;
      container.append(title, grid, reason, sampleBox);
    } else {
      container.appendChild(sampleBox);
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // VIEW 4.5: 🤖 MODEL ADVISOR
  // ═════════════════════════════════════════════════════════════════
  private _renderModelAdvisorTab(): void {
    if (!this._dataset || !this._dataset.supported) {
      this._contentArea.innerHTML = '<div class="mm-studio-empty">Analyze a dataset first to get model recommendations.</div>';
      return;
    }

    this._contentArea.replaceChildren();
    const frag = document.createDocumentFragment();

    // ── Header ──
    const hdr = document.createElement('div');
    hdr.className = 'mm-studio-section';
    hdr.innerHTML = `
      <div class="mm-studio-sec-title"><span>🤖</span> Intelligent Model Advisor</div>
      <div class="mm-studio-sec-sub">
        ModelMind analyses your dataset's size, feature types, and missing values
        to recommend the best ML models — ranked by suitability score.
      </div>
    `;

    // ── Target column selector ──
    const targetRow = document.createElement('div');
    targetRow.style.cssText = 'display:flex; align-items:center; gap:10px; margin-top:10px;';
    const targetLbl = document.createElement('span');
    targetLbl.style.cssText = 'font-size:11px; opacity:.7; font-weight:600;';
    targetLbl.textContent = '🎯 Target Column:';
    const targetSel = document.createElement('select');
    targetSel.className = 'mm-studio-select mm-select-sm';
    targetSel.style.maxWidth = '200px';
    (this._dataset.column_names ?? []).forEach(col => {
      const opt = document.createElement('option');
      opt.value = col;
      opt.textContent = col;
      if (col === this._targetCol || col === this._dataset!.column_names![this._dataset!.column_names!.length - 1]) opt.selected = true;
      targetSel.appendChild(opt);
    });
    const runBtn = document.createElement('button');
    runBtn.type = 'button';
    runBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-accent';
    runBtn.innerHTML = '🚀 Get Recommendations';
    targetRow.append(targetLbl, targetSel, runBtn);
    targetSel.addEventListener('change', () => {
      this._targetCol = targetSel.value;
    });
    hdr.appendChild(targetRow);
    frag.appendChild(hdr);

    // ── Results container ──

    // Phase 11: opt-in empirical evaluation, separate from heuristic ranking.
    const evaluationPanel = document.createElement('div');
    evaluationPanel.style.cssText =
      'background:#fff;border:1px solid #c7d2fe;border-radius:12px;' +
      'padding:14px;margin-bottom:16px;';

    const evaluationTitle = document.createElement('div');
    evaluationTitle.style.cssText =
      'font-size:14px;font-weight:800;color:#1e293b;margin-bottom:5px;';
    evaluationTitle.textContent = 'Measured Model Performance';

    const evaluationDescription = document.createElement('div');
    evaluationDescription.style.cssText =
      'font-size:11px;color:#64748b;line-height:1.6;margin-bottom:10px;';
    evaluationDescription.textContent =
      'Run real 3-fold cross-validation on your selected dataset. ' +
      'These measured scores are different from the suitability scores ' +
      'shown in the original recommendations below.';

    const evaluationControls = document.createElement('div');
    evaluationControls.style.cssText =
      'display:flex;gap:8px;flex-wrap:wrap;align-items:center;';

    const evaluationButton = document.createElement('button');
    evaluationButton.type = 'button';
    evaluationButton.className = 'mm-studio-btn mm-btn-sm mm-btn-accent';
    evaluationButton.textContent = 'Evaluate Models on My Dataset';

    const evaluationCancel = document.createElement('button');
    evaluationCancel.type = 'button';
    evaluationCancel.className = 'mm-studio-btn mm-btn-sm';
    evaluationCancel.textContent = 'Cancel Evaluation';
    evaluationCancel.disabled = true;

    const evaluationStatus = document.createElement('div');
    evaluationStatus.style.cssText =
      'font-size:11px;color:#475569;margin-top:10px;';
    evaluationStatus.textContent =
      'Evaluation has not started.';

    const evaluationResults = document.createElement('div');
    evaluationResults.style.cssText = 'margin-top:12px;';

    evaluationControls.append(evaluationButton, evaluationCancel);
    evaluationPanel.append(
      evaluationTitle,
      evaluationDescription,
      evaluationControls,
      evaluationStatus,
      evaluationResults
    );
    frag.appendChild(evaluationPanel);

    let activeEvaluationJob: string | null = null;
    let evaluationBusy = false;

    const evaluationSettings =
      this._app.serviceManager.serverSettings;

    const setEvaluationBusy = (busy: boolean): void => {
      evaluationBusy = busy;
      evaluationButton.disabled = busy;
      evaluationCancel.disabled = !busy || !activeEvaluationJob;
    };

    const showMeasuredResults = (
      jobResult: any,
      evaluationJobId: string,
      datasetPath: string,
      targetColumn: string
    ): void => {
      evaluationResults.replaceChildren();
      const evaluation = jobResult?.empirical_evaluation;

      if (!evaluation || evaluation.success !== true) {
        evaluationStatus.textContent =
          'Evaluation did not return a successful comparison.';
        return;
      }

      const metric = String(evaluation.metric ?? 'score');
      const higherIsBetter = evaluation.higher_is_better === true;

      const heading = document.createElement('div');
      heading.style.cssText =
        'font-size:12px;font-weight:700;margin-bottom:8px;';
      heading.textContent =
        `Best measured model: ${String(evaluation.recommended_model ?? 'Unknown')}` +
        ` | ${metric}: ${String(evaluation.recommended_score ?? 'N/A')}`;

      const explanation = document.createElement('div');
      explanation.style.cssText =
        'font-size:10px;color:#64748b;margin-bottom:10px;';
      explanation.textContent =
        `${String(evaluation.cv_folds ?? 3)}-fold cross-validation. ` +
        (higherIsBetter
          ? 'Higher scores are better.'
          : 'Lower scores are better.') +
        ' Results depend on this dataset and are not guarantees.';

      const table = document.createElement('table');
      table.style.cssText =
        'width:100%;border-collapse:collapse;font-size:11px;';

      const header = document.createElement('tr');
      for (const name of [
        'Model', 'Status', 'Mean score', 'Std. dev.', 'Scaler'
      ]) {
        const cell = document.createElement('th');
        cell.textContent = name;
        cell.style.cssText =
          'padding:8px;border-bottom:1px solid #e2e8f0;' +
          'text-align:left;background:#f8fafc;';
        header.appendChild(cell);
      }
      table.appendChild(header);

      const ranking = Array.isArray(evaluation.ranking)
        ? evaluation.ranking
        : [];

      for (const item of ranking) {
        const row = document.createElement('tr');

        const score = typeof item.mean_score === 'number'
          ? item.mean_score.toFixed(4)
          : 'N/A';

        const deviation = typeof item.std_score === 'number'
          ? item.std_score.toFixed(4)
          : 'N/A';

        for (const value of [
          item.model ?? 'Unknown',
          item.status ?? 'Unknown',
          score,
          deviation,
          item.scaler ?? 'None'
        ]) {
          const cell = document.createElement('td');
          cell.textContent = String(value);
          cell.style.cssText =
            'padding:8px;border-bottom:1px solid #e2e8f0;';
          row.appendChild(cell);
        }

        table.appendChild(row);
      }

      evaluationResults.append(heading, explanation, table);

      if (Array.isArray(evaluation.warnings) &&
          evaluation.warnings.length > 0) {
        const warning = document.createElement('div');
        warning.style.cssText =
          'font-size:10px;color:#92400e;margin-top:10px;';
        warning.textContent = evaluation.warnings
          .filter((item: unknown) => typeof item === 'string')
          .join(' ');
        evaluationResults.appendChild(warning);
      }

      const automl = jobResult?.automl_recommendations;
      if (
        automl?.success === true &&
        Array.isArray(automl.recommendations) &&
        evaluation.success === true
      ) {
        this._renderFastTuneTopFive(
          evaluationResults,
          evaluationJobId,
          datasetPath,
          targetColumn,
          automl,
          evaluation
        );
      }
    };

    evaluationCancel.addEventListener('click', async () => {
      if (!activeEvaluationJob) {
        return;
      }

      evaluationCancel.disabled = true;

      try {
        await requestAPI<any>(
          `api/dataset/evaluation-jobs/${activeEvaluationJob}/cancel`,
          evaluationSettings,
          { method: 'POST' }
        );
        evaluationStatus.textContent =
          'Cancellation requested. Waiting for worker to stop...';
      } catch (error) {
        evaluationStatus.textContent =
          `Cancellation request failed: ${String(error)}`;
        evaluationCancel.disabled = false;
      }
    });

    evaluationButton.addEventListener('click', async () => {
      // Do not start two competing evaluations in one panel.
      // The main AutoML loader disables runBtn while active.
      if (evaluationBusy || runBtn.disabled) {
        return;
      }

      const selectedTarget = targetSel.value;
      const selectedPath = this._currentPath;

      if (!selectedPath || !selectedTarget) {
        evaluationStatus.textContent =
          'Select a dataset and target column first.';
        return;
      }

      // Every result belongs to the exact dataset, target
      // and panel from which its evaluation started.
      const isEvaluationCurrent = (): boolean => {
        return (
          evaluationPanel.isConnected &&
          this._activeTab === 'model-advisor' &&
          this._currentPath === selectedPath &&
          targetSel.value === selectedTarget
        );
      };

      evaluationResults.replaceChildren();
      activeEvaluationJob = null;

      setEvaluationBusy(true);
      runBtn.disabled = true;

      evaluationStatus.textContent =
        'Submitting measured model evaluation...';

      let submittedJobId: string | null = null;

      const cancelObsoleteJob = async (): Promise<void> => {
        if (!submittedJobId) {
          return;
        }

        try {
          await requestAPI<any>(
            `api/dataset/evaluation-jobs/${submittedJobId}/cancel`,
            evaluationSettings,
            { method: 'POST' }
          );
        } catch {
          // The job may already be finished or no longer
          // available. The server owns job timeout/cleanup.
        }
      };

      try {
        const submitted = await requestAPI<any>(
          'api/dataset/evaluation-jobs',
          evaluationSettings,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file_path: selectedPath,
              target_col: selectedTarget,
              cv_folds: 3,
              evaluate_scalers: false
            })
          }
        );

        if (typeof submitted.job_id !== 'string' ||
            !submitted.job_id) {
          throw new Error(
            'Evaluation job ID was not returned.'
          );
        }

        submittedJobId = submitted.job_id;
        activeEvaluationJob = submitted.job_id;

        // The panel might have changed while the
        // submission request was in flight.
        if (!isEvaluationCurrent()) {
          await cancelObsoleteJob();
          return;
        }

        evaluationCancel.disabled = false;

        let finished = false;

        for (let attempt = 0; attempt < 180; attempt++) {
          // Check before sending the next HTTP request.
          if (!isEvaluationCurrent()) {
            await cancelObsoleteJob();
            return;
          }

          const job = await requestAPI<any>(
            `api/dataset/evaluation-jobs/${submitted.job_id}`,
            evaluationSettings
          );

          // A dataset, target or navigation change may have
          // happened while the HTTP request was in flight.
          if (!isEvaluationCurrent()) {
            await cancelObsoleteJob();
            return;
          }

          const status = String(job.status ?? 'unknown');

          evaluationStatus.textContent =
            `Dataset target: ${selectedTarget} | Job: ${status}`;

          if (status === 'completed') {
            finished = true;

            // Results are rendered only for the original
            // dataset, target and active Model Advisor panel.
            showMeasuredResults(
              job.result,
              submitted.job_id,
              selectedPath,
              selectedTarget
            );

            break;
          }

          if (
            ['failed', 'cancelled', 'timed_out'].includes(status)
          ) {
            finished = true;

            evaluationStatus.textContent =
              `Evaluation ${status}: ${String(job.error ?? '')}`;

            break;
          }

          await new Promise<void>(resolve => {
            setTimeout(resolve, 1000);
          });
        }

        if (!finished && isEvaluationCurrent()) {
          evaluationStatus.textContent =
            'Still waiting. The evaluation may continue on the server.';
        }

      } catch (error) {
        if (isEvaluationCurrent()) {
          evaluationStatus.textContent =
            `Evaluation error: ${String(error)}`;
        }
      } finally {
        activeEvaluationJob = null;
        setEvaluationBusy(false);
        runBtn.disabled = false;
      }
    });

    const resultsContainer = document.createElement('div');
    frag.appendChild(resultsContainer);
    this._contentArea.appendChild(frag);

    let recommendationBusy = false;

    const loadRecommendations = async () => {
      if (recommendationBusy) {
        return;
      }

      const chosenTarget = targetSel.value;
      const chosenPath = this._currentPath;

      // A recommendation belongs to one dataset and target.
      // Never display it for a different selection or panel.
      const isRequestCurrent = (): boolean => {
        return (
          resultsContainer.isConnected &&
          this._activeTab === 'model-advisor' &&
          this._currentPath === chosenPath &&
          targetSel.value === chosenTarget
        );
      };

      if (!chosenTarget || !chosenPath) {
        resultsContainer.textContent =
          'Select a dataset and target column first.';
        return;
      }

      if (evaluationBusy) {
        resultsContainer.textContent =
          'An evaluation is already running in this panel. ' +
          'Wait for it to finish before requesting recommendations.';
        return;
      }

      recommendationBusy = true;
      runBtn.disabled = true;

      resultsContainer.replaceChildren();

      const statusEl = document.createElement('div');
      statusEl.className = 'mm-studio-loading';
      statusEl.textContent =
        'Starting measured AutoML evaluation...';

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'mm-studio-btn mm-btn-sm';
      cancelBtn.textContent = 'Cancel AutoML';
      cancelBtn.disabled = true;

      resultsContainer.append(statusEl, cancelBtn);

      let jobId: string | null = null;
      let cancellationRequested = false;

      cancelBtn.addEventListener('click', async () => {
        if (!jobId || cancellationRequested) {
          return;
        }

        cancellationRequested = true;
        cancelBtn.disabled = true;
        statusEl.textContent = 'Requesting cancellation...';

        try {
          await requestAPI<any>(
            `api/dataset/evaluation-jobs/${jobId}/cancel`,
            this._app.serviceManager.serverSettings,
            { method: 'POST' }
          );
        } catch (error) {
          cancellationRequested = false;
          cancelBtn.disabled = false;
          statusEl.textContent =
            `Cancellation request failed: ${String(error)}`;
        }
      });

      try {
        const settings = this._app.serviceManager.serverSettings;

        const submitted = await requestAPI<any>(
          'api/dataset/evaluation-jobs',
          settings,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file_path: chosenPath,
              target_col: chosenTarget,
              cv_folds: 3,
              evaluate_scalers: false
            })
          }
        );

        if (typeof submitted.job_id !== 'string') {
          throw new Error('Evaluation job ID is missing.');
        }

        jobId = submitted.job_id;
        cancelBtn.disabled = false;

        if (!isRequestCurrent()) {
          try {
            await requestAPI<any>(
              `api/dataset/evaluation-jobs/${jobId}/cancel`,
              settings,
              { method: 'POST' }
            );
          } catch {
            // The server will still enforce its job timeout.
          }
          return;
        }

        let finished = false;

        for (let attempt = 0; attempt < 180; attempt++) {
          if (!isRequestCurrent()) {
            try {
              await requestAPI<any>(
                `api/dataset/evaluation-jobs/${jobId}/cancel`,
                settings,
                { method: 'POST' }
              );
            } catch {
              // Panel has closed; the server still owns job cleanup.
            }
            return;
          }

          const job = await requestAPI<any>(
            `api/dataset/evaluation-jobs/${jobId}`,
            settings
          );

          // Ignore results belonging to an obsolete selection.
          if (!isRequestCurrent()) {
            try {
              await requestAPI<any>(
                `api/dataset/evaluation-jobs/${jobId}/cancel`,
                settings,
                { method: 'POST' }
              );
            } catch {
              // A completed job cannot necessarily be cancelled.
            }
            return;
          }

          const status = String(job.status ?? 'unknown');

          statusEl.textContent =
            `AutoML: ${status} — comparing regression or ` +
            `classification algorithms using cross-validation.`;

          if (status === 'completed') {
            finished = true;

            const original = job.result;
            const automl = original?.automl_recommendations;

            if (
              !original?.handled ||
              !automl?.success ||
              !Array.isArray(automl.recommendations) ||
              automl.recommendations.length === 0
            ) {
              throw new Error(
                'Completed evaluation has no valid AutoML recommendations.'
              );
            }

            const models = automl.recommendations.map(
              (item: any, index: number) => {
                const rank = Number.isInteger(item.rank)
                  ? item.rank
                  : index + 1;
                const explanation = buildMeasuredModelExplanation({
                  name: String(item.name),
                  task: automl.task,
                  metric: String(item.metric ?? automl.metric ?? 'CV score'),
                  score: item.measured_score,
                  scoreStd: item.std_score,
                  rank,
                  finalistCount: automl.recommendations.length,
                  candidateCount: automl.candidate_count,
                  cvFolds: item.cv_folds ?? automl.cv_folds
                });

                return {
                  name: item.name,
                  rank,
                  medal: rank === 1 ? '🥇' :
                    rank === 2 ? '🥈' :
                    rank === 3 ? '🥉' : '🏅',
                  score: 0,
                  tags: [
                    'Measured CV',
                    automl.task === 'regression'
                      ? 'Regression'
                      : 'Classification'
                  ],
                  why: explanation.why,
                  strengths: explanation.strengths,
                  weaknesses: explanation.weaknesses,
                  best_for: explanation.bestFor,
                  training_speed: explanation.trainingSpeed,
                  complexity: explanation.complexity,
                  interpretability: explanation.interpretability,
                  code: item.code_available ? item.code : '',
                  defaultCode: item.code_available ? item.code : '',
                  automl_measured: true,
                  measured_score: item.measured_score,
                  measured_std: item.std_score,
                  automl_task: automl.task,
                  code_available: item.code_available,
                  code_error: item.code_error
                };
              }
            );

            const rendered = {
              ...original,
              models,
              automl_measured: true,
              automl_candidate_count: automl.candidate_count,
              automl_task: automl.task
            };

            resultsContainer.replaceChildren();
            this._renderModelAdvisorResults(
              resultsContainer,
              rendered
            );

            // Optional Fast Tune. Existing results remain unchanged.
            this._renderFastTuneTopFive(
              resultsContainer,
              jobId!,
              chosenPath,
              chosenTarget,
              automl,
              original.empirical_evaluation,
              models
            );

            break;
          }

          if (
            ['failed', 'cancelled', 'timed_out'].includes(status)
          ) {
            finished = true;
            statusEl.textContent =
              `AutoML ${status}: ${String(job.error ?? '')}`;
            cancelBtn.disabled = true;
            break;
          }

          await new Promise<void>(resolve =>
            setTimeout(resolve, 1000)
          );
        }

        if (!finished) {
          statusEl.textContent =
            'Evaluation is still pending on the server.';
          cancelBtn.disabled = true;
        }

      } catch (error) {
        statusEl.textContent =
          `AutoML failed: ${String(error)}`;
        cancelBtn.disabled = true;
      } finally {
        recommendationBusy = false;
        runBtn.disabled = false;
      }
    };

    runBtn.addEventListener('click', loadRecommendations);
    void loadRecommendations();
  }

  private _renderModelAdvisorResults(container: HTMLElement, res: any): void {
    if (!res.handled) {
      container.innerHTML = `<div class="mm-studio-alert mm-alert-error">${res.error ?? 'Analysis failed.'}</div>`;
      return;
    }

    const frag = document.createDocumentFragment();

    // ── Dataset + Task Summary cards ──
    const summaryGrid = document.createElement('div');
    summaryGrid.style.cssText = 'display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px;';
    const addMeta = (label: string, value: string, color = '#4f46e5') => {
      const card = document.createElement('div');
      card.style.cssText = `
        padding:12px; border-radius:10px; border:1px solid #dfe3ea;
        background:#ffffff; box-shadow:0 1px 3px rgba(31,41,55,0.03);
      `;
      card.innerHTML = `
        <div style="font-size:16px; font-weight:800; color:${color};">${value}</div>
        <div style="font-size:9.5px; color:#5d6b80; text-transform:uppercase; letter-spacing:0.3px; font-weight:600; margin-top:2px;">${label}</div>
      `;
      summaryGrid.appendChild(card);
    };
    addMeta('Rows', res.rows?.toLocaleString() ?? '—');
    addMeta('Features', `${res.n_numeric_features} num · ${res.n_categorical_features} cat`);
    addMeta('Missing Data', res.has_missing ? `${res.missing_pct}%` : 'None', res.has_missing ? '#dc2626' : '#059669');
    frag.appendChild(summaryGrid);

    // ── Task badge ──
    const taskBadge = document.createElement('div');
    taskBadge.style.cssText = `
      padding:10px 14px; border-radius:10px; margin-bottom:16px; font-size:12px; font-weight:600;
      background:${res.task === 'regression' ? '#eef2ff' : '#ecfdf5'};
      border:1px solid ${res.task === 'regression' ? '#c7d2fe' : '#a7f3d0'};
      color:${res.task === 'regression' ? '#4338ca' : '#065f46'};
    `;
    taskBadge.innerHTML = `
      <b>Detected Task:</b> ${res.task_label}
      &nbsp;·&nbsp; <b>Target Column:</b> <code>${res.target_column}</code>
      &nbsp;·&nbsp; <b>Dataset Size:</b> ${res.dataset_size_label}
    `;
    frag.appendChild(taskBadge);

    if (res.target_encoding === 'LabelEncoder') {
      const encodingNotice = document.createElement('div');
      encodingNotice.className = 'mm-studio-alert mm-alert-info';
      encodingNotice.style.marginBottom = '16px';
      encodingNotice.textContent =
        'LabelEncoder is included in the generated classification code: target categories are encoded for training, the code prints the label-to-number mapping, and predictions are converted back to the original category names. The source CSV is not changed.';
      frag.appendChild(encodingNotice);
    }

    // ── Section title ──
    const secTitle = document.createElement('div');
    secTitle.style.cssText = 'font-size:13px; font-weight:700; margin-bottom:12px; color:#1e293b;';
    secTitle.innerHTML = `🏆 Ranked Model Recommendations <span style="color:#64748b; font-weight:400; font-size:11px;">(${res.models?.length ?? 0} models analysed)</span>`;
    if (res.automl_measured) {
      secTitle.textContent =
        `Measured AutoML Rankings (${res.models.length} finalists ` +
        `from ${res.automl_candidate_count ?? 'multiple'} candidates)`;
    }
    frag.appendChild(secTitle);

    // ── Model cards ──
    (res.models ?? []).forEach((model: any) => {
      frag.appendChild(this._buildModelCard(model, res.target_column));
    });

    container.appendChild(frag);
  }


  /**
   * Optional Fast Tune Top 5.
   *
   * Runs only after a completed AutoML evaluation and only
   * when the student explicitly clicks the tuning button.
   *
   * No changes to Model Advisor ranking or existing cards.
   */
  private _renderFastTuneTopFive(
    container: HTMLElement,
    evaluationJobId: string,
    datasetPath: string,
    targetColumn: string,
    automl: any,
    empirical: any,
    advisorModels: IAdvisorModelCode[] = []
  ): void {
    const recommendations = automl?.recommendations;
    const featureColumns = empirical?.features;
    const task = empirical?.task;

    if (
      !Array.isArray(recommendations) ||
      recommendations.length < 1 ||
      recommendations.length > 5 ||
      !Array.isArray(featureColumns) ||
      featureColumns.length === 0 ||
      !['classification', 'regression'].includes(task)
    ) {
      return;
    }

    const names = recommendations.map(
      (item: any) => item.name
    );

    if (
      !names.every((name: unknown) =>
        typeof name === 'string' && name.length > 0
      )
    ) {
      return;
    }

    const section = document.createElement('section');
    section.className = 'mm-studio-section';
    section.style.cssText =
      'margin-top:18px;padding:16px;border:1px solid #c7d2fe;' +
      'border-radius:12px;background:#f8faff;';

    const heading = document.createElement('div');
    heading.style.cssText =
      'font-size:15px;font-weight:800;color:#1e293b;';
    heading.textContent = 'Fast Hyperparameter Tuning';

    const explanation = document.createElement('p');
    explanation.style.cssText =
      'font-size:12px;line-height:1.6;color:#475569;' +
      'margin:8px 0 12px;';
    explanation.textContent =
      'Search important parameters for your measured Top 5. ' +
      'Basic tests fewer configurations. Advanced explores ' +
      'more important settings. Only useful changes are shown.';

    const modeRow = document.createElement('div');
    modeRow.style.cssText =
      'display:flex;gap:8px;align-items:center;margin-bottom:10px;';

    const modeLabel = document.createElement('label');
    modeLabel.textContent = 'Tuning level:';
    modeLabel.style.cssText =
      'font-size:12px;font-weight:700;color:#334155;';

    const modeSelect = document.createElement('select');
    modeSelect.className = 'mm-studio-select';

    (['basic', 'advanced'] as const).forEach(level => {
      const option = document.createElement('option');
      option.value = level;
      option.textContent =
        level === 'basic' ? 'Basic' : 'Advanced';
      modeSelect.appendChild(option);
    });

    modeRow.append(modeLabel, modeSelect);

    const modeHelp = document.createElement('div');
    modeHelp.style.cssText =
      'font-size:11px;color:#64748b;margin-bottom:10px;';

    const updateModeHelp = () => {
      modeHelp.textContent = modeSelect.value === 'advanced'
        ? 'Advanced: up to 20 configurations per model. ' +
          'More exploration; time limit may stop the search.'
        : 'Basic: up to 8 configurations per model. ' +
          'Focuses on high-impact hyperparameters.';
    };

    modeSelect.addEventListener('change', updateModeHelp);
    updateModeHelp();

    const buttonRow = document.createElement('div');
    buttonRow.style.cssText =
      'display:flex;gap:8px;flex-wrap:wrap;';

    const tuneButton = document.createElement('button');
    tuneButton.type = 'button';
    tuneButton.className =
      'mm-studio-btn mm-btn-sm mm-btn-primary';
    tuneButton.textContent = '⚡ Fast Tune Top 5';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'mm-studio-btn mm-btn-sm';
    cancelButton.textContent = 'Cancel Tuning';
    cancelButton.disabled = true;
    cancelButton.style.display = 'none';

    const status = document.createElement('div');
    status.setAttribute('role', 'status');
    status.style.cssText =
      'font-size:12px;color:#475569;margin-top:10px;';
    status.textContent = 'Tuning has not started.';

    const output = document.createElement('div');
    output.style.cssText = 'margin-top:12px;';

    buttonRow.append(tuneButton, cancelButton);
    section.append(
      heading,
      explanation,
      modeRow,
      modeHelp,
      buttonRow,
      status,
      output
    );
    container.appendChild(section);

    let activeJobId: string | null = null;
    let busy = false;

    const isCurrent = () =>
      section.isConnected &&
      this._activeTab === 'model-advisor' &&
      this._currentPath === datasetPath &&
      this._targetCol === targetColumn;

    const settings = this._app.serviceManager.serverSettings;

    const printResult = (result: any) => {
      output.replaceChildren();

      const title = document.createElement('div');
      title.style.cssText =
        'font-size:13px;font-weight:800;margin-bottom:8px;';
      title.textContent = 'Tuned Models — Tested Results';
      output.appendChild(title);

      const note = document.createElement('p');
      note.style.cssText =
        'font-size:11px;color:#64748b;line-height:1.5;';
      note.textContent =
        `Uses the Model Advisor metric (${String(result?.metric ?? 'CV score')}), ` +
        `${String(result?.cv_folds ?? 'matching')} CV folds and its evaluated ` +
        'dataset sample, so default scores are directly comparable to ' +
        'the original finalists. Parameter selection can still overfit CV; ' +
        'confirm a final model on a separate test set before deployment.';
      output.appendChild(note);

      const results = Array.isArray(result?.results)
        ? result.results
        : [];
      const rankedResults = Array.isArray(result?.ranking)
        ? result.ranking
        : results;
      const rankedNames = new Set(
        rankedResults.map((item: any) => item?.model)
      );
      const ranking = [
        ...rankedResults,
        ...results.filter((item: any) => !rankedNames.has(item?.model))
      ];

      if (!ranking.length) {
        const message = document.createElement('pre');
        message.style.cssText =
          'font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere;';
        message.textContent = JSON.stringify(result, null, 2);
        output.appendChild(message);
        return;
      }


      const formattedScore = (item: any): string => {
        const raw =
          item?.best_score ??
          item?.mean_score ??
          item?.score ??
          item?.best?.score;

        if (typeof raw !== 'number' || !Number.isFinite(raw)) {
          return 'No valid CV score';
        }

        if (task === 'regression') {
          return `RMSE: ${Math.abs(raw).toFixed(4)} (lower is better)`;
        }

        const label = String(result?.metric ?? 'Accuracy');

        if (/accuracy|f1|precision|recall|roc.?auc/i.test(label)) {
          return `${label}: ${(raw * 100).toFixed(2)}%`;
        }

        return `${label}: ${raw.toFixed(4)}`;
      };

      const formatValue = (value: unknown): string => {
        if (value === null) return 'None';
        if (typeof value === 'string') return value;
        return JSON.stringify(value);
      };

      ranking.forEach((item: any, index: number) => {
        const card = document.createElement('div');
        card.style.cssText =
          'padding:12px;margin:8px 0;' +
          'border:1px solid #e2e8f0;' +
          'border-radius:10px;background:#fff;';

        const name = document.createElement('div');
        name.style.cssText =
          'font-size:13px;font-weight:700;color:#0f172a;';

        const modelName = String(
          item?.model ?? item?.name ?? 'Model'
        );

        name.textContent = `${index + 1}. ${modelName}`;

        const score = document.createElement('div');
        score.style.cssText =
          'font-size:12px;font-weight:600;' +
          'color:#059669;margin-top:6px;';
        score.textContent = formattedScore(item);


        const parameterText = document.createElement('div');
        parameterText.style.cssText =
          'font-size:11px;color:#475569;margin-top:7px;line-height:1.6;';

        const recommendations = Array.isArray(
          item?.recommended_changes
        ) ? item.recommended_changes : [];

        const params =
          item?.best_params &&
          typeof item.best_params === 'object' &&
          !Array.isArray(item.best_params)
            ? item.best_params as Record<string, unknown>
            : {};

        if (
          recommendations.length > 0 ||
          Object.keys(params).length > 0
        ) {
          const heading = document.createElement('div');
          heading.style.fontWeight = '700';
          heading.textContent = item?.completed === false
            ? 'Promising changes found (search incomplete):'
            : 'Recommended parameter changes:';
          parameterText.appendChild(heading);

          if (recommendations.length > 0) {
            recommendations.forEach((rec: any) => {
              const row = document.createElement('div');
              row.textContent =
                `${String(rec.parameter)}: ` +
                `${formatValue(rec.default)} → ` +
                `${formatValue(rec.recommended)}`;
              parameterText.appendChild(row);
              const reason = document.createElement('div');
              reason.style.cssText =
                'font-size:10px;color:#64748b;margin:0 0 4px 8px;';
              reason.textContent = explainTuningParameter(
                String(rec.parameter)
              );
              parameterText.appendChild(reason);
            });
          } else {
            Object.entries(params).forEach(([key, value]) => {
              const row = document.createElement('div');
              row.textContent =
                `${key}: ${formatValue(value)}`;
              parameterText.appendChild(row);
            });
          }
        } else {
          const state = String(
            item?.recommendation_status ?? ''
          );

          if (state === 'partial_defaults_recommended') {
            parameterText.textContent =
              'Defaults are the best-supported choice so far. ' +
              'The baseline settings are kept; the search is incomplete, ' +
              'so untested configurations could differ.';
          } else if (state === 'insufficient_validation') {
            parameterText.textContent =
              'No parameter changes recommended: the evaluation had fewer ' +
              'than three CV folds, which is not enough to assess tuning ' +
              'improvements reliably.';
          } else if (state === 'partial_parameter_changes') {
            parameterText.textContent =
              'Promising changes found, but the search is incomplete.';
          } else if (state === 'defaults_recommended') {
            parameterText.textContent =
              'Default parameters are the best-supported choice: no tested ' +
              'alternative beat the baseline by a meaningful, consistent ' +
              'margin on the same CV folds.';
          } else if (state === 'baseline_unavailable') {
            parameterText.textContent =
              'The default baseline was unavailable. ' +
              'No parameter changes can be recommended reliably.';
          } else if (
            state === 'no_valid_configuration' ||
            item?.status === 'failed'
          ) {
            parameterText.textContent =
              'No valid configuration was evaluated.';
          } else {
            parameterText.textContent =
              'No parameter changes recommended.';
          }
        }

        const baseline = item?.baseline_score;
        const bestTested = item?.best_tested_score;

        if (
          typeof baseline === 'number' &&
          Number.isFinite(baseline) &&
          typeof bestTested === 'number' &&
          Number.isFinite(bestTested)
        ) {
          const comparison = document.createElement('div');
          comparison.style.cssText =
            'font-size:10px;color:#64748b;margin-top:6px;';
          const selectedScore = item?.best_score;
          const selectedText =
            typeof selectedScore === 'number' &&
            Number.isFinite(selectedScore)
              ? ` • Recommended CV: ${formattedScore(item)}`
              : '';
          comparison.textContent =
            `Default CV: ${formattedScore({ best_score: baseline })} • ` +
            `Best tested CV: ${formattedScore({ best_score: bestTested })}` +
            selectedText;
          parameterText.appendChild(comparison);

          const improvement = item?.improvement_over_default;
          if (
            typeof improvement === 'number' &&
            Number.isFinite(improvement)
          ) {
            const gain = document.createElement('div');
            gain.style.cssText =
              'font-size:10px;color:#475569;margin-top:4px;';
            gain.textContent = task === 'classification'
              ? `Best tested change vs. default: ${(improvement * 100).toFixed(2)} percentage points in ${String(result?.metric ?? 'CV score')}.`
              : `Best tested RMSE change vs. default: ${improvement.toFixed(4)} lower is better.`;
            parameterText.appendChild(gain);
          }
        }

        const testedCount = item?.configurations_tested;
        const plannedCount = item?.configurations_planned;

        if (
          typeof testedCount === 'number' &&
          typeof plannedCount === 'number' &&
          plannedCount > 0
        ) {
          const progress = document.createElement('div');
          progress.style.cssText =
            'font-size:11px;color:#475569;margin-top:7px;';
          progress.textContent =
            `Configurations tested: ${testedCount}/${plannedCount}`;
          parameterText.appendChild(progress);
        }

        if (item?.completed === false) {
          const warning = document.createElement('div');
          warning.style.cssText =
            'font-size:11px;color:#b45309;margin-top:6px;';
          warning.textContent =
            'Partial search: not all configurations were tested.';
          parameterText.appendChild(warning);
        }

        const recommendationReason = document.createElement('div');
        recommendationReason.style.cssText =
          'font-size:10.5px;color:#334155;margin-top:7px;line-height:1.5;';
        const recommendationStatus = String(
          item?.recommendation_status ?? ''
        );
        if (
          recommendationStatus === 'parameter_changes_recommended' ||
          recommendationStatus === 'partial_parameter_changes'
        ) {
          recommendationReason.textContent =
            'Why these settings: this tested configuration was better than the default on the same CV folds and cleared the practical-gain and fold-consistency checks.' +
            (item?.completed === false
              ? ' The search is incomplete, so treat this as provisional.'
              : '');
        } else if (
          recommendationStatus === 'defaults_recommended' ||
          recommendationStatus === 'partial_defaults_recommended'
        ) {
          recommendationReason.textContent =
            'Why keep defaults: the baseline is the best-supported configuration. No tested alternative showed a sufficiently large, consistent improvement across the same CV folds.' +
            (item?.completed === false
              ? ' The search is incomplete; untested settings may differ.'
              : '');
        } else if (recommendationStatus === 'insufficient_validation') {
          recommendationReason.textContent =
            'Why no tuning change: too few CV folds were available to distinguish a real gain from fold-to-fold variation.';
        } else if (recommendationStatus === 'baseline_unavailable') {
          recommendationReason.textContent =
            'Why no tuning change: without a valid default baseline, a fair parameter comparison is not possible.';
        }
        if (recommendationReason.textContent) {
          parameterText.appendChild(recommendationReason);
        }

        if (typeof item?.code === 'string' && item.code.trim()) {
          const tunedCode = item.code;
          const hasRecommendedChanges = Object.keys(params).length > 0;
          const codeNotice = document.createElement('div');
          codeNotice.style.cssText =
            'font-size:10.5px;color:#047857;margin-top:6px;font-weight:600;display:flex;align-items:center;gap:4px;';
          codeNotice.textContent = hasRecommendedChanges
            ? 'CV-selected parameter values are applied in this code. The Model Advisor card keeps its baseline code separately.'
            : 'Defaults are the best-supported choice. This inserts the same default estimator settings as the baseline code; no parameter change passed the CV checks.';
          parameterText.appendChild(codeNotice);

          const actionRow = document.createElement('div');
          actionRow.style.cssText =
            'display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;';

          const insertTunedBtn = document.createElement('button');
          insertTunedBtn.type = 'button';
          insertTunedBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
          insertTunedBtn.style.cssText = 'background:#059669;border-color:#047857;color:#fff;font-weight:600;';
          insertTunedBtn.textContent =
            hasRecommendedChanges
              ? '📥 Insert CV-Selected Code'
              : '📥 Insert Default Code';
          insertTunedBtn.addEventListener('click', () => {
            const ok = this._insertCodeBelow(tunedCode);
            this._showToast(ok ? `✓ CV-selected ${modelName} code inserted into notebook!` : 'Open a notebook first.');
          });

          const copyTunedBtn = document.createElement('button');
          copyTunedBtn.type = 'button';
          copyTunedBtn.className = 'mm-studio-btn mm-btn-sm';
          copyTunedBtn.innerHTML = '📋 Copy Code';
          copyTunedBtn.addEventListener('click', async () => {
            await navigator.clipboard.writeText(tunedCode);
            copyTunedBtn.textContent = 'Copied!';
            setTimeout(() => { copyTunedBtn.innerHTML = '📋 Copy Code'; }, 1500);
          });

          const previewTunedBtn = document.createElement('button');
          previewTunedBtn.type = 'button';
          previewTunedBtn.className = 'mm-studio-btn mm-btn-sm';
          previewTunedBtn.innerHTML = '🔍 Preview Code';
          previewTunedBtn.addEventListener('click', () => {
            this._showCodePreviewModal(modelName + ' (Tuned)', tunedCode, 'advanced');
          });

          if (!this._canUseCodeAction('insert')) {
            actionRow.append(previewTunedBtn);
          } else {
            actionRow.append(insertTunedBtn, copyTunedBtn, previewTunedBtn);
          }
          card.appendChild(actionRow);
        } else if (typeof item?.code_error === 'string') {
          const codeWarning = document.createElement('div');
          codeWarning.style.cssText =
            'font-size:10px;color:#b45309;margin-top:6px;';
          codeWarning.textContent =
            `Could not synchronize generated code: ${item.code_error}`;
          parameterText.appendChild(codeWarning);
        }

        const details = document.createElement('details');
        details.style.cssText =
          'margin-top:9px;font-size:11px;color:#475569;';

        const summary = document.createElement('summary');
        summary.textContent = 'Advanced Details';
        summary.style.cssText =
          'cursor:pointer;font-weight:600;color:#4338ca;';

        const technical = document.createElement('pre');
        technical.style.cssText =
          'margin:8px 0 0;padding:9px;' +
          'background:#f8fafc;border-radius:8px;' +
          'white-space:pre-wrap;overflow-wrap:anywhere;' +
          'font-size:10px;';

        const technicalResult = { ...item };
        delete technicalResult.code;
        technical.textContent = JSON.stringify(
          technicalResult,
          null,
          2
        );

        details.append(summary, technical);
        card.append(name, score, parameterText, details);
        output.appendChild(card);
      });
    };

    cancelButton.addEventListener('click', async () => {
      if (!activeJobId) return;

      cancelButton.disabled = true;
      status.textContent = 'Cancellation requested...';

      try {
        await requestAPI<any>(
          `api/dataset/tuning-jobs/${activeJobId}/cancel`,
          settings,
          { method: 'POST' }
        );
      } catch (error) {
        status.textContent =
          `Cancellation request failed: ${String(error)}`;
        cancelButton.disabled = false;
      }
    });

    tuneButton.addEventListener('click', async () => {
      if (busy || !isCurrent()) return;

      busy = true;
      activeJobId = null;
      tuneButton.disabled = true;
      cancelButton.disabled = true;
      cancelButton.style.display = 'none';
      output.replaceChildren();
      modeSelect.disabled = true;
      const chosenLevel = modeSelect.value as 'basic' | 'advanced';
      status.textContent = `Submitting ${chosenLevel} tuning for Top 5...`;

      try {
        const submitted = await requestAPI<any>(
          'api/dataset/tuning-jobs',
          settings,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              evaluation_job_id: evaluationJobId,
              file_path: datasetPath,
              target_column: targetColumn,
              feature_columns: featureColumns,
              task,
              model_names: names,
              time_budget_seconds: chosenLevel === 'advanced' ? 120 : 60,
              level: chosenLevel
            })
          }
        );

        if (typeof submitted?.job_id !== 'string') {
          throw new Error('Tuning job ID is missing.');
        }

        activeJobId = submitted.job_id;
        cancelButton.disabled = false;
        cancelButton.style.display = 'inline-flex';

        let terminal = false;

        for (let attempt = 0; attempt < 240; attempt++) {
          if (!isCurrent()) {
            status.textContent =
              'Panel changed. Tuning continues on the server ' +
              'unless it is cancelled or reaches its timeout.';
            break;
          }

          const job = await requestAPI<any>(
            `api/dataset/tuning-jobs/${activeJobId}`,
            settings
          );

          const jobStatus = String(job?.status ?? 'unknown');

          status.textContent = `Fast tuning: ${jobStatus}`;

          if (jobStatus === 'completed') {
            terminal = true;
            resetTunedModelCode(advisorModels);
            printResult(job.result);
            const codeSync = applyTunedModelCode(
              advisorModels,
              job.result?.results
            );
            status.textContent =
              `Tuning finished: ${String(job.result?.models_completed ?? 0)}/` +
              `${names.length} models fully searched.` +
              (job.result?.timed_out ? ' Time budget reached.' : '') +
              ` ${codeSync.updated} Model Advisor card(s) now have CV-checked code.` +
              ' Only changes with a meaningful, consistent CV gain replace defaults; holdout accuracy can still differ.';
            break;
          }

          if (
            ['failed', 'cancelled', 'timed_out'].includes(jobStatus)
          ) {
            terminal = true;
            status.textContent =
              `Fast tuning ${jobStatus}: ` +
              String(job?.error ?? '');
            break;
          }

          await new Promise<void>(resolve =>
            setTimeout(resolve, 1000)
          );
        }

        if (!terminal && isCurrent()) {
          status.textContent =
            'Tuning is taking longer than expected. ' +
            'Check the job status before starting another run.';
        }
      } catch (error) {
        if (isCurrent()) {
          status.textContent =
            `Fast Tune error: ${String(error)}`;
        }
      } finally {
        busy = false;
        modeSelect.disabled = false;
        tuneButton.disabled = !isCurrent();
        cancelButton.disabled = true;
        cancelButton.style.display = 'none';
      }
    });
  }

  private _buildModelCard(model: any, targetCol: string): HTMLElement {
    // ── Preserve baseline code at card build time ──
    // defaultCode is the ORIGINAL code from the API — never overwritten by tuning.
    // This must be set before any tuning occurs so getBaselineCode() always returns
    // the clean pre-tuning version regardless of what happens to model.code later.
    if (typeof model.defaultCode !== 'string' || !model.defaultCode.trim()) {
      model.defaultCode = typeof model.code === 'string' ? model.code : '';
    }

    const getBaselineCode = (): string => {
      const src = (typeof model.defaultCode === 'string' && model.defaultCode.trim())
        ? model.defaultCode
        : model.code;
      return typeof src === 'string' ? removeModelAdvisorRaiseGuards(src) : '';
    };

    const getTunedCode = (): string => {
      const src = (typeof model.tuned_code === 'string' && model.tuned_code.trim())
        ? model.tuned_code
        : (typeof model.code === 'string' ? model.code : model.defaultCode);
      return typeof src === 'string' ? removeModelAdvisorRaiseGuards(src) : '';
    };

    // The Model Advisor card always provides the clean baseline model code without tuning
    const getModelCode = (): string => getBaselineCode();
    const rankColors: Record<number, { bg: string; border: string; text: string }> = {
      1: { bg: '#fef3c7', border: '#fde68a', text: '#b45309' },
      2: { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' },
      3: { bg: '#ffedd5', border: '#fed7aa', text: '#c2410c' }
    };
    const rankStyle = rankColors[model.rank] ?? { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' };
    const scoreColor = model.score >= 85 ? '#059669' : model.score >= 70 ? '#d97706' : '#dc2626';

    const card = document.createElement('div');
    card.style.cssText = `
      border:1px solid ${model.rank === 1 ? '#fde047' : '#dfe3ea'};
      border-radius:12px; padding:16px; margin-bottom:12px;
      background:${model.rank === 1 ? '#fffdf0' : '#ffffff'};
      box-shadow: 0 1px 3px rgba(31, 41, 55, 0.04);
      position:relative;
    `;

    // ── Card header ──
    const cardHdr = document.createElement('div');
    cardHdr.style.cssText = 'display:flex; align-items:center; gap:10px; margin-bottom:12px;';
    cardHdr.innerHTML = `
      <span style="font-size:22px; line-height:1;">${model.medal}</span>
      <div style="flex:1;">
        <div style="font-size:14px; font-weight:800; display:flex; align-items:center; gap:8px; color:#1e293b;">
          ${model.name}
          ${model.rank <= 3 ? `<span style="font-size:9px; padding:2px 8px; border-radius:99px; background:${rankStyle.bg}; color:${rankStyle.text}; border:1px solid ${rankStyle.border}; font-weight:700;">RANK #${model.rank}</span>` : ''}
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:5px;">
          ${(model.tags ?? []).map((t: string) => `<span style="font-size:9px; font-weight:600; padding:2px 8px; border-radius:99px; background:#eef2ff; border:1px solid #c7d2fe; color:#4338ca;">${t}</span>`).join('')}
        </div>
      </div>
      <div style="text-align:right; flex-shrink:0;">
        <div style="font-size:22px; font-weight:900; color:${scoreColor}; line-height:1;">${model.score}</div>
        <div style="font-size:9px; color:#64748b; font-weight:600;">/ 100</div>
      </div>
    `;
    card.appendChild(cardHdr);

    if (model.automl_measured) {
      const scoreBox = cardHdr.lastElementChild as HTMLElement | null;

      if (scoreBox) {
        scoreBox.replaceChildren();

        const score = document.createElement('div');
        score.style.cssText =
          'font-size:19px;font-weight:900;color:#059669;';

        const value = Number(model.measured_score);
        const isRegression = model.automl_task === 'regression';

        score.textContent = Number.isFinite(value)
          ? isRegression
            ? value.toFixed(4)
            : `${(value * 100).toFixed(2)}%`
          : 'N/A';

        const metric = document.createElement('div');
        metric.style.cssText =
          'font-size:10px;color:#64748b;font-weight:600;';
        metric.textContent = isRegression
          ? 'CV RMSE (lower is better)'
          : 'CV balanced accuracy';

        scoreBox.append(score, metric);
      }
    }


    // ── Score bar ──
    const barWrap = document.createElement('div');
    barWrap.style.cssText = 'height:6px; border-radius:99px; background:#e2e8f0; margin-bottom:12px; overflow:hidden;';
    const barFill = document.createElement('div');
    barFill.style.cssText = `height:100%; width:${model.score}%; border-radius:99px; background:linear-gradient(90deg, ${scoreColor}aa, ${scoreColor});`;
    barWrap.appendChild(barFill);
    if (!model.automl_measured) {
      card.appendChild(barWrap);
    }

    // ── Why recommended ──
    const whyEl = document.createElement('div');
    whyEl.style.cssText = `
      font-size:11.5px; padding:10px 12px; border-radius:8px; margin-bottom:10px;
      background:#f0fdf4; border:1px solid #bbf7d0; color:#14532d; line-height:1.6; font-weight:500;
    `;
    whyEl.innerHTML = `<b style="color:#15803d; font-weight:700;">✅ Why this model:</b> <span style="color:#166534;">${model.why}</span>`;
    card.appendChild(whyEl);
    // ModelMind: optional ML dependency availability.
    // Keep model rank, score, code actions and existing UI unchanged.
    const dependency = model.dependency_status;

    if (
      dependency &&
      dependency.available === false &&
      typeof dependency.optional_dependency === 'string'
    ) {
      const warning = document.createElement('div');

      warning.style.cssText = `
        padding:10px 12px;
        margin-bottom:10px;
        border-radius:8px;
        background:#fff7ed;
        border:1px solid #fed7aa;
        color:#9a3412;
        font-size:11px;
        line-height:1.6;
      `;

      const heading = document.createElement('div');
      heading.style.fontWeight = '700';
      heading.textContent = 'Optional ML package unavailable';

      const message = document.createElement('div');
      message.textContent =
        typeof dependency.message === 'string'
          ? dependency.message
          : 'This model requires an additional Python package.';

      const kernelNote = document.createElement('div');
      kernelNote.style.marginTop = '4px';
      kernelNote.textContent =
        'Availability is checked on the ModelMind server. ' +
        'Your notebook kernel may use a different environment.';

      warning.appendChild(heading);
      warning.appendChild(message);
      warning.appendChild(kernelNote);

      if (
        Array.isArray(dependency.alternatives) &&
        dependency.alternatives.length > 0
      ) {
        const alternatives = document.createElement('div');
        alternatives.style.marginTop = '6px';

        alternatives.textContent =
          'Available-library alternatives to consider: ' +
          dependency.alternatives
            .filter((name: unknown) => typeof name === 'string')
            .join(', ');

        warning.appendChild(alternatives);
      }

      card.appendChild(warning);
    }


    // ── Meta grid: speed, complexity, interpretability ──
    const metaGrid = document.createElement('div');
    metaGrid.style.cssText = 'display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:10px;';
    [
      ['Training Speed', model.training_speed ?? '—'],
      ['Complexity', model.complexity ?? '—'],
      ['Interpretability', model.interpretability ?? '—'],
    ].forEach(([lbl, val]) => {
      const box = document.createElement('div');
      box.style.cssText = 'padding:8px 10px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; font-size:10px;';
      box.innerHTML = `<div style="color:#64748b; font-size:9px; font-weight:600; text-transform:uppercase; margin-bottom:3px;">${lbl}</div><div style="font-weight:700; color:#0f172a;">${val}</div>`;
      metaGrid.appendChild(box);
    });
    card.appendChild(metaGrid);

    // ── Strengths & Weaknesses ──
    const swGrid = document.createElement('div');
    swGrid.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;';

    const strengthBox = document.createElement('div');
    strengthBox.style.cssText = 'padding:10px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0;';
    strengthBox.innerHTML = `
      <div style="font-size:10.5px; font-weight:700; color:#15803d; margin-bottom:6px;">✅ Strengths</div>
      ${(model.strengths ?? []).map((s: string) => `<div style="font-size:10px; color:#166534; margin-bottom:3px; line-height:1.4;">• ${s}</div>`).join('')}
    `;

    const weakBox = document.createElement('div');
    weakBox.style.cssText = 'padding:10px; border-radius:8px; background:#fef2f2; border:1px solid #fecaca;';
    weakBox.innerHTML = `
      <div style="font-size:10.5px; font-weight:700; color:#b91c1c; margin-bottom:6px;">⚠️ Weaknesses</div>
      ${(model.weaknesses ?? []).map((w: string) => `<div style="font-size:10px; color:#991b1b; margin-bottom:3px; line-height:1.4;">• ${w}</div>`).join('')}
    `;

    swGrid.append(strengthBox, weakBox);
    card.appendChild(swGrid);

    // ── Best for ──
    const bestFor = document.createElement('div');
    bestFor.style.cssText = 'font-size:11px; color:#475569; margin-bottom:12px; padding:7px 10px; border-radius:6px; background:#f8fafc; border:1px solid #e2e8f0; line-height:1.4;';
    bestFor.innerHTML = `<b style="color:#1e293b;">Best for:</b> ${model.best_for}`;
    card.appendChild(bestFor);

    // ── Code preview (collapsed by default) ──
    const codeSection = document.createElement('div');
    let codeVisible = false;
    const codeToggleBtn = document.createElement('button');
    codeToggleBtn.type = 'button';
    codeToggleBtn.className = 'mm-studio-btn mm-btn-sm';
    codeToggleBtn.innerHTML = '📄 Show Full Code';

    const codePre = document.createElement('pre');
    codePre.style.cssText = `
      background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
      padding:14px 16px; font-size:10.5px; line-height:1.7;
      font-family:ui-monospace,SFMono-Regular,'Cascadia Code',monospace;
      color:#1e293b; overflow-x:auto; margin:8px 0 0 0; white-space:pre; display:none;
    `;
    codePre.textContent = getModelCode() || '# No code available';

    codeToggleBtn.addEventListener('click', () => {
      codeVisible = !codeVisible;
      codePre.textContent = getModelCode() || '# No code available';
      codePre.style.display = codeVisible ? 'block' : 'none';
      codeToggleBtn.innerHTML = codeVisible ? '🔼 Hide Code' : '📄 Show Full Code';
    });

    codeSection.appendChild(codeToggleBtn);
    codeSection.appendChild(codePre);
    card.appendChild(codeSection);

    // ── Tuned Configuration Banner ──
    const tunedBanner = document.createElement('div');
    tunedBanner.style.cssText =
      'display:none; padding:10px 14px; border-radius:8px; margin-top:12px; ' +
      'background:#ecfdf5; border:1px solid #6ee7b7; color:#065f46; font-size:11.5px; line-height:1.5;';

    // ── Action buttons ──
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;';

    const previewBtn = document.createElement('button');
    previewBtn.type = 'button';
    previewBtn.className = 'mm-studio-btn mm-btn-sm';
    previewBtn.innerHTML = '🔍 Preview Code';
    previewBtn.addEventListener('click', () => {
      this._showCodePreviewModal(
        model.name + ' (Baseline)',
        getBaselineCode(),
        model.rank === 1 ? 'advanced' : model.rank === 2 ? 'medium' : 'basic'
      );
    });

    const copyBtn2 = document.createElement('button');
    copyBtn2.type = 'button';
    copyBtn2.className = 'mm-studio-btn mm-btn-sm';
    copyBtn2.innerHTML = '📋 Copy Code';
    copyBtn2.addEventListener('click', async () => {
      await navigator.clipboard.writeText(getModelCode());
      copyBtn2.textContent = 'Copied!';
      setTimeout(() => { copyBtn2.innerHTML = '📋 Copy Code'; }, 1500);
    });

    const insertBtn2 = document.createElement('button');
    insertBtn2.type = 'button';
    insertBtn2.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
    insertBtn2.innerHTML = '📥 Insert into Notebook';
    insertBtn2.title = 'Insert the clean baseline model code into your notebook';
    insertBtn2.addEventListener('click', () => {
      const ok = this._insertCodeBelow(getBaselineCode());
      this._showToast(
        ok
          ? `✓ ${model.name} baseline code inserted! (Ready for manual parameter changes)`
          : 'Open a notebook first.'
      );
    });

    model.refreshCode = () => {
      const available = Boolean(getBaselineCode());
      codePre.textContent = getBaselineCode() || '# No code available';
      codeToggleBtn.disabled = !available;
      previewBtn.disabled = !available;
      copyBtn2.disabled = !available;
      insertBtn2.disabled = !available;

      if (model.tuned_configuration_applied) {
        card.style.borderColor = '#10b981';
        card.style.boxShadow = '0 0 0 1px #10b981, 0 3px 10px rgba(16, 185, 129, 0.12)';
        insertBtn2.innerHTML = '📥 Insert Baseline Code into Notebook';

        tunedBanner.replaceChildren();
        tunedBanner.style.display = 'block';

        const bannerHdr = document.createElement('div');
        bannerHdr.style.cssText =
          'font-weight:700; color:#047857; margin-bottom:4px; display:flex; align-items:center; gap:6px; font-size:12px;';
        bannerHdr.innerHTML = '<span>⚡ Hyperparameter Tuning Recommendations:</span>';

        const changesList = document.createElement('div');
        changesList.style.cssText = 'font-size:11px; color:#14532d; margin-top:4px; line-height:1.6;';

        const formatVal = (v: any) => v === null ? 'None' : (typeof v === 'string' ? `"${v}"` : JSON.stringify(v));

        if (Array.isArray(model.tuned_changes) && model.tuned_changes.length > 0) {
          model.tuned_changes.forEach((ch: any) => {
            const itemEl = document.createElement('div');
            itemEl.innerHTML = `• <b>${ch.parameter}</b>: change from <code>${formatVal(ch.default)}</code> → <code>${formatVal(ch.recommended)}</code>`;
            changesList.appendChild(itemEl);
          });
        } else if (model.tuned_params) {
          Object.entries(model.tuned_params).forEach(([k, v]) => {
            const itemEl = document.createElement('div');
            itemEl.innerHTML = `• <b>${k}</b>: recommended value <code>${formatVal(v)}</code>`;
            changesList.appendChild(itemEl);
          });
        }
        if (
          changesList.childElementCount === 0 &&
          model.tuned_recommendation_status === 'defaults_recommended'
        ) {
          changesList.textContent =
            'Default parameters are the best-supported choice: no tested alternative beat the baseline by a meaningful, consistent margin on the same CV folds.';
        } else if (
          changesList.childElementCount === 0 &&
          model.tuned_recommendation_status === 'insufficient_validation'
        ) {
          changesList.textContent =
            'Defaults were retained because there were not enough CV folds to support a reliable tuning decision.';
        } else if (changesList.childElementCount === 0) {
          changesList.textContent =
            'No parameter changes were validated. The generated code preserves the baseline settings.';
        }

        const bannerNote = document.createElement('div');
        bannerNote.style.cssText =
          'font-size:10.5px; color:#475569; margin-top:6px; line-height:1.4;';
        bannerNote.innerHTML =
          '<b>Evaluation note:</b> The recommended code applies the tested estimator settings; when defaults are recommended, it uses the same estimator settings as baseline code. ' +
          'Its held-out score can differ from CV, and no tuning search can guarantee higher accuracy on new data.';

        const bannerActions = document.createElement('div');
        bannerActions.style.cssText =
          'display:flex; gap:8px; margin-top:8px; align-items:center; flex-wrap:wrap;';

        const previewTunedDirectBtn = document.createElement('button');
        previewTunedDirectBtn.type = 'button';
        previewTunedDirectBtn.className = 'mm-studio-btn mm-btn-sm';
        previewTunedDirectBtn.textContent = '🔍 Preview Recommended Code';
        previewTunedDirectBtn.addEventListener('click', () => {
          this._showCodePreviewModal(
            model.name + ' (Recommended)',
            getTunedCode(),
            'advanced'
          );
        });

        const insertTunedDirectBtn = document.createElement('button');
        insertTunedDirectBtn.type = 'button';
        insertTunedDirectBtn.className = 'mm-studio-btn mm-btn-sm';
        insertTunedDirectBtn.style.cssText =
          'background:#f0fdf4; border:1px solid #86efac; color:#15803d; font-weight:600; font-size:10.5px; cursor:pointer;';
        insertTunedDirectBtn.innerHTML = model.tuned_changes?.length
          ? '⚡ Insert CV-Selected Code'
          : '⚡ Insert Recommended Default Code';
        insertTunedDirectBtn.addEventListener('click', () => {
          const ok = this._insertCodeBelow(getTunedCode());
          this._showToast(ok ? `✓ Tuned ${model.name} code inserted!` : 'Open a notebook first.');
        });

        if (!this._canUseCodeAction('insert')) {
          bannerActions.append(previewTunedDirectBtn);
        } else {
          bannerActions.append(insertTunedDirectBtn);
        }
        tunedBanner.append(bannerHdr, changesList, bannerNote, bannerActions);
      } else {
        card.style.borderColor = model.rank === 1 ? '#fde047' : '#dfe3ea';
        card.style.boxShadow = '0 1px 3px rgba(31, 41, 55, 0.04)';
        insertBtn2.innerHTML = '📥 Insert into Notebook';
        tunedBanner.style.display = 'none';
        tunedBanner.replaceChildren();
      }
    };

    if (model.automl_measured && !model.code_available) {
      codeToggleBtn.disabled = true;
      previewBtn.disabled = true;
      copyBtn2.disabled = true;
      insertBtn2.disabled = true;

      const note = document.createElement('div');
      note.style.cssText =
        'font-size:11px;color:#b45309;margin-top:8px;';
      note.textContent =
        model.code_error || 'Executable code is unavailable.';
      card.appendChild(note);
    }

    if (!this._canUseCodeAction('insert')) {
      btnRow.append(previewBtn);
    } else {
      btnRow.append(previewBtn, copyBtn2, insertBtn2);
    }
    card.append(tunedBanner, btnRow);

    // Initialize display state
    model.refreshCode();

    return card;
  }

  // ═════════════════════════════════════════════════════════════════
  // VIEW 5: ⚗️ MODEL VISUALIZATION LAB
  // ═════════════════════════════════════════════════════════════════
  private _renderModelLabTab(): void {
    const frag = document.createDocumentFragment();

    const hdr = document.createElement('div');
    hdr.className = 'mm-studio-section';
    hdr.innerHTML = `
      <div class="mm-studio-sec-title"><span>⚗️</span> Model Visualization Lab</div>
      <div class="mm-studio-sec-sub">Interactive visualizers for foundational machine learning algorithms.</div>
    `;
    frag.appendChild(hdr);

    // Sub-nav for models
    const modelNav = document.createElement('div');
    modelNav.className = 'mm-studio-level-row';

    const models = [
      { id: 'gd', label: '📉 Gradient Descent' },
      { id: 'tree', label: '🌳 Decision Tree' },
      { id: 'knn', label: '🔵 KNN' },
      { id: 'kmeans', label: '🔮 K-Means' },
      { id: 'pca', label: '📐 PCA' },
    ];

    let selectedModel = 'gd';
    const modelContainer = document.createElement('div');
    modelContainer.className = 'mm-lab-model-container';

    models.forEach(m => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `mm-level-pill ${m.id === selectedModel ? 'active' : ''}`;
      b.textContent = m.label;
      b.addEventListener('click', () => {
        selectedModel = m.id;
        modelNav.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        this._renderSelectedModel(modelContainer, selectedModel);
      });
      modelNav.appendChild(b);
    });

    frag.appendChild(modelNav);
    frag.appendChild(modelContainer);
    this._contentArea.appendChild(frag);

    this._renderSelectedModel(modelContainer, selectedModel);
  }

  private _renderSelectedModel(container: HTMLElement, modelId: string): void {
    container.replaceChildren();

    if (modelId === 'gd') {
      this._renderGradientDescentLab(container);
    } else if (modelId === 'tree') {
      this._renderDecisionTreeLab(container);
    } else if (modelId === 'knn') {
      this._renderKNNLab(container);
    } else if (modelId === 'kmeans') {
      this._renderKMeansLab(container);
    } else if (modelId === 'pca') {
      this._renderPCALab(container);
    }
  }

  // 1. Gradient Descent Interactive Simulator
  private _renderGradientDescentLab(container: HTMLElement): void {
    const wrap = document.createElement('div');
    wrap.className = 'mm-studio-card';

    // State
    let w = 0.1;
    let b = 0.5;
    let lr = 0.05;
    let epoch = 0;
    let isRunning = false;
    let timer: any = null;

    // Fixed dummy data points for regression: y = 2x + 1 + noise
    const dataPoints = [
      { x: 0.1, y: 1.1 }, { x: 0.2, y: 1.5 }, { x: 0.3, y: 1.6 },
      { x: 0.4, y: 1.9 }, { x: 0.5, y: 2.1 }, { x: 0.6, y: 2.2 },
      { x: 0.7, y: 2.6 }, { x: 0.8, y: 2.7 }, { x: 0.9, y: 2.9 }
    ];

    const lossHistory: number[] = [];

    const computeLoss = (weight: number, bias: number) => {
      let sum = 0;
      dataPoints.forEach(p => {
        const pred = weight * p.x + bias;
        sum += Math.pow(pred - p.y, 2);
      });
      return sum / dataPoints.length;
    };

    const stepGD = () => {
      let gradW = 0;
      let gradB = 0;
      const n = dataPoints.length;
      dataPoints.forEach(p => {
        const diff = (w * p.x + b) - p.y;
        gradW += (2 / n) * diff * p.x;
        gradB += (2 / n) * diff;
      });
      w -= lr * gradW;
      b -= lr * gradB;
      epoch++;
      lossHistory.push(computeLoss(w, b));
      updateView();
    };

    wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Gradient Descent Regression Simulator</span>
        <span class="mm-studio-badge badge-num">Optimization</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Watch the regression line fit the data and loss minimize step-by-step.</div>

      <!-- Controls -->
      <div class="mm-lab-controls">
        <label class="mm-lab-ctrl-row">
          <span>Learning Rate (α): <b id="gd-lr-val">${lr}</b></span>
          <input type="range" id="gd-lr" min="0.01" max="0.2" step="0.01" value="${lr}" />
        </label>
        <div style="display:flex; gap:6px; margin-top:8px;">
          <button type="button" class="mm-studio-btn mm-btn-sm mm-btn-primary" id="gd-play">▶ Play</button>
          <button type="button" class="mm-studio-btn mm-btn-sm" id="gd-step">⏭ Step</button>
          <button type="button" class="mm-studio-btn mm-btn-sm" id="gd-reset">🔄 Reset</button>
        </div>
      </div>

      <!-- Live metrics -->
      <div class="mm-studio-stats-grid" style="margin-top:10px;">
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-epoch">0</div><div class="mm-stat-lbl">Epoch</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-w">0.10</div><div class="mm-stat-lbl">Weight (w)</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-b">0.50</div><div class="mm-stat-lbl">Bias (b)</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-loss" style="color:#f87171;">—</div><div class="mm-stat-lbl">MSE Loss</div></div>
      </div>

      <!-- Canvas for Plot -->
      <div style="margin-top:12px; border:1px solid #dfe3ea; border-radius:8px; overflow:hidden; background:#ffffff; padding:8px;">
        <div style="font-size:10px; font-weight:600; color:#64748b; margin-bottom:4px;">Regression Line & Data Points</div>
        <svg id="gd-canvas" viewBox="0 0 300 160" style="width:100%; height:160px; display:block;"></svg>
      </div>
    `;

    container.appendChild(wrap);

    const svg = wrap.querySelector('#gd-canvas') as SVGSVGElement;
    const epochEl = wrap.querySelector('#gd-epoch') as HTMLElement;
    const wEl = wrap.querySelector('#gd-w') as HTMLElement;
    const bEl = wrap.querySelector('#gd-b') as HTMLElement;
    const lossEl = wrap.querySelector('#gd-loss') as HTMLElement;
    const lrInput = wrap.querySelector('#gd-lr') as HTMLInputElement;
    const lrVal = wrap.querySelector('#gd-lr-val') as HTMLElement;
    const playBtn = wrap.querySelector('#gd-play') as HTMLButtonElement;
    const stepBtn = wrap.querySelector('#gd-step') as HTMLButtonElement;
    const resetBtn = wrap.querySelector('#gd-reset') as HTMLButtonElement;

    lrInput.addEventListener('input', () => {
      lr = parseFloat(lrInput.value);
      lrVal.textContent = lr.toFixed(2);
    });

    const updateView = () => {
      epochEl.textContent = String(epoch);
      wEl.textContent = w.toFixed(2);
      bEl.textContent = b.toFixed(2);
      const curLoss = computeLoss(w, b);
      lossEl.textContent = curLoss.toFixed(4);

      // Render SVG
      const wPx = 300;
      const hPx = 160;
      const pad = 24;
      const scaleX = (x: number) => pad + x * (wPx - pad * 2);
      const scaleY = (y: number) => hPx - pad - (y / 3.5) * (hPx - pad * 2);

      let svgHtml = `
        <line x1="${pad}" y1="${hPx - pad}" x2="${wPx - pad}" y2="${hPx - pad}" stroke="#334155" stroke-width="1"/>
        <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${hPx - pad}" stroke="#334155" stroke-width="1"/>
      `;

      // Data points
      dataPoints.forEach(p => {
        svgHtml += `<circle cx="${scaleX(p.x)}" cy="${scaleY(p.y)}" r="4" fill="#818cf8"/>`;
      });

      // Fitted Line
      const y0 = w * 0 + b;
      const y1 = w * 1.0 + b;
      svgHtml += `
        <line x1="${scaleX(0)}" y1="${scaleY(y0)}" x2="${scaleX(1.0)}" y2="${scaleY(y1)}"
          stroke="#34d399" stroke-width="2.5" stroke-linecap="round"/>
      `;
      svg.innerHTML = svgHtml;
    };

    stepBtn.addEventListener('click', () => stepGD());

    playBtn.addEventListener('click', () => {
      isRunning = !isRunning;
      playBtn.textContent = isRunning ? '⏸ Pause' : '▶ Play';
      playBtn.className = isRunning ? 'mm-studio-btn mm-btn-sm mm-btn-accent' : 'mm-studio-btn mm-btn-sm mm-btn-primary';

      if (isRunning) {
        timer = setInterval(() => {
          if (epoch >= 100) {
            clearInterval(timer);
            isRunning = false;
            playBtn.textContent = '▶ Play';
            return;
          }
          stepGD();
        }, 100);
      } else {
        clearInterval(timer);
      }
    });

    resetBtn.addEventListener('click', () => {
      clearInterval(timer);
      isRunning = false;
      playBtn.textContent = '▶ Play';
      w = 0.1;
      b = 0.5;
      epoch = 0;
      lossHistory.length = 0;
      updateView();
    });

    updateView();
  }

  // 2. Decision Tree Visualizer
  private _renderDecisionTreeLab(container: HTMLElement): void {
    const wrap = document.createElement('div');
    wrap.className = 'mm-studio-card';
    wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Decision Tree Node Split Visualizer</span>
        <span class="mm-studio-badge badge-cat">Classification</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Visualize how a tree splits data on features to minimize impurity.</div>

      <div class="mm-tree-diagram">
        <div class="mm-tree-node root">
          <div class="mm-node-title">Root Node [Petal Length ≤ 2.45]</div>
          <div class="mm-node-meta">Gini = 0.667 • Samples = 150</div>
        </div>
        <div class="mm-tree-branches">
          <div class="mm-tree-branch">
            <div class="mm-branch-label">True</div>
            <div class="mm-tree-node leaf leaf-a">
              <div class="mm-node-title">Setosa (Class 0)</div>
              <div class="mm-node-meta">Gini = 0.0 • Samples = 50</div>
            </div>
          </div>
          <div class="mm-tree-branch">
            <div class="mm-branch-label">False</div>
            <div class="mm-tree-node internal">
              <div class="mm-node-title">[Petal Width ≤ 1.75]</div>
              <div class="mm-node-meta">Gini = 0.50 • Samples = 100</div>
              <div class="mm-tree-subbranches">
                <div class="mm-tree-node leaf leaf-b">Versicolor (49/5)</div>
                <div class="mm-tree-node leaf leaf-c">Virginica (1/45)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(wrap);
  }

  // 3. KNN Visualizer
  private _renderKNNLab(container: HTMLElement): void {
    const wrap = document.createElement('div');
    wrap.className = 'mm-studio-card';
    wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>k-Nearest Neighbors (KNN) 2D Space</span>
        <span class="mm-studio-badge badge-cat">Instance-Based</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Click anywhere on the 2D grid to predict its class using k nearest neighbors.</div>

      <label class="mm-lab-ctrl-row">
        <span>k Neighbors: <b id="knn-k-val">3</b></span>
        <input type="range" id="knn-k" min="1" max="9" step="2" value="3" />
      </label>

      <div style="margin-top:10px; border:1px solid #dfe3ea; border-radius:8px; background:#ffffff; overflow:hidden;">
        <svg id="knn-svg" viewBox="0 0 300 180" style="width:100%; height:180px; display:block; cursor:crosshair;"></svg>
      </div>
      <div id="knn-pred-box" style="margin-top:8px; font-size:11px; font-weight:700; text-align:center; color:#0284c7;">
        Click the plot to classify a query point!
      </div>
    `;
    container.appendChild(wrap);

    const svg = wrap.querySelector('#knn-svg') as SVGSVGElement;
    const kInput = wrap.querySelector('#knn-k') as HTMLInputElement;
    const kVal = wrap.querySelector('#knn-k-val') as HTMLElement;
    const predBox = wrap.querySelector('#knn-pred-box') as HTMLElement;

    let k = 3;
    let queryPt: { x: number; y: number } | null = { x: 150, y: 90 };

    const classA = [
      { x: 50, y: 50 }, { x: 70, y: 70 }, { x: 80, y: 40 }, { x: 100, y: 60 }, { x: 90, y: 90 }, { x: 60, y: 110 }
    ];
    const classB = [
      { x: 220, y: 130 }, { x: 240, y: 150 }, { x: 210, y: 160 }, { x: 200, y: 120 }, { x: 250, y: 110 }, { x: 180, y: 140 }
    ];

    const draw = () => {
      let svgContent = '';
      classA.forEach(p => {
        svgContent += `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#38bdf8" />`;
      });
      classB.forEach(p => {
        svgContent += `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#f59e0b" />`;
      });

      if (queryPt) {
        // Compute distances
        const all = [
          ...classA.map(p => ({ ...p, cls: 'Class A (Blue)' })),
          ...classB.map(p => ({ ...p, cls: 'Class B (Amber)' }))
        ];
        all.sort((a, b) => {
          const d1 = Math.hypot(a.x - queryPt!.x, a.y - queryPt!.y);
          const d2 = Math.hypot(b.x - queryPt!.x, b.y - queryPt!.y);
          return d1 - d2;
        });

        const neighbors = all.slice(0, k);
        const maxDist = Math.hypot(neighbors[neighbors.length - 1].x - queryPt.x, neighbors[neighbors.length - 1].y - queryPt.y);

        // Dashed circle
        svgContent += `<circle cx="${queryPt.x}" cy="${queryPt.y}" r="${maxDist}" fill="none" stroke="#a78bfa" stroke-dasharray="4" stroke-width="1.5"/>`;

        // Lines to neighbors
        neighbors.forEach(n => {
          svgContent += `<line x1="${queryPt!.x}" y1="${queryPt!.y}" x2="${n.x}" y2="${n.y}" stroke="#a78bfa" stroke-width="1" opacity="0.6"/>`;
        });

        // Query point
        svgContent += `<circle cx="${queryPt.x}" cy="${queryPt.y}" r="6" fill="#ec4899" stroke="#fff" stroke-width="2"/>`;

        // Majority vote
        const countA = neighbors.filter(n => n.cls.includes('Class A')).length;
        const countB = k - countA;
        const winner = countA > countB ? 'Class A (Blue)' : 'Class B (Amber)';
        predBox.innerHTML = `Predicted: <span style="color:${countA > countB ? '#38bdf8' : '#f59e0b'}">${winner}</span> (${countA} vs ${countB} votes)`;
      }

      svg.innerHTML = svgContent;
    };

    kInput.addEventListener('input', () => {
      k = parseInt(kInput.value);
      kVal.textContent = String(k);
      draw();
    });

    svg.addEventListener('click', (e) => {
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 300;
      const y = ((e.clientY - rect.top) / rect.height) * 180;
      queryPt = { x, y };
      draw();
    });

    draw();
  }

  // 4. K-Means Clustering Visualizer
  private _renderKMeansLab(container: HTMLElement): void {
    const wrap = document.createElement('div');
    wrap.className = 'mm-studio-card';
    wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>K-Means Clustering Simulator</span>
        <span class="mm-studio-badge badge-num">Clustering</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Iteratively update cluster centroids to minimize within-cluster variance.</div>
      <div style="display:flex; gap:6px; margin-bottom:10px;">
        <button type="button" class="mm-studio-btn mm-btn-sm mm-btn-primary" id="km-step">Step Centroids</button>
        <button type="button" class="mm-studio-btn mm-btn-sm" id="km-reset">Reset</button>
      </div>
      <div style="border:1px solid #dfe3ea; border-radius:8px; background:#ffffff; overflow:hidden;">
        <svg id="km-svg" viewBox="0 0 300 160" style="width:100%; height:160px; display:block;"></svg>
      </div>
    `;
    container.appendChild(wrap);

    const svg = wrap.querySelector('#km-svg') as SVGSVGElement;
    const stepBtn = wrap.querySelector('#km-step') as HTMLButtonElement;
    const resetBtn = wrap.querySelector('#km-reset') as HTMLButtonElement;

    const points = [
      { x: 40, y: 40 }, { x: 50, y: 60 }, { x: 60, y: 35 }, { x: 70, y: 65 }, { x: 80, y: 50 },
      { x: 220, y: 120 }, { x: 230, y: 140 }, { x: 240, y: 110 }, { x: 250, y: 135 }, { x: 210, y: 130 },
      { x: 140, y: 90 }, { x: 150, y: 110 }, { x: 160, y: 85 }
    ];

    let centroids = [
      { x: 50, y: 120, color: '#38bdf8' },
      { x: 200, y: 50, color: '#f59e0b' }
    ];

    const drawKM = () => {
      let svgHtml = '';
      points.forEach(p => {
        // Assign to nearest centroid
        const d0 = Math.hypot(p.x - centroids[0].x, p.y - centroids[0].y);
        const d1 = Math.hypot(p.x - centroids[1].x, p.y - centroids[1].y);
        const col = d0 < d1 ? centroids[0].color : centroids[1].color;
        svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${col}" opacity="0.8"/>`;
      });

      // Centroids as glowing crosses
      centroids.forEach(c => {
        svgHtml += `
          <line x1="${c.x - 6}" y1="${c.y - 6}" x2="${c.x + 6}" y2="${c.y + 6}" stroke="${c.color}" stroke-width="3"/>
          <line x1="${c.x - 6}" y1="${c.y + 6}" x2="${c.x + 6}" y2="${c.y - 6}" stroke="${c.color}" stroke-width="3"/>
        `;
      });
      svg.innerHTML = svgHtml;
    };

    stepBtn.addEventListener('click', () => {
      // Recompute means
      const cluster0 = points.filter(p => Math.hypot(p.x - centroids[0].x, p.y - centroids[0].y) <= Math.hypot(p.x - centroids[1].x, p.y - centroids[1].y));
      const cluster1 = points.filter(p => Math.hypot(p.x - centroids[0].x, p.y - centroids[0].y) > Math.hypot(p.x - centroids[1].x, p.y - centroids[1].y));

      if (cluster0.length > 0) {
        centroids[0].x = cluster0.reduce((s, p) => s + p.x, 0) / cluster0.length;
        centroids[0].y = cluster0.reduce((s, p) => s + p.y, 0) / cluster0.length;
      }
      if (cluster1.length > 0) {
        centroids[1].x = cluster1.reduce((s, p) => s + p.x, 0) / cluster1.length;
        centroids[1].y = cluster1.reduce((s, p) => s + p.y, 0) / cluster1.length;
      }
      drawKM();
    });

    resetBtn.addEventListener('click', () => {
      centroids = [
        { x: 50, y: 120, color: '#38bdf8' },
        { x: 200, y: 50, color: '#f59e0b' }
      ];
      drawKM();
    });

    drawKM();
  }

  // 5. PCA Visualizer
  private _renderPCALab(container: HTMLElement): void {
    const wrap = document.createElement('div');
    wrap.className = 'mm-studio-card';
    wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Principal Component Analysis (PCA)</span>
        <span class="mm-studio-badge badge-num">Dim Reduction</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Projects high-dimensional data onto orthogonal axes of maximum variance.</div>

      <div style="font-size:11px; font-weight:600; margin-bottom:6px;">Variance Explained Ratio (Scree Plot):</div>
      <div class="mm-studio-bar-row">
        <div class="mm-studio-bar-label"><span>PC 1 (First Component)</span><span>72.8%</span></div>
        <div class="mm-studio-bar-track"><div class="mm-studio-bar-fill" style="width:72.8%; background:#818cf8;"></div></div>
      </div>
      <div class="mm-studio-bar-row">
        <div class="mm-studio-bar-label"><span>PC 2 (Second Component)</span><span>21.4%</span></div>
        <div class="mm-studio-bar-track"><div class="mm-studio-bar-fill" style="width:21.4%; background:#38bdf8;"></div></div>
      </div>
      <div class="mm-studio-bar-row">
        <div class="mm-studio-bar-label"><span>PC 3 (Residual)</span><span>5.8%</span></div>
        <div class="mm-studio-bar-track"><div class="mm-studio-bar-fill" style="width:5.8%; background:#64748b;"></div></div>
      </div>
    `;
    container.appendChild(wrap);
  }

  // ═════════════════════════════════════════════════════════════════
  // VIEW 6: 📖 PREPROCESSING & ML GUIDE
  // ═════════════════════════════════════════════════════════════════
  private _renderGuideTab(): void {
    const frag = document.createDocumentFragment();

    const hdr = document.createElement('div');
    hdr.className = 'mm-studio-section';
    hdr.innerHTML = `
      <div class="mm-studio-sec-title"><span>📖</span> Preprocessing & ML Handbook</div>
      <div class="mm-studio-sec-sub">Essential guides and best practices for robust data preparation.</div>
    `;
    frag.appendChild(hdr);

    const installCard = document.createElement('section');
    installCard.className = 'mm-studio-card';
    installCard.setAttribute('aria-labelledby', 'mm-guide-install-title');

    const installTitle = document.createElement('div');
    installTitle.id = 'mm-guide-install-title';
    installTitle.className = 'mm-studio-sec-title';
    installTitle.textContent = '📦 Install ML Libraries';

    const installDescription = document.createElement('div');
    installDescription.className = 'mm-studio-sec-sub';
    installDescription.style.marginTop = '0';
    installDescription.textContent =
      'Copy this single command into a notebook code cell and run it to install the libraries in the active notebook kernel. Internet access is required; installation may take a while.';

    const installCommand =
      '%pip install numpy pandas scipy scikit-learn xgboost lightgbm catboost imbalanced-learn statsmodels joblib matplotlib seaborn plotly shap optuna';
    const installCode = document.createElement('pre');
    installCode.style.cssText =
      'background:#f8fafc;border:1px solid #dfe3ea;border-radius:8px;' +
      'padding:10px 12px;margin:0;overflow-x:auto;white-space:pre;' +
      'font:11px/1.6 ui-monospace,SFMono-Regular,monospace;color:#1e293b;';
    installCode.textContent = installCommand;

    const copyInstallButton = document.createElement('button');
    copyInstallButton.type = 'button';
    copyInstallButton.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
    copyInstallButton.textContent = '📋 Copy install command';
    copyInstallButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(installCommand);
        copyInstallButton.textContent = 'Copied!';
        this._showToast('✓ Install command copied. Paste it into a notebook cell.');
        window.setTimeout(() => {
          copyInstallButton.textContent = '📋 Copy install command';
        }, 1800);
      } catch {
        this._showToast('Could not access the clipboard. Select and copy the command above.');
      }
    });

    const installActions = document.createElement('div');
    installActions.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    installActions.appendChild(copyInstallButton);

    const insertInstallButton = document.createElement('button');
    insertInstallButton.type = 'button';
    insertInstallButton.className = 'mm-studio-btn mm-btn-sm';
    insertInstallButton.textContent = '📥 Insert into notebook';
    insertInstallButton.addEventListener('click', () => {
      const inserted = this._insertCodeBelow(installCommand);
      this._showToast(
        inserted
          ? '✓ Install command inserted below the active cell. Run that cell to install the libraries.'
          : 'Open a notebook and select a cell before inserting the install command.'
      );
    });
    if (!this._canUseCodeAction('copy')) {
      const previewInstallButton = document.createElement('button');
      previewInstallButton.type = 'button';
      previewInstallButton.className = 'mm-studio-btn mm-btn-sm';
      previewInstallButton.textContent = '🔍 Preview Code';
      previewInstallButton.addEventListener('click', () => {
        this._showCodePreviewModal(
          'ML library install command',
          installCommand,
          'basic'
        );
      });
      installActions.replaceChildren(previewInstallButton);
    } else {
      installActions.appendChild(insertInstallButton);
    }

    installCard.append(
      installTitle,
      installDescription,
      installCode,
      installActions
    );
    frag.appendChild(installCard);

    const guides = [
      {
        title: '1. Handling Missing Data (Imputation)',
        emoji: '🩹',
        content: `
          • <b>MCAR (Missing Completely at Random):</b> Safe to drop if < 5% or use Mean/Median.<br/>
          • <b>MAR (Missing at Random):</b> Impute using KNN or IterativeImputer conditioned on other features.<br/>
          • <b>MNAR (Missing Not at Random):</b> Create a missingness indicator column before imputing.<br/>
          • <b>Rule of Thumb:</b> Use Median over Mean when data is skewed or contains outliers.
        `
      },
      {
        title: '2. Categorical Encoding Guide',
        emoji: '🏷️',
        content: `
          • <b>One-Hot Encoding:</b> Best for nominal data with low cardinality (< 10 unique values). Always set <code>handle_unknown='ignore'</code> for test data!<br/>
          • <b>Ordinal Encoding:</b> Use only when natural ranking exists (e.g. Low, Medium, High).<br/>
          • <b>Target / Frequency Encoding:</b> Best for high-cardinality features. Always compute inside CV loops to avoid leakage!
        `
      },
      {
        title: '3. Feature Scaling & Normalization',
        emoji: '⚖️',
        content: `
          • <b>StandardScaler:</b> Transforms features to mean=0, std=1. Essential for Logistic Regression, SVM, KNN, Neural Networks.<br/>
          • <b>RobustScaler:</b> Uses median and IQR. Best when features have extreme outliers.<br/>
          • <b>MinMaxScaler:</b> Bounds features strictly to [0, 1]. Best for image pixels or neural activations.<br/>
          • <b>Tree Models:</b> Random Forest and XGBoost do NOT require feature scaling.
        `
      },
      {
        title: '4. Outlier Detection & Treatment',
        emoji: '🎯',
        content: `
          • <b>IQR Rule:</b> Points outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR] are potential outliers.<br/>
          • <b>Capping / Winsorization:</b> Clip values to 1st and 99th percentiles rather than deleting rows to preserve sample size.
        `
      },
      {
        title: '5. Preventing Data Leakage Checklist',
        emoji: '🛡️',
        content: `
          • Always call <code>train_test_split</code> BEFORE fitting any Scaler or Imputer!<br/>
          • Fit transformers on training data only (<code>fit_transform</code>), then only <code>transform</code> the test data.<br/>
          • Never include the target variable in feature matrices.
        `
      }
    ];

    guides.forEach(g => {
      const card = document.createElement('div');
      card.className = 'mm-studio-card mm-guide-card';
      card.innerHTML = `
        <div class="mm-guide-hdr">
          <span>${g.emoji} ${g.title}</span>
        </div>
        <div class="mm-guide-body">${g.content}</div>
      `;
      frag.appendChild(card);
    });

    this._contentArea.appendChild(frag);
  }

  // ═════════════════════════════════════════════════════════════════
  // UTILITIES: INSERT CODE & TOAST
  // ═════════════════════════════════════════════════════════════════
  private _insertPreprocessingCode(code: string): boolean {
    const current = this._notebooks.currentWidget;

    if (!current?.content) {
      this._showToast('Open a notebook first.');
      return false;
    }

    return this._insertCodeBelow(code);
  }

  private _insertCodeBelow(code: string): boolean {
    const current = this._notebooks.currentWidget;
    if (!current) return false;
    const notebook = current.content;
    if (!notebook?.model) return false;

    const insertedIndex = notebook.activeCell
      ? notebook.activeCellIndex + 1
      : notebook.model.cells.length;
    notebook.model.sharedModel.insertCell(insertedIndex, {
      cell_type: 'code',
      source: code,
      metadata: { trusted: true }
    });
    notebook.activeCellIndex = insertedIndex;
    return true;
  }

  private _createStatCard(lbl: string, val: string | number, status: 'ok' | 'warn' | 'default' = 'default'): HTMLElement {
    const box = document.createElement('div');
    box.className = 'mm-stat-box';
    const valEl = document.createElement('div');
    valEl.className = 'mm-stat-val';
    if (status === 'warn') valEl.style.color = '#f87171';
    if (status === 'ok') valEl.style.color = '#34d399';
    valEl.textContent = String(val);

    const lblEl = document.createElement('div');
    lblEl.className = 'mm-stat-lbl';
    lblEl.textContent = lbl;

    box.append(valEl, lblEl);
    return box;
  }

  private _showToast(msg: string): void {
    const t = document.createElement('div');
    t.className = 'mm-studio-toast';
    t.textContent = msg;
    this._root.appendChild(t);
    setTimeout(() => {
      t.classList.add('fade-out');
      setTimeout(() => t.remove(), 400);
    }, 2200);
  }
}

export function createModelMindStudioWidget(
  app: JupyterFrontEnd,
  notebooks: INotebookTracker
): ModelMindStudioWidget {
  return new ModelMindStudioWidget(app, notebooks);
}
