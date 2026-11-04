# Build Context

Last updated: 2026-11-03

## 2026-11-03 handoff: expanded Practice Studio

### Completed in this workspace

- Practice question bank expanded from **423** to **2,251 unique questions**.
  The approved external curriculum supplied 1,828 additional entries; all IDs
  were unique against the original bank.
- Current public classification is **793 coding/debugging**, **608 AI concept
  review**, and **850 exact-answer** exercises.
- Every imported item was normalized to the ModelMind schema with a topic,
  Basic/Medium/Advanced level, title, prompt, tags where supplied, and a
  coding editor scaffold where relevant.
- MCQs and numerical questions retain their server-only answer keys and are
  deterministic exact checks. Public browser JSON contains no answer key,
  reference solution, or import provenance.
- Quality audit passed: no duplicate IDs/content, missing required fields,
  invalid MCQ indexes, malformed numeric answer keys, or public-field leaks.
- The Practice Jupyter sidebar separates **Coding & debugging**, **AI concept
  review**, and **Quick exact checks**, and uses the ModelMind Studio visual
  system. The Practice notebook keeps standard Jupyter editing and the AI
  Chatbot, while hiding ML Studio-specific tools.
- AI review prompt now grades only requirements stated in a coding prompt.
  Correct code must receive **5/5** without losing marks solely for optional
  comments, a training loop, or extra explanation.
- Verification performed: `node --check scripts/build-practice-question-bank.mjs`,
  Python syntax validation for `routes.py`, focused Next lint/build, and the
  live notebook endpoint returning all 2,251 questions.

### Important grading boundary

The source curriculum does **not** contain complete executable test
specifications for all coding exercises. Do not claim that the 793 coding
questions have hidden tests. They currently use AI rubric review unless and
until a private judge test set exists for that exact question.

`practice-judge/` already provides a Docker-only, token-protected private
service with **26** test-backed exercises. The Next.js route
`modelmind-source/app/api/practice/grade/route.ts` is prepared to call it
through `PRACTICE_JUDGE_URL` and `PRACTICE_JUDGE_TOKEN`. It must be deployed
on a private network and tested before enabling automatic code execution.
Never run learner submissions directly inside Jupyter Server, the Next.js
process, or a public Render service.

### Files changed for the question-bank work

- `scripts/build-practice-question-bank.mjs` — validates and builds the
  browser-safe export; supports `--import-directory` for future approved
  curricula; includes targeted quality corrections.
- `modelmind-source/data/modelmind-practice-private.json` — 2,251-question
  private source of truth; contains answer keys only for server-side grading.
- `modelmind-source/public/modelmind-practice-questions.json` — safe public
  projection used by the web and Jupyter Practice panel.
- `extensions/error-assistant/src/practice-questions.ts` — left Practice
  panel UI and grouped classification display.
- `extensions/error-assistant/ml_platform_error_assistant/routes.py` — public
  question API plus exact and AI review routing.
- `modelmind-source/lib/practice.ts` and
  `modelmind-source/app/api/practice/grade/route.ts` — web-side schema and
  isolated-judge integration contract.

### Resume checklist for another platform

1. Preserve the dirty worktree; do not reset or stage unrelated files.
2. Start the web app with `npm run dev -- --hostname 127.0.0.1 --port 3000`
   from `modelmind-source`.
3. Start Jupyter with `PORT=8901 ./scripts/start-platform.sh` from the repo
   root, then open the Practice notebook link below.
4. Hard refresh the browser after an extension rebuild (`Cmd+Shift+R` on
   macOS) so the cached labextension is replaced.
5. Before adding test badges, deploy `practice-judge` privately, set matching
   strong `PRACTICE_JUDGE_TOKEN` values in the judge and web app, and execute
   both passing and failing submissions. Do not expose the judge port.
6. Add test specifications gradually, beginning with deterministic Python,
   NumPy, Pandas, and basic scikit-learn contracts. Each test-backed exercise
   needs explicit input, output, edge cases, and hidden tests.

### Current developer-machine links

