"use strict";(self.rspackChunk_ml_platform_error_assistant=self.rspackChunk_ml_platform_error_assistant||[]).push([[700],{475(t,a,e){var o=e(601),r=e.n(o),s=e(314),i=(e.n(s))()(r());i.push([t.id,`/*
    See the JupyterLab Developer Guide for useful CSS Patterns:

    https://jupyterlab.readthedocs.io/en/stable/developer/css.html
*/
`,""]),e.d(a,{},{A:i})},646(t,a,e){var o=e(601),r=e.n(o),s=e(314),i=e.n(s),n=e(475),l=e(417),d=e.n(l),p=new URL(e(665),e.b),m=i()(r());m.i(n.A);var f=d()(p);m.push([t.id,`:root {
  --ml-assistant-panel-bg: #f5f6f8;
  --ml-assistant-card-bg: #fff;
  --ml-assistant-border: #dfe3ea;
  --ml-assistant-text: #253041;
  --ml-assistant-muted: #5d6b80;
  --ml-assistant-accent: #6d7cff;
  --ml-assistant-accent-soft: #eef1ff;
  --ml-assistant-error-bg: #f7dfe3;
  --ml-assistant-error-text: #a33d4d;
  --ml-assistant-success-bg: #dff5eb;
  --ml-assistant-success-text: #1d7b54;
  --ml-assistant-warn-bg: #fdf0d5;
  --ml-assistant-warn-text: #9c6b11;
  --ml-assistant-shadow: rgb(31 41 55 / 8%);
}

.ml-platform-error-assistant-panel {
  background: var(--ml-assistant-panel-bg);
  color: var(--ml-assistant-text);
  border-left: 1px solid var(--ml-assistant-border);
}

[id='jp-MainLogo'] {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  width: auto;
  min-width: 185px;
  padding-right: 12px;
}

[id='jp-MainLogo'] > * {
  display: none;
}

[id='jp-MainLogo']::before {
  display: block;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  background: url(${f}) center / contain no-repeat;
  content: '';
}

[id='jp-MainLogo']::after {
  margin-left: 8px;
  color: #172554;
  content: 'ModelMind Notebook';
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}

.ml-assistant-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 14px 14px 18px;
  box-sizing: border-box;
  gap: 12px;
}

.ml-assistant-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.ml-assistant-header h2 {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.35;
  font-weight: 700;
  color: var(--ml-assistant-text);
}

.ml-assistant-header-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.ml-assistant-cloud-option {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 190px;
  color: var(--ml-assistant-text);
  font-size: 11px;
  line-height: 1.3;
  cursor: pointer;
}

.ml-assistant-cloud-option input {
  flex: 0 0 auto;
  margin: 0;
  accent-color: var(--ml-assistant-accent);
}

.ml-assistant-cloud-option input:disabled {
  cursor: not-allowed;
}

.ml-assistant-provider-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--ml-assistant-muted);
  font-size: 11px;
  font-weight: 600;
}

.ml-assistant-provider-select {
  min-width: 128px;
  border: 1px solid var(--ml-assistant-border);
  border-radius: 6px;
  padding: 5px 7px;
  background: white;
  color: var(--ml-assistant-text);
  font-size: 11px;
}

.ml-assistant-primary-button,
.ml-assistant-secondary-button,
.ml-assistant-cta-button,
.ml-assistant-actions button,
.ml-assistant-tab {
  border: 1px solid var(--ml-assistant-border);
  border-radius: 8px;
  background: white;
  color: var(--ml-assistant-text);
  font-size: 12px;
  padding: 7px 10px;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    color 120ms ease,
    box-shadow 120ms ease;
}

.ml-assistant-primary-button {
  background: var(--ml-assistant-accent-soft);
  border-color: rgb(109 124 255 / 35%);
  color: var(--ml-assistant-accent);
  font-weight: 600;
}

.ml-assistant-secondary-button {
  background: white;
}

.ml-assistant-status-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  min-height: 24px;
}

.ml-assistant-status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid transparent;
}

.ml-assistant-status-default {
  background: #eef2f6;
  color: var(--ml-assistant-muted);
}

.ml-assistant-status-success {
  background: var(--ml-assistant-success-bg);
  color: var(--ml-assistant-success-text);
}

.ml-assistant-status-warn {
  background: var(--ml-assistant-warn-bg);
  color: var(--ml-assistant-warn-text);
}

.ml-assistant-tab-row {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  border-bottom: 1px solid var(--ml-assistant-border);
  padding-bottom: 4px;
}

.ml-assistant-tab {
  flex: 0 0 auto;
  background: transparent;
  border: none;
  border-radius: 6px 6px 0 0;
  padding: 8px 9px;
  color: var(--ml-assistant-muted);
  font-weight: 500;
}

.ml-assistant-tab.active {
  background: var(--ml-assistant-accent-soft);
  color: var(--ml-assistant-accent);
  border: 1px solid rgb(109 124 255 / 25%);
}

.ml-assistant-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 1px 3px 6px 1px;
  scrollbar-gutter: stable;
}

.ml-assistant-question-input {
  width: 100%;
  min-height: 92px;
  box-sizing: border-box;
  resize: vertical;
  border: 1px solid var(--ml-assistant-border);
  border-radius: 8px;
  background: white;
  color: var(--ml-assistant-text);
  padding: 10px 12px;
  font: inherit;
  line-height: 1.5;
}

.ml-assistant-question-label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: var(--ml-assistant-muted);
  font-size: 12px;
  font-weight: 600;
}

.ml-assistant-code-help-answer {
  border-left: 3px solid var(--ml-assistant-accent);
  padding: 4px 0 4px 12px;
  color: var(--ml-assistant-text);
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.ml-assistant-code-help-answer p {
  margin: 0 0 8px;
}

.ml-assistant-code-help-answer ul {
  margin: 0;
  padding-left: 18px;
}

.ml-assistant-empty {
  border: 1px dashed var(--ml-assistant-border);
  border-radius: 10px;
  background: rgb(255 255 255 / 40%);
  color: var(--ml-assistant-muted);
  padding: 20px 16px;
  text-align: center;
  line-height: 1.5;
}

.ml-assistant-cta-row {
  display: flex;
  justify-content: flex-start;
}

.ml-assistant-cta-button {
  align-self: flex-start;
  background: var(--ml-assistant-accent);
  border-color: var(--ml-assistant-accent);
  color: white;
  font-weight: 600;
  padding: 9px 14px;
}

.ml-assistant-result-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ml-assistant-error-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-radius: 8px;
  background: #fff1f1;
  border: 1px solid rgb(163 61 77 / 20%);
  padding: 11px 12px;
  color: var(--ml-assistant-error-text);
}

.ml-assistant-error-icon {
  display: inline-flex;
  flex: 0 0 20px;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #d92d20;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.ml-assistant-error-copy {
  min-width: 0;
}

.ml-assistant-error-title {
  font-size: 13px;
  font-weight: 700;
  margin: 1px 0 3px;
  overflow-wrap: anywhere;
}

.ml-assistant-error-message {
  font-size: 12px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.ml-assistant-traceback {
  border: 1px solid var(--ml-assistant-border);
  border-radius: 8px;
  background: #fff;
  color: var(--ml-assistant-muted);
}

.ml-assistant-traceback details {
  padding: 8px 10px;
}

.ml-assistant-traceback summary {
  color: var(--ml-assistant-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.ml-assistant-traceback pre {
  max-height: 240px;
  margin: 8px 0 0;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: monospace;
  font-size: 11px;
  line-height: 1.5;
  color: var(--ml-assistant-text);
}

.ml-assistant-card {
  border-radius: 10px;
  border: 1px solid var(--ml-assistant-border);
  padding: 12px;
  background: white;
  box-shadow: 0 1px 2px var(--ml-assistant-shadow);
}

.ml-assistant-card-blue {
  background: #edf4ff;
  border-color: #d3e3ff;
}

.ml-assistant-card-green {
  background: #edf9f2;
  border-color: #cfeee1;
}

.ml-assistant-card-title {
  font-size: 12px;
  font-weight: 700;
  color: #173ea5;
  margin-bottom: 7px;
}

.ml-assistant-card p {
  margin: 0 0 8px;
  color: var(--ml-assistant-text);
  font-size: 12px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.ml-assistant-card ul {
  margin: 0;
  padding-left: 17px;
  color: var(--ml-assistant-text);
  font-size: 12px;
  line-height: 1.5;
}

.ml-assistant-card li + li {
  margin-top: 4px;
}

.ml-assistant-code-block {
  background: rgb(255 255 255 / 80%);
  border: 1px solid var(--ml-assistant-border);
  border-radius: 7px;
  padding: 10px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
}

.ml-assistant-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 4px;
  padding-bottom: 2px;
}

.ml-assistant-actions button {
  min-width: 0;
  overflow-wrap: anywhere;
}

.ml-assistant-actions .ml-assistant-action-wide {
  grid-column: 1 / -1;
}

@media (width <= 520px) {
  [id='jp-MainLogo'] {
    min-width: 0;
  }

  [id='jp-MainLogo']::after {
    content: 'ModelMind';
  }

  .ml-assistant-header {
    flex-wrap: wrap;
  }

  .ml-assistant-header-controls {
    justify-content: flex-start;
    width: 100%;
  }

  .ml-assistant-cloud-option {
    max-width: none;
  }
}

.ml-assistant-primary-button:focus-visible,
.ml-assistant-secondary-button:focus-visible,
.ml-assistant-cta-button:focus-visible,
.ml-assistant-actions button:focus-visible,
.ml-assistant-tab:focus-visible,
.ml-assistant-question-input:focus-visible {
  outline: 2px solid var(--ml-assistant-accent);
  outline-offset: 2px;
}

.ml-assistant-primary-button:disabled,
.ml-assistant-secondary-button:disabled,
.ml-assistant-cta-button:disabled,
.ml-assistant-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ml-assistant-primary-button:hover:not(:disabled),
.ml-assistant-secondary-button:hover:not(:disabled),
.ml-assistant-cta-button:hover:not(:disabled),
.ml-assistant-actions button:hover:not(:disabled) {
  box-shadow: 0 2px 7px var(--ml-assistant-shadow);
}

/* ═══════════════════════════════════════════════════════════
   MODELMIND STUDIO — UNIFIED SLIDE BAR STYLES
   ═══════════════════════════════════════════════════════════ */

/* Single Left Sidebar Icon */
.mm-sidebar-icon {
  background-size: 16px;
  background-repeat: no-repeat;
  background-position: center;
}
.mm-icon-modelmind::before {
  content: '◈';
  font-size: 18px;
  font-weight: 900;
  background: linear-gradient(135deg, #a78bfa, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  line-height: 1;
}

/* ═══════════════════════════════════════════════════════════
   LEFT SIDEBAR ACTIVITY BAR — FIVE SECTION NAMES & STYLES
   ═══════════════════════════════════════════════════════════ */

:root {
  --jp-private-sidebar-tab-width: 58px !important;
}

.jp-SideBar.lm-TabBar.jp-mod-left {
  min-width: 58px !important;
  max-width: 58px !important;
  width: 58px !important;
  background: #ffffff !important;
  border-right: 1px solid #e2e8f0 !important;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.02) !important;
  z-index: 10 !important;
}

.jp-SideBar.jp-mod-left .lm-TabBar-content {
  width: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

.jp-SideBar.jp-mod-left .lm-TabBar-tab {
  width: 100% !important;
  box-sizing: border-box !important;
  padding: 8px 2px 6px !important;
  min-height: 52px !important;
  height: auto !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 3px !important;
  cursor: pointer !important;
  pointer-events: auto !important;
  z-index: 11 !important;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
  background: #ffffff !important;
  position: relative !important;
  border-left: 3px solid transparent !important;
  border-top: none !important;
  border-right: none !important;
  border-bottom: 1px solid #f1f5f9 !important;
}

.jp-SideBar.jp-mod-left .lm-TabBar-tab:hover {
  background: #f8fafc !important;
}

.jp-SideBar.jp-mod-left .lm-TabBar-tab:hover .mm-sidebar-tab-label {
  color: #0f172a !important;
}

.jp-SideBar.jp-mod-left .lm-TabBar-tab.lm-mod-current {
  background: #f5f3ff !important;
  border-left: 3px solid #7c3aed !important;
}

.jp-SideBar.jp-mod-left .lm-TabBar-tabIcon {
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transform: scale(1.05);
  transition: transform 0.18s ease !important;
  filter: grayscale(0.2);
}

.jp-SideBar.jp-mod-left .lm-TabBar-tab:hover .lm-TabBar-tabIcon {
  transform: scale(1.15);
  filter: none;
}

.jp-SideBar.jp-mod-left .lm-TabBar-tab.lm-mod-current .lm-TabBar-tabIcon {
  filter: none;
}

/* Custom Clear Text Label for the 5 Sections (Light Mode) */
.mm-sidebar-tab-label {
  display: block !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
  font-size: 9.5px !important;
  font-weight: 600 !important;
  line-height: 1.15 !important;
  text-align: center !important;
  color: #475569 !important;
  white-space: normal !important;
  word-break: break-word !important;
  max-width: 60px !important;
  letter-spacing: -0.15px !important;
  pointer-events: none !important;
  user-select: none !important;
  transition: color 0.18s ease !important;
}

.jp-SideBar.jp-mod-left .lm-TabBar-tab.lm-mod-current .mm-sidebar-tab-label {
  color: #6d28d9 !important;
  font-weight: 700 !important;
}

/* Special accent badge for ModelMind Studio (ML Studio) */
.jp-SideBar.jp-mod-left .lm-TabBar-tab[data-id*='modelmind'] .mm-sidebar-tab-label {
  color: #7c3aed !important;
  font-weight: 700 !important;
}

.jp-SideBar.jp-mod-left .lm-TabBar-tab[data-id*='modelmind'].lm-mod-current .mm-sidebar-tab-label {
  color: #5b21b6 !important;
}

/* Hide default rotated lumino label */
.jp-SideBar.jp-mod-left .lm-TabBar-tabLabel {
  display: none !important;
}

/* ═══════════════════════════════════════════════════════════
   MODELMIND STUDIO — CLEAN LIGHT THEME (MATCHING AI ASSISTANT)
   ═══════════════════════════════════════════════════════════ */

.mm-modelmind-panel {
  overflow: hidden !important;
  background: var(--ml-assistant-panel-bg, #f5f6f8) !important;
  color: var(--ml-assistant-text, #253041) !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
}

.mm-studio-root {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--ml-assistant-panel-bg, #f5f6f8);
  color: var(--ml-assistant-text, #253041);
  position: relative;
}

/* Header */
.mm-studio-header {
  padding: 12px 14px 10px;
  background: #ffffff;
  border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(31, 41, 55, 0.03);
}

.mm-studio-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.mm-studio-logo {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.25);
}

.mm-studio-title-box {
  min-width: 0;
}

.mm-studio-title {
  font-size: 13px;
  font-weight: 700;
  color: #172554;
  letter-spacing: -0.1px;
}

.mm-studio-sub {
  font-size: 9.5px;
  color: var(--ml-assistant-muted, #5d6b80);
  margin-top: 1px;
}

.mm-studio-path-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mm-studio-input-row {
  display: flex;
  gap: 6px;
}

.mm-studio-input {
  flex: 1;
  background: #ffffff;
  border: 1px solid var(--ml-assistant-border, #dfe3ea);
  color: var(--ml-assistant-text, #253041);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  outline: none;
  transition: all 0.15s ease;
}

.mm-studio-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.mm-studio-quick-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.mm-studio-quick-pill {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 9.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mm-studio-quick-pill:hover {
  background: var(--ml-assistant-accent-soft, #eef1ff);
  border-color: #c7d2fe;
  color: #4338ca;
}

.mm-studio-status-pill {
  font-size: 10px;
  padding: 5px 9px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.mm-studio-status-pill.success {
  color: var(--ml-assistant-success-text, #1d7b54);
  border-color: #a7f3d0;
  background: var(--ml-assistant-success-bg, #dff5eb);
  font-weight: 600;
}

.mm-studio-status-pill.loading {
  color: #4f46e5;
  border-color: #c7d2fe;
  background: var(--ml-assistant-accent-soft, #eef1ff);
}

.mm-studio-status-pill.error {
  color: var(--ml-assistant-error-text, #a33d4d);
  border-color: #fecdd3;
  background: var(--ml-assistant-error-bg, #f7dfe3);
  font-weight: 600;
}

/* Slide Bar / Tab Bar */
.mm-studio-tab-bar {
  display: flex;
  gap: 5px;
  padding: 8px 12px;
  background: #ffffff;
  border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: none;
}

.mm-studio-tab-bar::-webkit-scrollbar {
  display: none;
}

.mm-studio-tab {
  padding: 6px 11px;
  border-radius: 8px;
  border: 1px solid var(--ml-assistant-border, #dfe3ea);
  background: #ffffff;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.mm-studio-tab:hover {
  color: #1e293b;
  background: #f8fafc;
  border-color: #cbd5e1;
}

.mm-studio-tab.active {
  background: var(--ml-assistant-accent-soft, #eef1ff);
  border-color: rgb(109 124 255 / 45%);
  color: #4338ca;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.12);
}

/* Content Area */
.mm-studio-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--ml-assistant-panel-bg, #f5f6f8);
}

.mm-studio-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mm-studio-sec-title {
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ml-assistant-text, #253041);
}

.mm-studio-sec-sub {
  font-size: 10px;
  color: var(--ml-assistant-muted, #5d6b80);
  margin-top: -4px;
}

/* Cards (Matching AI Assistant style) */
.mm-studio-card {
  background: #ffffff;
  border: 1px solid var(--ml-assistant-border, #dfe3ea);
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 1px 3px rgba(31, 41, 55, 0.03);
  transition: all 0.15s ease;
  color: var(--ml-assistant-text, #253041);
}

.mm-studio-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 6px rgba(31, 41, 55, 0.06);
}

.mm-card-error {
  border-color: #fecdd3;
  background: var(--ml-assistant-error-bg, #f7dfe3);
  color: var(--ml-assistant-error-text, #a33d4d);
}

/* Stats Grid */
.mm-studio-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.mm-stat-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mm-stat-val {
  font-size: 17px;
  font-weight: 800;
  color: #4f46e5;
}

.mm-stat-lbl {
  font-size: 9.5px;
  color: var(--ml-assistant-muted, #5d6b80);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
}

/* Badges */
.mm-studio-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 99px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.badge-num {
  background: var(--ml-assistant-success-bg, #dff5eb);
  color: var(--ml-assistant-success-text, #1d7b54);
  border: 1px solid #a7f3d0;
}

.badge-cat {
  background: var(--ml-assistant-accent-soft, #eef1ff);
  color: #4338ca;
  border: 1px solid #c7d2fe;
}

/* Bar Rows */
.mm-studio-bar-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 10px;
  color: var(--ml-assistant-text, #253041);
}

.mm-studio-bar-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.mm-studio-bar-val {
  color: var(--ml-assistant-muted, #5d6b80);
}

.mm-studio-bar-track {
  height: 6px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
}

.mm-studio-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.3s ease;
  background: #6366f1;
}

/* Table (Clean Light Mode) */
.mm-studio-table-wrap {
  max-height: 220px;
  overflow: auto;
  border: 1px solid var(--ml-assistant-border, #dfe3ea);
  border-radius: 8px;
  background: #ffffff;
}

.mm-studio-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10.5px;
  text-align: left;
}

.mm-studio-table th {
  background: #f8fafc;
  color: #1e293b;
  padding: 7px 10px;
  font-weight: 700;
  position: sticky;
  top: 0;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.mm-th-dtype {
  font-size: 8.5px;
  color: #64748b;
  font-weight: 500;
  display: block;
}

.mm-studio-table td {
  padding: 6px 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  white-space: nowrap;
}

.mm-studio-table tr:hover td {
  background: #f8fafc;
}

/* Alerts */
.mm-studio-alert {
  padding: 8px 11px;
  border-radius: 7px;
  font-size: 11px;
  line-height: 1.45;
}

.mm-alert-info {
  background: #f0f7ff;
  border: 1px solid #d0e2ff;
  color: #1e3a8a;
}

.mm-alert-warning {
  background: var(--ml-assistant-warn-bg, #fdf0d5);
  border: 1px solid #fde047;
  color: var(--ml-assistant-warn-text, #9c6b11);
}

.mm-alert-error {
  background: var(--ml-assistant-error-bg, #f7dfe3);
  border: 1px solid #fecdd3;
  color: var(--ml-assistant-error-text, #a33d4d);
}

/* Buttons (Matching AI Assistant) */
.mm-studio-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--ml-assistant-border, #dfe3ea);
  background: #ffffff;
  color: var(--ml-assistant-text, #253041);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.mm-studio-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.mm-studio-btn.mm-btn-primary {
  background: #4f46e5;
  border: 1px solid #4338ca;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(79, 70, 229, 0.25);
}

.mm-studio-btn.mm-btn-primary:hover:not(:disabled) {
  background: #4338ca;
  opacity: 1;
  transform: translateY(-1px);
}

.mm-studio-btn.mm-btn-accent {
  background: #f59e0b;
  border: 1px solid #d97706;
  color: #ffffff;
}

.mm-studio-btn.mm-btn-sm {
  padding: 4px 9px;
  font-size: 10.5px;
}

/* Level row pills */
.mm-studio-level-row {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.mm-level-pill {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--ml-assistant-border, #dfe3ea);
  background: #ffffff;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mm-level-pill:hover {
  background: #f8fafc;
  color: #1e293b;
}

.mm-level-pill.active {
  border-color: #86efac;
  background: #f0fdf4;
  color: #166534;
  font-weight: 700;
}

.mm-prep-level-banner {
  padding: 11px 14px;
  margin: 8px 0 12px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.55;
  font-weight: 550;
}

.mm-prep-level-basic {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.mm-prep-level-medium {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

.mm-prep-level-advanced {
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  color: #3730a3;
}

/* Preprocessing Cards */
.mm-prep-card {
  gap: 12px;
}

.mm-prep-hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.mm-prep-action {
  font-size: 14px;
  font-weight: 700;
  color: #173b2b;
}

.mm-prep-text {
  font-size: 13px;
  line-height: 1.6;
  color: #334155;
}

.mm-prep-profile {
  padding: 10px 12px;
  border: 1px solid #dbe4ef;
  border-radius: 10px;
  background: #f8fafc;
  color: #334155;
  font-size: 12.5px;
  line-height: 1.55;
}

.mm-prep-why {
  padding: 14px 16px;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  background: #f0fdf4;
  color: #166534;
  font-size: 14px;
  line-height: 1.65;
}

.mm-prep-why strong {
  color: #15803d;
  font-weight: 750;
}

.mm-prep-best-for {
  padding: 10px 12px;
  border: 1px solid #dbe4ef;
  border-radius: 10px;
  background: #f8fafc;
  color: #475569;
  font-size: 12.5px;
  line-height: 1.55;
}

.mm-prep-risk-box {
  padding: 11px 13px;
  border: 1px solid #fecaca;
  border-radius: 10px;
  background: #fef2f2;
  color: #991b1b;
  font-size: 12.5px;
  line-height: 1.55;
}

.mm-prep-risk {
  color: #b91c1c;
  background: #fef2f2;
  padding: 5px 9px;
  border-radius: 6px;
  border: 1px solid #fecaca;
  font-size: 12.5px;
}

.mm-prep-strategy-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
}

.mm-prep-btn-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.mm-prep-preview-box {
  background: #ffffff;
  border: 1px solid #dbe4ef;
  border-radius: 12px;
  padding: 14px;
  color: #1e293b;
  box-shadow: 0 2px 8px rgb(15 23 42 / 5%);
}

.mm-prep-preview-box .mm-stat-lbl {
  font-size: 11px;
  line-height: 1.35;
}

.mm-prep-preview-rationale {
  padding: 12px 14px;
  border-radius: 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  font-size: 13px;
  line-height: 1.6;
  color: #166534;
}

.mm-prep-preview-note {
  font-size: 12px;
  line-height: 1.5;
  color: #475569;
  margin: 7px 0 10px;
}

/* Select */
.mm-studio-select {
  background: #ffffff;
  border: 1px solid var(--ml-assistant-border, #dfe3ea);
  color: var(--ml-assistant-text, #253041);
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 11px;
  outline: none;
}

.mm-studio-select:focus {
  border-color: #6366f1;
}

.mm-select-sm {
  font-size: 10px;
  padding: 3px 6px;
}

.mm-studio-select-row {
  display: flex;
  gap: 6px;
}

/* Histogram Container */
.mm-studio-hist-container {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 90px;
  padding-top: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.mm-hist-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}

.mm-hist-bar {
  width: 100%;
  background: linear-gradient(180deg, #818cf8, #4f46e5);
  border-radius: 3px 3px 0 0;
  transition: height 0.3s ease;
}

.mm-hist-bar:hover {
  background: #6366f1;
}

.mm-hist-label {
  font-size: 8.5px;
  color: #64748b;
  margin-top: 4px;
}

/* Decision Tree Diagram */
.mm-tree-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.mm-tree-node {
  background: #ffffff;
  border: 1px solid var(--ml-assistant-border, #dfe3ea);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 10.5px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(31, 41, 55, 0.04);
}

.mm-node-title {
  font-weight: 700;
  color: #4338ca;
}

.mm-node-meta {
  font-size: 9.5px;
  color: #64748b;
}

.mm-tree-branches {
  display: flex;
  gap: 16px;
  width: 100%;
}

.mm-tree-branch {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.mm-branch-label {
  font-size: 9.5px;
  font-weight: 700;
  color: #0284c7;
}

.leaf-a { border-color: #a7f3d0; background: #f0fdf4; }
.leaf-b { border-color: #bae6fd; background: #f0f9ff; }
.leaf-c { border-color: #fde68a; background: #fffbeb; }

.mm-tree-subbranches {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

/* Toast */
.mm-studio-toast {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  border: 1px solid #334155;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 99px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  animation: mm-toast-in 0.2s ease;
  z-index: 100;
  white-space: nowrap;
}

@keyframes mm-toast-in {
  from { opacity: 0; transform: translate(-50%, 8px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.mm-studio-toast.fade-out {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mm-studio-empty, .mm-studio-loading {
  text-align: center;
  padding: 24px 12px;
  font-size: 11px;
  color: #64748b;
}
`,""]),e.d(a,{},{A:m})},314(t){t.exports=function(t){var a=[];return a.toString=function(){return this.map(function(a){var e="",o=void 0!==a[5];return a[4]&&(e+="@supports (".concat(a[4],") {")),a[2]&&(e+="@media ".concat(a[2]," {")),o&&(e+="@layer".concat(a[5].length>0?" ".concat(a[5]):""," {")),e+=t(a),o&&(e+="}"),a[2]&&(e+="}"),a[4]&&(e+="}"),e}).join("")},a.i=function(t,e,o,r,s){"string"==typeof t&&(t=[[null,t,void 0]]);var i={};if(o)for(var n=0;n<this.length;n++){var l=this[n][0];null!=l&&(i[l]=!0)}for(var d=0;d<t.length;d++){var p=[].concat(t[d]);o&&i[p[0]]||(void 0!==s&&(void 0===p[5]||(p[1]="@layer".concat(p[5].length>0?" ".concat(p[5]):""," {").concat(p[1],"}")),p[5]=s),e&&(p[2]&&(p[1]="@media ".concat(p[2]," {").concat(p[1],"}")),p[2]=e),r&&(p[4]?(p[1]="@supports (".concat(p[4],") {").concat(p[1],"}"),p[4]=r):p[4]="".concat(r)),a.push(p))}},a}},417(t){t.exports=function(t,a){return(a||(a={}),t&&(t=String(t.__esModule?t.default:t),/^['"].*['"]$/.test(t)&&(t=t.slice(1,-1)),a.hash&&(t+=a.hash),/["'() \t\n]|(%20)/.test(t)||a.needQuotes))?'"'.concat(t.replace(/"/g,'\\"').replace(/\n/g,"\\n"),'"'):t}},601(t){t.exports=function(t){return t[1]}},72(t){var a=[];function e(t){for(var e=-1,o=0;o<a.length;o++)if(a[o].identifier===t){e=o;break}return e}function o(t,o){for(var r={},s=[],i=0;i<t.length;i++){var n=t[i],l=o.base?n[0]+o.base:n[0],d=r[l]||0,p="".concat(l," ").concat(d);r[l]=d+1;var m=e(p),f={css:n[1],media:n[2],sourceMap:n[3],supports:n[4],layer:n[5]};if(-1!==m)a[m].references++,a[m].updater(f);else{var c=function(t,a){var e=a.domAPI(a);return e.update(t),function(a){a?(a.css!==t.css||a.media!==t.media||a.sourceMap!==t.sourceMap||a.supports!==t.supports||a.layer!==t.layer)&&e.update(t=a):e.remove()}}(f,o);o.byIndex=i,a.splice(i,0,{identifier:p,updater:c,references:1})}s.push(p)}return s}t.exports=function(t,r){var s=o(t=t||[],r=r||{});return function(t){t=t||[];for(var i=0;i<s.length;i++){var n=e(s[i]);a[n].references--}for(var l=o(t,r),d=0;d<s.length;d++){var p=e(s[d]);0===a[p].references&&(a[p].updater(),a.splice(p,1))}s=l}}},659(t){var a={};t.exports=function(t,e){var o=function(t){if(void 0===a[t]){var e=document.querySelector(t);if(window.HTMLIFrameElement&&e instanceof window.HTMLIFrameElement)try{e=e.contentDocument.head}catch(t){e=null}a[t]=e}return a[t]}(t);if(!o)throw Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");o.appendChild(e)}},540(t){t.exports=function(t){var a=document.createElement("style");return t.setAttributes(a,t.attributes),t.insert(a,t.options),a}},56(t,a,e){t.exports=function(t){var a=e.nc;a&&t.setAttribute("nonce",a)}},825(t){t.exports=function(t){if("u"<typeof document)return{update:function(){},remove:function(){}};var a=t.insertStyleElement(t);return{update:function(e){var o,r,s;o="",e.supports&&(o+="@supports (".concat(e.supports,") {")),e.media&&(o+="@media ".concat(e.media," {")),(r=void 0!==e.layer)&&(o+="@layer".concat(e.layer.length>0?" ".concat(e.layer):""," {")),o+=e.css,r&&(o+="}"),e.media&&(o+="}"),e.supports&&(o+="}"),(s=e.sourceMap)&&"u">typeof btoa&&(o+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(s))))," */")),t.styleTagTransform(o,a,t.options)},remove:function(){var t;null===(t=a).parentNode||t.parentNode.removeChild(t)}}}},113(t){t.exports=function(t,a){if(a.styleSheet)a.styleSheet.cssText=t;else{for(;a.firstChild;)a.removeChild(a.firstChild);a.appendChild(document.createTextNode(t))}}},959(t,a,e){var o=e(72),r=e.n(o),s=e(825),i=e.n(s),n=e(659),l=e.n(n),d=e(56),p=e.n(d),m=e(540),f=e.n(m),c=e(113),b=e.n(c),x=e(646),u={};u.styleTagTransform=b(),u.setAttributes=p(),u.insert=l().bind(null,"head"),u.domAPI=i(),u.insertStyleElement=f(),r()(x.A,u),x.A&&x.A.locals&&x.A.locals},665(t,a,e){t.exports=e.p+"68c5c2a70ed031f3.png"}}]);