"use strict";(self.rspackChunk_ml_platform_error_assistant=self.rspackChunk_ml_platform_error_assistant||[]).push([[904],{795(e,t,a){let n,s;a.r(t),a.d(t,{default:()=>F});var i=a(320),o=a(427),l=a(542),r=a(698),d=a(660),c=a(665),m=a(901),p=a(904);async function u(e,t,a={}){let n,s=m.URLExt.join(t.baseUrl,e);try{n=await p.ServerConnection.makeRequest(s,a,t)}catch(e){throw new p.ServerConnection.NetworkError(e)}let i=await n.text();if(i.length>0)try{i=JSON.parse(i)}catch(e){console.log("Not a JSON response body.",n)}if(!n.ok){let e="string"==typeof i?i:i&&"object"==typeof i&&(i.message||i.error)||n.statusText;throw new p.ServerConnection.ResponseError(n,"string"==typeof e?e:JSON.stringify(e))}return i}function b(e,t){let a=0;for(let n=t;n<e.length;n+=1)if((a+=function(e){let t=0,a=null,n=!1;for(let s of e){if(a){n?n=!1:"\\"===s?n=!0:s===a&&(a=null);continue}'"'===s||"'"===s?a=s:"("===s?t+=1:")"===s&&(t-=1)}return t}(e[n]))<=0)return n;return e.length-1}function f(e){var t;let a=e.split("\n"),n=[];for(let e=0;e<a.length;e+=1){let s=a[e],i=s.match(/^(\s*)if\b.*:\s*$/),o=e+1,l=a[o],r=null==l?void 0:l.match(/^(\s*)raise\b/);if(i&&r&&r[1].length>i[1].length){e=b(a,o);continue}if(r){let s=n.length-1;for(;s>=0&&!n[s].trim();)s-=1;let i=null==(t=n[s])?void 0:t.match(/^(\s*)if\b.*:\s*$/);i&&i[1].length<r[1].length&&n.splice(s),e=b(a,e);continue}n.push(s)}return n.join("\n").replace(/\n{3,}/g,"\n\n")}function h(e){return e.toLowerCase().replace(/\s*\([^)]*\)/g,"").replace(/[^a-z0-9]/g,"").replace(/regressor$/,"regression").replace(/classifier$/,"classification")}class g extends d.Widget{constructor(e,t){super(),this._activeTab="xray",this._currentPath="50_Startups.csv",this._resolvedDatasetPath="",this._dataset=null,this._prepLevel="basic",this._targetCol="",this._featureCol="",this._tabButtons=new Map,this._app=e,this._notebooks=t,this.id="modelmind-studio-sidebar",this.title.caption="ModelMind Studio",this.title.iconClass="mm-sidebar-icon mm-icon-modelmind",this.addClass("mm-modelmind-panel"),this._root=document.createElement("div"),this._root.className="mm-studio-root",this.node.appendChild(this._root),this._buildHeader(),this._buildTabs(),this._buildContentArea(),this._bindNotebookTracker(),setTimeout(()=>{this._loadDataset(this._currentPath)},100)}_buildHeader(){let e=document.createElement("div");e.className="mm-studio-header";let t=document.createElement("div");t.className="mm-studio-brand",t.innerHTML=`
      <div class="mm-studio-logo">◈</div>
      <div class="mm-studio-title-box">
        <div class="mm-studio-title">ModelMind Studio</div>
        <div class="mm-studio-sub">AI ML Intelligence & Laboratory</div>
      </div>
    `;let a=document.createElement("div");a.className="mm-studio-path-wrap";let n=document.createElement("div");n.className="mm-studio-input-row",this._pathInput=document.createElement("input"),this._pathInput.type="text",this._pathInput.className="mm-studio-input",this._pathInput.placeholder="e.g. 50_Startups.csv",this._pathInput.value=this._currentPath;let s=document.createElement("button");s.type="button",s.className="mm-studio-btn mm-btn-primary",s.innerHTML="\uD83D\uDD0D Analyze",s.title="Analyze Dataset",s.addEventListener("click",()=>{let e=this._pathInput.value.trim();e&&this._loadDataset(e)}),n.append(this._pathInput,s);let i=document.createElement("div");i.className="mm-studio-quick-row";let o=document.createElement("button");o.type="button",o.className="mm-studio-quick-pill",o.innerHTML="⚡ Auto-Detect",o.title="Detect dataset from open notebook cell",o.addEventListener("click",()=>this._autoDetectDataset());let l=document.createElement("button");l.type="button",l.className="mm-studio-quick-pill",l.textContent="50_Startups.csv",l.addEventListener("click",()=>{this._pathInput.value="50_Startups.csv",this._loadDataset("50_Startups.csv")});let r=document.createElement("button");r.type="button",r.className="mm-studio-quick-pill",r.textContent="test_dataset.csv",r.addEventListener("click",()=>{this._pathInput.value="test_dataset.csv",this._loadDataset("test_dataset.csv")}),i.append(o,l,r),this._statusPill=document.createElement("div"),this._statusPill.className="mm-studio-status-pill",this._statusPill.textContent="Ready to analyze",a.append(n,i,this._statusPill),e.append(t,a),this._root.appendChild(e)}_buildTabs(){this._tabRow=document.createElement("div"),this._tabRow.className="mm-studio-tab-bar",[{id:"xray",label:"\uD83D\uDD2C X-Ray"},{id:"target",label:"\uD83C\uDFAF Target"},{id:"feature",label:"\uD83D\uDCCA Feature"},{id:"prep",label:"\uD83E\uDDE0 Preprocessing"},{id:"model-advisor",label:"\uD83E\uDD16 Model Advisor"},{id:"lab",label:"⚗️ Model Lab"},{id:"inspector",label:"⚠️ ML Inspector"},{id:"guide",label:"\uD83D\uDCD6 Guide"}].forEach(e=>{let t=document.createElement("button");t.type="button",t.className=`mm-studio-tab ${e.id===this._activeTab?"active":""}`,t.textContent=e.label,t.addEventListener("click",()=>{this._activeTab=e.id,this._tabButtons.forEach((t,a)=>{t.classList.toggle("active",a===e.id)}),this._renderCurrentTab()}),this._tabRow.appendChild(t),this._tabButtons.set(e.id,t)}),this._root.appendChild(this._tabRow)}_buildContentArea(){this._contentArea=document.createElement("div"),this._contentArea.className="mm-studio-content",this._root.appendChild(this._contentArea)}_bindNotebookTracker(){this._notebooks.activeCellChanged.connect(()=>{let e=this._notebooks.activeCell;if(!e||!(0,i.isCodeCellModel)(e.model))return;let t=e.model.toJSON().source,a=(Array.isArray(t)?t.join(""):t).match(/['"]((?:[^'"]+)\.(?:csv|xlsx|xls|json))['"]/);if(a){let e=a[1];e&&e!==this._currentPath&&(this._pathInput.value=e)}})}_autoDetectDataset(){let e=this._notebooks.activeCell;if(!e||!(0,i.isCodeCellModel)(e.model))return void this._showToast("Select a notebook cell containing dataset path.");let t=e.model.toJSON().source,a=(Array.isArray(t)?t.join(""):t).match(/['"]((?:[^'"]+)\.(?:csv|xlsx|xls|json))['"]/);a?(this._pathInput.value=a[1],this._loadDataset(a[1]),this._showToast(`Auto-detected: ${a[1]}`)):this._showToast("No .csv/.xlsx/.json found in active cell.")}async _loadDataset(e){var t,a,n;this._currentPath=e,this._statusPill.textContent="⏳ Analyzing dataset...",this._statusPill.className="mm-studio-status-pill loading";try{let s=await u("api/dataset/xray",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:e})});if(this._dataset=s,!s.supported){this._statusPill.textContent=`❌ ${s.message||"Dataset not supported"}`,this._statusPill.className="mm-studio-status-pill error",this._renderError(s.message||"Dataset format not supported.");return}let i=null!=(t=s.rows)?t:0,o=null!=(a=s.columns)?a:0,l=null!=(n=s.total_missing_values)?n:0;this._statusPill.textContent=`✓ ${s.filename||e}: ${i} rows \xd7 ${o} cols • ${l} missing`,this._statusPill.className="mm-studio-status-pill success",s.column_names&&s.column_names.length>0&&(this._targetCol&&s.column_names.includes(this._targetCol)||(this._targetCol=s.column_names[s.column_names.length-1]),this._featureCol&&s.column_names.includes(this._featureCol)||(this._featureCol=s.column_names[0])),this._renderCurrentTab()}catch(t){let e=t instanceof Error?t.message:"Failed to load dataset";this._statusPill.textContent=`❌ Error: ${e}`,this._statusPill.className="mm-studio-status-pill error",this._renderError(e)}}_renderError(e){this._contentArea.replaceChildren();let t=document.createElement("div");t.className="mm-studio-card mm-card-error",t.innerHTML=`
      <div style="font-weight:700; font-size:13px; margin-bottom:6px;">⚠️ Dataset Error</div>
      <div style="font-size:11px; opacity:.9;">${e}</div>
      <div style="font-size:10px; opacity:.6; margin-top:8px;">Ensure the file exists in the workspace. Supported: .csv, .xlsx, .json</div>
    `,this._contentArea.appendChild(t)}_renderCurrentTab(){switch(this._contentArea.replaceChildren(),this._activeTab){case"xray":this._renderXRayTab();break;case"target":this._renderTargetTab();break;case"feature":this._renderFeatureTab();break;case"prep":this._renderPreprocessingTab();break;case"model-advisor":this._renderModelAdvisorTab();break;case"lab":this._renderModelLabTab();break;case"inspector":this._renderInspectorTab();break;case"guide":this._renderGuideTab()}}_renderXRayTab(){var e,t,a,n,s,i,o,l;if(!this._dataset||!this._dataset.supported){this._contentArea.innerHTML='<div class="mm-studio-empty">Enter a dataset file path above and click \uD83D\uDD0D Analyze.</div>';return}let r=this._dataset,d=document.createDocumentFragment(),c=document.createElement("div");c.className="mm-studio-section",c.innerHTML=`<div class="mm-studio-sec-title"><span>🔬</span> Dataset Health Profile</div>`;let m=document.createElement("div");m.className="mm-studio-stats-grid";let p=null!=(t=null==(e=r.numeric_columns)?void 0:e.length)?t:0,u=null!=(n=null==(a=r.categorical_columns)?void 0:a.length)?n:0,b=null!=(s=r.total_missing_values)?s:0,f=null!=(i=r.duplicate_rows)?i:0;if(m.appendChild(this._createStatCard("Rows",null!=(o=r.rows)?o:0)),m.appendChild(this._createStatCard("Columns",`${null!=(l=r.columns)?l:0} (${p}N / ${u}C)`)),m.appendChild(this._createStatCard("Missing",b,b>0?"warn":"ok")),m.appendChild(this._createStatCard("Duplicates",f,f>0?"warn":"ok")),c.appendChild(m),r.likely_id_columns&&r.likely_id_columns.length>0){let e=document.createElement("div");e.className="mm-studio-alert mm-alert-warning",e.innerHTML=`⚠️ <b>Likely ID Column(s):</b> ${r.likely_id_columns.join(", ")} — These should not be used as training features.`,c.appendChild(e)}if(d.appendChild(c),r.missing_values&&Object.keys(r.missing_values).length>0){let e=Object.entries(r.missing_values).filter(([,e])=>e>0);if(e.length>0){let t=document.createElement("div");t.className="mm-studio-section",t.innerHTML='<div class="mm-studio-sec-title"><span>⚠️</span> Missing Values Breakdown</div>',e.forEach(([e,a])=>{let n=r.rows?Math.round(a/r.rows*100):0,s=document.createElement("div");s.className="mm-studio-bar-row",s.innerHTML=`
            <div class="mm-studio-bar-label">
              <span>${e}</span>
              <span class="mm-studio-bar-val">${a} (${n}%)</span>
            </div>
            <div class="mm-studio-bar-track">
              <div class="mm-studio-bar-fill" style="width:${n}%; background:#f87171;"></div>
            </div>
          `,t.appendChild(s)}),d.appendChild(t)}}if(r.preview&&r.preview.length>0){let e=document.createElement("div");e.className="mm-studio-section",e.innerHTML=`<div class="mm-studio-sec-title"><span>👁️</span> Data Preview (First 5 Rows)</div>`;let t=document.createElement("div");t.className="mm-studio-table-wrap";let a=document.createElement("table");a.className="mm-studio-table";let n=r.column_names||Object.keys(r.preview[0]||{}),s=document.createElement("thead"),i=document.createElement("tr");n.forEach(e=>{var t;let a=document.createElement("th"),n=(null==(t=r.dtypes)?void 0:t[e])||"";a.innerHTML=`<div>${e}</div><span class="mm-th-dtype">${n}</span>`,i.appendChild(a)}),s.appendChild(i),a.appendChild(s);let o=document.createElement("tbody");r.preview.slice(0,5).forEach((e,t)=>{let a=document.createElement("tr");n.forEach(t=>{let n=document.createElement("td"),s=e[t];n.textContent=null!=s?String(s):"—",null==s&&(n.style.color="#ef4444"),a.appendChild(n)}),o.appendChild(a)}),a.appendChild(o),t.appendChild(a),e.appendChild(t),d.appendChild(e)}if(r.column_stats&&r.column_stats.length>0){let e=document.createElement("div");e.className="mm-studio-section",e.innerHTML=`<div class="mm-studio-sec-title"><span>📋</span> Column Statistics</div>`,r.column_stats.forEach(t=>{var a;let n=document.createElement("div");n.className="mm-studio-col-card",n.innerHTML=`
          <div class="mm-studio-col-hdr">
            <span class="mm-studio-col-name">${t.name}</span>
            <span class="mm-studio-badge ${t.is_numeric?"badge-num":"badge-cat"}">${t.dtype}</span>
          </div>
          <div class="mm-studio-col-meta">
            <span>Missing: <b>${t.missing_count} (${t.missing_pct}%)</b></span>
            <span>Unique: <b>${t.unique_count}</b></span>
            ${t.is_numeric&&void 0!==t.mean?`<span>Mean: <b>${t.mean.toFixed(2)}</b></span>`:""}
            ${t.is_numeric&&void 0!==t.min?`<span>Min/Max: <b>${t.min.toFixed(1)} / ${null==(a=t.max)?void 0:a.toFixed(1)}</b></span>`:""}
          </div>
        `,e.appendChild(n)}),d.appendChild(e)}this._contentArea.appendChild(d)}_renderTargetTab(){if(!this._dataset||!this._dataset.supported){this._contentArea.innerHTML='<div class="mm-studio-empty">Analyze a dataset to use Target Intelligence.</div>';return}let e=document.createDocumentFragment(),t=document.createElement("div");t.className="mm-studio-section",t.innerHTML=`
      <div class="mm-studio-sec-title"><span>🎯</span> Target Variable Analyzer</div>
      <div class="mm-studio-sec-sub">Select the dependent variable you want your ML model to predict.</div>
    `;let a=document.createElement("div");a.className="mm-studio-select-row";let n=document.createElement("select");n.className="mm-studio-select",(this._dataset.column_names||[]).forEach(e=>{let t=document.createElement("option");t.value=e,t.textContent=e,e===this._targetCol&&(t.selected=!0),n.appendChild(t)});let s=document.createElement("button");s.type="button",s.className="mm-studio-btn mm-btn-primary",s.textContent="\uD83C\uDFAF Inspect Target",a.append(n,s),t.appendChild(a),e.appendChild(t);let i=document.createElement("div");i.className="mm-studio-target-result",e.appendChild(i);let o=async e=>{this._targetCol=e,i.innerHTML='<div class="mm-studio-loading">Analyzing target health...</div>';try{let t=await u("api/dataset/target",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:this._currentPath,target_column:e})});this._displayTargetResult(i,t)}catch(e){i.innerHTML=`<div class="mm-studio-alert mm-alert-error">${e instanceof Error?e.message:"Target analysis failed."}</div>`}};s.addEventListener("click",()=>o(n.value)),n.addEventListener("change",()=>o(n.value)),this._contentArea.appendChild(e),this._targetCol&&o(this._targetCol)}_displayTargetResult(e,t){var a,n,s,i,o,l,r,d,c,m,p;e.replaceChildren();let u=document.createElement("div");u.className="mm-studio-card";let b="classification"===t.task?"#4f46e5":"#059669";if(u.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-weight:700; font-size:14px;">${t.target_column||t.target||this._targetCol||"Target"}</span>
        <span class="mm-studio-badge" style="background:${"classification"===t.task?"#eef2ff":"#ecfdf5"}; color:${b}; border:1px solid ${"classification"===t.task?"#c7d2fe":"#a7f3d0"}; font-size:11px; font-weight:700;">
          ${(t.task_type||t.task||"ML").toUpperCase()} TASK
        </span>
      </div>
      <div class="mm-studio-stats-grid">
        <div class="mm-stat-box"><div class="mm-stat-val">${t.unique_count}</div><div class="mm-stat-lbl">Unique Values</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" style="color:${(null!=(a=t.missing_count)?a:0)>0?"#dc2626":"#059669"}">${null!=(n=t.missing_count)?n:0}</div><div class="mm-stat-lbl">Missing</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${t.dtype}</div><div class="mm-stat-lbl">Data Type</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${t.is_imbalanced?"Imbalanced":"Healthy"}</div><div class="mm-stat-lbl">Target Health</div></div>
      </div>
    `,(null!=(s=t.missing_count)?s:0)>0){let e=document.createElement("div");e.className="mm-studio-alert mm-alert-error",e.style.marginTop="10px",e.innerHTML=`❌ <b>Critical:</b> Target variable has ${t.missing_count} missing values. Supervised models cannot train on missing targets. Drop these rows before fitting.`,u.appendChild(e)}if(e.appendChild(u),"classification"===t.task){let a=document.createElement("div");a.className="mm-studio-section",a.innerHTML='<div class="mm-studio-sec-title"><span>⚖️</span> Class Distribution & Imbalance</div>';let n=document.createElement("div");if(n.className="mm-studio-alert mm-alert-info",n.textContent=t.is_numeric?"This numeric classification target is already encoded. This inspection does not change your data.":"This is a categorical target. This inspection does not encode or change your data. When you run generated classification code from Model Advisor, LabelEncoder is applied for training, its mapping is shown, and predictions are converted back to the original labels. Encoding does not improve model accuracy; clean inconsistent labels before training.",a.appendChild(n),t.class_percentages){if(void 0!==t.imbalance_ratio){let e=document.createElement("div");e.className=`mm-studio-alert ${t.is_imbalanced?"mm-alert-warning":"mm-alert-info"}`,e.innerHTML=`Imbalance Ratio: <b>${t.imbalance_ratio.toFixed(2)} : 1</b> — ${t.is_imbalanced?"⚠️ Significant class imbalance detected.":"✓ Well balanced target."}`,a.appendChild(e)}Object.entries(t.class_percentages).forEach(([e,n])=>{var s,i;let o=null!=(i=null==(s=t.class_counts)?void 0:s[e])?i:"",l=document.createElement("div");l.className="mm-studio-bar-row",l.innerHTML=`
            <div class="mm-studio-bar-label">
              <span>Class <b>"${e}"</b></span>
              <span class="mm-studio-bar-val">${o} (${n}%)</span>
            </div>
            <div class="mm-studio-bar-track">
              <div class="mm-studio-bar-fill" style="width:${n}%; background:#818cf8;"></div>
            </div>
          `,a.appendChild(l)})}e.appendChild(a)}if("regression"===t.task){let a=document.createElement("div");a.className="mm-studio-section",a.innerHTML=`<div class="mm-studio-sec-title"><span>📈</span> Continuous Target Stats</div>`;let n=document.createElement("div");if(n.className="mm-studio-stats-grid",n.innerHTML=`
        <div class="mm-stat-box"><div class="mm-stat-val">${null!=(o=null==(i=t.mean)?void 0:i.toFixed(2))?o:"—"}</div><div class="mm-stat-lbl">Mean</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${null!=(r=null==(l=t.median)?void 0:l.toFixed(2))?r:"—"}</div><div class="mm-stat-lbl">Median</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${null!=(c=null==(d=t.std)?void 0:d.toFixed(2))?c:"—"}</div><div class="mm-stat-lbl">Std Dev</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${null!=(p=null==(m=t.skewness)?void 0:m.toFixed(2))?p:"—"}</div><div class="mm-stat-lbl">Skewness</div></div>
      `,a.appendChild(n),t.skewness&&Math.abs(t.skewness)>1){let e=document.createElement("div");e.className="mm-studio-alert mm-alert-warning",e.innerHTML=`⚠️ <b>High Skewness (${t.skewness.toFixed(2)}):</b> Target is heavily skewed. Consider applying <code>np.log1p()</code> or Box-Cox transformation.`,a.appendChild(e)}if(t.outlier_count&&t.outlier_count>0){let e=document.createElement("div");e.className="mm-studio-alert mm-alert-warning",e.innerHTML=`⚠️ <b>Outliers (${t.outlier_count}):</b> Target contains ${t.outlier_count} potential outliers (1.5 \xd7 IQR rule).`,a.appendChild(e)}e.appendChild(a)}if(t.recommendations&&t.recommendations.length>0){let a=document.createElement("div");a.className="mm-studio-section",a.innerHTML=`<div class="mm-studio-sec-title"><span>💡</span> Target Engineering Advice</div>`;let n=document.createElement("ul");n.className="mm-studio-list",t.recommendations.forEach(e=>{let t=document.createElement("li");t.textContent=e,n.appendChild(t)}),a.appendChild(n),e.appendChild(a)}}_renderFeatureTab(){if(!this._dataset||!this._dataset.supported){this._contentArea.innerHTML='<div class="mm-studio-empty">Analyze a dataset to use Feature Deep-Dive.</div>';return}let e=document.createDocumentFragment(),t=document.createElement("div");t.className="mm-studio-section",t.innerHTML=`
      <div class="mm-studio-sec-title"><span>📊</span> Feature Deep-Dive & Distribution</div>
      <div class="mm-studio-sec-sub">Examine individual feature distribution, outliers, and correlations.</div>
    `;let a=document.createElement("div");a.className="mm-studio-select-row";let n=document.createElement("select");n.className="mm-studio-select",(this._dataset.column_names||[]).forEach(e=>{let t=document.createElement("option");t.value=e,t.textContent=e,e===this._featureCol&&(t.selected=!0),n.appendChild(t)});let s=document.createElement("button");s.type="button",s.className="mm-studio-btn mm-btn-primary",s.textContent="\uD83D\uDCCA Inspect Feature",a.append(n,s),t.appendChild(a),e.appendChild(t);let i=document.createElement("div");i.className="mm-studio-feat-result",e.appendChild(i);let o=async e=>{this._featureCol=e,i.innerHTML='<div class="mm-studio-loading">Analyzing feature distribution...</div>';try{let t=await u("api/dataset/feature",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:this._currentPath,feature_column:e})});this._displayFeatureResult(i,t)}catch(e){i.innerHTML=`<div class="mm-studio-alert mm-alert-error">${e instanceof Error?e.message:"Feature analysis failed."}</div>`}};s.addEventListener("click",()=>o(n.value)),n.addEventListener("change",()=>o(n.value)),this._contentArea.appendChild(e),this._featureCol&&o(this._featureCol)}_displayFeatureResult(e,t){var a,n,s,i,o,l,r,d,c,m,p;e.replaceChildren();let u=document.createElement("div");u.className="mm-studio-card",u.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-weight:700; font-size:14px;">${null!=(n=null!=(a=t.feature_column)?a:t.feature)?n:"—"}</span>
        <span class="mm-studio-badge ${(null!=(s=t.type)?s:t.feature_type)==="numerical"?"badge-num":"badge-cat"}">${(null!=(o=null!=(i=t.type)?i:t.feature_type)?o:"unknown").toUpperCase()}</span>
      </div>
      <div class="mm-studio-stats-grid">
        <div class="mm-stat-box"><div class="mm-stat-val">${null!=(l=t.missing_count)?l:0} (${(null!=(r=t.missing_percentage)?r:0).toFixed(1)}%)</div><div class="mm-stat-lbl">Missing</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${null!=(d=t.unique_count)?d:0}</div><div class="mm-stat-lbl">Unique</div></div>
        ${void 0!==t.mean?`<div class="mm-stat-box"><div class="mm-stat-val">${t.mean.toFixed(2)}</div><div class="mm-stat-lbl">Mean</div></div>`:""}
        ${void 0!==t.median?`<div class="mm-stat-box"><div class="mm-stat-val">${t.median.toFixed(2)}</div><div class="mm-stat-lbl">Median</div></div>`:""}
        ${(null!=(c=t.std)?c:t.standard_deviation)!==void 0?`<div class="mm-stat-box"><div class="mm-stat-val">${(null!=(m=t.std)?m:t.standard_deviation).toFixed(2)}</div><div class="mm-stat-lbl">Std Dev</div></div>`:""}
        ${void 0!==t.skewness?`<div class="mm-stat-box"><div class="mm-stat-val">${t.skewness.toFixed(2)}</div><div class="mm-stat-lbl">Skewness</div></div>`:""}
        ${void 0!==t.outlier_count?`<div class="mm-stat-box"><div class="mm-stat-val" style="color:${t.outlier_count>0?"#f87171":"inherit"}">${t.outlier_count}</div><div class="mm-stat-lbl">Outliers</div></div>`:""}
      </div>
    `,e.appendChild(u);let b=document.createElement("div");if(b.className="mm-studio-section",b.innerHTML=`<div class="mm-studio-sec-title"><span>📊</span> Distribution</div>`,t.histogram_counts&&t.histogram_edges&&t.histogram_counts.length>0){let e=t.histogram_counts,a=t.histogram_edges,n=Math.max(...e,1),s=document.createElement("div");s.className="mm-studio-hist-container",e.forEach((e,t)=>{var i,o;let l=Math.round(e/n*100),r=document.createElement("div");r.className="mm-hist-col";let d=(null!=(i=a[t])?i:0).toFixed(0),c=(null!=(o=a[t+1])?o:0).toFixed(0);r.title=`[${d} – ${c}]: ${e}`,r.innerHTML=`
          <div class="mm-hist-bar" style="height:${Math.max(l,4)}%;"></div>
          <div class="mm-hist-label">${d}</div>
        `,s.appendChild(r)}),b.appendChild(s)}else if(t.histogram&&t.histogram.length>0){let e=Math.max(...t.histogram.map(e=>e.count),1),a=document.createElement("div");a.className="mm-studio-hist-container",t.histogram.forEach(t=>{let n=Math.round(t.count/e*100),s=document.createElement("div");s.className="mm-hist-col",s.title=`[${t.bin_start.toFixed(1)} – ${t.bin_end.toFixed(1)}]: ${t.count}`,s.innerHTML=`
          <div class="mm-hist-bar" style="height:${Math.max(n,4)}%;"></div>
          <div class="mm-hist-label">${t.bin_start.toFixed(0)}</div>
        `,a.appendChild(s)}),b.appendChild(a)}else if(t.category_distribution&&t.category_distribution.length>0)t.category_distribution.slice(0,10).forEach(e=>{let t=Math.round(e.percentage),a=document.createElement("div");a.className="mm-studio-bar-row",a.innerHTML=`
          <div class="mm-studio-bar-label">
            <span>"${e.value}"</span>
            <span class="mm-studio-bar-val">${e.count} (${t}%)</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${t}%; background:#38bdf8;"></div>
          </div>
        `,b.appendChild(a)});else if(t.value_counts){let e=Object.entries(t.value_counts).slice(0,8),a=t.total_rows||1;e.forEach(([e,t])=>{let n=Math.round(t/a*100),s=document.createElement("div");s.className="mm-studio-bar-row",s.innerHTML=`
          <div class="mm-studio-bar-label">
            <span>"${e}"</span>
            <span class="mm-studio-bar-val">${t} (${n}%)</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${n}%; background:#38bdf8;"></div>
          </div>
        `,b.appendChild(s)})}if(e.appendChild(b),t.correlations&&Object.keys(t.correlations).length>0){let a=document.createElement("div");a.className="mm-studio-section",a.innerHTML=`<div class="mm-studio-sec-title"><span>🔗</span> Correlations with Other Features</div>`;let n=null!=(p=t.feature_column)?p:t.feature;Object.entries(t.correlations).forEach(([e,t])=>{if(e===n)return;let s=Math.abs(t),i=t>0?"#059669":"#dc2626",o=document.createElement("div");o.className="mm-studio-bar-row",o.innerHTML=`
          <div class="mm-studio-bar-label">
            <span>${e}</span>
            <span class="mm-studio-bar-val" style="color:${i}; font-weight:700;">r = ${t.toFixed(3)}</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${Math.round(100*s)}%; background:${i};"></div>
          </div>
        `,a.appendChild(o)}),e.appendChild(a)}}_renderPreprocessingTab(){if(!this._dataset||!this._dataset.supported){this._contentArea.innerHTML='<div class="mm-studio-empty">Analyze a dataset to get Smart Preprocessing recommendations.</div>';return}this._contentArea.replaceChildren();let e=document.createDocumentFragment(),t=document.createElement("div");t.className="mm-studio-section";let a={basic:"\uD83D\uDFE2 Basic — Fill missing values with mean/mode. Perfect for beginners.",medium:"\uD83D\uDFE1 Medium — Fill NA + detect & cap outliers + encoding with pandas.",advanced:"\uD83D\uDD34 Advanced — Full sklearn Pipeline with ColumnTransformer, StandardScaler, OneHotEncoder & OrdinalEncoder."},n=document.createElement("div");n.className="mm-studio-level-row",n.id="mm-prep-level-row";let s=document.createElement("span");s.style.cssText="font-size:11px; opacity:.7; margin-right:6px; font-weight:600;",s.textContent="Skill Level:",n.appendChild(s);let i=document.createElement("div");i.style.cssText=`
      font-size:11px; padding:8px 12px; border-radius:8px; margin-bottom:10px; margin-top:6px;
      background:rgba(167,139,250,0.08); border:1px solid rgba(167,139,250,0.2); color:#c4b5fd;
      line-height:1.5;
    `,i.textContent=a[this._prepLevel];let o=()=>{n.querySelectorAll(".mm-level-pill").forEach(e=>{let t=e.dataset.level===this._prepLevel;e.className=`mm-level-pill${t?" active":""}`}),i.textContent=a[this._prepLevel]};["basic","medium","advanced"].forEach(e=>{let t=document.createElement("button");t.type="button",t.dataset.level=e,t.className=`mm-level-pill ${this._prepLevel===e?"active":""}`,t.textContent=e.charAt(0).toUpperCase()+e.slice(1),t.addEventListener("click",()=>{this._prepLevel=e,o(),this._loadPreprocessingAdvice(l)}),n.appendChild(t)}),t.appendChild(n),t.appendChild(i),e.appendChild(t);let l=document.createElement("div");l.className="mm-studio-prep-cards",e.appendChild(l),this._contentArea.appendChild(e),this._loadPreprocessingAdvice(l)}async _loadPreprocessingAdvice(e){e.innerHTML='<div class="mm-studio-loading">Generating smart preprocessing recommendations...</div>';try{let t=this._pathInput.value.trim()||this._currentPath,a=await u("api/dataset/preprocessing",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:t,level:this._prepLevel})});if(this._resolvedDatasetPath=a.resolved_path||t,e.replaceChildren(),a.dataset_warnings&&a.dataset_warnings.length>0){let t=document.createElement("div");t.className="mm-studio-alert mm-alert-warning",t.innerHTML=`<b>Dataset Observations:</b><br/>${a.dataset_warnings.map(e=>`• ${e}`).join("<br/>")}`,e.appendChild(t)}if(!a.recommendations||0===a.recommendations.length){e.innerHTML='<div class="mm-studio-empty">No preprocessing needed! Dataset is clean.</div>';return}if(a.recommendations.forEach(t=>{let n=this._createRecommendationCard(t,a.recommendations);e.appendChild(n)}),"advanced"===this._prepLevel&&a.pipeline_code){let t=document.createElement("div");t.style.cssText=`
          margin-top:18px; padding:16px; border-radius:12px;
          background:rgba(99,102,241,0.07); border:1px solid rgba(99,102,241,0.25);
        `;let n=document.createElement("div");n.style.cssText="font-size:13px; font-weight:700; margin-bottom:4px; color:#4338ca;",n.innerHTML="\uD83D\uDE80 Suggested Full ColumnTransformer Pipeline";let s=document.createElement("div");s.style.cssText="font-size:11px; color:#5d6b80; margin-bottom:10px;",s.textContent="This pipeline combines all numerical and categorical columns with proper imputation, scaling, and encoding.";let i=document.createElement("pre");i.style.cssText=`
          background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
          padding:12px 14px; font-size:10.5px; overflow-x:auto; margin:0;
          font-family:ui-monospace,SFMono-Regular,monospace; line-height:1.65; color:#1e293b;
        `,i.textContent=a.pipeline_code;let o=document.createElement("div");o.style.cssText="display:flex; gap:8px; margin-top:10px;";let l=document.createElement("button");l.type="button",l.className="mm-studio-btn mm-btn-sm",l.innerHTML="\uD83D\uDCCB Copy Pipeline",l.addEventListener("click",async()=>{await navigator.clipboard.writeText(a.pipeline_code),l.textContent="Copied!",setTimeout(()=>{l.innerHTML="\uD83D\uDCCB Copy Pipeline"},1500)});let r=document.createElement("button");r.type="button",r.className="mm-studio-btn mm-btn-sm mm-btn-primary",r.innerHTML="\uD83D\uDCE5 Insert Pipeline",r.addEventListener("click",()=>{let e=this._insertPreprocessingCode(a.pipeline_code);this._showToast(e?"✓ Pipeline code inserted!":"Open a notebook first.")}),o.append(l,r),t.append(n,s,i,o),e.appendChild(t)}}catch(t){e.innerHTML=`<div class="mm-studio-alert mm-alert-error">${t instanceof Error?t.message:"Failed to generate recommendations."}</div>`}}_createRecommendationCard(e,t){let a=document.createElement("div");a.className="mm-studio-card mm-prep-card";let n={none:"#059669",low:"#d97706",moderate:"#ea580c",high:"#dc2626",very_high:"#991b1b"}[e.missing_severity]||"#64748b",s=document.createElement("div");s.className="mm-prep-hdr",s.innerHTML=`
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-weight:700; font-size:13px;">${e.feature}</span>
        <span class="mm-studio-badge ${"numerical"===e.feature_type?"badge-num":"badge-cat"}">${e.feature_type.toUpperCase()}</span>
      </div>
      <span class="mm-studio-badge" style="background:${n}22; color:${n}; border:1px solid ${n}44;">
        ${e.missing_count} MISSING (${e.missing_pct}%)
      </span>
    `;let i=document.createElement("div");i.className="mm-prep-action",i.innerHTML=`<b>Recommended:</b> ${e.recommended_action||e.imputation_strategy}`;let o=document.createElement("div");o.className="mm-prep-text",o.innerHTML=`<b>Why:</b> ${e.why||e.explanation}`;let l=document.createElement("div");l.className="mm-prep-strategy-row";let r=document.createElement("select");r.className="mm-studio-select mm-select-sm",("numerical"===e.feature_type?["mean","median","most_frequent","constant","standard_scaler","minmax_scaler","robust_scaler","cap_outliers_iqr","drop_column"]:["most_frequent","unknown","one_hot_encode","ordinal_encode","frequency_encode","drop_column"]).forEach(t=>{let a=document.createElement("option");a.value=t,a.textContent=t.replace(/_/g," ").toUpperCase(),(t===e.imputation_strategy||"median"===t)&&(a.selected=!0),r.appendChild(a)}),l.innerHTML='<span style="font-size:10px; opacity:.7;">Strategy:</span>',l.appendChild(r);let d=document.createElement("div");d.className="mm-prep-preview-box",d.style.display="none";let c=document.createElement("div");c.className="mm-prep-btn-row";let m=document.createElement("button");m.type="button",m.className="mm-studio-btn mm-btn-sm",m.innerHTML="\uD83D\uDC41️ Preview",m.title="Preview before and after",m.addEventListener("click",async()=>{m.disabled=!0,m.textContent="⏳ Loading...";try{let t=await u("api/dataset/preprocessing/preview",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:this._currentPath,feature:e.feature,strategy:r.value})});this._renderLivePreview(d,t),d.style.display="block"}catch(e){d.innerHTML=`<div class="mm-studio-alert mm-alert-error">${e instanceof Error?e.message:"Preview failed."}</div>`,d.style.display="block"}finally{m.disabled=!1,m.innerHTML="\uD83D\uDC41️ Preview"}});let p=document.createElement("button");p.type="button",p.className="mm-studio-btn mm-btn-sm mm-btn-accent",p.innerHTML="⚡ Apply to File",p.title="Apply transformation directly to dataset with backup",p.addEventListener("click",async()=>{if(confirm(`Apply '${r.value}' to column '${e.feature}' in ${this._currentPath}?
A .bak backup will be created.`)){p.disabled=!0,p.textContent="Applying...";try{let t=await u("api/dataset/preprocessing/apply",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:this._currentPath,feature:e.feature,strategy:r.value})});this._showToast(`✓ Applied ${r.value} to ${e.feature}! Backup created.`),t.dataset&&(this._dataset=t.dataset),this._loadDataset(this._currentPath)}catch(e){this._showToast(`❌ Apply failed: ${e instanceof Error?e.message:"Error"}`)}finally{p.disabled=!1,p.innerHTML="⚡ Apply to File"}}});let b=document.createElement("button");b.type="button",b.className="mm-studio-btn mm-btn-sm",b.innerHTML="↩️ Undo",b.title="Restore original dataset from backup",b.addEventListener("click",async()=>{if(confirm(`Undo changes and restore ${this._currentPath} from backup?`))try{let e=await u("api/dataset/preprocessing/undo",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:this._currentPath})});this._showToast("✓ Restored dataset from backup!"),e.dataset&&(this._dataset=e.dataset),this._loadDataset(this._currentPath)}catch(e){this._showToast(`❌ Undo failed: ${e instanceof Error?e.message:"Error"}`)}});let f=document.createElement("button");f.type="button",f.className="mm-studio-btn mm-btn-sm mm-btn-primary",f.innerHTML="\uD83D\uDCE5 Insert Code",f.title="Insert complete runnable preprocessing code, including loading the selected dataset",f.addEventListener("click",()=>{let t=this._buildFullPreprocessingCode(e,r.value);this._insertPreprocessingCode(t)?this._showToast("✓ Full preprocessing code inserted below active cell!"):this._showToast("Please open a notebook first.")});let h=document.createElement("button");h.type="button",h.className="mm-studio-btn mm-btn-sm",h.innerHTML="\uD83D\uDCCB Copy",h.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(this._buildFullPreprocessingCode(e,r.value)),h.textContent="Copied!",setTimeout(()=>{h.innerHTML="\uD83D\uDCCB Copy"},1500)}catch(e){h.textContent="Error"}});let g=document.createElement("button");return g.type="button",g.className="mm-studio-btn mm-btn-sm",g.innerHTML="\uD83D\uDD0D Preview Code",g.title="View the generated code in a readable panel",g.addEventListener("click",()=>{this._showCodePreviewModal(e.feature,this._buildFullPreprocessingCode(e,r.value),this._prepLevel)}),c.append(m,p,b,f,h,g),a.append(s,i,o,l,d,c),a}_buildFullPreprocessingCode(e,t){return function(e,t,a){var n;let s,i=JSON.stringify(e),o=null==(n=e.split(/[?#]/,1)[0].split(".").pop())?void 0:n.toLowerCase(),l=new Set(["import pandas as pd"]),r=a;"most_frequent_or_unknown"===r&&(r="most_frequent");let d=JSON.stringify(t.feature),c=`df[${d}]`;switch(r){case"mean":case"median":s=`${c} = pd.to_numeric(${c}, errors="coerce")
${c} = ${c}.fillna(${c}.${r}())`;break;case"most_frequent":s=`mode = ${c}.mode(dropna=True)
fill_value = mode.iloc[0] if not mode.empty else "Unknown"
${c} = ${c}.fillna(fill_value)`;break;case"unknown":s=`${c} = ${c}.fillna("Unknown")`;break;case"constant":s=[..."numerical"===t.feature_type?[`${c} = pd.to_numeric(${c}, errors="coerce")`]:[],`${c} = ${c}.fillna(${"numerical"===t.feature_type?"0":'"Unknown"'})`].join("\n");break;case"drop_column":s=`df = df.drop(columns=[${d}])`;break;case"standard_scaler":case"minmax_scaler":case"robust_scaler":{let e={standard_scaler:"StandardScaler",minmax_scaler:"MinMaxScaler",robust_scaler:"RobustScaler"}[r];l.add(`from sklearn.preprocessing import ${e}`),s=`${c} = pd.to_numeric(${c}, errors="coerce")
${c} = ${c}.fillna(${c}.median())
df[[${d}]] = ${e}().fit_transform(df[[${d}]])`;break}case"cap_outliers_iqr":s=`${c} = pd.to_numeric(${c}, errors="coerce")
q1 = ${c}.quantile(0.25)
q3 = ${c}.quantile(0.75)
iqr = q3 - q1
${c} = ${c}.clip(lower=q1 - 1.5 * iqr, upper=q3 + 1.5 * iqr)`;break;case"one_hot_encode":s=`${c} = ${c}.fillna("Unknown")
df = pd.get_dummies(df, columns=[${d}], prefix=[${d}], dtype=int)`;break;case"ordinal_encode":s=`${c} = ${c}.fillna("Unknown").astype("category").cat.codes`;break;case"frequency_encode":s=`${c} = ${c}.fillna("Unknown")
frequencies = ${c}.value_counts(normalize=True)
${c} = ${c}.map(frequencies)`;break;default:s=`# No transformation is needed for ${d}.`}return["# Complete preprocessing workflow for the analyzed dataset",...Array.from(l),"",`df = pd.${"xlsx"===o||"xls"===o?"read_excel":"json"===o?"read_json":"read_csv"}(${i})`,'print(f"Loaded dataset: {df.shape[0]} rows \xd7 {df.shape[1]} columns")',"","# Apply preprocessing only to the selected column",s,"","# Check the result",'print(f"Dataset shape after preprocessing: {df.shape}")',`print("Missing values remaining in " + ${d} + ": " + str(${c}.isna().sum()) if ${d} in df.columns else "Selected column was dropped.")`,"","# Preview only the selected column or its encoded output columns",..."one_hot_encode"===r?[`print(df.loc[:, [column for column in df.columns if column == ${d} or column.startswith(${JSON.stringify(`${t.feature}_`)})]].head())`]:"drop_column"===r?['print("Selected column was dropped as requested.")']:[`print(df[[${d}]].head())`]].join("\n")}(this._resolvedDatasetPath||this._pathInput.value.trim()||this._currentPath,e,t)}_showCodePreviewModal(e,t,a){var n;null==(n=document.getElementById("mm-code-preview-modal"))||n.remove();let s={basic:"#059669",medium:"#d97706",advanced:"#4f46e5"}[a]||"#4f46e5",i=document.createElement("div");i.id="mm-code-preview-modal",i.style.cssText=`
      position:fixed; inset:0; z-index:99999;
      background:rgba(0,0,0,0.75); backdrop-filter:blur(4px);
      display:flex; align-items:center; justify-content:center;
      padding:20px;
    `;let o=document.createElement("div");o.style.cssText=`
      background:#ffffff; border:1px solid #dfe3ea; border-radius:12px;
      padding:0; width:min(680px, 95vw); max-height:85vh;
      display:flex; flex-direction:column; box-shadow:0 20px 45px rgba(0,0,0,0.12);
      overflow:hidden; color:#253041;
    `;let l=document.createElement("div");l.style.cssText=`
      display:flex; align-items:center; gap:10px; padding:16px 20px;
      border-bottom:1px solid #dfe3ea;
      background:#f8fafc;
    `,l.innerHTML=`
      <span style="font-size:16px;">🔍</span>
      <div style="flex:1;">
        <div style="font-size:13px; font-weight:700; color:#172554;">Code Preview — <code style="color:${s};">${e}</code></div>
        <div style="font-size:10px; color:#64748b; margin-top:2px;">
          Skill Level: <span style="color:${s}; font-weight:600; text-transform:capitalize;">${a}</span>
        </div>
      </div>
    `;let r=document.createElement("button");r.type="button",r.innerHTML="✕",r.style.cssText=`
      background:#f1f5f9; border:1px solid #dfe3ea;
      color:#475569; border-radius:8px; width:28px; height:28px;
      cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center;
    `,r.addEventListener("click",()=>i.remove()),l.appendChild(r);let d=document.createElement("div");d.style.cssText="flex:1; overflow-y:auto; padding:16px 20px; background:#f8fafc;";let c=document.createElement("div");c.style.cssText="display:flex; align-items:center; gap:8px; margin-bottom:12px;",c.innerHTML=`
      <span style="
        font-size:9.5px; font-weight:700; padding:3px 9px; border-radius:99px;
        background:${s}15; color:${s}; border:1px solid ${s}35;
        text-transform:uppercase; letter-spacing:0.5px;
      ">${a} level</span>
      <span style="font-size:10.5px; color:#64748b;">Python code for column: ${e}</span>
    `;let m=document.createElement("pre");m.style.cssText=`
      background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
      padding:16px 18px; font-size:11.5px; line-height:1.7;
      font-family:ui-monospace,SFMono-Regular,'Cascadia Code',monospace;
      color:#1e293b; overflow-x:auto; margin:0; white-space:pre;
    `,m.textContent=t,d.append(c,m);let p=document.createElement("div");p.style.cssText=`
      display:flex; gap:8px; padding:14px 20px;
      border-top:1px solid #dfe3ea;
      background:#ffffff;
    `;let u=document.createElement("button");u.type="button",u.className="mm-studio-btn mm-btn-sm",u.innerHTML="\uD83D\uDCCB Copy Code",u.addEventListener("click",async()=>{await navigator.clipboard.writeText(t),u.textContent="Copied!",setTimeout(()=>{u.innerHTML="\uD83D\uDCCB Copy Code"},1500)});let b=document.createElement("button");b.type="button",b.className="mm-studio-btn mm-btn-sm mm-btn-primary",b.innerHTML="\uD83D\uDCE5 Insert into Notebook",b.addEventListener("click",()=>{let e=this._insertCodeBelow(t);this._showToast(e?"✓ Code inserted into notebook!":"Please open a notebook first."),i.remove()});let f=document.createElement("button");f.type="button",f.className="mm-studio-btn mm-btn-sm",f.innerHTML="Close",f.addEventListener("click",()=>i.remove()),p.append(u,b,f),o.append(l,d,p),i.appendChild(o),i.addEventListener("click",e=>{e.target===i&&i.remove()}),document.body.appendChild(i)}_renderLivePreview(e,t){var a,n,s,i,o,l,r,d,c,m;e.replaceChildren();let p=document.createElement("div");p.style.cssText="font-weight:700; font-size:11px; margin-bottom:8px; color:#818cf8;",p.innerHTML=`👁️ Live Preview: Strategy <code>${t.strategy}</code> on <code>${t.feature}</code>`;let u=null!=(s=null!=(n=null==(a=t.before.statistics)?void 0:a.missing_count)?n:t.before.missing_count)?s:0,b=null!=(l=null!=(o=null==(i=t.after.statistics)?void 0:i.missing_count)?o:t.after.missing_count)?l:0,f=null!=(d=null==(r=t.before.statistics)?void 0:r.mean)?d:t.before.mean,h=null!=(m=null==(c=t.after.statistics)?void 0:c.mean)?m:t.after.mean,g=t.before.sample||t.before.sample_values||[],v=t.after.sample||t.after.sample_values||[],x=document.createElement("div");x.className="mm-studio-stats-grid",x.innerHTML=`
      <div class="mm-stat-box">
        <div class="mm-stat-val" style="color:#dc2626;">${u}</div>
        <div class="mm-stat-lbl">Missing Before</div>
      </div>
      <div class="mm-stat-box">
        <div class="mm-stat-val" style="color:#059669;">${b}</div>
        <div class="mm-stat-lbl">Missing After</div>
      </div>
      ${void 0!==f?`
        <div class="mm-stat-box">
          <div class="mm-stat-val">${"number"==typeof f?f.toFixed(2):f}</div>
          <div class="mm-stat-lbl">Mean Before</div>
        </div>
      `:""}
      ${void 0!==h?`
        <div class="mm-stat-box">
          <div class="mm-stat-val">${"number"==typeof h?h.toFixed(2):h}</div>
          <div class="mm-stat-lbl">Mean After</div>
        </div>
      `:""}
    `;let y=document.createElement("div");y.className="mm-prep-sample-box",y.innerHTML=`
      <div style="font-size:10px; font-weight:600; margin-bottom:4px; opacity:.8;">Sample Values (Before vs After):</div>
      <div style="display:flex; gap:10px; font-family:monospace; font-size:10px;">
        <div style="flex:1;">
          <div style="opacity:.6; margin-bottom:2px;">Before:</div>
          <div style="color:#fca5a5;">${g.slice(0,5).map(e=>null===e?"NaN":"number"==typeof e?e.toFixed(1):e).join(", ")}</div>
        </div>
        <div style="flex:1;">
          <div style="opacity:.6; margin-bottom:2px;">After:</div>
          <div style="color:#86efac;">${v.slice(0,5).map(e=>null===e?"NaN":"number"==typeof e?e.toFixed(1):e).join(", ")}</div>
        </div>
      </div>
    `,e.append(p,x,y)}_renderModelAdvisorTab(){var e;if(!this._dataset||!this._dataset.supported){this._contentArea.innerHTML='<div class="mm-studio-empty">Analyze a dataset first to get model recommendations.</div>';return}this._contentArea.replaceChildren();let t=document.createDocumentFragment(),a=document.createElement("div");a.className="mm-studio-section",a.innerHTML=`
      <div class="mm-studio-sec-title"><span>🤖</span> Intelligent Model Advisor</div>
      <div class="mm-studio-sec-sub">
        ModelMind analyses your dataset's size, feature types, and missing values
        to recommend the best ML models — ranked by suitability score.
      </div>
    `;let n=document.createElement("div");n.style.cssText="display:flex; align-items:center; gap:10px; margin-top:10px;";let s=document.createElement("span");s.style.cssText="font-size:11px; opacity:.7; font-weight:600;",s.textContent="\uD83C\uDFAF Target Column:";let i=document.createElement("select");i.className="mm-studio-select mm-select-sm",i.style.maxWidth="200px",(null!=(e=this._dataset.column_names)?e:[]).forEach(e=>{let t=document.createElement("option");t.value=e,t.textContent=e,(e===this._targetCol||e===this._dataset.column_names[this._dataset.column_names.length-1])&&(t.selected=!0),i.appendChild(t)});let o=document.createElement("button");o.type="button",o.className="mm-studio-btn mm-btn-sm mm-btn-accent",o.innerHTML="\uD83D\uDE80 Get Recommendations",n.append(s,i,o),i.addEventListener("change",()=>{this._targetCol=i.value}),a.appendChild(n),t.appendChild(a);let l=document.createElement("div");l.style.cssText="background:#fff;border:1px solid #c7d2fe;border-radius:12px;padding:14px;margin-bottom:16px;";let r=document.createElement("div");r.style.cssText="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:5px;",r.textContent="Measured Model Performance";let d=document.createElement("div");d.style.cssText="font-size:11px;color:#64748b;line-height:1.6;margin-bottom:10px;",d.textContent="Run real 3-fold cross-validation on your selected dataset. These measured scores are different from the suitability scores shown in the original recommendations below.";let c=document.createElement("div");c.style.cssText="display:flex;gap:8px;flex-wrap:wrap;align-items:center;";let m=document.createElement("button");m.type="button",m.className="mm-studio-btn mm-btn-sm mm-btn-accent",m.textContent="Evaluate Models on My Dataset";let p=document.createElement("button");p.type="button",p.className="mm-studio-btn mm-btn-sm",p.textContent="Cancel Evaluation",p.disabled=!0;let b=document.createElement("div");b.style.cssText="font-size:11px;color:#475569;margin-top:10px;",b.textContent="Evaluation has not started.";let f=document.createElement("div");f.style.cssText="margin-top:12px;",c.append(m,p),l.append(r,d,c,b,f),t.appendChild(l);let h=null,g=!1,v=this._app.serviceManager.serverSettings,x=e=>{g=e,m.disabled=e,p.disabled=!e||!h},y=(e,t,a,n)=>{var s,i,o,l,r,d,c;f.replaceChildren();let m=null==e?void 0:e.empirical_evaluation;if(!m||!0!==m.success){b.textContent="Evaluation did not return a successful comparison.";return}let p=String(null!=(s=m.metric)?s:"score"),u=!0===m.higher_is_better,h=document.createElement("div");h.style.cssText="font-size:12px;font-weight:700;margin-bottom:8px;",h.textContent=`Best measured model: ${String(null!=(i=m.recommended_model)?i:"Unknown")} | ${p}: ${String(null!=(o=m.recommended_score)?o:"N/A")}`;let g=document.createElement("div");g.style.cssText="font-size:10px;color:#64748b;margin-bottom:10px;",g.textContent=`${String(null!=(l=m.cv_folds)?l:3)}-fold cross-validation. `+(u?"Higher scores are better.":"Lower scores are better.")+" Results depend on this dataset and are not guarantees.";let v=document.createElement("table");v.style.cssText="width:100%;border-collapse:collapse;font-size:11px;";let x=document.createElement("tr");for(let e of["Model","Status","Mean score","Std. dev.","Scaler"]){let t=document.createElement("th");t.textContent=e,t.style.cssText="padding:8px;border-bottom:1px solid #e2e8f0;text-align:left;background:#f8fafc;",x.appendChild(t)}for(let e of(v.appendChild(x),Array.isArray(m.ranking)?m.ranking:[])){let t=document.createElement("tr"),a="number"==typeof e.mean_score?e.mean_score.toFixed(4):"N/A",n="number"==typeof e.std_score?e.std_score.toFixed(4):"N/A";for(let s of[null!=(r=e.model)?r:"Unknown",null!=(d=e.status)?d:"Unknown",a,n,null!=(c=e.scaler)?c:"None"]){let e=document.createElement("td");e.textContent=String(s),e.style.cssText="padding:8px;border-bottom:1px solid #e2e8f0;",t.appendChild(e)}v.appendChild(t)}if(f.append(h,g,v),Array.isArray(m.warnings)&&m.warnings.length>0){let e=document.createElement("div");e.style.cssText="font-size:10px;color:#92400e;margin-top:10px;",e.textContent=m.warnings.filter(e=>"string"==typeof e).join(" "),f.appendChild(e)}let y=null==e?void 0:e.automl_recommendations;(null==y?void 0:y.success)===!0&&Array.isArray(y.recommendations)&&!0===m.success&&this._renderFastTuneTopFive(f,t,a,n,y,m)};p.addEventListener("click",async()=>{if(h){p.disabled=!0;try{await u(`api/dataset/evaluation-jobs/${h}/cancel`,v,{method:"POST"}),b.textContent="Cancellation requested. Waiting for worker to stop..."}catch(e){b.textContent=`Cancellation request failed: ${String(e)}`,p.disabled=!1}}}),m.addEventListener("click",async()=>{var e,t;if(g||o.disabled)return;let a=i.value,n=this._currentPath;if(!n||!a){b.textContent="Select a dataset and target column first.";return}let s=()=>l.isConnected&&"model-advisor"===this._activeTab&&this._currentPath===n&&i.value===a;f.replaceChildren(),h=null,x(!0),o.disabled=!0,b.textContent="Submitting measured model evaluation...";let r=null,d=async()=>{if(r)try{await u(`api/dataset/evaluation-jobs/${r}/cancel`,v,{method:"POST"})}catch(e){}};try{let i=await u("api/dataset/evaluation-jobs",v,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:n,target_col:a,cv_folds:3,evaluate_scalers:!1})});if("string"!=typeof i.job_id||!i.job_id)throw Error("Evaluation job ID was not returned.");if(r=i.job_id,h=i.job_id,!s())return void await d();p.disabled=!1;let o=!1;for(let l=0;l<180;l++){if(!s())return void await d();let l=await u(`api/dataset/evaluation-jobs/${i.job_id}`,v);if(!s())return void await d();let r=String(null!=(e=l.status)?e:"unknown");if(b.textContent=`Dataset target: ${a} | Job: ${r}`,"completed"===r){o=!0,y(l.result,i.job_id,n,a);break}if(["failed","cancelled","timed_out"].includes(r)){o=!0,b.textContent=`Evaluation ${r}: ${String(null!=(t=l.error)?t:"")}`;break}await new Promise(e=>{setTimeout(e,1e3)})}!o&&s()&&(b.textContent="Still waiting. The evaluation may continue on the server.")}catch(e){s()&&(b.textContent=`Evaluation error: ${String(e)}`)}finally{h=null,x(!1),o.disabled=!1}});let C=document.createElement("div");t.appendChild(C),this._contentArea.appendChild(t);let _=!1,w=async()=>{var e,t;if(_)return;let a=i.value,n=this._currentPath,s=()=>C.isConnected&&"model-advisor"===this._activeTab&&this._currentPath===n&&i.value===a;if(!a||!n){C.textContent="Select a dataset and target column first.";return}if(g){C.textContent="An evaluation is already running in this panel. Wait for it to finish before requesting recommendations.";return}_=!0,o.disabled=!0,C.replaceChildren();let l=document.createElement("div");l.className="mm-studio-loading",l.textContent="Starting measured AutoML evaluation...";let r=document.createElement("button");r.type="button",r.className="mm-studio-btn mm-btn-sm",r.textContent="Cancel AutoML",r.disabled=!0,C.append(l,r);let d=null,c=!1;r.addEventListener("click",async()=>{if(d&&!c){c=!0,r.disabled=!0,l.textContent="Requesting cancellation...";try{await u(`api/dataset/evaluation-jobs/${d}/cancel`,this._app.serviceManager.serverSettings,{method:"POST"})}catch(e){c=!1,r.disabled=!1,l.textContent=`Cancellation request failed: ${String(e)}`}}});try{let i=this._app.serviceManager.serverSettings,o=await u("api/dataset/evaluation-jobs",i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:n,target_col:a,cv_folds:3,evaluate_scalers:!1})});if("string"!=typeof o.job_id)throw Error("Evaluation job ID is missing.");if(d=o.job_id,r.disabled=!1,!s()){try{await u(`api/dataset/evaluation-jobs/${d}/cancel`,i,{method:"POST"})}catch(e){}return}let c=!1;for(let o=0;o<180;o++){if(!s()){try{await u(`api/dataset/evaluation-jobs/${d}/cancel`,i,{method:"POST"})}catch(e){}return}let o=await u(`api/dataset/evaluation-jobs/${d}`,i);if(!s()){try{await u(`api/dataset/evaluation-jobs/${d}/cancel`,i,{method:"POST"})}catch(e){}return}let m=String(null!=(e=o.status)?e:"unknown");if(l.textContent=`AutoML: ${m} — comparing regression or classification algorithms using cross-validation.`,"completed"===m){c=!0;let e=o.result,t=null==e?void 0:e.automl_recommendations;if(!(null==e?void 0:e.handled)||!(null==t?void 0:t.success)||!Array.isArray(t.recommendations)||0===t.recommendations.length)throw Error("Completed evaluation has no valid AutoML recommendations.");let s=t.recommendations.map((e,a)=>({name:e.name,rank:a+1,medal:0===a?"\uD83E\uDD47":1===a?"\uD83E\uDD48":2===a?"\uD83E\uDD49":"\uD83C\uDFC5",score:0,tags:["Measured CV","regression"===t.task?"Regression":"Classification"],why:"Selected using measured cross-validation performance among the evaluated finalists. The score is an estimate, not a guarantee of performance on new data.",strengths:["Evaluated on the selected dataset","Preprocessing fitted within CV folds"],weaknesses:["Performance depends on the dataset","Final holdout performance may differ"],best_for:"Datasets where this algorithm performs well under the selected evaluation procedure.",training_speed:"Dataset dependent",complexity:"Model dependent",interpretability:"Model dependent",code:e.code_available?e.code:"",defaultCode:e.code_available?e.code:"",automl_measured:!0,measured_score:e.measured_score,measured_std:e.std_score,automl_task:t.task,code_available:e.code_available,code_error:e.code_error})),i={...e,models:s,automl_measured:!0,automl_candidate_count:t.candidate_count,automl_task:t.task};C.replaceChildren(),this._renderModelAdvisorResults(C,i),this._renderFastTuneTopFive(C,d,n,a,t,e.empirical_evaluation,s);break}if(["failed","cancelled","timed_out"].includes(m)){c=!0,l.textContent=`AutoML ${m}: ${String(null!=(t=o.error)?t:"")}`,r.disabled=!0;break}await new Promise(e=>setTimeout(e,1e3))}c||(l.textContent="Evaluation is still pending on the server.",r.disabled=!0)}catch(e){l.textContent=`AutoML failed: ${String(e)}`,r.disabled=!0}finally{_=!1,o.disabled=!1}};o.addEventListener("click",w),w()}_renderModelAdvisorResults(e,t){var a,n,s,i,o,l,r;if(!t.handled){e.innerHTML=`<div class="mm-studio-alert mm-alert-error">${null!=(a=t.error)?a:"Analysis failed."}</div>`;return}let d=document.createDocumentFragment(),c=document.createElement("div");c.style.cssText="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px;";let m=(e,t,a="#4f46e5")=>{let n=document.createElement("div");n.style.cssText=`
        padding:12px; border-radius:10px; border:1px solid #dfe3ea;
        background:#ffffff; box-shadow:0 1px 3px rgba(31,41,55,0.03);
      `,n.innerHTML=`
        <div style="font-size:16px; font-weight:800; color:${a};">${t}</div>
        <div style="font-size:9.5px; color:#5d6b80; text-transform:uppercase; letter-spacing:0.3px; font-weight:600; margin-top:2px;">${e}</div>
      `,c.appendChild(n)};m("Rows",null!=(s=null==(n=t.rows)?void 0:n.toLocaleString())?s:"—"),m("Features",`${t.n_numeric_features} num \xb7 ${t.n_categorical_features} cat`),m("Missing Data",t.has_missing?`${t.missing_pct}%`:"None",t.has_missing?"#dc2626":"#059669"),d.appendChild(c);let p=document.createElement("div");if(p.style.cssText=`
      padding:10px 14px; border-radius:10px; margin-bottom:16px; font-size:12px; font-weight:600;
      background:${"regression"===t.task?"#eef2ff":"#ecfdf5"};
      border:1px solid ${"regression"===t.task?"#c7d2fe":"#a7f3d0"};
      color:${"regression"===t.task?"#4338ca":"#065f46"};
    `,p.innerHTML=`
      <b>Detected Task:</b> ${t.task_label}
      &nbsp;\xb7&nbsp; <b>Target Column:</b> <code>${t.target_column}</code>
      &nbsp;\xb7&nbsp; <b>Dataset Size:</b> ${t.dataset_size_label}
    `,d.appendChild(p),"LabelEncoder"===t.target_encoding){let e=document.createElement("div");e.className="mm-studio-alert mm-alert-info",e.style.marginBottom="16px",e.textContent="LabelEncoder is included in the generated classification code: target categories are encoded for training, the code prints the label-to-number mapping, and predictions are converted back to the original category names. The source CSV is not changed.",d.appendChild(e)}let u=document.createElement("div");u.style.cssText="font-size:13px; font-weight:700; margin-bottom:12px; color:#1e293b;",u.innerHTML=`🏆 Ranked Model Recommendations <span style="color:#64748b; font-weight:400; font-size:11px;">(${null!=(o=null==(i=t.models)?void 0:i.length)?o:0} models analysed)</span>`,t.automl_measured&&(u.textContent=`Measured AutoML Rankings (${t.models.length} finalists from ${null!=(l=t.automl_candidate_count)?l:"multiple"} candidates)`),d.appendChild(u),(null!=(r=t.models)?r:[]).forEach(e=>{d.appendChild(this._buildModelCard(e,t.target_column))}),e.appendChild(d)}_renderFastTuneTopFive(e,t,a,n,s,i,o=[]){let l=null==s?void 0:s.recommendations,r=null==i?void 0:i.features,d=null==i?void 0:i.task;if(!Array.isArray(l)||l.length<1||l.length>5||!Array.isArray(r)||0===r.length||!["classification","regression"].includes(d))return;let c=l.map(e=>e.name);if(!c.every(e=>"string"==typeof e&&e.length>0))return;let m=document.createElement("section");m.className="mm-studio-section",m.style.cssText="margin-top:18px;padding:16px;border:1px solid #c7d2fe;border-radius:12px;background:#f8faff;";let p=document.createElement("div");p.style.cssText="font-size:15px;font-weight:800;color:#1e293b;",p.textContent="Fast Hyperparameter Tuning";let b=document.createElement("p");b.style.cssText="font-size:12px;line-height:1.6;color:#475569;margin:8px 0 12px;",b.textContent="Search important parameters for your measured Top 5. Basic tests fewer configurations. Advanced explores more important settings. Only useful changes are shown.";let f=document.createElement("div");f.style.cssText="display:flex;gap:8px;align-items:center;margin-bottom:10px;";let g=document.createElement("label");g.textContent="Tuning level:",g.style.cssText="font-size:12px;font-weight:700;color:#334155;";let v=document.createElement("select");v.className="mm-studio-select",["basic","advanced"].forEach(e=>{let t=document.createElement("option");t.value=e,t.textContent="basic"===e?"Basic":"Advanced",v.appendChild(t)}),f.append(g,v);let x=document.createElement("div");x.style.cssText="font-size:11px;color:#64748b;margin-bottom:10px;";let y=()=>{x.textContent="advanced"===v.value?"Advanced: up to 20 configurations per model. More exploration; time limit may stop the search.":"Basic: up to 8 configurations per model. Focuses on high-impact hyperparameters."};v.addEventListener("change",y),y();let C=document.createElement("div");C.style.cssText="display:flex;gap:8px;flex-wrap:wrap;";let _=document.createElement("button");_.type="button",_.className="mm-studio-btn mm-btn-sm mm-btn-primary",_.textContent="⚡ Fast Tune Top 5";let w=document.createElement("button");w.type="button",w.className="mm-studio-btn mm-btn-sm",w.textContent="Cancel Tuning",w.disabled=!0,w.style.display="none";let k=document.createElement("div");k.setAttribute("role","status"),k.style.cssText="font-size:12px;color:#475569;margin-top:10px;",k.textContent="Tuning has not started.";let E=document.createElement("div");E.style.cssText="margin-top:12px;",C.append(_,w),m.append(p,b,f,x,C,k,E),e.appendChild(m);let T=null,$=!1,M=()=>m.isConnected&&"model-advisor"===this._activeTab&&this._currentPath===a&&this._targetCol===n,N=this._app.serviceManager.serverSettings,L=e=>{var t,a;E.replaceChildren();let n=document.createElement("div");n.style.cssText="font-size:13px;font-weight:800;margin-bottom:8px;",n.textContent="Tuned Models — Tested Results",E.appendChild(n);let s=document.createElement("p");s.style.cssText="font-size:11px;color:#64748b;line-height:1.5;",s.textContent=`Uses the Model Advisor metric (${String(null!=(t=null==e?void 0:e.metric)?t:"CV score")}), ${String(null!=(a=null==e?void 0:e.cv_folds)?a:"matching")} CV folds and its evaluated dataset sample, so default scores are directly comparable to the original finalists. Parameter selection can still overfit CV; confirm a final model on a separate test set before deployment.`,E.appendChild(s);let i=Array.isArray(null==e?void 0:e.results)?e.results:Array.isArray(null==e?void 0:e.ranking)?e.ranking:[];if(!i.length){let t=document.createElement("pre");t.style.cssText="font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere;",t.textContent=JSON.stringify(e,null,2),E.appendChild(t);return}let o=e=>null===e?"None":"string"==typeof e?e:JSON.stringify(e);i.forEach((t,a)=>{var n,s,i;let l=document.createElement("div");l.style.cssText="padding:12px;margin:8px 0;border:1px solid #e2e8f0;border-radius:10px;background:#fff;";let r=document.createElement("div");r.style.cssText="font-size:13px;font-weight:700;color:#0f172a;";let c=String(null!=(s=null!=(n=null==t?void 0:t.model)?n:null==t?void 0:t.name)?s:"Model");r.textContent=`${a+1}. ${c}`;let m=document.createElement("div");m.style.cssText="font-size:12px;font-weight:600;color:#059669;margin-top:6px;",m.textContent=(t=>{var a,n,s,i,o;let l=null!=(s=null!=(n=null!=(a=null==t?void 0:t.best_score)?a:null==t?void 0:t.mean_score)?n:null==t?void 0:t.score)?s:null==(i=null==t?void 0:t.best)?void 0:i.score;if("number"!=typeof l||!Number.isFinite(l))return"No valid CV score";if("regression"===d)return`RMSE: ${Math.abs(l).toFixed(4)} (lower is better)`;let r=String(null!=(o=null==e?void 0:e.metric)?o:"Accuracy");return/accuracy|f1|precision|recall|roc.?auc/i.test(r)?`${r}: ${(100*l).toFixed(2)}%`:`${r}: ${l.toFixed(4)}`})(t);let p=document.createElement("div");p.style.cssText="font-size:11px;color:#475569;margin-top:7px;line-height:1.6;";let u=Array.isArray(null==t?void 0:t.recommended_changes)?t.recommended_changes:[],b=(null==t?void 0:t.best_params)&&"object"==typeof t.best_params&&!Array.isArray(t.best_params)?t.best_params:{};if(u.length>0||Object.keys(b).length>0){let e=document.createElement("div");e.style.fontWeight="700",e.textContent=(null==t?void 0:t.completed)===!1?"Promising changes found (search incomplete):":"Recommended parameter changes:",p.appendChild(e),u.length>0?u.forEach(e=>{let t=document.createElement("div");t.textContent=`${String(e.parameter)}: ${o(e.default)} → ${o(e.recommended)}`,p.appendChild(t)}):Object.entries(b).forEach(([e,t])=>{let a=document.createElement("div");a.textContent=`${e}: ${o(t)}`,p.appendChild(a)})}else{let e=String(null!=(i=null==t?void 0:t.recommendation_status)?i:"");"partial_defaults_recommended"===e?p.textContent="Default parameters performed best so far. Search incomplete — more configurations remain untested.":"insufficient_validation"===e?p.textContent="No parameter changes recommended: the evaluation had fewer than three CV folds, which is not enough to assess tuning improvements reliably.":"partial_parameter_changes"===e?p.textContent="Promising changes found, but the search is incomplete.":"defaults_recommended"===e?p.textContent="Keep default parameters. Tested alternatives did not provide a meaningful improvement.":"baseline_unavailable"===e?p.textContent="The default baseline was unavailable. No parameter changes can be recommended reliably.":"no_valid_configuration"===e||(null==t?void 0:t.status)==="failed"?p.textContent="No valid configuration was evaluated.":p.textContent="No parameter changes recommended."}let f=null==t?void 0:t.baseline_score,h=null==t?void 0:t.best_tested_score;if("number"==typeof f&&Number.isFinite(f)&&"number"==typeof h&&Number.isFinite(h)){let e=document.createElement("div");e.style.cssText="font-size:10px;color:#64748b;margin-top:6px;",e.textContent=`Default CV: ${f.toFixed(4)} • Best tested CV: ${h.toFixed(4)}`,p.appendChild(e)}let g=null==t?void 0:t.configurations_tested,v=null==t?void 0:t.configurations_planned;if("number"==typeof g&&"number"==typeof v&&v>0){let e=document.createElement("div");e.style.cssText="font-size:11px;color:#475569;margin-top:7px;",e.textContent=`Configurations tested: ${g}/${v}`,p.appendChild(e)}if((null==t?void 0:t.completed)===!1){let e=document.createElement("div");e.style.cssText="font-size:11px;color:#b45309;margin-top:6px;",e.textContent="Partial search: not all configurations were tested.",p.appendChild(e)}if("string"==typeof(null==t?void 0:t.code)&&t.code.trim()){let e=t.code,a=document.createElement("div");a.style.cssText="font-size:10.5px;color:#047857;margin-top:6px;font-weight:600;display:flex;align-items:center;gap:4px;",a.innerHTML="<span>⚡ Tuned! Recommendations shown on Model Advisor card above. The main insert button still inserts <b>baseline code</b> — apply changes manually.</span>",p.appendChild(a);let n=document.createElement("div");n.style.cssText="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;";let s=document.createElement("button");s.type="button",s.className="mm-studio-btn mm-btn-sm mm-btn-primary",s.style.cssText="background:#059669;border-color:#047857;color:#fff;font-weight:600;",s.innerHTML="\uD83D\uDCE5 Insert Tuned Code into Notebook",s.addEventListener("click",()=>{let t=this._insertCodeBelow(e);this._showToast(t?`✓ Tuned ${c} code inserted into notebook!`:"Open a notebook first.")});let i=document.createElement("button");i.type="button",i.className="mm-studio-btn mm-btn-sm",i.innerHTML="\uD83D\uDCCB Copy Code",i.addEventListener("click",async()=>{await navigator.clipboard.writeText(e),i.textContent="Copied!",setTimeout(()=>{i.innerHTML="\uD83D\uDCCB Copy Code"},1500)});let o=document.createElement("button");o.type="button",o.className="mm-studio-btn mm-btn-sm",o.innerHTML="\uD83D\uDD0D Preview Code",o.addEventListener("click",()=>{this._showCodePreviewModal(c+" (Tuned)",e,"advanced")}),n.append(s,i,o),l.appendChild(n)}else if("string"==typeof(null==t?void 0:t.code_error)){let e=document.createElement("div");e.style.cssText="font-size:10px;color:#b45309;margin-top:6px;",e.textContent=`Could not synchronize generated code: ${t.code_error}`,p.appendChild(e)}let x=document.createElement("details");x.style.cssText="margin-top:9px;font-size:11px;color:#475569;";let y=document.createElement("summary");y.textContent="Advanced Details",y.style.cssText="cursor:pointer;font-weight:600;color:#4338ca;";let C=document.createElement("pre");C.style.cssText="margin:8px 0 0;padding:9px;background:#f8fafc;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:10px;";let _={...t};delete _.code,C.textContent=JSON.stringify(_,null,2),x.append(y,C),l.append(r,m,p,x),E.appendChild(l)})};w.addEventListener("click",async()=>{if(T){w.disabled=!0,k.textContent="Cancellation requested...";try{await u(`api/dataset/tuning-jobs/${T}/cancel`,N,{method:"POST"})}catch(e){k.textContent=`Cancellation request failed: ${String(e)}`,w.disabled=!1}}}),_.addEventListener("click",async()=>{var e,s,i,l,m,p;if($||!M())return;$=!0,T=null,_.disabled=!0,w.disabled=!0,w.style.display="none",E.replaceChildren(),v.disabled=!0;let b=v.value;k.textContent=`Submitting ${b} tuning for Top 5...`;try{let f=await u("api/dataset/tuning-jobs",N,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({evaluation_job_id:t,file_path:a,target_column:n,feature_columns:r,task:d,model_names:c,time_budget_seconds:"advanced"===b?120:60,level:b})});if("string"!=typeof(null==f?void 0:f.job_id))throw Error("Tuning job ID is missing.");T=f.job_id,w.disabled=!1,w.style.display="inline-flex";let g=!1;for(let t=0;t<240;t++){if(!M()){k.textContent="Panel changed. Tuning continues on the server unless it is cancelled or reaches its timeout.";break}let t=await u(`api/dataset/tuning-jobs/${T}`,N),a=String(null!=(e=null==t?void 0:t.status)?e:"unknown");if(k.textContent=`Fast tuning: ${a}`,"completed"===a){g=!0,o.forEach(e=>{var t;e.code=e.defaultCode,delete e.tuned_code,e.code_available=!!e.defaultCode,e.tuned_configuration_applied=!1,delete e.tuned_params,delete e.tuned_changes,delete e.tuned_score,delete e.tuned_code_error,null==(t=e.refreshCode)||t.call(e)}),L(t.result);let e=function(e,t){if(!Array.isArray(t))return{updated:0,errors:[]};let a=0,n=[];return t.forEach(t=>{var s,i,o;if(!t||"object"!=typeof t||"string"!=typeof t.model)return;let l=t.model.trim(),r=h(l),d=e.find(e=>{if(e.name===l)return!0;let t=h(e.name);return!!(t===r||(r.includes("svr")||r.includes("supportvectorreg"))&&(t.includes("svr")||t.includes("supportvectorreg"))||(r.includes("svm")||r.includes("supportvector"))&&(t.includes("svm")||t.includes("supportvector")))});if(d)if("string"==typeof t.code&&t.code.trim()){d.tuned_code=t.code,d.code_available=!0,d.tuned_configuration_applied=!0,d.tuned_params=t.best_params&&"object"==typeof t.best_params&&!Array.isArray(t.best_params)?t.best_params:void 0,d.tuned_changes=Array.isArray(t.recommended_changes)?t.recommended_changes:void 0;let e=null!=(i=null!=(s=t.best_score)?s:t.mean_score)?i:t.score;d.tuned_score="number"==typeof e?e:void 0,delete d.tuned_code_error,null==(o=d.refreshCode)||o.call(d),a+=1}else"string"==typeof t.code_error&&(d.tuned_code_error=t.code_error,n.push(`${d.name}: ${t.code_error}`))}),{updated:a,errors:n}}(o,null==(s=t.result)?void 0:s.results);k.textContent=`Tuning finished: ${String(null!=(l=null==(i=t.result)?void 0:i.models_completed)?l:0)}/${c.length} models fully searched.`+((null==(m=t.result)?void 0:m.timed_out)?" Time budget reached.":"")+` ${e.updated} Model Advisor card(s) now show tuning recommendations.`+' The "Insert into Notebook" button still inserts baseline code — apply the shown parameter changes manually!';break}if(["failed","cancelled","timed_out"].includes(a)){g=!0,k.textContent=`Fast tuning ${a}: `+String(null!=(p=null==t?void 0:t.error)?p:"");break}await new Promise(e=>setTimeout(e,1e3))}!g&&M()&&(k.textContent="Tuning is taking longer than expected. Check the job status before starting another run.")}catch(e){M()&&(k.textContent=`Fast Tune error: ${String(e)}`)}finally{$=!1,v.disabled=!1,_.disabled=!M(),w.disabled=!0,w.style.display="none"}})}_buildModelCard(e,t){var a,n,s,i,o,l,r;"string"==typeof e.defaultCode&&e.defaultCode.trim()||(e.defaultCode="string"==typeof e.code?e.code:"");let d=()=>{let t="string"==typeof e.defaultCode&&e.defaultCode.trim()?e.defaultCode:e.code;return"string"==typeof t?f(t):""},c=null!=(a=({1:{bg:"#fef3c7",border:"#fde68a",text:"#b45309"},2:{bg:"#f1f5f9",border:"#cbd5e1",text:"#475569"},3:{bg:"#ffedd5",border:"#fed7aa",text:"#c2410c"}})[e.rank])?a:{bg:"#f8fafc",border:"#e2e8f0",text:"#64748b"},m=e.score>=85?"#059669":e.score>=70?"#d97706":"#dc2626",p=document.createElement("div");p.style.cssText=`
      border:1px solid ${1===e.rank?"#fde047":"#dfe3ea"};
      border-radius:12px; padding:16px; margin-bottom:12px;
      background:${1===e.rank?"#fffdf0":"#ffffff"};
      box-shadow: 0 1px 3px rgba(31, 41, 55, 0.04);
      position:relative;
    `;let u=document.createElement("div");if(u.style.cssText="display:flex; align-items:center; gap:10px; margin-bottom:12px;",u.innerHTML=`
      <span style="font-size:22px; line-height:1;">${e.medal}</span>
      <div style="flex:1;">
        <div style="font-size:14px; font-weight:800; display:flex; align-items:center; gap:8px; color:#1e293b;">
          ${e.name}
          ${e.rank<=3?`<span style="font-size:9px; padding:2px 8px; border-radius:99px; background:${c.bg}; color:${c.text}; border:1px solid ${c.border}; font-weight:700;">RANK #${e.rank}</span>`:""}
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:5px;">
          ${(null!=(n=e.tags)?n:[]).map(e=>`<span style="font-size:9px; font-weight:600; padding:2px 8px; border-radius:99px; background:#eef2ff; border:1px solid #c7d2fe; color:#4338ca;">${e}</span>`).join("")}
        </div>
      </div>
      <div style="text-align:right; flex-shrink:0;">
        <div style="font-size:22px; font-weight:900; color:${m}; line-height:1;">${e.score}</div>
        <div style="font-size:9px; color:#64748b; font-weight:600;">/ 100</div>
      </div>
    `,p.appendChild(u),e.automl_measured){let t=u.lastElementChild;if(t){t.replaceChildren();let a=document.createElement("div");a.style.cssText="font-size:19px;font-weight:900;color:#059669;";let n=Number(e.measured_score),s="regression"===e.automl_task;a.textContent=Number.isFinite(n)?s?n.toFixed(4):`${(100*n).toFixed(2)}%`:"N/A";let i=document.createElement("div");i.style.cssText="font-size:10px;color:#64748b;font-weight:600;",i.textContent=s?"CV RMSE (lower is better)":"CV balanced accuracy",t.append(a,i)}}let b=document.createElement("div");b.style.cssText="height:6px; border-radius:99px; background:#e2e8f0; margin-bottom:12px; overflow:hidden;";let h=document.createElement("div");h.style.cssText=`height:100%; width:${e.score}%; border-radius:99px; background:linear-gradient(90deg, ${m}aa, ${m});`,b.appendChild(h),e.automl_measured||p.appendChild(b);let g=document.createElement("div");g.style.cssText=`
      font-size:11.5px; padding:10px 12px; border-radius:8px; margin-bottom:10px;
      background:#f0fdf4; border:1px solid #bbf7d0; color:#14532d; line-height:1.6; font-weight:500;
    `,g.innerHTML=`<b style="color:#15803d; font-weight:700;">✅ Why this model:</b> <span style="color:#166534;">${e.why}</span>`,p.appendChild(g);let v=e.dependency_status;if(v&&!1===v.available&&"string"==typeof v.optional_dependency){let e=document.createElement("div");e.style.cssText=`
        padding:10px 12px;
        margin-bottom:10px;
        border-radius:8px;
        background:#fff7ed;
        border:1px solid #fed7aa;
        color:#9a3412;
        font-size:11px;
        line-height:1.6;
      `;let t=document.createElement("div");t.style.fontWeight="700",t.textContent="Optional ML package unavailable";let a=document.createElement("div");a.textContent="string"==typeof v.message?v.message:"This model requires an additional Python package.";let n=document.createElement("div");if(n.style.marginTop="4px",n.textContent="Availability is checked on the ModelMind server. Your notebook kernel may use a different environment.",e.appendChild(t),e.appendChild(a),e.appendChild(n),Array.isArray(v.alternatives)&&v.alternatives.length>0){let t=document.createElement("div");t.style.marginTop="6px",t.textContent="Available-library alternatives to consider: "+v.alternatives.filter(e=>"string"==typeof e).join(", "),e.appendChild(t)}p.appendChild(e)}let x=document.createElement("div");x.style.cssText="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:10px;",[["Training Speed",null!=(s=e.training_speed)?s:"—"],["Complexity",null!=(i=e.complexity)?i:"—"],["Interpretability",null!=(o=e.interpretability)?o:"—"]].forEach(([e,t])=>{let a=document.createElement("div");a.style.cssText="padding:8px 10px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; font-size:10px;",a.innerHTML=`<div style="color:#64748b; font-size:9px; font-weight:600; text-transform:uppercase; margin-bottom:3px;">${e}</div><div style="font-weight:700; color:#0f172a;">${t}</div>`,x.appendChild(a)}),p.appendChild(x);let y=document.createElement("div");y.style.cssText="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;";let C=document.createElement("div");C.style.cssText="padding:10px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0;",C.innerHTML=`
      <div style="font-size:10.5px; font-weight:700; color:#15803d; margin-bottom:6px;">✅ Strengths</div>
      ${(null!=(l=e.strengths)?l:[]).map(e=>`<div style="font-size:10px; color:#166534; margin-bottom:3px; line-height:1.4;">• ${e}</div>`).join("")}
    `;let _=document.createElement("div");_.style.cssText="padding:10px; border-radius:8px; background:#fef2f2; border:1px solid #fecaca;",_.innerHTML=`
      <div style="font-size:10.5px; font-weight:700; color:#b91c1c; margin-bottom:6px;">⚠️ Weaknesses</div>
      ${(null!=(r=e.weaknesses)?r:[]).map(e=>`<div style="font-size:10px; color:#991b1b; margin-bottom:3px; line-height:1.4;">• ${e}</div>`).join("")}
    `,y.append(C,_),p.appendChild(y);let w=document.createElement("div");w.style.cssText="font-size:11px; color:#475569; margin-bottom:12px; padding:7px 10px; border-radius:6px; background:#f8fafc; border:1px solid #e2e8f0; line-height:1.4;",w.innerHTML=`<b style="color:#1e293b;">Best for:</b> ${e.best_for}`,p.appendChild(w);let k=document.createElement("div"),E=!1,T=document.createElement("button");T.type="button",T.className="mm-studio-btn mm-btn-sm",T.innerHTML="\uD83D\uDCC4 Show Full Code";let $=document.createElement("pre");$.style.cssText=`
      background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
      padding:14px 16px; font-size:10.5px; line-height:1.7;
      font-family:ui-monospace,SFMono-Regular,'Cascadia Code',monospace;
      color:#1e293b; overflow-x:auto; margin:8px 0 0 0; white-space:pre; display:none;
    `,$.textContent=d()||"# No code available",T.addEventListener("click",()=>{E=!E,$.textContent=d()||"# No code available",$.style.display=E?"block":"none",T.innerHTML=E?"\uD83D\uDD3C Hide Code":"\uD83D\uDCC4 Show Full Code"}),k.appendChild(T),k.appendChild($),p.appendChild(k);let M=document.createElement("div");M.style.cssText="display:none; padding:10px 14px; border-radius:8px; margin-top:12px; background:#ecfdf5; border:1px solid #6ee7b7; color:#065f46; font-size:11.5px; line-height:1.5;";let N=document.createElement("div");N.style.cssText="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;";let L=document.createElement("button");L.type="button",L.className="mm-studio-btn mm-btn-sm",L.innerHTML="\uD83D\uDD0D Preview Code",L.addEventListener("click",()=>{this._showCodePreviewModal(e.name+" (Baseline)",d(),1===e.rank?"advanced":2===e.rank?"medium":"basic")});let S=document.createElement("button");S.type="button",S.className="mm-studio-btn mm-btn-sm",S.innerHTML="\uD83D\uDCCB Copy Code",S.addEventListener("click",async()=>{await navigator.clipboard.writeText(d()),S.textContent="Copied!",setTimeout(()=>{S.innerHTML="\uD83D\uDCCB Copy Code"},1500)});let A=document.createElement("button");if(A.type="button",A.className="mm-studio-btn mm-btn-sm mm-btn-primary",A.innerHTML="\uD83D\uDCE5 Insert into Notebook",A.title="Insert the clean baseline model code into your notebook",A.addEventListener("click",()=>{let t=this._insertCodeBelow(d());this._showToast(t?`✓ ${e.name} baseline code inserted! (Ready for manual parameter changes)`:"Open a notebook first.")}),e.refreshCode=()=>{let t=!!d();if($.textContent=d()||"# No code available",T.disabled=!t,L.disabled=!t,S.disabled=!t,A.disabled=!t,e.tuned_configuration_applied){p.style.borderColor="#10b981",p.style.boxShadow="0 0 0 1px #10b981, 0 3px 10px rgba(16, 185, 129, 0.12)",A.innerHTML="\uD83D\uDCE5 Insert Baseline Code into Notebook",M.replaceChildren(),M.style.display="block";let t=document.createElement("div");t.style.cssText="font-weight:700; color:#047857; margin-bottom:4px; display:flex; align-items:center; gap:6px; font-size:12px;",t.innerHTML="<span>⚡ Hyperparameter Tuning Recommendations:</span>";let a=document.createElement("div");a.style.cssText="font-size:11px; color:#14532d; margin-top:4px; line-height:1.6;";let n=e=>null===e?"None":"string"==typeof e?`"${e}"`:JSON.stringify(e);Array.isArray(e.tuned_changes)&&e.tuned_changes.length>0?e.tuned_changes.forEach(e=>{let t=document.createElement("div");t.innerHTML=`• <b>${e.parameter}</b>: change from <code>${n(e.default)}</code> → <code>${n(e.recommended)}</code>`,a.appendChild(t)}):e.tuned_params&&Object.entries(e.tuned_params).forEach(([e,t])=>{let s=document.createElement("div");s.innerHTML=`• <b>${e}</b>: recommended value <code>${n(t)}</code>`,a.appendChild(s)});let s=document.createElement("div");s.style.cssText="font-size:10.5px; color:#475569; margin-top:6px; line-height:1.4;",s.innerHTML='<b>Workflow:</b> <i>"Insert Baseline Code"</i> inserts the model code before tuning. Run it first in your notebook, then manually change the parameter values as shown above to compare results!';let i=document.createElement("div");i.style.cssText="display:flex; gap:8px; margin-top:8px; align-items:center; flex-wrap:wrap;";let o=document.createElement("button");o.type="button",o.className="mm-studio-btn mm-btn-sm",o.style.cssText="background:#f0fdf4; border:1px solid #86efac; color:#15803d; font-weight:600; font-size:10.5px; cursor:pointer;",o.innerHTML="⚡ Insert Already-Tuned Code Instead",o.addEventListener("click",()=>{let t,a=this._insertCodeBelow("string"==typeof(t="string"==typeof e.tuned_code&&e.tuned_code.trim()?e.tuned_code:"string"==typeof e.code?e.code:e.defaultCode)?f(t):"");this._showToast(a?`✓ Tuned ${e.name} code inserted!`:"Open a notebook first.")}),i.append(o),M.append(t,a,s,i)}else p.style.borderColor=1===e.rank?"#fde047":"#dfe3ea",p.style.boxShadow="0 1px 3px rgba(31, 41, 55, 0.04)",A.innerHTML="\uD83D\uDCE5 Insert into Notebook",M.style.display="none",M.replaceChildren()},e.automl_measured&&!e.code_available){T.disabled=!0,L.disabled=!0,S.disabled=!0,A.disabled=!0;let t=document.createElement("div");t.style.cssText="font-size:11px;color:#b45309;margin-top:8px;",t.textContent=e.code_error||"Executable code is unavailable.",p.appendChild(t)}return N.append(L,S,A),p.append(M,N),e.refreshCode(),p}_renderModelLabTab(){let e=document.createDocumentFragment(),t=document.createElement("div");t.className="mm-studio-section",t.innerHTML=`
      <div class="mm-studio-sec-title"><span>⚗️</span> Model Visualization Lab</div>
      <div class="mm-studio-sec-sub">Interactive visualizers for foundational machine learning algorithms.</div>
    `,e.appendChild(t);let a=document.createElement("div");a.className="mm-studio-level-row";let n="gd",s=document.createElement("div");s.className="mm-lab-model-container",[{id:"gd",label:"\uD83D\uDCC9 Gradient Descent"},{id:"tree",label:"\uD83C\uDF33 Decision Tree"},{id:"knn",label:"\uD83D\uDD35 KNN"},{id:"kmeans",label:"\uD83D\uDD2E K-Means"},{id:"pca",label:"\uD83D\uDCD0 PCA"}].forEach(e=>{let t=document.createElement("button");t.type="button",t.className=`mm-level-pill ${e.id===n?"active":""}`,t.textContent=e.label,t.addEventListener("click",()=>{n=e.id,a.querySelectorAll("button").forEach(e=>e.classList.remove("active")),t.classList.add("active"),this._renderSelectedModel(s,n)}),a.appendChild(t)}),e.appendChild(a),e.appendChild(s),this._contentArea.appendChild(e),this._renderSelectedModel(s,n)}_renderSelectedModel(e,t){e.replaceChildren(),"gd"===t?this._renderGradientDescentLab(e):"tree"===t?this._renderDecisionTreeLab(e):"knn"===t?this._renderKNNLab(e):"kmeans"===t?this._renderKMeansLab(e):"pca"===t&&this._renderPCALab(e)}_renderGradientDescentLab(e){let t=document.createElement("div");t.className="mm-studio-card";let a=.1,n=.5,s=.05,i=0,o=!1,l=null,r=[{x:.1,y:1.1},{x:.2,y:1.5},{x:.3,y:1.6},{x:.4,y:1.9},{x:.5,y:2.1},{x:.6,y:2.2},{x:.7,y:2.6},{x:.8,y:2.7},{x:.9,y:2.9}],d=[],c=(e,t)=>{let a=0;return r.forEach(n=>{let s=e*n.x+t;a+=Math.pow(s-n.y,2)}),a/r.length},m=()=>{let e=0,t=0,o=r.length;r.forEach(s=>{let i=a*s.x+n-s.y;e+=2/o*i*s.x,t+=2/o*i}),a-=s*e,n-=s*t,i++,d.push(c(a,n)),_()};t.innerHTML=`
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Gradient Descent Regression Simulator</span>
        <span class="mm-studio-badge badge-num">Optimization</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Watch the regression line fit the data and loss minimize step-by-step.</div>

      \x3c!-- Controls --\x3e
      <div class="mm-lab-controls">
        <label class="mm-lab-ctrl-row">
          <span>Learning Rate (α): <b id="gd-lr-val">${s}</b></span>
          <input type="range" id="gd-lr" min="0.01" max="0.2" step="0.01" value="${s}" />
        </label>
        <div style="display:flex; gap:6px; margin-top:8px;">
          <button type="button" class="mm-studio-btn mm-btn-sm mm-btn-primary" id="gd-play">▶ Play</button>
          <button type="button" class="mm-studio-btn mm-btn-sm" id="gd-step">⏭ Step</button>
          <button type="button" class="mm-studio-btn mm-btn-sm" id="gd-reset">🔄 Reset</button>
        </div>
      </div>

      \x3c!-- Live metrics --\x3e
      <div class="mm-studio-stats-grid" style="margin-top:10px;">
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-epoch">0</div><div class="mm-stat-lbl">Epoch</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-w">0.10</div><div class="mm-stat-lbl">Weight (w)</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-b">0.50</div><div class="mm-stat-lbl">Bias (b)</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-loss" style="color:#f87171;">—</div><div class="mm-stat-lbl">MSE Loss</div></div>
      </div>

      \x3c!-- Canvas for Plot --\x3e
      <div style="margin-top:12px; border:1px solid #dfe3ea; border-radius:8px; overflow:hidden; background:#ffffff; padding:8px;">
        <div style="font-size:10px; font-weight:600; color:#64748b; margin-bottom:4px;">Regression Line & Data Points</div>
        <svg id="gd-canvas" viewBox="0 0 300 160" style="width:100%; height:160px; display:block;"></svg>
      </div>
    `,e.appendChild(t);let p=t.querySelector("#gd-canvas"),u=t.querySelector("#gd-epoch"),b=t.querySelector("#gd-w"),f=t.querySelector("#gd-b"),h=t.querySelector("#gd-loss"),g=t.querySelector("#gd-lr"),v=t.querySelector("#gd-lr-val"),x=t.querySelector("#gd-play"),y=t.querySelector("#gd-step"),C=t.querySelector("#gd-reset");g.addEventListener("input",()=>{v.textContent=(s=parseFloat(g.value)).toFixed(2)});let _=()=>{u.textContent=String(i),b.textContent=a.toFixed(2),f.textContent=n.toFixed(2),h.textContent=c(a,n).toFixed(4);let e=e=>136-e/3.5*112,t=`
        <line x1="24" y1="136" x2="276" y2="136" stroke="#334155" stroke-width="1"/>
        <line x1="24" y1="24" x2="24" y2="136" stroke="#334155" stroke-width="1"/>
      `;r.forEach(a=>{t+=`<circle cx="${24+252*a.x}" cy="${e(a.y)}" r="4" fill="#818cf8"/>`});let s=0*a+n,o=+a+n;p.innerHTML=t+=`
        <line x1="${24}" y1="${e(s)}" x2="${276}" y2="${e(o)}"
          stroke="#34d399" stroke-width="2.5" stroke-linecap="round"/>
      `};y.addEventListener("click",()=>m()),x.addEventListener("click",()=>{x.textContent=(o=!o)?"⏸ Pause":"▶ Play",x.className=o?"mm-studio-btn mm-btn-sm mm-btn-accent":"mm-studio-btn mm-btn-sm mm-btn-primary",o?l=setInterval(()=>{if(i>=100){clearInterval(l),o=!1,x.textContent="▶ Play";return}m()},100):clearInterval(l)}),C.addEventListener("click",()=>{clearInterval(l),o=!1,x.textContent="▶ Play",a=.1,n=.5,i=0,d.length=0,_()}),_()}_renderDecisionTreeLab(e){let t=document.createElement("div");t.className="mm-studio-card",t.innerHTML=`
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
    `,e.appendChild(t)}_renderKNNLab(e){let t=document.createElement("div");t.className="mm-studio-card",t.innerHTML=`
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
    `,e.appendChild(t);let a=t.querySelector("#knn-svg"),n=t.querySelector("#knn-k"),s=t.querySelector("#knn-k-val"),i=t.querySelector("#knn-pred-box"),o=3,l={x:150,y:90},r=[{x:50,y:50},{x:70,y:70},{x:80,y:40},{x:100,y:60},{x:90,y:90},{x:60,y:110}],d=[{x:220,y:130},{x:240,y:150},{x:210,y:160},{x:200,y:120},{x:250,y:110},{x:180,y:140}],c=()=>{let e="";if(r.forEach(t=>{e+=`<circle cx="${t.x}" cy="${t.y}" r="5" fill="#38bdf8" />`}),d.forEach(t=>{e+=`<circle cx="${t.x}" cy="${t.y}" r="5" fill="#f59e0b" />`}),l){let t=[...r.map(e=>({...e,cls:"Class A (Blue)"})),...d.map(e=>({...e,cls:"Class B (Amber)"}))];t.sort((e,t)=>Math.hypot(e.x-l.x,e.y-l.y)-Math.hypot(t.x-l.x,t.y-l.y));let a=t.slice(0,o),n=Math.hypot(a[a.length-1].x-l.x,a[a.length-1].y-l.y);e+=`<circle cx="${l.x}" cy="${l.y}" r="${n}" fill="none" stroke="#a78bfa" stroke-dasharray="4" stroke-width="1.5"/>`,a.forEach(t=>{e+=`<line x1="${l.x}" y1="${l.y}" x2="${t.x}" y2="${t.y}" stroke="#a78bfa" stroke-width="1" opacity="0.6"/>`}),e+=`<circle cx="${l.x}" cy="${l.y}" r="6" fill="#ec4899" stroke="#fff" stroke-width="2"/>`;let s=a.filter(e=>e.cls.includes("Class A")).length,c=o-s;i.innerHTML=`Predicted: <span style="color:${s>c?"#38bdf8":"#f59e0b"}">${s>c?"Class A (Blue)":"Class B (Amber)"}</span> (${s} vs ${c} votes)`}a.innerHTML=e};n.addEventListener("input",()=>{s.textContent=String(o=parseInt(n.value)),c()}),a.addEventListener("click",e=>{let t=a.getBoundingClientRect();l={x:(e.clientX-t.left)/t.width*300,y:(e.clientY-t.top)/t.height*180},c()}),c()}_renderKMeansLab(e){let t=document.createElement("div");t.className="mm-studio-card",t.innerHTML=`
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
    `,e.appendChild(t);let a=t.querySelector("#km-svg"),n=t.querySelector("#km-step"),s=t.querySelector("#km-reset"),i=[{x:40,y:40},{x:50,y:60},{x:60,y:35},{x:70,y:65},{x:80,y:50},{x:220,y:120},{x:230,y:140},{x:240,y:110},{x:250,y:135},{x:210,y:130},{x:140,y:90},{x:150,y:110},{x:160,y:85}],o=[{x:50,y:120,color:"#38bdf8"},{x:200,y:50,color:"#f59e0b"}],l=()=>{let e="";i.forEach(t=>{let a=Math.hypot(t.x-o[0].x,t.y-o[0].y)<Math.hypot(t.x-o[1].x,t.y-o[1].y)?o[0].color:o[1].color;e+=`<circle cx="${t.x}" cy="${t.y}" r="4" fill="${a}" opacity="0.8"/>`}),o.forEach(t=>{e+=`
          <line x1="${t.x-6}" y1="${t.y-6}" x2="${t.x+6}" y2="${t.y+6}" stroke="${t.color}" stroke-width="3"/>
          <line x1="${t.x-6}" y1="${t.y+6}" x2="${t.x+6}" y2="${t.y-6}" stroke="${t.color}" stroke-width="3"/>
        `}),a.innerHTML=e};n.addEventListener("click",()=>{let e=i.filter(e=>Math.hypot(e.x-o[0].x,e.y-o[0].y)<=Math.hypot(e.x-o[1].x,e.y-o[1].y)),t=i.filter(e=>Math.hypot(e.x-o[0].x,e.y-o[0].y)>Math.hypot(e.x-o[1].x,e.y-o[1].y));e.length>0&&(o[0].x=e.reduce((e,t)=>e+t.x,0)/e.length,o[0].y=e.reduce((e,t)=>e+t.y,0)/e.length),t.length>0&&(o[1].x=t.reduce((e,t)=>e+t.x,0)/t.length,o[1].y=t.reduce((e,t)=>e+t.y,0)/t.length),l()}),s.addEventListener("click",()=>{o=[{x:50,y:120,color:"#38bdf8"},{x:200,y:50,color:"#f59e0b"}],l()}),l()}_renderPCALab(e){let t=document.createElement("div");t.className="mm-studio-card",t.innerHTML=`
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
    `,e.appendChild(t)}_renderInspectorTab(){let e=document.createDocumentFragment(),t=document.createElement("div");t.className="mm-studio-section",t.innerHTML=`
      <div class="mm-studio-sec-title"><span>⚠️</span> ML Code Inspector & Leakage Checker</div>
      <div class="mm-studio-sec-sub">Scans code for data leakage, invalid scaling order, and ML anti-patterns.</div>
    `;let a=document.createElement("textarea");a.className="mm-inspector-textarea",a.placeholder="Paste or scan Python ML code here...";let n=this._notebooks.activeCell;if(n&&(0,i.isCodeCellModel)(n.model)){let e=n.model.toJSON().source;a.value=Array.isArray(e)?e.join(""):e}let s=document.createElement("div");s.style.cssText="display:flex; gap:8px; margin-top:8px;";let o=document.createElement("button");o.type="button",o.className="mm-studio-btn mm-btn-sm",o.innerHTML="⚡ Fetch Active Cell",o.addEventListener("click",()=>{let e=this._notebooks.activeCell;if(e&&(0,i.isCodeCellModel)(e.model)){let t=e.model.toJSON().source;a.value=Array.isArray(t)?t.join(""):t,this._showToast("Fetched active cell code.")}else this._showToast("Select an active code cell first.")});let l=document.createElement("button");l.type="button",l.className="mm-studio-btn mm-btn-sm mm-btn-primary",l.innerHTML="\uD83D\uDD0D Scan for ML Mistakes",s.append(o,l),t.append(a,s),e.appendChild(t);let r=document.createElement("div");r.className="mm-inspector-results",e.appendChild(r),l.addEventListener("click",async()=>{let e=a.value.trim();if(!e){r.innerHTML='<div class="mm-studio-empty">Enter code to scan.</div>';return}r.innerHTML='<div class="mm-studio-loading">Inspecting AST for ML anti-patterns...</div>';try{let t=await u("api/ai/ml-check",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:e,level:this._prepLevel})});if(r.replaceChildren(),0===t.finding_count){r.innerHTML=`
            <div class="mm-studio-alert mm-alert-info">
              ✅ <b>Clean Code:</b> No data leakage or critical ML methodology flaws detected!
            </div>
          `;return}let a=document.createElement("div");a.style.cssText="font-weight:700; font-size:12px; margin-bottom:8px; color:#f87171;",a.textContent=`Found ${t.finding_count} potential ML mistake(s):`,r.appendChild(a),t.findings.forEach(e=>{let t=document.createElement("div");t.className="mm-studio-card mm-mistake-card";let a="high"===e.severity?"#ef4444":"#f59e0b",n=e.message||e.what_happened||"",s=e.explanation||e.why_it_matters||e.recommendation||"",i=e.suggested_fix||e.code_example||"";if(t.innerHTML=`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-weight:700; font-size:12px; color:${a};">${e.title}</span>
              <span class="mm-studio-badge" style="background:${a}22; color:${a}; border:1px solid ${a}44;">
                ${e.severity.toUpperCase()}
              </span>
            </div>
            ${e.line_number?`<div style="font-size:10px; opacity:.6; margin-bottom:4px;">Line: ${e.line_number}</div>`:""}
            <div style="font-size:11px; margin-bottom:6px;">${n}</div>
            ${s?`<div style="font-size:11px; opacity:.85; background:rgba(0,0,0,0.25); padding:6px 8px; border-radius:6px; font-family:monospace; margin-bottom:8px; line-height:1.4;">${s}</div>`:""}
          `,i){let e=document.createElement("button");e.type="button",e.className="mm-studio-btn mm-btn-sm mm-btn-primary",e.textContent="\uD83D\uDCE5 Insert Fixed Code",e.addEventListener("click",()=>{this._insertCodeBelow(i),this._showToast("Inserted corrected code into notebook!")}),t.appendChild(e)}r.appendChild(t)})}catch(e){r.innerHTML=`<div class="mm-studio-alert mm-alert-error">${e instanceof Error?e.message:"Check failed."}</div>`}}),this._contentArea.appendChild(e)}_renderGuideTab(){let e=document.createDocumentFragment(),t=document.createElement("div");t.className="mm-studio-section",t.innerHTML=`
      <div class="mm-studio-sec-title"><span>📖</span> Preprocessing & ML Handbook</div>
      <div class="mm-studio-sec-sub">Essential guides and best practices for robust data preparation.</div>
    `,e.appendChild(t);let a=document.createElement("section");a.className="mm-studio-card",a.setAttribute("aria-labelledby","mm-guide-install-title");let n=document.createElement("div");n.id="mm-guide-install-title",n.className="mm-studio-sec-title",n.textContent="\uD83D\uDCE6 Install ML Libraries";let s=document.createElement("div");s.className="mm-studio-sec-sub",s.style.marginTop="0",s.textContent="Copy this single command into a notebook code cell and run it to install the libraries in the active notebook kernel. Internet access is required; installation may take a while.";let i="%pip install numpy pandas scipy scikit-learn xgboost lightgbm catboost imbalanced-learn statsmodels joblib matplotlib seaborn plotly shap optuna",o=document.createElement("pre");o.style.cssText="background:#f8fafc;border:1px solid #dfe3ea;border-radius:8px;padding:10px 12px;margin:0;overflow-x:auto;white-space:pre;font:11px/1.6 ui-monospace,SFMono-Regular,monospace;color:#1e293b;",o.textContent=i;let l=document.createElement("button");l.type="button",l.className="mm-studio-btn mm-btn-sm mm-btn-primary",l.textContent="\uD83D\uDCCB Copy install command",l.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(i),l.textContent="Copied!",this._showToast("✓ Install command copied. Paste it into a notebook cell."),window.setTimeout(()=>{l.textContent="\uD83D\uDCCB Copy install command"},1800)}catch(e){this._showToast("Could not access the clipboard. Select and copy the command above.")}});let r=document.createElement("div");r.style.cssText="display:flex;gap:8px;flex-wrap:wrap;",r.appendChild(l);let d=document.createElement("button");d.type="button",d.className="mm-studio-btn mm-btn-sm",d.textContent="\uD83D\uDCE5 Insert into notebook",d.addEventListener("click",()=>{let e=this._insertCodeBelow(i);this._showToast(e?"✓ Install command inserted below the active cell. Run that cell to install the libraries.":"Open a notebook and select a cell before inserting the install command.")}),r.appendChild(d),a.append(n,s,o,r),e.appendChild(a),[{title:"1. Handling Missing Data (Imputation)",emoji:"\uD83E\uDE79",content:`
          • <b>MCAR (Missing Completely at Random):</b> Safe to drop if < 5% or use Mean/Median.<br/>
          • <b>MAR (Missing at Random):</b> Impute using KNN or IterativeImputer conditioned on other features.<br/>
          • <b>MNAR (Missing Not at Random):</b> Create a missingness indicator column before imputing.<br/>
          • <b>Rule of Thumb:</b> Use Median over Mean when data is skewed or contains outliers.
        `},{title:"2. Categorical Encoding Guide",emoji:"\uD83C\uDFF7️",content:`
          • <b>One-Hot Encoding:</b> Best for nominal data with low cardinality (< 10 unique values). Always set <code>handle_unknown='ignore'</code> for test data!<br/>
          • <b>Ordinal Encoding:</b> Use only when natural ranking exists (e.g. Low, Medium, High).<br/>
          • <b>Target / Frequency Encoding:</b> Best for high-cardinality features. Always compute inside CV loops to avoid leakage!
        `},{title:"3. Feature Scaling & Normalization",emoji:"⚖️",content:`
          • <b>StandardScaler:</b> Transforms features to mean=0, std=1. Essential for Logistic Regression, SVM, KNN, Neural Networks.<br/>
          • <b>RobustScaler:</b> Uses median and IQR. Best when features have extreme outliers.<br/>
          • <b>MinMaxScaler:</b> Bounds features strictly to [0, 1]. Best for image pixels or neural activations.<br/>
          • <b>Tree Models:</b> Random Forest and XGBoost do NOT require feature scaling.
        `},{title:"4. Outlier Detection & Treatment",emoji:"\uD83C\uDFAF",content:`
          • <b>IQR Rule:</b> Points outside [Q1 - 1.5\xd7IQR, Q3 + 1.5\xd7IQR] are potential outliers.<br/>
          • <b>Capping / Winsorization:</b> Clip values to 1st and 99th percentiles rather than deleting rows to preserve sample size.
        `},{title:"5. Preventing Data Leakage Checklist",emoji:"\uD83D\uDEE1️",content:`
          • Always call <code>train_test_split</code> BEFORE fitting any Scaler or Imputer!<br/>
          • Fit transformers on training data only (<code>fit_transform</code>), then only <code>transform</code> the test data.<br/>
          • Never include the target variable in feature matrices.
        `}].forEach(t=>{let a=document.createElement("div");a.className="mm-studio-card mm-guide-card",a.innerHTML=`
        <div class="mm-guide-hdr">
          <span>${t.emoji} ${t.title}</span>
        </div>
        <div class="mm-guide-body">${t.content}</div>
      `,e.appendChild(a)}),this._contentArea.appendChild(e)}_insertPreprocessingCode(e){let t=this._notebooks.currentWidget;return(null==t?void 0:t.content)?this._insertCodeBelow(e):(this._showToast("Open a notebook first."),!1)}_insertCodeBelow(e){let t=this._notebooks.currentWidget;if(!t)return!1;let a=t.content;if(!(null==a?void 0:a.model))return!1;let n=a.activeCell?a.activeCellIndex+1:a.model.cells.length;return a.model.sharedModel.insertCell(n,{cell_type:"code",source:e,metadata:{trusted:!0}}),a.activeCellIndex=n,!0}_createStatCard(e,t,a="default"){let n=document.createElement("div");n.className="mm-stat-box";let s=document.createElement("div");s.className="mm-stat-val","warn"===a&&(s.style.color="#f87171"),"ok"===a&&(s.style.color="#34d399"),s.textContent=String(t);let i=document.createElement("div");return i.className="mm-stat-lbl",i.textContent=e,n.append(s,i),n}_showToast(e){let t=document.createElement("div");t.className="mm-studio-toast",t.textContent=e,this._root.appendChild(t),setTimeout(()=>{t.classList.add("fade-out"),setTimeout(()=>t.remove(),400)},2200)}}let v=null,x=null,y=!1,C="basic",_=null,w=null;function k(){if(document.getElementById("mm-tutor-styles"))return;let e=document.createElement("style");e.id="mm-tutor-styles",e.textContent=`
    /* ── Overlay ── */
    #mm-tutor-overlay {
      position: fixed; inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(2px);
      z-index: 9998;
      opacity: 0; transition: opacity .25s ease;
      pointer-events: none; display: none;
    }
    #mm-tutor-overlay.open { opacity: 1; pointer-events: auto; display: block; }

    /* ── Panel — Unified with ModelMind AI Assistant ── */
    #mm-tutor-panel {
      position: fixed; right: 0; bottom: 0; top: 0; width: 420px; max-width: 96vw;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      border-left: 1px solid var(--ml-assistant-border, #dfe3ea);
      z-index: 9999; overflow-y: auto; transform: translateX(100%);
      transition: transform .28s cubic-bezier(.4, 0, .2, 1);
      display: flex; flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--ml-assistant-text, #253041);
      box-shadow: -6px 0 24px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.12));
    }
    #mm-tutor-panel.open { transform: translateX(0); }

    /* ── Header ── */
    #mm-tutor-header {
      padding: 14px 16px 12px;
      border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: #ffffff;
      position: sticky; top: 0; z-index: 2;
      display: flex; flex-direction: column; gap: 4px;
    }
    .mm-tutor-header-top {
      display: flex; align-items: center; justify-content: space-between;
    }
    #mm-tutor-header h2 {
      margin: 0; font-size: 15px; font-weight: 700;
      color: var(--ml-assistant-text, #253041);
      display: flex; align-items: center; gap: 8px;
    }
    #mm-tutor-header .sub {
      font-size: 11px;
      color: var(--ml-assistant-muted, #5d6b80);
      font-weight: 500;
    }
    #mm-tutor-close {
      background: transparent;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      color: var(--ml-assistant-muted, #5d6b80);
      cursor: pointer; font-size: 16px; line-height: 1;
      padding: 4px 8px; border-radius: 6px;
      transition: all .15s ease;
    }
    #mm-tutor-close:hover {
      background: #f1f5f9;
      color: var(--ml-assistant-text, #253041);
      border-color: #cbd5e1;
    }

    /* ── Body ── */
    #mm-tutor-body, .mm-tutor-embedded-body {
      padding: 14px 16px; flex: 1;
      display: flex; flex-direction: column; gap: 10px;
    }

    /* ── Level Switcher Tabs (Basic / Medium / Advanced) ── */
    .mm-tutor-level-row {
      display: flex; gap: 6px;
      padding: 3px; background: #eaecf1;
      border-radius: 8px; margin-bottom: 6px;
    }
    .mm-tutor-level-btn {
      flex: 1; font-size: 12px; font-weight: 600; padding: 6px 10px;
      border-radius: 6px; cursor: pointer; text-align: center;
      border: none; background: transparent;
      color: var(--ml-assistant-muted, #5d6b80);
      transition: all .15s ease;
    }
    .mm-tutor-level-btn:hover {
      color: var(--ml-assistant-text, #253041);
    }
    .mm-tutor-level-btn.active {
      background: #ffffff;
      color: var(--ml-assistant-accent, #6d7cff);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      font-weight: 700;
    }

    /* ── Error Banner ── */
    .mm-tutor-error-banner {
      background: var(--ml-assistant-error-bg, #f7dfe3);
      border: 1px solid rgba(163, 61, 77, 0.25);
      border-radius: 8px;
      padding: 12px 14px;
    }
    .mm-tutor-error-banner .banner-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 700;
      color: var(--ml-assistant-error-text, #a33d4d);
      margin-bottom: 3px;
    }
    .mm-tutor-error-banner .banner-type {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px; font-weight: 700;
      color: #991b1b;
    }
    .mm-tutor-error-banner .banner-msg {
      font-size: 12px; color: #7f1d1d; margin-top: 4px; line-height: 1.4;
      word-break: break-word;
    }
    .mm-tutor-error-banner .banner-line {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px; color: #b91c1c; margin-top: 6px;
      padding: 4px 8px; background: rgba(255,255,255,0.6);
      border-radius: 4px; overflow-x: auto;
    }

    /* ── Local Engine / Coverage Pill ── */
    .mm-tutor-coverage {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--ml-assistant-success-bg, #dff5eb);
      color: var(--ml-assistant-success-text, #1d7b54);
      border: 1px solid rgba(29, 123, 84, 0.2);
      border-radius: 6px; padding: 6px 10px;
      font-size: 11px; font-weight: 600;
    }
    .mm-tutor-coverage.mm-tutor-low-conf {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid rgba(180, 83, 9, 0.3);
    }
    .mm-tutor-withheld-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px; padding: 12px 14px;
      margin: 2px 0 6px;
    }
    .mm-tutor-withheld-box .withheld-title {
      font-size: 12px; font-weight: 700; color: #92400e;
      margin-bottom: 4px; display: flex; align-items: center; gap: 6px;
    }
    .mm-tutor-withheld-box .withheld-desc {
      font-size: 11.5px; color: #78350f; line-height: 1.5;
    }
    .mm-tutor-ask-ai-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; margin-top: 10px; padding: 9px 14px;
      background: var(--ml-assistant-accent, #6d7cff);
      color: #ffffff; border: none; border-radius: 6px;
      font-size: 12px; font-weight: 700; cursor: pointer;
      transition: all .15s ease;
      box-shadow: 0 2px 8px rgba(109, 124, 255, 0.35);
    }
    .mm-tutor-ask-ai-btn:hover {
      background: #5865f2;
      box-shadow: 0 4px 14px rgba(109, 124, 255, 0.5);
      transform: translateY(-1px);
    }

    /* ── Contextual Smart Hints ── */
    .mm-tutor-hint {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border: 1px solid rgba(109, 124, 255, 0.3);
      border-radius: 8px; padding: 10px 12px;
      font-size: 12px; color: #3730a3; line-height: 1.45;
    }

    /* ── Content Card (What / Why / How to fix) ── */
    .mm-tutor-section {
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 8px; padding: 12px 14px;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.04));
    }
    .mm-tutor-section-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.6px;
      color: var(--ml-assistant-muted, #5d6b80);
      margin-bottom: 6px; text-transform: uppercase;
    }
    .mm-tutor-section-content {
      font-size: 12.5px; color: var(--ml-assistant-text, #253041);
      line-height: 1.55;
    }

    /* ── Numbered Steps ── */
    .mm-tutor-step {
      display: flex; gap: 8px; margin-bottom: 6px;
      font-size: 12px; line-height: 1.5;
      color: var(--ml-assistant-text, #253041);
    }
    .mm-tutor-step-num {
      width: 18px; height: 18px; border-radius: 50%;
      background: var(--ml-assistant-accent-soft, #eef1ff);
      color: var(--ml-assistant-accent, #6d7cff);
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      margin-top: 1px; flex-shrink: 0;
    }

    /* ── Code Tip Block ── */
    .mm-tutor-code-wrap {
      position: relative; margin-top: 6px;
    }
    .mm-tutor-code-tip {
      background: #0f172a; border: 1px solid #1e293b;
      border-radius: 8px; padding: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11.5px; line-height: 1.6; color: #e2e8f0;
      overflow-x: auto; white-space: pre;
    }
    .mm-tutor-copy-btn {
      position: absolute; top: 8px; right: 8px;
      font-size: 10px; font-weight: 600; padding: 4px 9px;
      border-radius: 5px; cursor: pointer;
      background: #334155; border: 1px solid #475569; color: #f8fafc;
      transition: all .12s ease;
    }
    .mm-tutor-copy-btn:hover { background: #475569; }

    /* ── Empty State & Quick Presets ── */
    .mm-tutor-empty {
      background: #ffffff;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 8px; padding: 20px 16px; text-align: center;
    }
    .mm-tutor-empty h3 {
      margin: 8px 0 4px; font-size: 14px; font-weight: 700;
      color: var(--ml-assistant-text, #253041);
    }
    .mm-tutor-empty p {
      margin: 0 0 14px; font-size: 12px;
      color: var(--ml-assistant-muted, #5d6b80);
      line-height: 1.5;
    }
    .mm-tutor-preset-list {
      display: flex; flex-direction: column; gap: 6px;
      text-align: left; margin-top: 12px;
    }
    .mm-tutor-preset-btn {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 6px; padding: 8px 10px;
      font-size: 11.5px; font-weight: 600;
      color: var(--ml-assistant-text, #253041);
      cursor: pointer; transition: all .15s ease;
    }
    .mm-tutor-preset-btn:hover {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border-color: rgba(109, 124, 255, 0.35);
      color: var(--ml-assistant-accent, #6d7cff);
    }

    /* ── FAB button ── */
    #mm-tutor-fab {
      position: fixed; right: 20px; bottom: 20px; z-index: 9997;
      width: 48px; height: 48px; border-radius: 50%; border: none; cursor: pointer;
      background: linear-gradient(135deg, #6d7cff 0%, #4f46e5 100%);
      color: #fff; font-size: 20px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(109, 124, 255, 0.4);
      transition: transform .15s, box-shadow .15s;
    }
    #mm-tutor-fab:hover { transform: scale(1.08); box-shadow: 0 6px 22px rgba(109, 124, 255, 0.6); }
    #mm-tutor-fab .badge {
      position: absolute; top: -2px; right: -2px; width: 15px; height: 15px;
      border-radius: 50%; background: #ef4444; font-size: 9px; font-weight: 800;
      display: none; align-items: center; justify-content: center; color: #fff;
    }
    #mm-tutor-fab .badge.show { display: flex; }
  `,document.head.appendChild(e)}function E(){var e,t;if(k(),x||((x=document.createElement("div")).id="mm-tutor-overlay",x.addEventListener("click",$),document.body.appendChild(x)),!v){let a;(v=document.createElement("div")).id="mm-tutor-panel",v.setAttribute("role","dialog"),v.setAttribute("aria-label","AI Debugger Tutor");let n=document.createElement("div");n.id="mm-tutor-header",n.innerHTML=`
      <div class="mm-tutor-header-top">
        <h2>🎓 AI Debugger Tutor</h2>
        <button id="mm-tutor-close" aria-label="Close tutor panel">✕</button>
      </div>
      <div class="sub">100% Offline \xb7 No AI required \xb7 ~80% ML Error Coverage</div>
    `,null==(e=n.querySelector("#mm-tutor-close"))||e.addEventListener("click",$),v.appendChild(n);let s=document.createElement("div");s.id="mm-tutor-body",(t=s).replaceChildren(),(a=document.createElement("div")).className="mm-tutor-empty",a.innerHTML=`
    <div style="font-size:32px">🎓</div>
    <h3>AI Debugger Tutor Ready</h3>
    <p>Run any failing notebook cell, and the Tutor will instantly explain what happened with <strong>Basic</strong>, <strong>Medium</strong>, and <strong>Advanced</strong> fixes — 100% offline.</p>
    <div class="mm-tutor-coverage">🔒 Local Engine \xb7 Zero API Latency \xb7 ~80% ML Coverage</div>
    <div class="mm-tutor-preset-list">
      <div style="font-size:11px;font-weight:700;color:#5d6b80;text-transform:uppercase;margin-bottom:2px">Try Example Scenarios:</div>
      <button type="button" class="mm-tutor-preset-btn" data-type="ValueError" data-msg="Input X contains NaN.">
        <span>⚡ NaN in Model Fit (ValueError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
      <button type="button" class="mm-tutor-preset-btn" data-type="KeyError" data-msg="KeyError: 'target'">
        <span>⚡ Missing Column 'target' (KeyError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
      <button type="button" class="mm-tutor-preset-btn" data-type="NameError" data-msg="name 'X_train' is not defined">
        <span>⚡ Undefined 'X_train' (NameError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
      <button type="button" class="mm-tutor-preset-btn" data-type="ValueError" data-msg="Found input variables with inconsistent numbers of samples: [100, 80]">
        <span>⚡ Shape Mismatch [100, 80] (ValueError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
    </div>
  `,a.querySelectorAll(".mm-tutor-preset-btn").forEach(e=>{e.addEventListener("click",()=>{let t=e.getAttribute("data-type")||"ValueError",a=e.getAttribute("data-msg")||"Error";w&&N({error_type:t,error_message:a,traceback:`${t}: ${a}`,code:"model.fit(X_train, y_train)"},w,!0)})}),t.appendChild(a),v.appendChild(s),document.body.appendChild(v)}}function T(){v||E(),v.classList.add("open"),null==x||x.classList.add("open"),y=!0}function $(){null==v||v.classList.remove("open"),null==x||x.classList.remove("open"),y=!1}function M(){y?$():T()}async function N(e,t,a=!1){_=e,w=t,k(),v||E(),a&&T();let n=v.querySelector("#mm-tutor-body");if(n){n.replaceChildren();let e=document.createElement("div");e.style.textAlign="center",e.style.padding="30px 16px",e.style.color="#5d6b80",e.innerHTML='<div style="font-size:28px;margin-bottom:8px">⏳</div>Analysing with Local ML Engine…',n.appendChild(e)}try{var s;let a,i=await u("api/ai/tutor",t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({error_type:e.error_type,error_message:e.error_message,traceback:e.traceback,code:e.code,level:C})});n&&function(e,t){var a,n,s,i,o,l,r,d;if(e.replaceChildren(),!t.handled){let n=document.createElement("div");n.className="mm-tutor-empty",n.innerHTML=`
      <div style="font-size:28px">🤔</div>
      <h3>Error Not Diagnosed</h3>
      <p>${null!=(a=t.error_message)?a:"Could not automatically analyse this error offline."}</p>
    `,e.appendChild(n);return}let c=document.createElement("div");c.className="mm-tutor-level-row",["basic","medium","advanced"].forEach(e=>{let t=document.createElement("button");t.type="button",t.className=`mm-tutor-level-btn${e===C?" active":""}`,t.textContent=({basic:"\uD83D\uDC23 Basic Fix",medium:"⚡ Medium (M02)",advanced:"\uD83D\uDE80 Pipeline (Adv)"})[e],t.addEventListener("click",()=>{C=e,_&&w&&N(_,w,!0)}),c.appendChild(t)}),e.appendChild(c);let m=document.createElement("div");m.className="mm-tutor-error-banner",m.innerHTML=`
    <div class="banner-title">
      <span style="font-size:16px">${null!=(n=t.icon)?n:"\uD83D\uDC1B"}</span>
      <span>${null!=(s=t.title)?s:"Runtime Error"}</span>
    </div>
    <div class="banner-type">${null!=(i=t.error_type)?i:""}</div>
    ${t.error_message?`<div class="banner-msg">${t.error_message}</div>`:""}
    ${t.failing_line?`<div class="banner-line">→ ${t.failing_line}</div>`:""}
  `,e.appendChild(m);let p=!0===t.can_suggest_code&&(null!=(o=t.confidence)?o:0)>=70,u=document.createElement("div");if(u.className=p?"mm-tutor-coverage":"mm-tutor-coverage mm-tutor-low-conf",u.innerHTML=p?`🟢 <strong>Confidence: ${null!=(l=t.confidence)?l:85}%</strong> (≥70% High) \xb7 Level: <strong>${C.toUpperCase()}</strong>`:`⚠️ <strong>Confidence: ${null!=(r=t.confidence)?r:45}%</strong> (<70% Threshold) \xb7 Fix Code Withheld`,e.appendChild(u),!p){let a=document.createElement("div");a.className="mm-tutor-withheld-box",a.innerHTML=`
      <div class="withheld-title">🛡️ Code Fix Withheld (Confidence &lt; 70%)</div>
      <div class="withheld-desc">
        ${null!=(d=t.confidence_reason)?d:"The exact root cause cannot be verified with ≥70% confidence. Automatic code generation is disabled to prevent recommending incorrect code. Follow the diagnostic steps below or ask the AI Assistant."}
      </div>
      <button type="button" class="mm-tutor-ask-ai-btn">
        <span>🤖</span>
        <span>Ask AI Assistant for Full Diagnosis</span>
        <span>→</span>
      </button>
    `;let n=a.querySelector(".mm-tutor-ask-ai-btn");null==n||n.addEventListener("click",()=>{$(),window.dispatchEvent(new CustomEvent("modelmind:open-ai-assistant",{detail:{mode:"explain",error:_}}))}),e.appendChild(a)}if(t.smart_hints&&t.smart_hints.length>0&&t.smart_hints.forEach(t=>{let a=document.createElement("div");a.className="mm-tutor-hint",a.textContent=t,e.appendChild(a)}),t.what){let a=document.createElement("div");a.className="mm-tutor-section",a.innerHTML=`
      <div class="mm-tutor-section-label">What Happened</div>
      <div class="mm-tutor-section-content">${t.what}</div>
    `,e.appendChild(a)}if(t.why){let a=document.createElement("div");a.className="mm-tutor-section",a.innerHTML=`
      <div class="mm-tutor-section-label">Why This Happened</div>
      <div class="mm-tutor-section-content">${t.why}</div>
    `,e.appendChild(a)}if(t.steps&&t.steps.length>0){let a=document.createElement("div");a.className="mm-tutor-section",a.innerHTML=`<div class="mm-tutor-section-label">${p?`How To Fix It (${C.toUpperCase()})`:"Diagnostic Steps"}</div>`,t.steps.forEach((e,t)=>{let n=document.createElement("div");n.className="mm-tutor-step",n.innerHTML=`<div class="mm-tutor-step-num">${t+1}</div><div>${e}</div>`,a.appendChild(n)}),e.appendChild(a)}if(p&&t.code_tip){let a=document.createElement("div");a.className="mm-tutor-section",a.innerHTML=`<div class="mm-tutor-section-label">Recommended Code Fix (${C.toUpperCase()})</div>`;let n=document.createElement("div");n.className="mm-tutor-code-wrap";let s=document.createElement("div");s.className="mm-tutor-code-tip",s.textContent=t.code_tip;let i=document.createElement("button");i.type="button",i.className="mm-tutor-copy-btn",i.textContent="Copy Code",i.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(t.code_tip),i.textContent="Copied!"}catch(e){i.textContent="Copied!"}setTimeout(()=>{i.textContent="Copy Code"},1800)}),n.append(s,i),a.appendChild(n),e.appendChild(a)}if(t.note){let a=document.createElement("div");a.style.fontSize="11px",a.style.color="#94a3b8",a.style.padding="4px 2px",a.textContent=t.note,e.appendChild(a)}}(n,i),a=null==(s=document.getElementById("mm-tutor-fab"))?void 0:s.querySelector(".badge"),null==a||a.classList.add("show")}catch(e){if(n){n.replaceChildren();let t=document.createElement("div");t.className="mm-tutor-empty",t.innerHTML=`<div style="font-size:24px;margin-bottom:8px">⚠️</div><div style="color:#ef4444">${e instanceof Error?e.message:"Tutor unavailable."}</div>`,n.appendChild(t)}}}async function L(e,t){return u("api/ai/chat",e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})}let S="@ml-platform/error-assistant:open";function A(e){var t,a,n;return null!=(n=null!=(t=e.activeCell)?t:null==(a=e.currentWidget)?void 0:a.content.activeCell)?n:null}function z(e){let t;if(!e||!(0,i.isCodeCellModel)(e.model))return null;for(let a of e.model.outputs.toJSON().reverse())if(P(a)){t=a;break}if(!t)return null;let a=e.model.toJSON().source,n=Array.isArray(a)?a.join(""):a;return{cell_id:e.model.id.slice(0,256),code:n.slice(0,2e4),error_type:t.ename.slice(0,200),error_message:t.evalue.slice(0,2e3),traceback:t.traceback.join("\n").slice(0,12e3)}}function H(e,t){let a=e.content.widgets,n=a.indexOf(t);return n<0?"":a.slice(Math.max(0,n-1),n+2).filter(e=>e!==t&&(0,i.isCodeCellModel)(e.model)).map(e=>{let t=e.model.toJSON().source;return Array.isArray(t)?t.join(""):t}).join("\n").slice(0,12e3)}function P(e){return"error"===e.output_type&&"ename"in e&&"string"==typeof e.ename&&"evalue"in e&&"string"==typeof e.evalue&&"traceback"in e&&Array.isArray(e.traceback)&&e.traceback.every(e=>"string"==typeof e)}function I(e,t){let a=document.createElement("div");return a.className=`ml-assistant-status-pill ml-assistant-status-${t}`,a.textContent=e,a}function O(e,t,a,n=!1){e.replaceChildren();let s=document.createElement("div");s.className="ml-assistant-result-header";let i=document.createElement("div");i.className="ml-assistant-error-banner";let o=document.createElement("span");o.className="ml-assistant-error-icon",o.setAttribute("aria-hidden","true"),o.textContent="!";let l=document.createElement("div");l.className="ml-assistant-error-copy";let r=document.createElement("div");r.className="ml-assistant-error-title",r.textContent=t.errorType;let d=document.createElement("div");d.className="ml-assistant-error-message",d.textContent=t.errorMessage,l.append(r,d),i.append(o,l);let c=document.createElement("div");c.className="ml-assistant-traceback";let m=document.createElement("details"),p=document.createElement("summary");p.textContent="View traceback";let u=document.createElement("pre");u.textContent=t.traceback,m.append(p,u),c.append(m);let b=document.createElement("div");b.className="ml-assistant-card ml-assistant-card-blue";let f=document.createElement("div");f.className="ml-assistant-card-title",f.textContent="Explanation";let h=document.createElement("p");h.textContent=t.summary;let g=document.createElement("ul");t.details.forEach(e=>{let t=document.createElement("li");t.textContent=e,g.appendChild(t)}),b.append(f,h,g);let v=document.createElement("div");v.className="ml-assistant-card ml-assistant-card-green";let x=document.createElement("div");x.className="ml-assistant-card-title",x.textContent="Possible solution";let y=document.createElement("p");y.textContent=t.fix;let C=document.createElement("div");C.className="ml-assistant-code-block",C.textContent="Generate a suggestion to see corrected code here.";let _=null;v.append(x,y,C);let w=document.createElement("div");w.className="ml-assistant-actions";let k=document.createElement("button");k.type="button",k.textContent="Suggest Fix",k.disabled=!a;let E=document.createElement("button");E.type="button",E.textContent="Apply Fix",E.disabled=!a;let T=document.createElement("button");T.type="button",T.textContent="Copy Code",T.className="ml-assistant-secondary-button";let $=async()=>{if(!a)throw Error("No fix action is available");if(_)return _;k.disabled=!0,E.disabled=!0,k.textContent="Generating...";try{return _=await a.suggestFix(),y.textContent="gemini"===_.provider?`Gemini suggestion: ${_.summary}`:_.summary,C.textContent=_.candidate_code,T.disabled=!1,_}finally{k.textContent="Suggest Fix",k.disabled=!1,E.disabled=!1}};k.addEventListener("click",async()=>{k.disabled=!0,k.textContent="Generating...";try{await $()}catch(e){y.textContent=e instanceof Error?e.message:"Could not generate a fix"}finally{k.disabled=!1,k.textContent="Suggest Fix"}}),E.addEventListener("click",async()=>{if(a){E.disabled=!0,k.disabled=!0,E.textContent=_?"Applying...":"Generating...";try{let e=await $();await a.applyFix(e),E.textContent="Fixed and ran"}catch(e){E.textContent=e instanceof Error?e.message:"Could not apply fix"}finally{k.disabled=!1}window.setTimeout(()=>{E.textContent="Apply Fix",E.disabled=!1},2500)}}),T.addEventListener("click",async()=>{if(_){try{await navigator.clipboard.writeText(_.candidate_code),T.textContent="Copied"}catch(e){T.textContent="Copy failed"}window.setTimeout(()=>{T.textContent="Copy Code"},1200)}}),T.disabled=!0,k.classList.add("ml-assistant-action-wide"),w.append(k,E,T),s.append(i,c),e.append(s,b,v,w),n&&a&&k.click()}document.querySelectorAll('link[rel~="icon"]').forEach(e=>{e.remove()}),(n=document.createElement("link")).rel="icon",n.type="image/png",n.setAttribute("sizes","256x256"),n.href=c,document.head.appendChild(n),(s=document.createElement("style")).id="modelmind-splash-branding",s.textContent=`
    #jupyterlab-splash #moon1,
    #jupyterlab-splash #moon2,
    #jupyterlab-splash #moon3 {
      display: none !important;
      animation: none !important;
    }
  `,document.head.appendChild(s);let F={id:"@ml-platform/error-assistant:plugin",description:"JupyterLab error assistant frontend and server extension",autoStart:!0,requires:[o.IMainMenu,l.INotebookTracker,r.ITranslator],activate:(e,t,a,n)=>{let s,o,r,c,m,p=n.load("@ml-platform/error-assistant"),b=new d.Widget;b.id="ml-platform-error-assistant-panel",b.title.label="Error Assistant",b.title.caption="Notebook error assistant",b.addClass("ml-platform-error-assistant-panel");let f=document.createElement("div");f.className="ml-assistant-shell";let h=document.createElement("div");h.className="ml-assistant-header";let x=document.createElement("h2");x.textContent="AI Assistant";let y=document.createElement("div");y.className="ml-assistant-header-controls";let C=document.createElement("button");C.type="button",C.className="ml-assistant-primary-button",C.textContent="Install Ollama",C.disabled=!0;let _=document.createElement("label");_.className="ml-assistant-cloud-option",_.title="When enabled, the failed cell, traceback, and nearby code may be sent to Google Gemini, either directly or as a fallback.";let T=document.createElement("input");T.type="checkbox",T.disabled=!0;let $=document.createElement("span");$.textContent="Allow Gemini use",_.append(T,$);let F=document.createElement("div");F.className="ml-assistant-status-row";let j=I("Ollama (Local AI)","success"),D=I("Cloud disabled","default"),R=document.createElement("label");R.className="ml-assistant-provider-row",R.textContent="Fix provider";let q=document.createElement("select");q.className="ml-assistant-provider-select";let B=document.createElement("option");B.value="ollama",B.textContent="Ollama (local)";let G=document.createElement("option");G.value="gemini",G.textContent="Gemini (cloud)",q.append(B,G),R.appendChild(q);let J=document.createElement("div");J.className="ml-assistant-tab-row";let U=new Map;["Explain Error","Suggest Fix","Code Help","Ask AI"].forEach((e,t)=>{let a=document.createElement("button");a.type="button",a.className=`ml-assistant-tab ${0===t?"active":""}`,a.textContent=e,J.appendChild(a),U.set(e,a)});let V=null,W=document.createElement("div");W.className="ml-assistant-cta-row";let K=document.createElement("button");K.type="button",K.className="ml-assistant-cta-button",K.textContent="Analyze Error",W.appendChild(K);let X=document.createElement("div");X.className="ml-assistant-content";let Q="explain",Y=!1;X.appendChild(((m=document.createElement("div")).className="ml-assistant-empty",m.textContent="Select a failed code cell to capture its error.",m)),h.append(x,y),y.append(C,_),F.append(j,D),f.append(h,F,R,J,W,X),b.node.append(f);let Z=async()=>{try{let t=await u("api/health",e.serviceManager.serverSettings);j.textContent="ok"===t.status?"Ollama (Local AI)":"Platform unavailable",j.className="ok"===t.status?"ml-assistant-status-pill ml-assistant-status-success":"ml-assistant-status-pill ml-assistant-status-warn",T.disabled=!t.gemini_fallback_available,G.disabled=!t.gemini_fallback_available,G.disabled&&"gemini"===q.value&&(q.value="ollama"),D.textContent=t.gemini_fallback_available?"Gemini available (opt-in)":"enabled"===t.cloud_fallback?"Gemini API key missing":"Cloud disabled by server",D.className=t.gemini_fallback_available?"ml-assistant-status-pill ml-assistant-status-success":"ml-assistant-status-pill ml-assistant-status-default"}catch(e){j.textContent="Platform unavailable",j.className="ml-assistant-status-pill ml-assistant-status-warn",T.disabled=!0,D.textContent="Cloud status unavailable",D.className="ml-assistant-status-pill ml-assistant-status-warn"}try{let t=await u("api/local-ai/status",e.serviceManager.serverSettings);"connected"===t.status&&"available"===t.model_status?(Y=!0,j.textContent="Ollama (Local AI)",j.className="ml-assistant-status-pill ml-assistant-status-success",C.textContent="Model ready",C.disabled=!0):("connected"===t.status?(Y=!0,j.textContent="Model missing",j.className="ml-assistant-status-pill ml-assistant-status-warn",C.textContent="Install recommended model"):(Y=!1,j.textContent="Ollama not detected",j.className="ml-assistant-status-pill ml-assistant-status-warn",C.textContent="Get Ollama"),C.disabled=!1)}catch(e){Y=!1,j.textContent="Local AI unavailable",j.className="ml-assistant-status-pill ml-assistant-status-warn",C.textContent="Get Ollama",C.disabled=!1}};K.addEventListener("click",async()=>{let t=A(a),n=a.currentWidget,s=z(t);if(!s)return void O(X,{errorType:"No error detected",errorMessage:"The active code cell has no error output.",traceback:"No traceback available.",summary:"Select a cell that produced an actual runtime error.",details:["The selected cell is not currently failing."],fix:'print("Select a failing cell and retry.")'});X.innerHTML="",K.disabled=!0;let o=document.createElement("div");o.className="ml-assistant-empty",o.textContent="Capturing error...",X.appendChild(o),s&&(V=s,N({error_type:s.error_type,error_message:s.error_message,traceback:s.traceback,code:s.code},e.serviceManager.serverSettings));try{let a=await u("api/error/analyze",e.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if("analyzed"!==a.status)throw Error("analysis unavailable");let o=a.analysis.summary,r=a.analysis.details,d=async()=>{if(!t||!n)throw Error("Select a notebook cell first");let a=await u("api/ai/fix",e.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({error:s,notebook_context:H(n,t),provider:q.value,allow_gemini_fallback:T.checked})});if("suggested"!==a.status||!a.candidate_code)throw Error(a.message||("gemini_disabled"===a.status?"Gemini fallback is disabled by server policy":"gemini_opt_in_required"===a.status?"Check Allow Gemini use before selecting Gemini":"gemini_unconfigured"===a.status?"Save a Gemini API key in JupyterLab using the API Key tab in the right sidebar":"gemini_unavailable"===a.status?"Gemini is temporarily unavailable; try again later":"model_missing"===a.status?`Install ${a.model_id||"the local Ollama model"} first`:"incomplete_model_response"===a.status||"incomplete_gemini_response"===a.status?"The AI returned only part of the cell. Nothing was applied; try again or enable Gemini fallback.":"Neither local Ollama nor the enabled Gemini fallback produced a valid fix"));return{summary:a.summary||"A fix candidate is ready.",candidate_code:a.candidate_code,provider:a.provider||"ollama"}},c=async e=>{var a,s;let o,r;if(!t||!n)throw Error("Select a notebook cell first");if(a=t.model,s=e.candidate_code,o=null==a?void 0:a.sharedModel,r=s.trim(),!o||"function"!=typeof o.setSource||!r||(o.setSource(r),0))throw Error("Could not update the failed cell");if(!await l.NotebookActions.runCells(n.content,[t],n.sessionContext))throw Error("Fix applied; cell could not be run");if(!(0,i.isCodeCellModel)(t.model)||t.model.outputs.toJSON().some(P))throw Error("Fix applied, but the cell still reports an error")},m={suggestFix:d,applyFix:c};if(a.analysis.is_sufficient)return void O(X,{errorType:s.error_type,errorMessage:s.error_message,traceback:s.traceback,summary:o,details:r,fix:"A corrected cell will be generated locally when you apply the fix."},m,"suggest"===Q);let p=await u("api/ai/explain",e.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});"explained"===p.status&&p.explanation&&(o=p.explanation.summary,r=p.explanation.details),O(X,{errorType:s.error_type,errorMessage:s.error_message,traceback:s.traceback,summary:o,details:r,fix:"A corrected cell will be generated locally when you apply the fix."},m,"suggest"===Q)}catch(e){O(X,{errorType:"Error analysis unavailable",errorMessage:"The platform could not diagnose this error.",traceback:"The backend returned no valid analysis.",summary:"The local platform could not validate the notebook error.",details:["Check the notebook output and retry the analysis."],fix:'print("Review the failing cell and confirm the variable or column exists.")'})}finally{K.disabled=!1}}),U.forEach((t,n)=>{t.addEventListener("click",()=>{if(U.forEach(e=>e.classList.remove("active")),t.classList.add("active"),"Code Help"===n||"Ask AI"===n){Q="explain",(()=>{let t=A(a);if(!t||!(0,i.isCodeCellModel)(t.model)){let e=document.createElement("div");e.className="ml-assistant-empty",e.textContent="Select a code cell to ask local Ollama about it.",X.replaceChildren(e);return}let n=t.model.toJSON().source,s=(Array.isArray(n)?n.join(""):n).slice(0,2e4),o=a.currentWidget,l=document.createElement("textarea");l.className="ml-assistant-question-input",l.maxLength=1e3,l.value="Explain this cell and point out potential issues.";let r=document.createElement("label");r.className="ml-assistant-question-label",r.textContent="Ask a question about this cell",r.appendChild(l);let d=document.createElement("button");d.type="button",d.className="ml-assistant-cta-button",d.textContent="Ask Local Ollama";let c=document.createElement("div");c.className="ml-assistant-code-help-answer",X.replaceChildren(r,d,c),d.addEventListener("click",async()=>{let a=l.value.trim();if(!a){c.textContent="Enter a question about this code first.";return}d.disabled=!0,c.textContent="Asking local Ollama...";try{let n=await u("api/ai/code-help",e.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:s,question:a,notebook_context:o&&t?H(o,t):""})});if(c.replaceChildren(),"explained"!==n.status||!n.explanation){c.textContent="model_missing"===n.status?`Install ${n.model_id||"the local Ollama model"} first.`:"Local Ollama could not answer this code question.";return}let i=document.createElement("p");i.textContent=n.explanation.summary;let l=document.createElement("ul");n.explanation.details.forEach(e=>{let t=document.createElement("li");t.textContent=e,l.appendChild(t)}),c.append(i,l)}catch(e){c.textContent="Local code help is unavailable right now."}finally{d.disabled=!1}})})();return}Q="Suggest Fix"===n?"suggest":"explain",K.click()})}),C.addEventListener("click",async()=>{if(!Y)return void window.open("https://ollama.com/download","_blank","noopener,noreferrer");C.disabled=!0;try{let t=await u("api/local-ai/install",e.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({allow_download:!0})});if("installed"===t.status){await Z(),O(X,{errorType:"Model installed",errorMessage:t.message||"Local model ready",traceback:"Installation completed successfully.",summary:"The recommended local model is available for notebook error explanations.",details:["The local Ollama path is now active."],fix:'print("Model ready. Re-run the failing cell to explain the error.")'});return}O(X,{errorType:"Local model installation failed",errorMessage:t.message||"The recommended Ollama model could not be installed.",traceback:"No notebook code was sent to a cloud service.",summary:"ModelMind could not finish downloading the local model.",details:["Check that Ollama is running and that this computer has an internet connection.","Retry after resolving the issue; the model is not installed until Ollama confirms it."],fix:"Restart Ollama and retry the model installation."})}catch(e){O(X,{errorType:"Local model installation failed",errorMessage:e instanceof Error?e.message:"The local model request failed.",traceback:"No notebook code was sent to a cloud service.",summary:"ModelMind could not finish downloading the local model.",details:["Check the local Jupyter server and Ollama status, then retry."],fix:"Restart the local ModelMind services and retry."})}finally{await Z()}}),e.shell.add(b,"right",{rank:900}),window.addEventListener("modelmind:open-ai-assistant",t=>{var a;e.shell.activateById(b.id);let n=(null==(a=null==t?void 0:t.detail)?void 0:a.mode)==="suggest"?"Suggest Fix":"Explain Error",s=U.get(n)||U.get("Explain Error");s?s.click():K.click()}),function(e){if(w=e,k(),v||E(),document.getElementById("mm-tutor-fab"))return;let t=document.createElement("button");t.id="mm-tutor-fab",t.title="AI Debugger Tutor (Offline ML Guidance)",t.setAttribute("aria-label","Open AI Debugger Tutor");let a=document.createElement("div");a.className="badge",a.textContent="!",t.innerHTML=`<span>🎓</span>`,t.appendChild(a),t.addEventListener("click",M),document.body.appendChild(t)}(e.serviceManager.serverSettings);let ee=new d.Widget;ee.id="mm-ai-chatbot-panel",ee.title.label="\uD83D\uDCAC AI Chat",ee.title.caption="AI Chatbot — powered by Ollama & Gemini",ee.addClass("mm-chatbot-widget");let et=function(e,t,a){if(document.getElementById("mm-chatbot-styles")){let e=document.getElementById("mm-chatbot-styles");e&&e.remove()}let n=document.createElement("style");n.id="mm-chatbot-styles",n.textContent=`
    /* ═══════════════════════════════════════════════
       AI CHATBOT PANEL — AI Assistant Matching Theme
    ═══════════════════════════════════════════════ */
    .mm-chatbot-root {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-width: 0;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      color: var(--ml-assistant-text, #253041);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      position: relative;
      border-left: 1px solid var(--ml-assistant-border, #dfe3ea);
      container-name: mm-chatbot;
      container-type: inline-size;
    }

    /* Header matching AI Assistant */
    .mm-chatbot-header {
      flex-shrink: 0;
      padding: 14px 14px 10px;
      background: var(--ml-assistant-card-bg, #ffffff);
      border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mm-chatbot-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-width: 0;
    }

    .mm-chatbot-title {
      min-width: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--ml-assistant-text, #253041);
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .mm-chatbot-title-icon {
      font-size: 18px;
      line-height: 1;
    }

    /* Provider Switch styled like AI Assistant tabs / buttons */
    .mm-chatbot-provider-switch {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      gap: 6px;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      padding: 3px;
      border-radius: 8px;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
    }

    .mm-chatbot-provider-btn {
      min-width: 0;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--ml-assistant-muted, #5d6b80);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .mm-chatbot-provider-btn:hover:not(.active-ollama):not(.active-gemini) {
      color: var(--ml-assistant-text, #253041);
      background: rgba(255, 255, 255, 0.7);
    }

    .mm-chatbot-provider-btn.active-ollama {
      background: var(--ml-assistant-card-bg, #ffffff);
      border-color: var(--ml-assistant-border, #dfe3ea);
      color: #6b21a8;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.08));
    }

    .mm-chatbot-provider-btn.active-gemini {
      background: var(--ml-assistant-card-bg, #ffffff);
      border-color: var(--ml-assistant-border, #dfe3ea);
      color: #173ea5;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.08));
    }

    /* Status row matching AI Assistant */
    .mm-chatbot-status-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .mm-chatbot-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      background: var(--ml-assistant-success-bg, #dff5eb);
      color: var(--ml-assistant-success-text, #1d7b54);
      border: 1px solid transparent;
    }

    .mm-chatbot-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
    }

    .mm-chatbot-status-pill.offline {
      background: var(--ml-assistant-warn-bg, #fdf0d5);
      color: var(--ml-assistant-warn-text, #9c6b11);
    }

    .mm-chatbot-status-pill.offline .mm-chatbot-status-dot {
      background: #f59e0b;
    }

    /* Context row matching AI Assistant secondary controls */
    .mm-chatbot-context-bar {
      flex-shrink: 0;
      padding: 7px 14px;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: var(--ml-assistant-muted, #5d6b80);
      font-weight: 600;
      flex-wrap: wrap;
    }

    .mm-chatbot-context-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 999px;
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      color: var(--ml-assistant-text, #253041);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }

    .mm-chatbot-context-chip:hover {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border-color: var(--ml-assistant-accent, #6d7cff);
      color: var(--ml-assistant-accent, #6d7cff);
    }

    /* Messages thread */
    .mm-chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      scroll-behavior: smooth;
      min-width: 0;
    }

    .mm-chatbot-messages::-webkit-scrollbar {
      width: 5px;
    }
    .mm-chatbot-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    .mm-chatbot-messages::-webkit-scrollbar-thumb {
      background: var(--ml-assistant-border, #dfe3ea);
      border-radius: 99px;
    }
    .mm-chatbot-messages::-webkit-scrollbar-thumb:hover {
      background: #cbd5e1;
    }

    /* Welcome / Empty State matching AI Assistant */
    .mm-chat-welcome {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 24px 16px;
      text-align: center;
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 12px;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.05));
      margin: auto 0;
    }

    .mm-chat-welcome-icon {
      font-size: 36px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--ml-assistant-accent-soft, #eef1ff);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ml-assistant-accent, #6d7cff);
    }

    .mm-chat-welcome-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--ml-assistant-text, #253041);
      margin: 0;
    }

    .mm-chat-welcome-sub {
      font-size: 12px;
      color: var(--ml-assistant-muted, #5d6b80);
      line-height: 1.5;
      max-width: 260px;
      margin: 0;
    }

    .mm-chat-suggestions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
      margin-top: 6px;
    }

    .mm-chat-suggestion-chip {
      padding: 9px 12px;
      border-radius: 8px;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: var(--ml-assistant-panel-bg, #f8fafc);
      color: var(--ml-assistant-text, #253041);
      font-size: 11.5px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
      line-height: 1.4;
    }

    .mm-chat-suggestion-chip:hover {
      border-color: var(--ml-assistant-accent, #6d7cff);
      background: var(--ml-assistant-accent-soft, #eef1ff);
      color: #312e81;
      transform: translateX(2px);
    }

    /* Message Bubbles */
    .mm-chat-msg {
      display: flex;
      gap: 9px;
      max-width: 100%;
      min-width: 0;
    }

    .mm-chat-msg-user {
      flex-direction: row-reverse;
      align-self: flex-end;
    }

    .mm-chat-msg-assistant {
      align-self: flex-start;
    }

    .mm-chat-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .mm-chat-avatar-user {
      background: #e0e7ff;
      border: 1px solid #c7d2fe;
      color: #4338ca;
    }

    .mm-chat-avatar-assistant {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border: 1px solid rgba(109, 124, 255, 0.3);
      color: var(--ml-assistant-accent, #6d7cff);
    }

    .mm-chat-bubble-container {
      display: flex;
      flex-direction: column;
      gap: 3px;
      max-width: calc(100% - 38px);
      min-width: 0;
    }

    .mm-chat-bubble-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10.5px;
      color: var(--ml-assistant-muted, #5d6b80);
      padding: 0 3px;
    }

    .mm-chat-bubble-header-user {
      justify-content: flex-end;
    }

    .mm-chat-sender-name {
      font-weight: 700;
      color: var(--ml-assistant-text, #253041);
    }

    .mm-chat-provider-badge {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 999px;
      font-size: 9.5px;
      font-weight: 600;
    }

    .mm-chat-badge-gemini {
      background: #edf4ff;
      border: 1px solid #d3e3ff;
      color: #173ea5;
    }

    .mm-chat-badge-ollama {
      background: #f5f3ff;
      border: 1px solid #ddd6fe;
      color: #6b21a8;
    }

    .mm-chat-time {
      font-size: 10px;
      color: #94a3b8;
    }

    /* Bubble bodies matching AI Assistant Cards */
    .mm-chat-bubble {
      padding: 11px 13px;
      border-radius: 10px;
      font-size: 12px;
      line-height: 1.55;
      word-break: break-word;
    }

    .mm-chat-bubble-user {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border: 1px solid #d3e3ff;
      border-top-right-radius: 2px;
      color: #1e1b4b;
      box-shadow: 0 1px 2px rgba(109, 124, 255, 0.06);
    }

    .mm-chat-bubble-assistant {
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-top-left-radius: 2px;
      color: var(--ml-assistant-text, #253041);
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.06));
    }

    .mm-chat-bubble-error {
      background: var(--ml-assistant-error-bg, #fff1f1) !important;
      border: 1px solid rgb(163 61 77 / 20%) !important;
      color: var(--ml-assistant-error-text, #a33d4d) !important;
    }

    /* Message content */
    .mm-chat-msg-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mm-chat-text-seg {
      color: inherit;
      font-size: 12px;
      line-height: 1.6;
    }

    .mm-chat-text-seg strong {
      color: #0f172a;
      font-weight: 700;
    }

    .mm-chat-text-seg em {
      color: #4338ca;
    }

    .mm-chat-inline-code {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 1px 5px;
      font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: #0f172a;
    }

    /* Code block matching AI Assistant style */
    .mm-chat-code-block {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      background: #1e293b;
      margin: 4px 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .mm-chat-code-lang {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 10px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .mm-chat-code-lang span {
      font-size: 10px;
      color: #475569;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .mm-chat-copy-btn {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .mm-chat-copy-btn:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
      color: #1e293b;
    }

    .mm-chat-code-block pre {
      margin: 0;
      padding: 11px 13px;
      overflow-x: auto;
      background: #1e293b;
    }

    .mm-chat-code-block code {
      font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace;
      font-size: 11.5px;
      line-height: 1.55;
      color: #f8fafc;
      white-space: pre;
    }

    /* Typing animation */
    .mm-chat-bubble-streaming {
      padding: 12px 16px;
    }

    .mm-chat-typing-dots {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .mm-chat-typing-dots span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--ml-assistant-accent, #6d7cff);
      animation: mm-typing 1.2s infinite;
    }

    .mm-chat-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .mm-chat-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes mm-typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
      30% { transform: translateY(-5px); opacity: 1; }
    }

    /* Input Area matching AI Assistant form inputs */
    .mm-chatbot-input-area {
      flex-shrink: 0;
      padding: 10px 14px 14px;
      border-top: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: var(--ml-assistant-card-bg, #ffffff);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mm-chatbot-input-helpers {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
    }

    .mm-chat-helper-btn {
      padding: 4px 9px;
      border-radius: 6px;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: var(--ml-assistant-card-bg, #ffffff);
      color: var(--ml-assistant-muted, #5d6b80);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .mm-chat-helper-btn:hover {
      border-color: #cbd5e1;
      color: var(--ml-assistant-text, #253041);
      background: var(--ml-assistant-panel-bg, #f8fafc);
    }

    .mm-chatbot-clear-btn {
      padding: 4px 9px;
      border-radius: 6px;
      border: 1px solid rgba(163, 61, 77, 0.2);
      background: #ffffff;
      color: var(--ml-assistant-error-text, #a33d4d);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      margin-left: auto;
    }

    .mm-chatbot-clear-btn:hover {
      background: #fff1f1;
      border-color: rgba(163, 61, 77, 0.4);
    }

    .mm-chatbot-input-row {
      display: flex;
      gap: 8px;
      align-items: flex-end;
      min-width: 0;
    }

    .mm-chatbot-textarea {
      flex: 1;
      min-width: 0;
      background: #ffffff;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 8px;
      color: var(--ml-assistant-text, #253041);
      font-size: 12px;
      padding: 9px 12px;
      resize: none;
      outline: none;
      font-family: inherit;
      line-height: 1.45;
      max-height: 120px;
      min-height: 38px;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .mm-chatbot-textarea:focus {
      border-color: var(--ml-assistant-accent, #6d7cff);
      box-shadow: 0 0 0 3px rgba(109, 124, 255, 0.16);
    }

    .mm-chatbot-textarea::placeholder {
      color: #94a3b8;
    }

    /* Send button matching .ml-assistant-cta-button */
    .mm-chatbot-send-btn {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      border: 1px solid var(--ml-assistant-accent, #6d7cff);
      background: var(--ml-assistant-accent, #6d7cff);
      color: #ffffff;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      flex-shrink: 0;
      box-shadow: 0 1px 2px rgba(109, 124, 255, 0.2);
    }

    .mm-chatbot-send-btn:hover:not(:disabled) {
      background: #5b6aff;
      border-color: #5b6aff;
      box-shadow: 0 2px 4px rgba(109, 124, 255, 0.3);
    }

    .mm-chatbot-send-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      box-shadow: none;
    }

    .mm-chatbot-send-btn.gemini-mode {
      background: #2563eb;
      border-color: #2563eb;
    }

    .mm-chatbot-send-btn.gemini-mode:hover:not(:disabled) {
      background: #1d4ed8;
      border-color: #1d4ed8;
    }

    @container mm-chatbot (max-width: 380px) {
      .mm-chatbot-header { padding-inline: 10px; }
      .mm-chatbot-title-row { align-items: flex-start; gap: 7px; }
      .mm-chatbot-title {
        flex: 0 1 92px;
        align-items: flex-start;
        line-height: 1.08;
      }
      .mm-chatbot-provider-switch { flex: 1 1 auto; gap: 3px; }
      .mm-chatbot-provider-btn {
        flex: 1 1 0;
        justify-content: center;
        padding: 5px 6px;
        white-space: nowrap;
      }
      .mm-chatbot-context-bar { padding-inline: 10px; }
      .mm-chatbot-messages { padding: 10px; }
      .mm-chatbot-input-area { padding-inline: 10px; }
      .mm-chatbot-input-helpers { gap: 5px; }
      .mm-chat-helper-btn { flex: 0 1 auto; padding-inline: 7px; }
      .mm-chatbot-clear-btn { margin-left: auto; }
    }
  `,document.head.appendChild(n);let s=[],i="ollama",o=!1,l=[],r=document.createElement("div");r.className="mm-chatbot-root";let d=document.createElement("div");d.className="mm-chatbot-header";let c=document.createElement("div");c.className="mm-chatbot-title-row";let m=document.createElement("div");m.className="mm-chatbot-title",m.innerHTML='<span class="mm-chatbot-title-icon">\uD83D\uDCAC</span> AI Chatbot';let p=document.createElement("div");p.className="mm-chatbot-provider-switch";let b=document.createElement("button");b.className="mm-chatbot-provider-btn active-ollama",b.title="Use local Ollama (offline, private)",b.textContent="\uD83E\uDD99 Ollama";let f=document.createElement("button");f.className="mm-chatbot-provider-btn",f.title="Switch to Google Gemini (cloud)",f.textContent="✨ Gemini",p.append(b,f),c.append(m,p);let h=document.createElement("div");h.className="mm-chatbot-status-bar";let g=document.createElement("span");g.className="mm-chatbot-status-pill",g.innerHTML='<span class="mm-chatbot-status-dot"></span> Ollama (Local AI)';let v=document.createElement("span");v.className="mm-chatbot-status-pill",v.innerHTML='<span class="mm-chatbot-status-dot"></span> Gemini (Cloud AI)',h.append(g,v),d.append(c,h);let x=document.createElement("div");x.className="mm-chatbot-context-bar",x.innerHTML="<span>Context:</span>";let y=document.createElement("button");y.className="mm-chatbot-context-chip",y.title="Paste active cell code into your message",y.innerHTML="\uD83D\uDCCB Active Cell";let C=document.createElement("button");C.className="mm-chatbot-context-chip",C.style.display="none",C.title="Paste last error into your message",C.innerHTML="\uD83D\uDC1E Last Error",x.append(y,C);let _=document.createElement("div");_.className="mm-chatbot-messages";let w=document.createElement("div");w.className="mm-chat-welcome",w.innerHTML=`
    <div class="mm-chat-welcome-icon">🤖</div>
    <div class="mm-chat-welcome-title">ModelMind AI Chatbot</div>
    <div class="mm-chat-welcome-sub">Ask me anything — code explanations, debugging help, ML concepts, or anything Python.</div>
  `;let k=document.createElement("div");k.className="mm-chat-suggestions",["\uD83D\uDCA1 Explain active cell code","\uD83D\uDC1E How to fix the latest error?","\uD83D\uDCCA How to visualize data with matplotlib?","⚡ Optimize my code performance","\uD83E\uDD16 Recommend best ML model for my data"].forEach(e=>{let n=document.createElement("button");n.className="mm-chat-suggestion-chip",n.textContent=e,n.addEventListener("click",()=>{let n=e.replace(/^[^\s]+\s/,"");if(e.includes("active cell")){let e=t();e&&(n=`Explain this code:
\`\`\`python
${e}
\`\`\``)}else if(e.includes("latest error")){let e=a();e&&(n=`How do I fix this error?
${e.error_type}: ${e.error_message}
\`\`\`python
${e.code||""}
\`\`\``)}N.value=n,N.dispatchEvent(new Event("input")),I()}),k.appendChild(n)}),w.appendChild(k),_.appendChild(w);let E=document.createElement("div");E.className="mm-chatbot-input-area";let T=document.createElement("div");T.className="mm-chatbot-input-helpers",[{icon:"\uD83D\uDCCB",label:"Paste Code",action:()=>{let e=t();e&&(N.value+=(N.value?"\n":"")+`\`\`\`python
${e.slice(0,3e3)}
\`\`\``,A(),N.focus())}},{icon:"\uD83D\uDC1E",label:"Paste Error",action:()=>{let e=a();e&&(N.value+=(N.value?"\n":"")+`Error: ${e.error_type}: ${e.error_message}
`+(e.traceback?`Traceback:
\`\`\`
${e.traceback.slice(0,1e3)}
\`\`\``:""),A(),N.focus())}},{icon:"\uD83D\uDCDD",label:"Explain Code",action:()=>{let e=t();e&&(N.value=`Please explain this code in detail:
\`\`\`python
${e.slice(0,3e3)}
\`\`\``,A(),N.focus())}}].forEach(({icon:e,label:t,action:a})=>{let n=document.createElement("button");n.className="mm-chat-helper-btn",n.textContent=`${e} ${t}`,n.addEventListener("click",a),T.appendChild(n)});let $=document.createElement("button");$.className="mm-chatbot-clear-btn",$.textContent="\uD83D\uDDD1 Clear",$.addEventListener("click",()=>{s.length=0,l.length=0,_.replaceChildren(w)}),T.appendChild($);let M=document.createElement("div");M.className="mm-chatbot-input-row";let N=document.createElement("textarea");N.className="mm-chatbot-textarea",N.placeholder="Ask anything about code, ML, or Python... (Shift+Enter for newline)",N.rows=1;let S=document.createElement("button");function A(){N.style.height="auto",N.style.height=Math.min(N.scrollHeight,120)+"px"}function z(e){i=e,"ollama"===e?(b.className="mm-chatbot-provider-btn active-ollama",f.className="mm-chatbot-provider-btn",g.style.borderColor="rgba(107, 33, 168, 0.4)",g.style.background="#f3e8ff",g.style.color="#6b21a8",v.style.borderColor="transparent",v.style.background="var(--ml-assistant-success-bg, #dff5eb)",v.style.color="var(--ml-assistant-success-text, #1d7b54)",S.className="mm-chatbot-send-btn"):(f.className="mm-chatbot-provider-btn active-gemini",b.className="mm-chatbot-provider-btn",v.style.borderColor="rgba(30, 64, 175, 0.4)",v.style.background="#eff6ff",v.style.color="#1e40af",g.style.borderColor="transparent",g.style.background="var(--ml-assistant-success-bg, #dff5eb)",g.style.color="var(--ml-assistant-success-text, #1d7b54)",S.className="mm-chatbot-send-btn gemini-mode")}async function H(){try{(await u("api/settings/gemini-key",e)).configured?(v.classList.remove("offline"),v.innerHTML='<span class="mm-chatbot-status-dot"></span> Gemini configured'):(v.classList.add("offline"),v.innerHTML='<span class="mm-chatbot-status-dot"></span> Gemini unconfigured')}catch(e){v.classList.add("offline"),v.innerHTML='<span class="mm-chatbot-status-dot"></span> Gemini unavailable'}try{let t=await u("api/local-ai/status",e);"connected"===t.status&&"available"===t.model_status?(g.classList.remove("offline"),g.innerHTML='<span class="mm-chatbot-status-dot"></span> Ollama (Local AI)'):(g.classList.add("offline"),g.innerHTML='<span class="mm-chatbot-status-dot"></span> Ollama offline')}catch(e){g.classList.add("offline"),g.innerHTML='<span class="mm-chatbot-status-dot"></span> Ollama offline'}z(i)}function P(e){let t=_.querySelector(".mm-chat-welcome");t&&t.remove();let a=function(e){let t=document.createElement("div");t.className=`mm-chat-msg mm-chat-msg-${e.role}`;let a=document.createElement("div");a.className=`mm-chat-avatar mm-chat-avatar-${e.role}`,a.textContent="user"===e.role?"\uD83D\uDC64":"gemini"===e.provider?"✨":"\uD83E\uDD99";let n=document.createElement("div");n.className="mm-chat-bubble-container";let s=document.createElement("div");s.className=`mm-chat-bubble-header mm-chat-bubble-header-${e.role}`;let i=document.createElement("span");if(i.className="mm-chat-sender-name",i.textContent="user"===e.role?"You":"ModelMind AI",s.appendChild(i),"assistant"===e.role&&e.provider){let t=document.createElement("span");t.className=`mm-chat-provider-badge mm-chat-badge-${e.provider}`,t.textContent="gemini"===e.provider?"Gemini Cloud":"Ollama Local",s.appendChild(t)}let o=document.createElement("span");o.className="mm-chat-time",o.textContent=e.timestamp.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),s.appendChild(o);let l=document.createElement("div");if(l.className=`mm-chat-bubble mm-chat-bubble-${e.role}`,e.isError&&l.classList.add("mm-chat-bubble-error"),e.isStreaming){l.classList.add("mm-chat-bubble-streaming");let e=document.createElement("div");e.className="mm-chat-typing-dots",e.innerHTML="<span></span><span></span><span></span>",l.appendChild(e)}else{let t=function(e){let t=document.createElement("div");t.className="mm-chat-msg-content";let{segments:a}=function(e){let t,a=[],n=/```(\w*)\n?([\s\S]*?)```/g,s=0;for(;null!==(t=n.exec(e));)t.index>s&&a.push({type:"text",content:e.slice(s,t.index)}),a.push({type:"code",lang:t[1]||"python",content:t[2].trim()}),s=t.index+t[0].length;return s<e.length&&a.push({type:"text",content:e.slice(s)}),{segments:a}}(e);return a.forEach(e=>{if("code"===e.type){let a=document.createElement("div");a.className="mm-chat-code-block";let n=document.createElement("div");n.className="mm-chat-code-lang";let s=document.createElement("span");s.textContent=e.lang||"code";let i=document.createElement("button");i.className="mm-chat-copy-btn",i.textContent="Copy",i.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(e.content),i.textContent="✓ Copied",setTimeout(()=>{i.textContent="Copy"},1500)}catch(e){i.textContent="Failed"}}),n.append(s,i);let o=document.createElement("pre"),l=document.createElement("code");l.textContent=e.content,o.appendChild(l),a.append(n,o),t.appendChild(a)}else{let a=document.createElement("div");a.className="mm-chat-text-seg",a.innerHTML=e.content.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,'<code class="mm-chat-inline-code">$1</code>').replace(/\n/g,"<br>"),t.appendChild(a)}}),t}(e.content);l.appendChild(t)}return n.append(s,l),"user"===e.role?t.append(n,a):t.append(a,n),t}(e);return _.appendChild(a),_.scrollTop=_.scrollHeight,a}async function I(){let a=N.value.trim();if(!a||o)return;o=!0,S.disabled=!0,N.value="",A();let n={role:"user",content:a,timestamp:new Date};s.push(n),P(n),l.push({role:"user",content:a});let r=P({role:"assistant",content:"",timestamp:new Date,isStreaming:!0});try{let n=await L(e,{message:a,provider:i,history:l.slice(-10),context:{active_code:t().slice(0,3e3)}});if(r.remove(),"replied"===n.status&&n.reply){let e={role:"assistant",content:n.reply,provider:n.provider||i,timestamp:new Date};s.push(e),P(e),l.push({role:"assistant",content:n.reply})}else{l.pop();let e="I could not respond right now.";"model_missing"===n.status?e="\uD83E\uDD99 Ollama model not found. Please install it first via the AI Assistant.":"ollama_unavailable"===n.status?e="\uD83E\uDD99 Ollama is not running. Start Ollama, or switch to Gemini.":"gemini_unconfigured"===n.status?e="✨ Open the \uD83D\uDD11 API Key tab in the right sidebar to save your Gemini key.":"gemini_unavailable"===n.status?e=n.message?`✨ ${n.message}`:"✨ Gemini is temporarily unavailable. Try again or switch to Ollama.":n.message&&(e=n.message);let t={role:"assistant",content:e,timestamp:new Date,isError:!0};s.push(t),P(t)}}catch(t){r.remove(),l.pop();let e={role:"assistant",content:"⚠️ Network error — could not reach the backend. Is the platform running?",timestamp:new Date,isError:!0};s.push(e),P(e)}finally{o=!1,S.disabled=!1,N.focus()}}return S.className="mm-chatbot-send-btn",S.title="Send message",S.innerHTML="➤",M.append(N,S),E.append(T,M),N.addEventListener("input",A),H(),window.addEventListener("modelmind:gemini-key-updated",()=>{H()}),b.addEventListener("click",()=>z("ollama")),f.addEventListener("click",()=>z("gemini")),y.addEventListener("click",()=>{let e=t();e&&(N.value+=(N.value?"\n":"")+`\`\`\`python
${e.slice(0,3e3)}
\`\`\``,A(),N.focus())}),C.addEventListener("click",()=>{let e=a();if(e){let t=`Error: ${e.error_type}: ${e.error_message}
\`\`\`
${e.traceback.slice(0,1e3)}
\`\`\``;N.value+=(N.value?"\n":"")+t,A(),N.focus()}}),S.addEventListener("click",I),N.addEventListener("keydown",e=>{"Enter"!==e.key||e.shiftKey||(e.preventDefault(),I())}),setInterval(()=>{let e=a();C.style.display=e?"inline-flex":"none"},2e3),r.append(d,x,_,E),r}(e.serviceManager.serverSettings,()=>{let e=A(a);if(!e||!(0,i.isCodeCellModel)(e.model))return"";let t=e.model.toJSON().source;return(Array.isArray(t)?t.join(""):t).slice(0,2e4)},()=>z(A(a))||V);ee.node.style.cssText="height:100%;overflow:hidden;",ee.node.appendChild(et),e.shell.add(ee,"right",{rank:800}),l.NotebookActions.executed.connect((t,a)=>{let{cell:n,success:s}=a;s||setTimeout(()=>{let t=z(n);t&&(V=t,N({error_type:t.error_type,error_message:t.error_message,traceback:t.traceback,code:t.code},e.serviceManager.serverSettings))},75)});let ea=new g(e,a);e.shell.add(ea,"left",{rank:300});let en=function(e,t){let a=new d.Widget;a.id="mm-api-key-settings",a.title.label=t.__("API Key"),a.title.caption=t.__("Manage Gemini credentials stored on this computer"),a.addClass("mm-api-key-settings-widget");let n=document.createElement("section");n.className="mm-key-settings";let s=document.createElement("header");s.className="mm-key-settings-header";let i=document.createElement("h2");i.textContent="API Key";let o=document.createElement("p");o.textContent="Gemini credentials stay in your computer's credential store.",s.append(i,o);let l=document.createElement("div");l.className="mm-key-settings-status",l.setAttribute("role","status"),l.setAttribute("aria-live","polite"),l.textContent="Checking saved credentials...";let r=(e,t="info")=>{l.textContent=e,l.dataset.state=t},c=document.createElement("form");c.className="mm-key-settings-form";let m=document.createElement("label");m.htmlFor="mm-gemini-api-key",m.textContent="Google Gemini API key";let p=document.createElement("input");p.id="mm-gemini-api-key",p.type="password",p.name="api_key",p.autocomplete="new-password",p.maxLength=512,p.placeholder="Paste your Gemini API key",p.required=!0,p.setAttribute("aria-describedby","mm-key-settings-note");let b=document.createElement("div");b.className="mm-key-settings-actions";let f=document.createElement("button");f.type="submit",f.textContent="Save key";let h=document.createElement("button");h.type="button",h.textContent="Remove key",h.disabled=!0,b.append(f,h);let g=document.createElement("p");g.id="mm-key-settings-note",g.className="mm-key-settings-note",g.textContent="The key is never shown again after saving and is not written to a notebook or browser storage. It is stored on the machine running Jupyter Server, so only save it from a server you trust. Gemini requests send the selected code and error context to Google. Ollama stays local.",c.append(m,p,b,g),n.append(s,l,c),a.node.appendChild(n);let v=e=>{p.disabled=e,f.disabled=e,h.disabled=e||"desktop"!==h.dataset.source},x=async()=>{try{let t=await u("api/settings/gemini-key",e);h.dataset.source=t.source||"",h.disabled="desktop"!==t.source,p.disabled=!1,f.disabled=!1,"desktop"===t.source?r("Your personal Gemini key is saved in this computer’s credential store.","success"):"environment"===t.source?r("A server Gemini key is configured. Saving here will use your personal key instead.","info"):r("No Gemini key saved on this computer.","warning")}catch(e){r("Could not read the system credential store. Check the Jupyter server log.","error"),p.disabled=!0,f.disabled=!0,h.disabled=!0}};if(c.addEventListener("submit",async t=>{t.preventDefault();let a=p.value.trim();if(!a){r("Enter a Gemini API key before saving.","warning"),p.focus();return}v(!0),r("Saving to the system credential store...");try{await u("api/settings/gemini-key",e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({api_key:a})}),p.value="",r("Gemini key saved in this computer's credential store.","success"),window.dispatchEvent(new Event("modelmind:gemini-key-updated")),await x()}catch(e){r("Could not save the key. Check that the system credential store is available.","error")}finally{v(!1)}}),h.addEventListener("click",async()=>{v(!0),r("Removing saved Gemini key...");try{await u("api/settings/gemini-key",e,{method:"DELETE"}),p.value="",r("Saved Gemini key removed.","success"),window.dispatchEvent(new Event("modelmind:gemini-key-updated")),await x()}catch(e){r("Could not remove the key. Check that the system credential store is available.","error")}finally{v(!1)}}),!document.getElementById("mm-key-settings-styles")){let e=document.createElement("style");e.id="mm-key-settings-styles",e.textContent=`
      .mm-key-settings {
        box-sizing: border-box;
        width: 100%; min-width: 0; height: 100%;
        overflow-y: auto; padding: 18px 14px;
        color: #e2e8f0; background: #0f172a;
        font-family: 'Segoe UI', system-ui, sans-serif;
      }
      .mm-key-settings-header {
        margin: -18px -14px 16px; padding: 18px 14px 16px;
        background: linear-gradient(135deg, #1e1b4b, #0f172a);
        border-bottom: 1px solid rgba(167,139,250,.2);
      }
      .mm-key-settings-header h2 { margin: 0; color: #f1f5f9; font-size: 16px; }
      .mm-key-settings-header p, .mm-key-settings-note {
        color: #aab5c8; font-size: 11px; line-height: 1.6;
      }
      .mm-key-settings-header p { margin: 6px 0 0; }
      .mm-key-settings-status {
        box-sizing: border-box; width: 100%; padding: 10px;
        border: 1px solid rgba(167,139,250,.3);
        border-radius: 10px; color: #c4b5fd; background: rgba(30,27,75,.4);
        font-size: 12px; line-height: 1.5;
      }
      .mm-key-settings-status[data-state="success"] {
        border-color: rgba(167,139,250,.38); color: #c4b5fd;
        background: rgba(30,27,75,.48);
      }
      .mm-key-settings-status[data-state="warning"] {
        border-color: rgba(245,158,11,.35); color: #fcd34d;
        background: rgba(120,80,10,.16);
      }
      .mm-key-settings-status[data-state="error"] {
        border-color: rgba(248,113,113,.38); color: #fca5a5;
        background: rgba(127,29,29,.2);
      }
      .mm-key-settings-form { display: flex; flex-direction: column; gap: 9px; margin-top: 18px; }
      .mm-key-settings-form label { color: #dbe4f0; font-size: 11px; font-weight: 600; }
      .mm-key-settings-form input {
        box-sizing: border-box; width: 100%; min-width: 0; padding: 10px;
        border: 1px solid #334155; border-radius: 8px;
        outline: none; color: #f8fafc; background: #1e293b;
        font: inherit; font-size: 13px;
      }
      .mm-key-settings-form input:focus { border-color: #a78bfa; }
      .mm-key-settings-form input::placeholder { color: #aab5c8; opacity: 1; }
      .mm-key-settings-actions { display: flex; gap: 8px; }
      .mm-key-settings-actions button {
        box-sizing: border-box; min-width: 0; min-height: 38px; flex: 1;
        padding: 8px; border: 1px solid #5546a5; border-radius: 8px;
        color: #fff; background: #43358a; font: inherit; font-size: 12px;
        font-weight: 600; cursor: pointer;
      }
      .mm-key-settings-actions button:last-child {
        border-color: #475569; color: #cbd5e1; background: #1e293b;
      }
      .mm-key-settings-actions button:hover:not(:disabled) { filter: brightness(1.12); }
      .mm-key-settings-actions button:disabled { cursor: not-allowed; opacity: .5; }
      .mm-key-settings-note { margin: 2px 0 0; }
    `,document.head.appendChild(e)}return x(),a}(e.serviceManager.serverSettings,p);en.title.label="\uD83D\uDD11 API Key",en.title.caption=p.__("Save Gemini credentials in this computer’s credential store"),e.shell.add(en,"right",{rank:700});let es="modelmind:open-studio";if(e.commands.addCommand(es,{label:"Open ModelMind Studio",caption:"Open the unified ModelMind ML Studio slide bar in the left panel",execute:()=>{e.shell.activateById(ea.id)}}),t.viewMenu.addGroup([{command:es}],899),!document.getElementById("mm-left-panel-styles")){let e=document.createElement("style");e.id="mm-left-panel-styles",e.textContent=`
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
      `,document.head.appendChild(e)}e.commands.addCommand(S,{label:"Open Error Assistant",execute:()=>{e.shell.activateById(b.id),Z()}});let ei=t.helpMenu;t.viewMenu.addGroup([{command:S}],900),ei.hide(),Z(),s=[{match:(e,t)=>"filebrowser"===e||t.toLowerCase().includes("file browser"),shortName:"Upload / Files",fullName:"Upload Dataset & Files",description:"Upload CSV, Excel datasets & manage notebook files"},{match:(e,t)=>"jp-running-sessions"===e||t.toLowerCase().includes("running"),shortName:"Running",fullName:"Active Kernels & Sessions",description:"Monitor active kernels, terminals & running sessions"},{match:(e,t)=>e.includes("modelmind")||t.toLowerCase().includes("modelmind"),shortName:"ML Studio",fullName:"ModelMind ML Studio & Preprocessing",description:"Dataset Intelligence, Preprocessing Advisor & Model Selection"},{match:(e,t)=>e.includes("api-key")||t.toLowerCase().includes("api key"),shortName:"API Key",fullName:"ModelMind API Key Settings",description:"Store Gemini credentials in the computer’s credential store"},{match:(e,t)=>"table-of-contents"===e||t.toLowerCase().includes("table of contents")||t.toLowerCase().includes("outline"),shortName:"Outline",fullName:"Notebook Outline",description:"Table of contents, markdown headers & notebook outline"},{match:(e,t)=>e.includes("extension")||t.toLowerCase().includes("extension"),shortName:"Extensions",fullName:"Extensions & Tools",description:"Manage JupyterLab extensions and platform plugins"}],o=!1,(r=()=>{if(!o){o=!0;try{let e=document.querySelectorAll(".jp-SideBar.jp-mod-left .lm-TabBar-tab");if(!e||0===e.length)return;e.forEach(e=>{let t=e.getAttribute("data-id")||"",a=e.getAttribute("title")||"",n=s.find(e=>e.match(t,a));if(!n)return;let i=`${n.fullName} — ${n.description}`;e.title!==i&&(e.title=i);let o=e.querySelector(".mm-sidebar-tab-label");o||((o=document.createElement("div")).className="mm-sidebar-tab-label",e.appendChild(o)),o.textContent!==n.shortName&&(o.textContent=n.shortName);let l=e.querySelector(".lm-TabBar-tabLabel");l&&"none"!==l.style.display&&(l.style.display="none")})}finally{o=!1}}})(),[100,300,700,1500,3e3,5e3].forEach(e=>setTimeout(r,e)),(c=document.querySelector(".jp-SideBar.jp-mod-left .lm-TabBar-content"))?new MutationObserver(()=>r()).observe(c,{childList:!0}):setTimeout(()=>{let e=document.querySelector(".jp-SideBar.jp-mod-left .lm-TabBar-content");e&&new MutationObserver(()=>r()).observe(e,{childList:!0})},1e3)}}},665(e,t,a){e.exports=a.p+"68c5c2a70ed031f3.png"}}]);