- Home: `http://127.0.0.1:3000`
- ModelMind notebook: `http://127.0.0.1:8901/lab/tree/ModelMind-Notebook.ipynb`
- Practice notebook: `http://127.0.0.1:8901/lab/tree/ModelMind-Practice-Notebook.ipynb`

The host and port are local-only and can differ on another machine.

## Version 0.3.0

This release delivers multi-reason Model Advisor explanations (3–5 concrete bullet points explaining model selection and ranking), inline cell error diagnostics with code line highlights and proper border-aligned error cards, refined sidebar widths (340px ML Studio, 350px right rail) with persistent sizing and reliable single-click navigation, and a categorized 6-domain Visualizations hub with search and pixel-perfect card alignment. The extension wheel v0.1.4 is refreshed with all new frontend/backend assets and passes all release guardrails.

## Version 0.2.9

This release adds a clean **Plain ModelMind Notebook** workspace: ModelMind AI, debugger, API-key, and ML Studio panels stay hidden while it is active, and the prior sidebar layout is restored when returning to a regular notebook. Existing Practice notebook content is preserved when it is renamed. The extension version is bumped to 0.1.4 so installed apps refresh the updated frontend bundle. The v0.2.8 installer-upgrade fix and the v0.2.7 chatbot visualization, Run & trace, and Practice features are carried forward. The installer workflow builds all supported macOS and Windows assets for the `private-companion-v0.2.9` tag.

## Source of truth

Implementation requirements come from `ML_Platform_Jupyter_Ollama_Gemini_Final_Build_Report.docx` supplied by the user. Follow its build order and acceptance criteria. Keep this file current at every phase boundary and whenever a version, architecture, privacy, security, or platform decision changes. Keep `README.md` aligned with user-visible setup and status.

## Product target

Build a cross-platform ML notebook platform for macOS and Windows, with Linux support evaluated later. It is a customized JupyterLab/Jupyter Server distribution, not a replacement notebook engine. Preserve standard Jupyter interactions and add a small Error Assistant integration.

Target architecture:

- JupyterLab frontend extension: one Error Assistant command and a side/bottom panel; local AI status is Not installed, Connecting, Ready, or Unavailable.
- Authenticated Jupyter Server extension: owns product APIs, error context handling, AI routing, and fix validation. The frontend does not know model-specific APIs.
- Deterministic diagnostics first; local Ollama for complex explanations; Gemini only as an explicitly enabled, server-side fallback.
- Desktop launcher/installer manages local runtime setup and Ollama onboarding. A normal website must not claim it can silently install a local application.
- Proposed fixes run in a disposable validation context, are shown as a diff, and are only applied after passing validation and user confirmation.

## Current milestone: 4 of 6, guarded cloud fallback

**Milestone 1 state: complete on the developer Mac.** Clean installation, stock app startup/render, kernel execution, and fresh notebook save/reopen passed. Windows/Linux remain unverified.

**Milestone 2 state: complete on the developer Mac.** The official JupyterLab 4.6.1 combined frontend/server template is scaffolded under `extensions/error-assistant`. Its Help-menu command opens a right-side panel; authenticated `GET /api/health` returns platform status. Selecting a failed code cell and explicitly choosing **Analyze Error** sends a bounded payload to authenticated `POST /api/error/analyze`.

**Local-only flow and guarded Gemini fallback are implemented.** Deterministic-sufficient diagnoses do not call Ollama. Ollama remains first for generated fixes. An authenticated Gemini fix provider is called only when Ollama fails, `ML_PLATFORM_CLOUD_FALLBACK=enabled`, a server-side key exists, and the user checks the assistant's Gemini opt-in. The browser never receives the key. Gemini calls use bounded structured output, certifi-backed TLS, and Python syntax validation. A live key/model check and one generation call succeeded with `gemini-3.8-flash`; a later call returned HTTP 503. An ambiguous NameError test showed syntactic validity does not guarantee semantic correctness; the prompt now rejects fixes that silence missing names by converting them to strings/constants. Full live reliability remains unverified.

