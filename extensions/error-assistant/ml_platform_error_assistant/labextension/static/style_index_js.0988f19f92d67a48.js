"use strict";
(self["rspackChunk_ml_platform_error_assistant"] = self["rspackChunk_ml_platform_error_assistant"] || []).push([["style_index_js"], {
"./node_modules/css-loader/dist/cjs.js!./style/base.css"(module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": () => (__rspack_default_export)
});
/* import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__rspack_import_0 = __webpack_require__("./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__rspack_import_0);
/* import */ var _node_modules_css_loader_dist_runtime_api_js__rspack_import_1 = __webpack_require__("./node_modules/css-loader/dist/runtime/api.js");
/* import */ var _node_modules_css_loader_dist_runtime_api_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__rspack_import_1);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__rspack_import_1_default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__rspack_import_0_default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/*
    See the JupyterLab Developer Guide for useful CSS Patterns:

    https://jupyterlab.readthedocs.io/en/stable/developer/css.html
*/
`, "",{"version":3,"sources":["webpack://./style/base.css"],"names":[],"mappings":"AAAA;;;;CAIC","sourcesContent":["/*\n    See the JupyterLab Developer Guide for useful CSS Patterns:\n\n    https://jupyterlab.readthedocs.io/en/stable/developer/css.html\n*/\n"],"sourceRoot":""}]);
// Exports
/* export default */ const __rspack_default_export = (___CSS_LOADER_EXPORT___);


},
"./node_modules/css-loader/dist/cjs.js!./style/index.css"(module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": () => (__rspack_default_export)
});
/* import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__rspack_import_0 = __webpack_require__("./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__rspack_import_0);
/* import */ var _node_modules_css_loader_dist_runtime_api_js__rspack_import_1 = __webpack_require__("./node_modules/css-loader/dist/runtime/api.js");
/* import */ var _node_modules_css_loader_dist_runtime_api_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__rspack_import_1);
/* import */ var _node_modules_css_loader_dist_cjs_js_base_css__rspack_import_2 = __webpack_require__("./node_modules/css-loader/dist/cjs.js!./style/base.css");
/* import */ var _node_modules_css_loader_dist_runtime_getUrl_js__rspack_import_3 = __webpack_require__("./node_modules/css-loader/dist/runtime/getUrl.js");
/* import */ var _node_modules_css_loader_dist_runtime_getUrl_js__rspack_import_3_default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__rspack_import_3);
// Imports




var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */__webpack_require__("./style/modelmind-logo.png"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__rspack_import_1_default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__rspack_import_0_default()));
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_base_css__rspack_import_2["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__rspack_import_3_default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `:root {
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
  background: url(${___CSS_LOADER_URL_REPLACEMENT_0___}) center / contain no-repeat;
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
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--ml-assistant-border, #dfe3ea);
  background: #ffffff;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mm-level-pill:hover {
  background: #f8fafc;
  color: #1e293b;
}

.mm-level-pill.active {
  border-color: rgb(109 124 255 / 50%);
  background: var(--ml-assistant-accent-soft, #eef1ff);
  color: #4338ca;
  font-weight: 700;
}

/* Preprocessing Cards */
.mm-prep-card {
  gap: 10px;
}

.mm-prep-hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.mm-prep-action {
  font-size: 11.5px;
  font-weight: 700;
  color: #172554;
}

.mm-prep-text {
  font-size: 10.5px;
  line-height: 1.5;
  color: #475569;
}

.mm-prep-risk {
  color: #b91c1c;
  background: #fef2f2;
  padding: 5px 9px;
  border-radius: 6px;
  border: 1px solid #fecaca;
  font-size: 10.5px;
}

.mm-prep-strategy-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mm-prep-btn-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.mm-prep-preview-box {
  background: #f8fafc;
  border: 1px solid var(--ml-assistant-border, #dfe3ea);
  border-radius: 8px;
  padding: 10px;
  color: #1e293b;
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

/* ML Inspector */
.mm-inspector-textarea {
  width: 100%;
  height: 90px;
  background: #ffffff;
  border: 1px solid var(--ml-assistant-border, #dfe3ea);
  border-radius: 7px;
  color: var(--ml-assistant-text, #253041);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  padding: 8px 10px;
  outline: none;
  resize: vertical;
}

.mm-inspector-textarea:focus {
  border-color: #6366f1;
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
`, "",{"version":3,"sources":["webpack://./style/index.css"],"names":[],"mappings":"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","sourcesContent":["@import url('base.css');\n\n:root {\n  --ml-assistant-panel-bg: #f5f6f8;\n  --ml-assistant-card-bg: #fff;\n  --ml-assistant-border: #dfe3ea;\n  --ml-assistant-text: #253041;\n  --ml-assistant-muted: #5d6b80;\n  --ml-assistant-accent: #6d7cff;\n  --ml-assistant-accent-soft: #eef1ff;\n  --ml-assistant-error-bg: #f7dfe3;\n  --ml-assistant-error-text: #a33d4d;\n  --ml-assistant-success-bg: #dff5eb;\n  --ml-assistant-success-text: #1d7b54;\n  --ml-assistant-warn-bg: #fdf0d5;\n  --ml-assistant-warn-text: #9c6b11;\n  --ml-assistant-shadow: rgb(31 41 55 / 8%);\n}\n\n.ml-platform-error-assistant-panel {\n  background: var(--ml-assistant-panel-bg);\n  color: var(--ml-assistant-text);\n  border-left: 1px solid var(--ml-assistant-border);\n}\n\n[id='jp-MainLogo'] {\n  display: flex;\n  flex: 0 0 auto;\n  align-items: center;\n  width: auto;\n  min-width: 185px;\n  padding-right: 12px;\n}\n\n[id='jp-MainLogo'] > * {\n  display: none;\n}\n\n[id='jp-MainLogo']::before {\n  display: block;\n  flex: 0 0 30px;\n  width: 30px;\n  height: 30px;\n  background: url('./modelmind-logo.png') center / contain no-repeat;\n  content: '';\n}\n\n[id='jp-MainLogo']::after {\n  margin-left: 8px;\n  color: #172554;\n  content: 'ModelMind Notebook';\n  font-size: 14px;\n  font-weight: 700;\n  white-space: nowrap;\n}\n\n.ml-assistant-shell {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  min-height: 0;\n  padding: 14px 14px 18px;\n  box-sizing: border-box;\n  gap: 12px;\n}\n\n.ml-assistant-header {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 10px;\n}\n\n.ml-assistant-header h2 {\n  margin: 0;\n  font-size: 1.05rem;\n  line-height: 1.35;\n  font-weight: 700;\n  color: var(--ml-assistant-text);\n}\n\n.ml-assistant-header-controls {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  flex-wrap: wrap;\n  gap: 8px;\n}\n\n.ml-assistant-cloud-option {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  max-width: 190px;\n  color: var(--ml-assistant-text);\n  font-size: 11px;\n  line-height: 1.3;\n  cursor: pointer;\n}\n\n.ml-assistant-cloud-option input {\n  flex: 0 0 auto;\n  margin: 0;\n  accent-color: var(--ml-assistant-accent);\n}\n\n.ml-assistant-cloud-option input:disabled {\n  cursor: not-allowed;\n}\n\n.ml-assistant-provider-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  color: var(--ml-assistant-muted);\n  font-size: 11px;\n  font-weight: 600;\n}\n\n.ml-assistant-provider-select {\n  min-width: 128px;\n  border: 1px solid var(--ml-assistant-border);\n  border-radius: 6px;\n  padding: 5px 7px;\n  background: white;\n  color: var(--ml-assistant-text);\n  font-size: 11px;\n}\n\n.ml-assistant-primary-button,\n.ml-assistant-secondary-button,\n.ml-assistant-cta-button,\n.ml-assistant-actions button,\n.ml-assistant-tab {\n  border: 1px solid var(--ml-assistant-border);\n  border-radius: 8px;\n  background: white;\n  color: var(--ml-assistant-text);\n  font-size: 12px;\n  padding: 7px 10px;\n  cursor: pointer;\n  transition:\n    background-color 120ms ease,\n    border-color 120ms ease,\n    color 120ms ease,\n    box-shadow 120ms ease;\n}\n\n.ml-assistant-primary-button {\n  background: var(--ml-assistant-accent-soft);\n  border-color: rgb(109 124 255 / 35%);\n  color: var(--ml-assistant-accent);\n  font-weight: 600;\n}\n\n.ml-assistant-secondary-button {\n  background: white;\n}\n\n.ml-assistant-status-row {\n  display: flex;\n  gap: 8px;\n  align-items: center;\n  flex-wrap: wrap;\n  min-height: 24px;\n}\n\n.ml-assistant-status-pill {\n  display: inline-flex;\n  align-items: center;\n  border-radius: 999px;\n  padding: 5px 10px;\n  font-size: 11px;\n  font-weight: 600;\n  border: 1px solid transparent;\n}\n\n.ml-assistant-status-default {\n  background: #eef2f6;\n  color: var(--ml-assistant-muted);\n}\n\n.ml-assistant-status-success {\n  background: var(--ml-assistant-success-bg);\n  color: var(--ml-assistant-success-text);\n}\n\n.ml-assistant-status-warn {\n  background: var(--ml-assistant-warn-bg);\n  color: var(--ml-assistant-warn-text);\n}\n\n.ml-assistant-tab-row {\n  display: flex;\n  gap: 4px;\n  overflow-x: auto;\n  border-bottom: 1px solid var(--ml-assistant-border);\n  padding-bottom: 4px;\n}\n\n.ml-assistant-tab {\n  flex: 0 0 auto;\n  background: transparent;\n  border: none;\n  border-radius: 6px 6px 0 0;\n  padding: 8px 9px;\n  color: var(--ml-assistant-muted);\n  font-weight: 500;\n}\n\n.ml-assistant-tab.active {\n  background: var(--ml-assistant-accent-soft);\n  color: var(--ml-assistant-accent);\n  border: 1px solid rgb(109 124 255 / 25%);\n}\n\n.ml-assistant-content {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  flex: 1 1 auto;\n  min-height: 0;\n  overflow: auto;\n  padding: 1px 3px 6px 1px;\n  scrollbar-gutter: stable;\n}\n\n.ml-assistant-question-input {\n  width: 100%;\n  min-height: 92px;\n  box-sizing: border-box;\n  resize: vertical;\n  border: 1px solid var(--ml-assistant-border);\n  border-radius: 8px;\n  background: white;\n  color: var(--ml-assistant-text);\n  padding: 10px 12px;\n  font: inherit;\n  line-height: 1.5;\n}\n\n.ml-assistant-question-label {\n  display: flex;\n  flex-direction: column;\n  gap: 7px;\n  color: var(--ml-assistant-muted);\n  font-size: 12px;\n  font-weight: 600;\n}\n\n.ml-assistant-code-help-answer {\n  border-left: 3px solid var(--ml-assistant-accent);\n  padding: 4px 0 4px 12px;\n  color: var(--ml-assistant-text);\n  line-height: 1.45;\n  overflow-wrap: anywhere;\n}\n\n.ml-assistant-code-help-answer p {\n  margin: 0 0 8px;\n}\n\n.ml-assistant-code-help-answer ul {\n  margin: 0;\n  padding-left: 18px;\n}\n\n.ml-assistant-empty {\n  border: 1px dashed var(--ml-assistant-border);\n  border-radius: 10px;\n  background: rgb(255 255 255 / 40%);\n  color: var(--ml-assistant-muted);\n  padding: 20px 16px;\n  text-align: center;\n  line-height: 1.5;\n}\n\n.ml-assistant-cta-row {\n  display: flex;\n  justify-content: flex-start;\n}\n\n.ml-assistant-cta-button {\n  align-self: flex-start;\n  background: var(--ml-assistant-accent);\n  border-color: var(--ml-assistant-accent);\n  color: white;\n  font-weight: 600;\n  padding: 9px 14px;\n}\n\n.ml-assistant-result-header {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.ml-assistant-error-banner {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  border-radius: 8px;\n  background: #fff1f1;\n  border: 1px solid rgb(163 61 77 / 20%);\n  padding: 11px 12px;\n  color: var(--ml-assistant-error-text);\n}\n\n.ml-assistant-error-icon {\n  display: inline-flex;\n  flex: 0 0 20px;\n  align-items: center;\n  justify-content: center;\n  width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  background: #d92d20;\n  color: #fff;\n  font-size: 13px;\n  font-weight: 700;\n}\n\n.ml-assistant-error-copy {\n  min-width: 0;\n}\n\n.ml-assistant-error-title {\n  font-size: 13px;\n  font-weight: 700;\n  margin: 1px 0 3px;\n  overflow-wrap: anywhere;\n}\n\n.ml-assistant-error-message {\n  font-size: 12px;\n  line-height: 1.45;\n  overflow-wrap: anywhere;\n}\n\n.ml-assistant-traceback {\n  border: 1px solid var(--ml-assistant-border);\n  border-radius: 8px;\n  background: #fff;\n  color: var(--ml-assistant-muted);\n}\n\n.ml-assistant-traceback details {\n  padding: 8px 10px;\n}\n\n.ml-assistant-traceback summary {\n  color: var(--ml-assistant-muted);\n  font-size: 12px;\n  font-weight: 600;\n  cursor: pointer;\n}\n\n.ml-assistant-traceback pre {\n  max-height: 240px;\n  margin: 8px 0 0;\n  overflow: auto;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n  font-family: monospace;\n  font-size: 11px;\n  line-height: 1.5;\n  color: var(--ml-assistant-text);\n}\n\n.ml-assistant-card {\n  border-radius: 10px;\n  border: 1px solid var(--ml-assistant-border);\n  padding: 12px;\n  background: white;\n  box-shadow: 0 1px 2px var(--ml-assistant-shadow);\n}\n\n.ml-assistant-card-blue {\n  background: #edf4ff;\n  border-color: #d3e3ff;\n}\n\n.ml-assistant-card-green {\n  background: #edf9f2;\n  border-color: #cfeee1;\n}\n\n.ml-assistant-card-title {\n  font-size: 12px;\n  font-weight: 700;\n  color: #173ea5;\n  margin-bottom: 7px;\n}\n\n.ml-assistant-card p {\n  margin: 0 0 8px;\n  color: var(--ml-assistant-text);\n  font-size: 12px;\n  line-height: 1.55;\n  overflow-wrap: anywhere;\n}\n\n.ml-assistant-card ul {\n  margin: 0;\n  padding-left: 17px;\n  color: var(--ml-assistant-text);\n  font-size: 12px;\n  line-height: 1.5;\n}\n\n.ml-assistant-card li + li {\n  margin-top: 4px;\n}\n\n.ml-assistant-code-block {\n  background: rgb(255 255 255 / 80%);\n  border: 1px solid var(--ml-assistant-border);\n  border-radius: 7px;\n  padding: 10px;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n  font-family: monospace;\n  font-size: 12px;\n  line-height: 1.5;\n}\n\n.ml-assistant-actions {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 8px;\n  margin-top: 4px;\n  padding-bottom: 2px;\n}\n\n.ml-assistant-actions button {\n  min-width: 0;\n  overflow-wrap: anywhere;\n}\n\n.ml-assistant-actions .ml-assistant-action-wide {\n  grid-column: 1 / -1;\n}\n\n@media (width <= 520px) {\n  [id='jp-MainLogo'] {\n    min-width: 0;\n  }\n\n  [id='jp-MainLogo']::after {\n    content: 'ModelMind';\n  }\n\n  .ml-assistant-header {\n    flex-wrap: wrap;\n  }\n\n  .ml-assistant-header-controls {\n    justify-content: flex-start;\n    width: 100%;\n  }\n\n  .ml-assistant-cloud-option {\n    max-width: none;\n  }\n}\n\n.ml-assistant-primary-button:focus-visible,\n.ml-assistant-secondary-button:focus-visible,\n.ml-assistant-cta-button:focus-visible,\n.ml-assistant-actions button:focus-visible,\n.ml-assistant-tab:focus-visible,\n.ml-assistant-question-input:focus-visible {\n  outline: 2px solid var(--ml-assistant-accent);\n  outline-offset: 2px;\n}\n\n.ml-assistant-primary-button:disabled,\n.ml-assistant-secondary-button:disabled,\n.ml-assistant-cta-button:disabled,\n.ml-assistant-actions button:disabled {\n  cursor: not-allowed;\n  opacity: 0.6;\n}\n\n.ml-assistant-primary-button:hover:not(:disabled),\n.ml-assistant-secondary-button:hover:not(:disabled),\n.ml-assistant-cta-button:hover:not(:disabled),\n.ml-assistant-actions button:hover:not(:disabled) {\n  box-shadow: 0 2px 7px var(--ml-assistant-shadow);\n}\n\n/* ═══════════════════════════════════════════════════════════\n   MODELMIND STUDIO — UNIFIED SLIDE BAR STYLES\n   ═══════════════════════════════════════════════════════════ */\n\n/* Single Left Sidebar Icon */\n.mm-sidebar-icon {\n  background-size: 16px;\n  background-repeat: no-repeat;\n  background-position: center;\n}\n.mm-icon-modelmind::before {\n  content: '◈';\n  font-size: 18px;\n  font-weight: 900;\n  background: linear-gradient(135deg, #a78bfa, #818cf8);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  display: inline-block;\n  line-height: 1;\n}\n\n/* ═══════════════════════════════════════════════════════════\n   LEFT SIDEBAR ACTIVITY BAR — FIVE SECTION NAMES & STYLES\n   ═══════════════════════════════════════════════════════════ */\n\n:root {\n  --jp-private-sidebar-tab-width: 58px !important;\n}\n\n.jp-SideBar.lm-TabBar.jp-mod-left {\n  min-width: 58px !important;\n  max-width: 58px !important;\n  width: 58px !important;\n  background: #ffffff !important;\n  border-right: 1px solid #e2e8f0 !important;\n  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.02) !important;\n  z-index: 10 !important;\n}\n\n.jp-SideBar.jp-mod-left .lm-TabBar-content {\n  width: 100% !important;\n  display: flex !important;\n  flex-direction: column !important;\n}\n\n.jp-SideBar.jp-mod-left .lm-TabBar-tab {\n  width: 100% !important;\n  box-sizing: border-box !important;\n  padding: 8px 2px 6px !important;\n  min-height: 52px !important;\n  height: auto !important;\n  display: flex !important;\n  flex-direction: column !important;\n  align-items: center !important;\n  justify-content: center !important;\n  gap: 3px !important;\n  cursor: pointer !important;\n  pointer-events: auto !important;\n  z-index: 11 !important;\n  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;\n  background: #ffffff !important;\n  position: relative !important;\n  border-left: 3px solid transparent !important;\n  border-top: none !important;\n  border-right: none !important;\n  border-bottom: 1px solid #f1f5f9 !important;\n}\n\n.jp-SideBar.jp-mod-left .lm-TabBar-tab:hover {\n  background: #f8fafc !important;\n}\n\n.jp-SideBar.jp-mod-left .lm-TabBar-tab:hover .mm-sidebar-tab-label {\n  color: #0f172a !important;\n}\n\n.jp-SideBar.jp-mod-left .lm-TabBar-tab.lm-mod-current {\n  background: #f5f3ff !important;\n  border-left: 3px solid #7c3aed !important;\n}\n\n.jp-SideBar.jp-mod-left .lm-TabBar-tabIcon {\n  margin: 0 !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  transform: scale(1.05);\n  transition: transform 0.18s ease !important;\n  filter: grayscale(0.2);\n}\n\n.jp-SideBar.jp-mod-left .lm-TabBar-tab:hover .lm-TabBar-tabIcon {\n  transform: scale(1.15);\n  filter: none;\n}\n\n.jp-SideBar.jp-mod-left .lm-TabBar-tab.lm-mod-current .lm-TabBar-tabIcon {\n  filter: none;\n}\n\n/* Custom Clear Text Label for the 5 Sections (Light Mode) */\n.mm-sidebar-tab-label {\n  display: block !important;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;\n  font-size: 9.5px !important;\n  font-weight: 600 !important;\n  line-height: 1.15 !important;\n  text-align: center !important;\n  color: #475569 !important;\n  white-space: normal !important;\n  word-break: break-word !important;\n  max-width: 60px !important;\n  letter-spacing: -0.15px !important;\n  pointer-events: none !important;\n  user-select: none !important;\n  transition: color 0.18s ease !important;\n}\n\n.jp-SideBar.jp-mod-left .lm-TabBar-tab.lm-mod-current .mm-sidebar-tab-label {\n  color: #6d28d9 !important;\n  font-weight: 700 !important;\n}\n\n/* Special accent badge for ModelMind Studio (ML Studio) */\n.jp-SideBar.jp-mod-left .lm-TabBar-tab[data-id*='modelmind'] .mm-sidebar-tab-label {\n  color: #7c3aed !important;\n  font-weight: 700 !important;\n}\n\n.jp-SideBar.jp-mod-left .lm-TabBar-tab[data-id*='modelmind'].lm-mod-current .mm-sidebar-tab-label {\n  color: #5b21b6 !important;\n}\n\n/* Hide default rotated lumino label */\n.jp-SideBar.jp-mod-left .lm-TabBar-tabLabel {\n  display: none !important;\n}\n\n/* ═══════════════════════════════════════════════════════════\n   MODELMIND STUDIO — CLEAN LIGHT THEME (MATCHING AI ASSISTANT)\n   ═══════════════════════════════════════════════════════════ */\n\n.mm-modelmind-panel {\n  overflow: hidden !important;\n  background: var(--ml-assistant-panel-bg, #f5f6f8) !important;\n  color: var(--ml-assistant-text, #253041) !important;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;\n}\n\n.mm-studio-root {\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  background: var(--ml-assistant-panel-bg, #f5f6f8);\n  color: var(--ml-assistant-text, #253041);\n  position: relative;\n}\n\n/* Header */\n.mm-studio-header {\n  padding: 12px 14px 10px;\n  background: #ffffff;\n  border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);\n  flex-shrink: 0;\n  box-shadow: 0 1px 3px rgba(31, 41, 55, 0.03);\n}\n\n.mm-studio-brand {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 10px;\n}\n\n.mm-studio-logo {\n  width: 24px;\n  height: 24px;\n  border-radius: 6px;\n  background: linear-gradient(135deg, #6366f1, #4f46e5);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #fff;\n  font-size: 13px;\n  font-weight: 900;\n  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.25);\n}\n\n.mm-studio-title-box {\n  min-width: 0;\n}\n\n.mm-studio-title {\n  font-size: 13px;\n  font-weight: 700;\n  color: #172554;\n  letter-spacing: -0.1px;\n}\n\n.mm-studio-sub {\n  font-size: 9.5px;\n  color: var(--ml-assistant-muted, #5d6b80);\n  margin-top: 1px;\n}\n\n.mm-studio-path-wrap {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.mm-studio-input-row {\n  display: flex;\n  gap: 6px;\n}\n\n.mm-studio-input {\n  flex: 1;\n  background: #ffffff;\n  border: 1px solid var(--ml-assistant-border, #dfe3ea);\n  color: var(--ml-assistant-text, #253041);\n  padding: 6px 10px;\n  border-radius: 6px;\n  font-size: 11px;\n  outline: none;\n  transition: all 0.15s ease;\n}\n\n.mm-studio-input:focus {\n  border-color: #6366f1;\n  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);\n}\n\n.mm-studio-quick-row {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-wrap: wrap;\n}\n\n.mm-studio-quick-pill {\n  background: #f1f5f9;\n  border: 1px solid #e2e8f0;\n  color: #475569;\n  padding: 3px 8px;\n  border-radius: 6px;\n  font-size: 9.5px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.15s ease;\n}\n\n.mm-studio-quick-pill:hover {\n  background: var(--ml-assistant-accent-soft, #eef1ff);\n  border-color: #c7d2fe;\n  color: #4338ca;\n}\n\n.mm-studio-status-pill {\n  font-size: 10px;\n  padding: 5px 9px;\n  border-radius: 6px;\n  background: #f8fafc;\n  border: 1px solid #e2e8f0;\n  color: #64748b;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  font-weight: 500;\n}\n\n.mm-studio-status-pill.success {\n  color: var(--ml-assistant-success-text, #1d7b54);\n  border-color: #a7f3d0;\n  background: var(--ml-assistant-success-bg, #dff5eb);\n  font-weight: 600;\n}\n\n.mm-studio-status-pill.loading {\n  color: #4f46e5;\n  border-color: #c7d2fe;\n  background: var(--ml-assistant-accent-soft, #eef1ff);\n}\n\n.mm-studio-status-pill.error {\n  color: var(--ml-assistant-error-text, #a33d4d);\n  border-color: #fecdd3;\n  background: var(--ml-assistant-error-bg, #f7dfe3);\n  font-weight: 600;\n}\n\n/* Slide Bar / Tab Bar */\n.mm-studio-tab-bar {\n  display: flex;\n  gap: 5px;\n  padding: 8px 12px;\n  background: #ffffff;\n  border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);\n  overflow-x: auto;\n  flex-shrink: 0;\n  scrollbar-width: none;\n}\n\n.mm-studio-tab-bar::-webkit-scrollbar {\n  display: none;\n}\n\n.mm-studio-tab {\n  padding: 6px 11px;\n  border-radius: 8px;\n  border: 1px solid var(--ml-assistant-border, #dfe3ea);\n  background: #ffffff;\n  color: #475569;\n  font-size: 11px;\n  font-weight: 600;\n  cursor: pointer;\n  white-space: nowrap;\n  transition: all 0.15s ease;\n}\n\n.mm-studio-tab:hover {\n  color: #1e293b;\n  background: #f8fafc;\n  border-color: #cbd5e1;\n}\n\n.mm-studio-tab.active {\n  background: var(--ml-assistant-accent-soft, #eef1ff);\n  border-color: rgb(109 124 255 / 45%);\n  color: #4338ca;\n  font-weight: 700;\n  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.12);\n}\n\n/* Content Area */\n.mm-studio-content {\n  flex: 1;\n  overflow-y: auto;\n  padding: 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  background: var(--ml-assistant-panel-bg, #f5f6f8);\n}\n\n.mm-studio-section {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.mm-studio-sec-title {\n  font-size: 12px;\n  font-weight: 700;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  color: var(--ml-assistant-text, #253041);\n}\n\n.mm-studio-sec-sub {\n  font-size: 10px;\n  color: var(--ml-assistant-muted, #5d6b80);\n  margin-top: -4px;\n}\n\n/* Cards (Matching AI Assistant style) */\n.mm-studio-card {\n  background: #ffffff;\n  border: 1px solid var(--ml-assistant-border, #dfe3ea);\n  border-radius: 8px;\n  padding: 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  box-shadow: 0 1px 3px rgba(31, 41, 55, 0.03);\n  transition: all 0.15s ease;\n  color: var(--ml-assistant-text, #253041);\n}\n\n.mm-studio-card:hover {\n  border-color: #cbd5e1;\n  box-shadow: 0 2px 6px rgba(31, 41, 55, 0.06);\n}\n\n.mm-card-error {\n  border-color: #fecdd3;\n  background: var(--ml-assistant-error-bg, #f7dfe3);\n  color: var(--ml-assistant-error-text, #a33d4d);\n}\n\n/* Stats Grid */\n.mm-studio-stats-grid {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 8px;\n}\n\n.mm-stat-box {\n  background: #f8fafc;\n  border: 1px solid #e2e8f0;\n  border-radius: 8px;\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n\n.mm-stat-val {\n  font-size: 17px;\n  font-weight: 800;\n  color: #4f46e5;\n}\n\n.mm-stat-lbl {\n  font-size: 9.5px;\n  color: var(--ml-assistant-muted, #5d6b80);\n  text-transform: uppercase;\n  letter-spacing: 0.4px;\n  font-weight: 600;\n}\n\n/* Badges */\n.mm-studio-badge {\n  display: inline-flex;\n  align-items: center;\n  padding: 3px 8px;\n  border-radius: 99px;\n  font-size: 9.5px;\n  font-weight: 700;\n  letter-spacing: 0.2px;\n}\n\n.badge-num {\n  background: var(--ml-assistant-success-bg, #dff5eb);\n  color: var(--ml-assistant-success-text, #1d7b54);\n  border: 1px solid #a7f3d0;\n}\n\n.badge-cat {\n  background: var(--ml-assistant-accent-soft, #eef1ff);\n  color: #4338ca;\n  border: 1px solid #c7d2fe;\n}\n\n/* Bar Rows */\n.mm-studio-bar-row {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  font-size: 10px;\n  color: var(--ml-assistant-text, #253041);\n}\n\n.mm-studio-bar-label {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  font-weight: 500;\n}\n\n.mm-studio-bar-val {\n  color: var(--ml-assistant-muted, #5d6b80);\n}\n\n.mm-studio-bar-track {\n  height: 6px;\n  background: #e2e8f0;\n  border-radius: 99px;\n  overflow: hidden;\n}\n\n.mm-studio-bar-fill {\n  height: 100%;\n  border-radius: 99px;\n  transition: width 0.3s ease;\n  background: #6366f1;\n}\n\n/* Table (Clean Light Mode) */\n.mm-studio-table-wrap {\n  max-height: 220px;\n  overflow: auto;\n  border: 1px solid var(--ml-assistant-border, #dfe3ea);\n  border-radius: 8px;\n  background: #ffffff;\n}\n\n.mm-studio-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 10.5px;\n  text-align: left;\n}\n\n.mm-studio-table th {\n  background: #f8fafc;\n  color: #1e293b;\n  padding: 7px 10px;\n  font-weight: 700;\n  position: sticky;\n  top: 0;\n  border-bottom: 1px solid #e2e8f0;\n  white-space: nowrap;\n}\n\n.mm-th-dtype {\n  font-size: 8.5px;\n  color: #64748b;\n  font-weight: 500;\n  display: block;\n}\n\n.mm-studio-table td {\n  padding: 6px 10px;\n  border-bottom: 1px solid #f1f5f9;\n  color: #334155;\n  white-space: nowrap;\n}\n\n.mm-studio-table tr:hover td {\n  background: #f8fafc;\n}\n\n/* Alerts */\n.mm-studio-alert {\n  padding: 8px 11px;\n  border-radius: 7px;\n  font-size: 11px;\n  line-height: 1.45;\n}\n\n.mm-alert-info {\n  background: #f0f7ff;\n  border: 1px solid #d0e2ff;\n  color: #1e3a8a;\n}\n\n.mm-alert-warning {\n  background: var(--ml-assistant-warn-bg, #fdf0d5);\n  border: 1px solid #fde047;\n  color: var(--ml-assistant-warn-text, #9c6b11);\n}\n\n.mm-alert-error {\n  background: var(--ml-assistant-error-bg, #f7dfe3);\n  border: 1px solid #fecdd3;\n  color: var(--ml-assistant-error-text, #a33d4d);\n}\n\n/* Buttons (Matching AI Assistant) */\n.mm-studio-btn {\n  padding: 6px 12px;\n  border-radius: 8px;\n  border: 1px solid var(--ml-assistant-border, #dfe3ea);\n  background: #ffffff;\n  color: var(--ml-assistant-text, #253041);\n  font-size: 11px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  white-space: nowrap;\n}\n\n.mm-studio-btn:hover:not(:disabled) {\n  background: #f8fafc;\n  border-color: #cbd5e1;\n}\n\n.mm-studio-btn.mm-btn-primary {\n  background: #4f46e5;\n  border: 1px solid #4338ca;\n  color: #ffffff;\n  font-weight: 600;\n  box-shadow: 0 1px 3px rgba(79, 70, 229, 0.25);\n}\n\n.mm-studio-btn.mm-btn-primary:hover:not(:disabled) {\n  background: #4338ca;\n  opacity: 1;\n  transform: translateY(-1px);\n}\n\n.mm-studio-btn.mm-btn-accent {\n  background: #f59e0b;\n  border: 1px solid #d97706;\n  color: #ffffff;\n}\n\n.mm-studio-btn.mm-btn-sm {\n  padding: 4px 9px;\n  font-size: 10.5px;\n}\n\n/* Level row pills */\n.mm-studio-level-row {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  flex-wrap: wrap;\n}\n\n.mm-level-pill {\n  padding: 4px 10px;\n  border-radius: 6px;\n  border: 1px solid var(--ml-assistant-border, #dfe3ea);\n  background: #ffffff;\n  color: #64748b;\n  font-size: 10.5px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.15s ease;\n}\n\n.mm-level-pill:hover {\n  background: #f8fafc;\n  color: #1e293b;\n}\n\n.mm-level-pill.active {\n  border-color: rgb(109 124 255 / 50%);\n  background: var(--ml-assistant-accent-soft, #eef1ff);\n  color: #4338ca;\n  font-weight: 700;\n}\n\n/* Preprocessing Cards */\n.mm-prep-card {\n  gap: 10px;\n}\n\n.mm-prep-hdr {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 8px;\n}\n\n.mm-prep-action {\n  font-size: 11.5px;\n  font-weight: 700;\n  color: #172554;\n}\n\n.mm-prep-text {\n  font-size: 10.5px;\n  line-height: 1.5;\n  color: #475569;\n}\n\n.mm-prep-risk {\n  color: #b91c1c;\n  background: #fef2f2;\n  padding: 5px 9px;\n  border-radius: 6px;\n  border: 1px solid #fecaca;\n  font-size: 10.5px;\n}\n\n.mm-prep-strategy-row {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.mm-prep-btn-row {\n  display: flex;\n  gap: 6px;\n  flex-wrap: wrap;\n  padding-top: 4px;\n}\n\n.mm-prep-preview-box {\n  background: #f8fafc;\n  border: 1px solid var(--ml-assistant-border, #dfe3ea);\n  border-radius: 8px;\n  padding: 10px;\n  color: #1e293b;\n}\n\n/* Select */\n.mm-studio-select {\n  background: #ffffff;\n  border: 1px solid var(--ml-assistant-border, #dfe3ea);\n  color: var(--ml-assistant-text, #253041);\n  padding: 5px 8px;\n  border-radius: 6px;\n  font-size: 11px;\n  outline: none;\n}\n\n.mm-studio-select:focus {\n  border-color: #6366f1;\n}\n\n.mm-select-sm {\n  font-size: 10px;\n  padding: 3px 6px;\n}\n\n.mm-studio-select-row {\n  display: flex;\n  gap: 6px;\n}\n\n/* Histogram Container */\n.mm-studio-hist-container {\n  display: flex;\n  align-items: flex-end;\n  gap: 4px;\n  height: 90px;\n  padding-top: 10px;\n  border-bottom: 1px solid #e2e8f0;\n}\n\n.mm-hist-col {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  height: 100%;\n  justify-content: flex-end;\n}\n\n.mm-hist-bar {\n  width: 100%;\n  background: linear-gradient(180deg, #818cf8, #4f46e5);\n  border-radius: 3px 3px 0 0;\n  transition: height 0.3s ease;\n}\n\n.mm-hist-bar:hover {\n  background: #6366f1;\n}\n\n.mm-hist-label {\n  font-size: 8.5px;\n  color: #64748b;\n  margin-top: 4px;\n}\n\n/* ML Inspector */\n.mm-inspector-textarea {\n  width: 100%;\n  height: 90px;\n  background: #ffffff;\n  border: 1px solid var(--ml-assistant-border, #dfe3ea);\n  border-radius: 7px;\n  color: var(--ml-assistant-text, #253041);\n  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;\n  font-size: 11px;\n  padding: 8px 10px;\n  outline: none;\n  resize: vertical;\n}\n\n.mm-inspector-textarea:focus {\n  border-color: #6366f1;\n}\n\n/* Decision Tree Diagram */\n.mm-tree-diagram {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 12px;\n  padding: 8px 0;\n}\n\n.mm-tree-node {\n  background: #ffffff;\n  border: 1px solid var(--ml-assistant-border, #dfe3ea);\n  border-radius: 8px;\n  padding: 8px 12px;\n  font-size: 10.5px;\n  text-align: center;\n  box-shadow: 0 1px 3px rgba(31, 41, 55, 0.04);\n}\n\n.mm-node-title {\n  font-weight: 700;\n  color: #4338ca;\n}\n\n.mm-node-meta {\n  font-size: 9.5px;\n  color: #64748b;\n}\n\n.mm-tree-branches {\n  display: flex;\n  gap: 16px;\n  width: 100%;\n}\n\n.mm-tree-branch {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n}\n\n.mm-branch-label {\n  font-size: 9.5px;\n  font-weight: 700;\n  color: #0284c7;\n}\n\n.leaf-a { border-color: #a7f3d0; background: #f0fdf4; }\n.leaf-b { border-color: #bae6fd; background: #f0f9ff; }\n.leaf-c { border-color: #fde68a; background: #fffbeb; }\n\n.mm-tree-subbranches {\n  display: flex;\n  gap: 6px;\n  margin-top: 6px;\n}\n\n/* Toast */\n.mm-studio-toast {\n  position: absolute;\n  bottom: 16px;\n  left: 50%;\n  transform: translateX(-50%);\n  background: #1e293b;\n  border: 1px solid #334155;\n  color: #ffffff;\n  font-size: 11px;\n  font-weight: 600;\n  padding: 6px 14px;\n  border-radius: 99px;\n  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);\n  pointer-events: none;\n  animation: mm-toast-in 0.2s ease;\n  z-index: 100;\n  white-space: nowrap;\n}\n\n@keyframes mm-toast-in {\n  from { opacity: 0; transform: translate(-50%, 8px); }\n  to { opacity: 1; transform: translate(-50%, 0); }\n}\n\n.mm-studio-toast.fade-out {\n  opacity: 0;\n  transition: opacity 0.3s ease;\n}\n\n.mm-studio-empty, .mm-studio-loading {\n  text-align: center;\n  padding: 24px 12px;\n  font-size: 11px;\n  color: #64748b;\n}\n"],"sourceRoot":""}]);
// Exports
/* export default */ const __rspack_default_export = (___CSS_LOADER_EXPORT___);


},
"./node_modules/css-loader/dist/runtime/api.js"(module) {


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

},
"./node_modules/css-loader/dist/runtime/getUrl.js"(module) {


module.exports = function (url, options) {
  if (!options) {
    options = {};
  }
  if (!url) {
    return url;
  }
  url = String(url.__esModule ? url.default : url);

  // If url is already wrapped in quotes, remove them
  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }
  if (options.hash) {
    url += options.hash;
  }

  // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls
  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }
  return url;
};

},
"./node_modules/css-loader/dist/runtime/sourceMaps.js"(module) {


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

},
"./style/index.css"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": () => (__rspack_default_export)
});
/* import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__rspack_import_0 = __webpack_require__("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__rspack_import_0);
/* import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__rspack_import_1 = __webpack_require__("./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__rspack_import_1);
/* import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__rspack_import_2 = __webpack_require__("./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__rspack_import_2_default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__rspack_import_2);
/* import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__rspack_import_3 = __webpack_require__("./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__rspack_import_3_default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__rspack_import_3);
/* import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__rspack_import_4 = __webpack_require__("./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__rspack_import_4_default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__rspack_import_4);
/* import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__rspack_import_5 = __webpack_require__("./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__rspack_import_5_default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__rspack_import_5);
/* import */ var _node_modules_css_loader_dist_cjs_js_index_css__rspack_import_6 = __webpack_require__("./node_modules/css-loader/dist/cjs.js!./style/index.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__rspack_import_5_default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__rspack_import_3_default());
options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__rspack_import_2_default().bind(null, "head");
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__rspack_import_1_default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__rspack_import_4_default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__rspack_import_0_default()(_node_modules_css_loader_dist_cjs_js_index_css__rspack_import_6["default"], options);




       /* export default */ const __rspack_default_export = (_node_modules_css_loader_dist_cjs_js_index_css__rspack_import_6["default"] && _node_modules_css_loader_dist_cjs_js_index_css__rspack_import_6["default"].locals ? _node_modules_css_loader_dist_cjs_js_index_css__rspack_import_6["default"].locals : undefined);


},
"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"(module) {


var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

},
"./node_modules/style-loader/dist/runtime/insertBySelector.js"(module) {


var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

},
"./node_modules/style-loader/dist/runtime/insertStyleElement.js"(module) {


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

},
"./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js"(module, __unused_rspack_exports, __webpack_require__) {


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

},
"./node_modules/style-loader/dist/runtime/styleDomAPI.js"(module) {


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

},
"./node_modules/style-loader/dist/runtime/styleTagTransform.js"(module) {


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

},
"./style/index.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
/* import */ var _index_css__rspack_import_0 = __webpack_require__("./style/index.css");



},
"./style/modelmind-logo.png"(module, __unused_rspack_exports, __webpack_require__) {
module.exports = __webpack_require__.p + "68c5c2a70ed031f3.png";

},

}]);
//# sourceMappingURL=style_index_js.0988f19f92d67a48.js.map