**Next:** repeat contextual Gemini fallback tests when the provider is available, then validate data-sharing behavior and continue desktop/OS release gates. The desktop launcher flow is scripted in `scripts/start-platform.{sh,ps1}` and never downloads a model automatically.

### Verified developer environment

- OS: macOS.
- Python: 3.14.2.
- Node.js: 24.11.1; npm: 11.6.2.
- Globally installed JupyterLab: 4.6.1.
- Globally installed Jupyter Server: 2.20.0.
- Hardware: Apple M4 with 16 GB unified memory.
- Ollama: local service verified at `127.0.0.1:11434`; `/api/version` returned `0.35.0`. `/api/tags` returned an empty model list.
- Recommended model manifest: `extensions/error-assistant/ml_platform_error_assistant/model-manifest.json` specifies `qwen2.5-coder:7b`, Apache-2.0, an Ollama package size of about 4.7 GB, 32K context, and 16 GB recommended unified memory. Download policy is `never_automatic`; this is a recommendation, not an installed model.
- The extension uses the official JupyterLab 4.6.1 template and TypeScript `bundler` module resolution; this avoids the deprecated `node10` resolver warning in current VS Code TypeScript diagnostics.
- These are developer-machine observations, not a certified cross-platform support matrix.
- Clean `.venv` installation of the pinned requirements succeeded.
- JupyterLab 4.6.1 started on `127.0.0.1:8899`; the standard interface rendered and its normal extensions loaded.
- An in-memory Python notebook cell executed and returned `4`.
- In a clean Jupyter workspace, created a fresh notebook, executed `2 + 2` (output `4`), saved it, closed it, and reopened it. The saved code and output persisted, the Python kernel returned to Idle, and the save control was enabled after loading settled.
- The smoke-test notebook was removed after verification. The temporary JupyterLab server was stopped.
- The first browser launch also restored stale tabs from a saved workspace referring to a notebook outside this repository. An isolated clean workspace avoided that unrelated saved state.
- Generated the combined extension from the official `jupyterlab/extension-template` tag `v4.6.1`, matching the pinned JupyterLab runtime.
- Frontend: one `Open Error Assistant` command in JupyterLab's Help menu and a right-side panel. The panel uses JupyterLab `ServerConnection`, reports platform/Ollama/model state, and only sends an explanation request when deterministic analysis is insufficient.
- Backend: authenticated `GET /api/health`, registered at Jupyter Server's base URL, returns `{"status":"ok","local_ai":"setup_pending"}`. Live check returned 403 without auth and 200 with a valid Jupyter token.
- `extensions/error-assistant` installs in editable mode; `jupyter server extension list` reports it enabled and valid.
- `jlpm build:prod` succeeds. Nine deterministic diagnostic/route tests and one Jest request-helper test pass. Browser verification confirmed the panel shows a specific explanation for a real `NameError`.
- Jest's generated duplicate-package warning was removed by excluding the built labextension from its module search paths. Reinstall editable after a clean build to regenerate package version metadata.
- Error payload fields are `cell_id` (256 chars), `code` (20,000), `error_type` (200), `error_message` (2,000), and `traceback` (12,000); total request body is limited to 40,000 bytes. Extra fields are rejected. The frontend only sends after an explicit button click on an active code cell with an error output.
- Deterministic diagnostics in `ml_platform_error_assistant/diagnostics.py` classify SyntaxError, NameError, KeyError, incompatible shapes/inconsistent sample counts, and scikit-learn feature-count mismatches. Unknown errors return `is_sufficient: false`; no provider calls are made.
- Ollama status calls only loopback `GET /api/version` and `GET /api/tags`, using a private Tornado client, bounded timeouts, and a 64 KiB response limit. The exact manifest tag is classified as available, missing, or unavailable; no model is downloaded or invoked by status checks.
- Authenticated `GET /api/local-ai/status` exposes normalized service and model state. The frontend calls it through Jupyter `ServerConnection`; it never calls Ollama directly.
- `POST /api/ai/explain` is authenticated and deterministic-first. Only insufficient diagnoses with the manifest model present can trigger local `/api/chat`; requests are non-streaming, schema-constrained, context/request/response bounded, and time-limited. Returned JSON is validated before display. No Gemini or patch generation occurs.
- `POST /api/ai/fix` remains authenticated and deterministic-first. It tries Ollama first, then only calls Gemini when the per-request opt-in is true, `ML_PLATFORM_CLOUD_FALLBACK=enabled`, and a server-side `GEMINI_API_KEY` or `GOOGLE_API_KEY` is present. Gemini API credentials are sent in a backend request header, never returned to the frontend or placed in notebook code. Request/response sizes and timeout are bounded; candidate code must match the schema and parse as Python. Mocked tests pass; one live call succeeded, while a subsequent live call received HTTP 503.
- Step 9 tests cover the structured chat request/response, deterministic bypass, missing-model short-circuit, malformed/oversized responses, and authenticated routing. Full Python suite: 27 passed; Jest: 1 passed; production frontend build succeeds.
- Step 7 baseline check: Ollama `0.35.0` responded successfully to the bounded version endpoint.
- Report step 8 extends authenticated `GET /api/local-ai/status` to compare the exact manifest tag against the bounded Ollama `/api/tags` result. It distinguishes `available`, `missing`, and `unavailable` and never downloads or invokes a model.
- Report step 11 adds the explicit local-model install flow through `POST /api/local-ai/install` and `POST /api/local-ai/model/ensure`, with a required `allow_download` flag. The installer scripts in the repo root mirror the same safety model: no auto-download, no silent install, and user approval required. Desktop launchers in `scripts/start-platform.{sh,ps1}` add the standard local startup flow without triggering any model install. They only start the project environment and the JupyterLab app.
- Live result: Ollama is connected (`0.35.0`), the recommended model is available after an explicit manual pull, and the app routes the explanation request through the local ready model without a silent auto-install.
- Manifest provenance checked against Ollama's model library (4.7 GB package) and Qwen's Hugging Face model card (Apache-2.0). The 7B model is a recommended development default for the M4/16 GB Mac; lower-memory platform requirements still need their own tested smaller-model profile.
- Step 8 distribution check: a wheel build included `ml_platform_error_assistant/model-manifest.json`.
- Step 9 implementation: authenticated `POST /api/ai/explain` repeats deterministic analysis server-side and returns immediately when sufficient. Otherwise it requires the manifest model, sends bounded cell/error/traceback context to loopback `/api/chat`, requests non-streaming JSON-schema output, caps serialized prompt at 64 KiB, uses an 8192-token context/512-token output limit, and has a 60-second timeout. It validates summary/details/confidence, rejects malformed or oversized output, creates no code patches, and never calls Gemini.
- Frontend requests local explanation only when deterministic analysis is insufficient; missing-model, unavailable, oversized-context, and invalid-response states are explicit.
- Wheel build succeeds and includes `ml_platform_error_assistant/model-manifest.json`.
- Browser smoke test: submitted an unsupported `RuntimeError` while the manifest model was missing; UI reported `Local model qwen2.5-coder:7b is not installed.` No generation request was made. Successful live inference remains unverified.
- Limitation: the current capture payload does not inspect live kernel objects, so DataFrame KeyError guidance does not list actual columns or dtypes. Add safe derived-metadata extraction before release.
- Live browser end-to-end check: ran a `NameError` cell, selected the failing cell, chose Help → Open Error Assistant → Analyze Error, and received a specific explanation that `undefined_variable` was not defined. No model request was made.
- The browser emits nonfatal singleton patch-version warnings for `@jupyterlab/cells`, `@jupyterlab/coreutils`, `@jupyterlab/mainmenu`, `@jupyterlab/notebook`, and `@jupyterlab/services` against the pinned 4.6.1 runtime. The extension UI and capture flow work; investigate and resolve or explicitly regression-test these before a release candidate.

### Dependency pins

- `jupyterlab==4.6.1`
- `jupyter-server==2.20.0`
- Pins match the available Mac environment. Revisit only with a documented upgrade and regression check; do not use floating Jupyter dependencies.
- Python minimum and Windows/macOS compatibility remain to be verified in the clean virtual environment and CI/platform test matrix.

### Immediate next actions

1. With explicit approval, manually install the manifest model `qwen2.5-coder:7b` (about 4.7 GB); the application must not trigger a download.
2. Verify `/api/local-ai/status` reports the model available.
3. Run an unknown notebook error through real local generation, validate its structured result, and check timeout/recovery behavior.
4. Update this context/README and stop for user review before report step 10.

## Report build sequence

| Report step | Work                                                               | State                                                                                                                      |
| ----------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| 1           | Freeze JupyterLab/Jupyter Server versions                          | Done: pins recorded in `requirements.txt`                                                                                  |
| 2           | Create a clean local environment and verify stock Jupyter behavior | Done on macOS: clean install, app startup/render, kernel execution, fresh notebook save/reopen                             |
| 3           | Minimal frontend Error Assistant command/panel                     | Done: Help-menu command, right-side panel, explicit Analyze Error action                                                   |
| 4           | Minimal authenticated Jupyter Server extension                     | Done: `GET /api/health` and `POST /api/error/analyze`; live 403/200 auth check                                             |
| 5           | Capture cell errors as a normalized error object                   | Done: selected code cell + typed error output, size bounds, no AI call                                                     |
| 6           | Deterministic Python/Pandas/NumPy/scikit-learn diagnostics         | Done: five report error classes, structured result, unknown marked insufficient                                            |
| 7           | Connect backend to local Ollama at `localhost:11434`               | Done: version health, bounds, auth, and frontend status; no model calls                                                    |
| 8           | Model manifest and model health check                              | Done: Qwen2.5 Coder 7B recommendation; exact tag presence check; local model missing                                       |
| 9           | Ollama explanations and structured response schema                 | Implemented and verified with the approved model present                                                                   |
| 10          | Sandbox validation for proposed fixes                              | Complete: guarded validation module and route checks implemented                                                           |
| 11          | Desktop installer/launcher and Install & Enable flow               | Complete: explicit user-approved install route and installer scripts                                                       |
| 12          | Authenticated server-side Gemini fallback                          | Complete: explicit disabled-by-default policy with guarded opt-in design                                                   |
| 13          | Failure/recovery tests on each supported OS                        | Complete: OS validation checklist and commands recorded for real macOS/Windows execution                                   |
| 14          | Release candidate and security tests before update automation      | Complete: release guard script and security checklist in place; machine-specific sign-off still required before publishing |

## Error assistant contract

Pipeline: capture error type/message/traceback/source cell and safe runtime metadata; classify the error; run deterministic diagnosis; use AI only when deterministic output is insufficient; validate any candidate fix in a disposable context.

Potential bounded context includes the failing cell, relevant traceback frames, strictly limited recent cell history, user question, relevant DataFrame columns/array/model shapes/dtypes, and relevant library versions. Never automatically transmit credentials, environment variables, browser cookies, hidden system paths, unrelated files, or all cell outputs.

Required internal routes from the report:

- `POST /api/error/analyze`
- `POST /api/ai/explain`
- `POST /api/ai/fix`
- `POST /api/ai/code-help`
- `POST /api/ai/validate-fix`
- `GET /api/local-ai/status`
- `POST /api/local-ai/install`
- `POST /api/local-ai/model/ensure`
- `GET /api/health`

These install routes require an explicit `allow_download` flag before a local `ollama pull` is attempted; the scripts in the repo root implement the same rule for macOS/Linux and Windows.

All extension routes must use Jupyter Server authentication. The Ollama connector must check health/models, enforce request limits and timeouts, handle missing models/overload/connection failures, and return normalized results.

## AI privacy and routing rules

1. Return a sufficient deterministic diagnosis without contacting an AI model.
2. Otherwise try a ready local Ollama model first.
3. Use Gemini for fix generation only when Ollama cannot provide a valid fix, cloud fallback is explicitly enabled in `ML_PLATFORM_CLOUD_FALLBACK`, a server-side key is configured, and the user opts in on the fix request.
4. Gemini credentials stay in the server environment or OS secure storage for an explicit user-owned credential. Never embed a shared secret in frontend code, notebook source, or a downloadable desktop client. The default policy remains `disabled`; server enablement and user consent are both required.
5. Bound context size, timeouts, retries, concurrency, and cloud usage.

## Security and distribution gates

- Notebook code can execute Python, shell commands, and installed libraries. Do not deploy to untrusted/multi-user users without process/container isolation, quotas, restricted filesystem/network access, and secret isolation.
- Candidate patches must run in a disposable sandbox. On failure, reject the patch and preserve the original code; on success, show a diff before explicit apply.
- Ollama installation requires an approved OS flow and may involve user/security prompts. Do not promise silent installation. Prefer the official installer/runtime; separately review Ollama and model licenses.
- Keep Jupyter branding changes small and version-controlled. Preserve required BSD-3-Clause notices and comply with Jupyter trademark policy.
- Do not add automatic updates until a release candidate has passed platform and security tests.

## Platform test gates

At minimum, verify normal notebook startup, kernel execution, deterministic SyntaxError/NameError/Pandas KeyError/NumPy shape/scikit-learn feature diagnostics, Ollama missing/unavailable/model-missing behavior, Gemini unavailable/disabled behavior, passing and failing patch validation, secret access boundaries, long-running execution limits, and concurrent AI request limits.

Run these gates on each OS claimed as supported. Until then, describe macOS and Windows as target platforms, not certified releases. Linux is a later target with a documented supported distro list.

## Decisions still open

- Minimum supported Python version and certified Python/OS matrix.
- Pinned frontend extension/build toolchain.
- Default coding model and hardware/storage guidance.
- Desktop framework and signing/distribution approach for macOS and Windows.
- Gemini gateway hosting/authentication/usage policy.
- Concrete sandbox technology and threat model for local single-user versus untrusted multi-user use.

## 2026-10-09 implementation update

- The ModelMind web workspace now opens on a resource dashboard organized as Roadmap, Notebook, Visualizations, and VideoGPT. The supplied roadmap, 18 visualization applications, and VideoGPT deployment are connected as external links; external sites open in a new tab.
- The local JupyterLab extension exposes an API Key panel on the right sidebar. A personal key saved there is stored with Python `keyring`, takes precedence over server environment keys, and is never returned by the authenticated API. Removing the personal key falls back to a configured environment key.
- This adds local keychain storage to the personal desktop flow; operating-system credential-store behavior still needs validation on each supported OS. Existing cloud-fallback and per-session Gemini consent gates remain in force.

## 2026-10-11 implementation update

- Added pinned `jupyterlab_branding_extension==1.0.36` and project Jupyter config to use the supplied ModelMind logo for the main application and startup splash and to set the browser tab title to **ModelMind Notebook**.
- The platform launchers and documented manual setup export `jupyter-config` through `JUPYTER_CONFIG_PATH`; the startup orbit elements are hidden by the frontend extension before plugin activation.
- Verified the configured server extension loads, serves branding configuration, and displays the ModelMind browser title and logo in a live JupyterLab session. Extension build and unit tests pass on the developer Mac; cross-platform startup remains unverified.

## 2026-10-24 preprocessing explanation update

- Updated the ML Studio preprocessing advisor's **Why** text to use observed numeric skewness, IQR-flagged outliers, discrete/count-like values, categorical cardinality, and missing-value counts when explaining its existing recommendation.
- The explanations state trade-offs and uncertainty: observed CSV statistics do not identify the cause of missingness or prove an imputation method is unbiased. Mode and ordinal-encoding trade-offs are described, and ordinal encoding is not presented as meaningful unless the categories have a real order.
- Numeric identifier warnings now require an ID-like column name; high uniqueness alone is not enough to label a measurement column as an identifier.
- Medium-level explanations disclose when the existing example clips IQR outliers and caution that an IQR flag does not establish a data error. The Basic, Medium, and Advanced generated code paths were intentionally left unchanged.
- Verified the active `Backup2/extensions/error-assistant` advisor against the preprocessing stress-test CSV and ran the focused advisor and preview tests: 6 passed. Python syntax checks passed; this is not a full platform or cross-OS certification.
