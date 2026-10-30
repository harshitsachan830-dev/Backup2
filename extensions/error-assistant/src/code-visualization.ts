/** Source-only visual summaries for the AI chatbot. This module never runs code. */
import { MODEL_VISUALIZATION_CATALOG } from './visualization-registry';

export type CodeVisualizationKind =
  | 'neural-network'
  | 'decision-tree'
  | 'clustering'
  | 'dimensionality-reduction'
  | 'pipeline'
  | 'algorithm'
  | 'code-flow';

export interface CodeVisualizationStep {
  title: string;
  detail: string;
  line?: number;
  indent?: number;
}

export interface CodeVisualizationLayer {
  label: string;
  units: number | null;
}

export interface CodeSourceOverlay {
  id: string;
  title: string;
  summary: string;
  steps: CodeVisualizationStep[];
}

export interface CodeVisualizationSpec {
  kind: CodeVisualizationKind;
  title: string;
  summary: string;
  steps: CodeVisualizationStep[];
  layers?: CodeVisualizationLayer[];
  sourceFacts: string[];
  limits: string[];
  sourceNote: string;
  category?: string;
  sourceOverlays?: CodeSourceOverlay[];
}

function lineFor(code: string, pattern: RegExp): number | undefined {
  const lines = code.split(/\r?\n/);
  const index = lines.findIndex(line => pattern.test(line));
  return index < 0 ? undefined : index + 1;
}

function sourceValue(code: string, name: string): string | undefined {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = code.match(new RegExp(`\\b${escaped}\\s*=\\s*(\\([^)]*\\)|[^,\\n)]+)`));
  return match?.[1]?.trim();
}

function literalInteger(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/^\(?\s*(\d+)\s*\)?$/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function literalIntegerList(value: string | undefined): number[] {
  if (!value) return [];
  const numbers = value.match(/\d+/g)?.map(Number) ?? [];
  return numbers.length && numbers.every(number => Number.isSafeInteger(number) && number > 0)
    ? numbers.slice(0, 5)
    : [];
}

function namedPipelineSteps(code: string): string[] {
  const tupleNames = (block: string): string[] => {
    const names: string[] = [];
    const pattern = /\(\s*['"]([^'"]+)['"]\s*,/g;
    let item: RegExpExecArray | null;
    while ((item = pattern.exec(block)) && names.length < 7) names.push(item[1]);
    return names;
  };
  const branches = code.match(/transformers\s*=\s*\[([\s\S]*?)\]/);
  const outerBranches = branches ? tupleNames(branches[1]) : [];
  const innerSteps: string[] = [];
  const pipelineStepBlocks = /steps\s*=\s*\[([\s\S]*?)\]/g;
  let item: RegExpExecArray | null;
  while ((item = pipelineStepBlocks.exec(code)) && innerSteps.length < 7) {
    innerSteps.push(...tupleNames(item[1]).slice(0, 7 - innerSteps.length));
  }
  const stages = [...outerBranches, ...innerSteps];
  return stages.length ? stages.slice(0, 7) : tupleNames(code).slice(0, 7);
}

function sourceLineForStage(code: string, name: string): number | undefined {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return lineFor(code, new RegExp(`[\\"']${escaped}[\\"']\\s*,`));
}

function genericFlow(code: string): CodeVisualizationSpec {
  const rows = code.split(/\r?\n/);
  const steps: CodeVisualizationStep[] = [];
  rows.forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    let title = 'Python statement';
    let detail = 'The expression is evaluated in the current program state.';
    if (/^(?:from\s+\S+\s+import|import)\b/.test(line)) {
      title = 'Load dependency'; detail = 'Makes a module or selected names available to later code.';
    } else if (/^(?:async\s+)?def\s+/.test(line)) {
      title = 'Define function'; detail = 'Creates a reusable function; its body runs when the function is called.';
    } else if (/^class\s+/.test(line)) {
      title = 'Define class'; detail = 'Declares a type and its behavior; instances are created separately.';
    } else if (/^(?:if|elif|else|try|except|finally)\b/.test(line)) {
      title = 'Choose a path'; detail = 'The runtime condition or outcome determines which indented block runs.';
    } else if (/^(?:for|while|async\s+for)\b/.test(line)) {
      title = 'Repeat a block'; detail = 'The indented body may run repeatedly; the actual number of passes depends on runtime values.';
    } else if (/\.(?:read_csv|read_parquet|read_excel)\s*\(/.test(line) || /\bread_csv\s*\(/.test(line)) {
      title = 'Load data'; detail = 'Reads a table from the source named in this call; the file contents are not inspected here.';
    } else if (/\.(?:fit|fit_transform)\s*\(/.test(line)) {
      title = 'Fit / learn'; detail = 'Requests that the estimator or transformer learn from the supplied data.';
    } else if (/\.(?:predict|predict_proba)\s*\(/.test(line)) {
      title = 'Predict'; detail = 'Requests predictions from the estimator; no prediction is computed by this preview.';
    } else if (/\.(?:transform|impute|scale|encode)\s*\(/.test(line)) {
      title = 'Transform features'; detail = 'Applies a data-preparation step to its input.';
    } else if (/\.(?:plot|hist|bar|scatter|show|savefig)\s*\(/.test(line)) {
      title = 'Create visualization'; detail = 'Builds or displays a chart when the line is executed.';
    } else if (/^return\b/.test(line)) {
      title = 'Return value'; detail = 'Exits the current function and passes a value to its caller.';
    } else if (/^print\s*\(|^display\s*\(/.test(line)) {
      title = 'Show output'; detail = 'Writes a value to notebook output when the line runs.';
    } else if (/^[\w.\[\]]+\s*(?:[+\-*/]?=)/.test(line)) {
      title = 'Set or update value'; detail = 'Evaluates the right-hand expression and stores it in a name or location.';
    }
    steps.push({ title, detail, line: index + 1 });
  });

  const visible = steps.slice(0, 7);
  if (steps.length > visible.length) {
    visible.push({ title: 'More source code', detail: `${steps.length - 7} additional nonblank statement(s) are omitted from this compact overview.` });
  }
  if (!visible.length) {
    visible.push({ title: 'Selected source', detail: 'This cell has no recognizable executable statements to arrange into a flow.' });
  }

  return {
    kind: 'code-flow',
    title: 'Selected-cell code flow',
    summary: 'A static, line-ordered overview of recognizable Python statements.',
    steps: visible,
    sourceFacts: steps.slice(0, 5).map(step => `Line ${step.line}: ${step.title.toLowerCase()} — ${step.detail}`),
    limits: ['This preview does not execute the cell, read local files, or compute runtime values.'],
    sourceNote: 'This is a source-code reading aid. Conditions, loop counts, values, and outputs depend on execution and are not inferred.'
  };
}

function buildSourceOverlays(source: string): CodeSourceOverlay[] {
  const lines = source.split(/\r?\n/);
  const overlays: CodeSourceOverlay[] = [];
  const indentOf = (line: string): number => line.match(/^\s*/)?.[0].replace(/\t/g, '    ').length ?? 0;
  const structure: CodeVisualizationStep[] = [];
  lines.forEach((raw, index) => {
    const text = raw.trim();
    if (!text || text.startsWith('#')) return;
    const match = text.match(/^(if|elif|else|for|while|try|except|finally|with|def|async\s+def|return|break|continue)\b(.*)/);
    if (!match) return;
    const keyword = match[1].replace(/\s+/g, ' ');
    const depth = Math.min(8, Math.floor(indentOf(raw) / 4));
    const roles: Record<string, string> = {
      if: 'Condition', elif: 'Alternative condition', else: 'Alternate branch', for: 'Loop', while: 'Loop',
      try: 'Protected block', except: 'Error branch', finally: 'Cleanup branch', with: 'Context block',
      def: 'Function', 'async def': 'Async function', return: 'Return', break: 'Loop exit', continue: 'Next iteration'
    };
    structure.push({ title: `${roles[keyword] ?? 'Statement'}${match[2] ? ` · ${match[2].trim().replace(/:$/, '')}` : ''}`, detail: 'Read from the source line; this map does not evaluate conditions or choose a runtime path.', line: index + 1, indent: depth });
  });
  if (structure.length) {
    overlays.push({
      id: 'C01',
      title: 'Control-flow outline',
      summary: 'Branch, loop, function, and exit statements in source order, nested by indentation. This is a structural outline, not an executed path.',
      steps: structure.slice(0, 24)
    });
  }

  const functionDefs: Array<{ name: string; start: number }> = [];
  const definitionPattern = /^[ \t]*(?:async[ \t]+)?def[ \t]+(\w+)[ \t]*\(/gm;
  let definition: RegExpExecArray | null;
  while ((definition = definitionPattern.exec(source)) !== null) {
    functionDefs.push({ name: definition[1], start: definition.index });
  }
  const recursive: CodeVisualizationStep[] = [];
  functionDefs.forEach(({ name, start }) => {
    const startLine = source.slice(0, start).split(/\r?\n/).length;
    const defIndent = indentOf(lines[startLine - 1] ?? '');
    let endLine = lines.length;
    for (let index = startLine; index < lines.length; index += 1) {
      if (lines[index].trim() && indentOf(lines[index]) <= defIndent) { endLine = index; break; }
    }
    const body = lines.slice(startLine, endLine).join('\n').replace(/^\s*#.*$/gm, '');
    const callPattern = new RegExp(`\\b${name}\\s*\\(`);
    const callLine = body.split(/\r?\n/).findIndex(line => callPattern.test(line));
    if (callLine >= 0) recursive.push({ title: `${name}() calls itself`, detail: 'A recursive call is present in the function body. Recursion depth, termination, and returned values depend on runtime input.', line: startLine + callLine + 1 });
  });
  if (recursive.length) {
    overlays.push({ id: 'C05', title: 'Recursive-call structure', summary: 'Self-calls found by matching function names in their source bodies; no call tree is executed or inferred.', steps: recursive.slice(0, 8) });
  }

  const arraySteps: CodeVisualizationStep[] = [];
  lines.forEach((raw, index) => {
    if (/\b(?:reshape|transpose|ravel|flatten|stack|concatenate|vstack|hstack|array|asarray)\s*\(|\.shape\b/.test(raw) && !raw.trim().startsWith('#')) {
      arraySteps.push({ title: 'Array or shape operation', detail: raw.trim().slice(0, 150), line: index + 1 });
    }
  });
  if (arraySteps.length) {
    overlays.push({ id: 'C07', title: 'Array and shape operations', summary: 'Source operations that create, reshape, combine, or inspect array dimensions. Actual dimensions appear only when values are inspected at runtime.', steps: arraySteps.slice(0, 12) });
  }

  const sortSteps: CodeVisualizationStep[] = [];
  lines.forEach((raw, index) => {
    if (/\bsorted\s*\(|\.sort\s*\(/.test(raw) && !raw.trim().startsWith('#')) {
      sortSteps.push({ title: 'Sorting operation', detail: 'A built-in sorted() call or in-place .sort() call appears in the source; no values are sorted by this preview.', line: index + 1 });
    }
  });
  if (sortSteps.length) {
    overlays.push({ id: 'C10', title: 'Sorting source map', summary: 'Sorting call sites are identified. A before/after animation requires actual input values and an explicit run.', steps: sortSteps.slice(0, 8) });
  }

  const binarySearch: CodeVisualizationStep[] = [];
  lines.forEach((raw, index) => {
    if (/\bbisect_(?:left|right)\s*\(|\bbinary_search\s*\(/.test(raw) && !raw.trim().startsWith('#')) {
      binarySearch.push({ title: 'Binary-search operation', detail: 'A bisect or explicitly named binary_search call appears in the source; the searched values and result are not evaluated here.', line: index + 1 });
    }
  });
  if (binarySearch.length) {
    overlays.push({ id: 'C11', title: 'Binary-search source map', summary: 'Recognized search calls are shown with their source locations; no sortedness or search result is assumed.', steps: binarySearch.slice(0, 8) });
  }

  const loopLines: Array<{ line: number; depth: number }> = [];
  lines.forEach((raw, index) => {
    if (/^(?:\s*)(?:for|while)\b/.test(raw)) loopLines.push({ line: index + 1, depth: indentOf(raw) });
  });
  if (loopLines.length) {
    const maxDepth = Math.max(...loopLines.map(item => item.depth));
    overlays.push({
      id: 'C12',
      title: 'Complexity cues',
      summary: 'Static hints only. Input sizes, early exits, called functions, and runtime values are not known, so this view does not assign a Big-O bound.',
      steps: [
        { title: `${loopLines.length} loop header(s)`, detail: maxDepth >= 4 ? 'At least one loop is nested inside another loop by source indentation; this can increase work as input grows, but does not establish a bound.' : 'A loop is present; its iteration count depends on its iterable or stopping condition.', line: loopLines[0].line },
        ...(recursive.length ? [{ title: 'Recursive call(s) also present', detail: 'Recurrence cost cannot be established without input-size progress and a termination condition.' }] : []),
        ...(sortSteps.length ? [{ title: 'Sorting call(s) also present', detail: 'Sorting cost depends on the number of elements and the selected implementation.' }] : [])
      ]
    });
  }

  return overlays;
}

/** Build a conservative visualization from source text; never imports, evaluates, or executes it. */
function buildCodeVisualization(code: string): CodeVisualizationSpec {
  const source = code.slice(0, 3000);
  const mlp = source.match(/\bMLP(?:Classifier|Regressor)\b/);
  if (mlp) {
    const hiddenSizes = literalIntegerList(sourceValue(source, 'hidden_layer_sizes'));
    const layers: CodeVisualizationLayer[] = [
      { label: 'Input features', units: null },
      ...(hiddenSizes.length
        ? hiddenSizes.map((units, index) => ({ label: `Hidden ${index + 1}`, units }))
        : [{ label: 'Hidden layer(s)', units: null }]),
      { label: 'Output', units: null }
    ];
    return {
      kind: 'neural-network',
      title: 'Neural-network architecture in source',
      summary: `${mlp[0]} is declared in this cell. The diagram shows layer flow; the input/output widths are unknown unless the fitted model is inspected.`,
      layers,
      steps: [{ title: 'Source declaration', detail: `${mlp[0]} appears in the selected code.`, line: lineFor(source, /\bMLP(?:Classifier|Regressor)\b/) }],
      sourceFacts: [
        `${mlp[0]} is named in the selected source.`,
        ...(hiddenSizes.length ? [`The literal hidden_layer_sizes setting is (${hiddenSizes.join(', ')}).`] : [])
      ],
      limits: ['This source preview does not show fitted weights, activations, predictions, or measured accuracy.'],
      sourceNote: hiddenSizes.length
        ? `Hidden-layer sizes ${hiddenSizes.join(' → ')} were read from the literal hidden_layer_sizes setting. No weights, learned activations, or predictions are shown.`
        : 'No literal hidden_layer_sizes value was found. Layer widths, learned weights, activations, and predictions are not shown.'
    };
  }

  if (/\bDecisionTree(?:Classifier|Regressor)\b/.test(source)) {
    const isRegression = /\bDecisionTreeRegressor\b/.test(source);
    return {
      kind: 'decision-tree',
      title: 'Decision-tree concept in source',
      summary: `The code declares a ${isRegression ? 'regression' : 'classification'} decision tree.`,
      steps: [
        { title: 'Input features', detail: 'The estimator receives feature rows when fit or predict is called.' },
        { title: 'Feature test', detail: 'A fitted tree learns a feature and threshold for each split; this source preview does not invent either.' },
        { title: isRegression ? 'Numeric estimate' : 'Class decision', detail: 'A leaf returns the learned value or class after the fitted path is followed.' }
      ],
      sourceFacts: [`The selected source names a ${isRegression ? 'DecisionTreeRegressor' : 'DecisionTreeClassifier'}.`],
      limits: ['The diagram is conceptual; learned feature tests, thresholds, branches, and leaf values require a fitted-model inspection.'],
      sourceNote: 'Branch structure is conceptual. For real split names, thresholds, samples, and leaf outputs, use Visualize Tree after fitting the model in the notebook kernel.'
    };
  }

  if (/\bKMeans\b/.test(source)) {
    const clusters = literalInteger(sourceValue(source, 'n_clusters'));
    return {
      kind: 'clustering',
      title: 'K-means workflow in source',
      summary: clusters === null
        ? 'The code references KMeans; the number of clusters is not a visible positive integer literal.'
        : `The source sets n_clusters=${clusters}. This is a configured value, not a measured cluster result.`,
      steps: [
        { title: 'Feature rows', detail: 'KMeans receives numeric observations as input.' },
        { title: clusters === null ? 'Choose k' : `Initialize ${clusters} centroids`, detail: 'Centroid positions depend on the data and initialization at fit time.' },
        { title: 'Assign points', detail: 'Each row is assigned to its nearest current centroid.' },
        { title: 'Update and repeat', detail: 'Centroids are recomputed until the stopping rule is met.' }
      ],
      sourceFacts: [
        'The selected source references KMeans.',
        ...(clusters === null ? [] : [`The source sets n_clusters=${clusters}; this is configuration, not a measured result.`])
      ],
      limits: ['No centroids, assignments, cluster sizes, or inertia are calculated by this preview.'],
      sourceNote: 'No points, centroid positions, labels, or inertia are computed by this static preview.'
    };
  }

  if (/\bPCA\b/.test(source) && !/\b(?:Pipeline|ColumnTransformer)\s*\(/.test(source)) {
    const components = sourceValue(source, 'n_components');
    const scaler = /\b(?:StandardScaler|RobustScaler|MinMaxScaler)\b/.test(source);
    return {
      kind: 'dimensionality-reduction',
      title: 'PCA workflow in source',
      summary: 'The selected code references principal-component analysis.',
      steps: [
        { title: 'Feature matrix', detail: 'PCA operates on numeric feature columns.' },
        ...(scaler ? [{ title: 'Scale features', detail: 'A scaler is also referenced in the selected source; whether it runs before PCA depends on the code path.' }] : []),
        { title: 'Find components', detail: components ? `The source sets n_components=${components}; inspect the fitted object for the realized component count.` : 'Principal directions are learned from the fitted input data.' },
        { title: 'Project rows', detail: 'Rows are represented in the selected component space when transform is called.' }
      ],
      sourceFacts: [
        'The selected source references PCA.',
        ...(components ? [`The source sets n_components=${components}.`] : [])
      ],
      limits: ['No fitted components, explained variance, loadings, or projected rows are calculated by this preview.'],
      sourceNote: 'No explained-variance values, component loadings, or transformed rows are fabricated; those require fitting and inspecting the estimator.'
    };
  }

  if (/\b(?:Pipeline|ColumnTransformer)\s*\(/.test(source)) {
    const names = namedPipelineSteps(source);
    const sourceFacts: string[] = [];
    const limits: string[] = [];
    if (names.length) {
      sourceFacts.push(`Named source stages, in branch-to-step order: ${names.join(' → ')}.`);
    }
    const branch = /\bColumnTransformer\s*\(/.test(source)
      ? source.match(/\(\s*['"]([^'"]+)['"]\s*,\s*([A-Za-z_]\w*)\s*,\s*\[([^\]]*)\]\s*\)/)
      : null;
    if (branch) {
      const columns: string[] = [];
      const columnPattern = /['"]([^'"]+)['"]/g;
      let columnMatch: RegExpExecArray | null;
      while ((columnMatch = columnPattern.exec(branch[3])) !== null) {
        columns.push(columnMatch[1]);
      }
      if (columns.length) {
        sourceFacts.push(`ColumnTransformer branch "${branch[1]}" routes ${columns.map(column => `"${column}"`).join(', ')} through "${branch[2]}".`);
      }
    }
    if (/\bPCA\s*\(/.test(source)) {
      sourceFacts.push('PCA is configured as a source stage; the named stage list preserves the order visible in the pipeline declaration.');
    }
    const splitCall = source.match(/\btrain_test_split\s*\(([^\n)]*)\)/);
    if (splitCall) {
      const splitLine = lineFor(source, /\btrain_test_split\s*\(/);
      sourceFacts.push(`${splitLine ? `Line ${splitLine}: ` : ''}train_test_split(${splitCall[1].trim()}) partitions inputs; it does not itself evaluate a model.`);
    }
    if (/\.fit_transform\s*\(\s*X_train\s*\)/.test(source)) {
      sourceFacts.push('The source calls preprocessor.fit_transform(X_train), which fits the preprocessing steps on the training input and transforms it when executed.');
    }
    if (/\.transform\s*\(\s*X_test\s*\)/.test(source)) {
      sourceFacts.push('The source calls preprocessor.transform(X_test), applying the already-fitted preprocessing steps to the test input when executed.');
    }
    if (/\bStandardScaler\s*\(/.test(source)) {
      sourceFacts.push('StandardScaler is configured; when fit, it centers and scales using statistics learned from its fit input. It does not remove skewness.');
    }
    if (/\bPowerTransformer\b/.test(source) && !/\bPowerTransformer\s*\(/.test(source)) {
      sourceFacts.push('PowerTransformer appears in an import but is not configured as a pipeline step in this source.');
    }
    if (!/\b(?:cross_val_score|accuracy_score|balanced_accuracy_score|mean_squared_error|classification_report)\s*\(|\.predict(?:_proba)?\s*\(|\.score\s*\(/.test(source)) {
      limits.push('No prediction or model-evaluation metric is computed in this cell.');
    }
    if (/missing|null|isna/i.test(source) && !/\.(?:isna|isnull)\s*\(/.test(source)) {
      limits.push('A missing-value comment or label is not a measured missing-value check in this source.');
    }
    limits.push('This preview does not read the CSV or calculate transformed values.');
    const steps = names.length
      ? names.map(name => ({ title: name, detail: 'Stage label read from a source tuple; outer column-transformer branches appear before nested pipeline steps.', line: sourceLineForStage(source, name) }))
      : [
          { title: 'Input columns', detail: 'The transformer receives the selected feature columns.' },
          { title: 'Transform stages', detail: 'Configured transformers run in the order defined by the source.' },
          { title: 'Estimator', detail: 'A final estimator consumes the transformed feature matrix when the pipeline is fit or called.' }
        ];
    return {
      kind: 'pipeline',
      title: 'Preprocessing pipeline in source',
      summary: names.length ? `Found ${names.length} named stage label(s) in the pipeline/transformer source. Pipeline steps follow source order; ColumnTransformer branches are shown as routing branches.` : 'The cell declares a scikit-learn pipeline or column transformer.',
      steps,
      sourceFacts: sourceFacts.length ? sourceFacts : ['A scikit-learn Pipeline or ColumnTransformer is declared in the selected source.'],
      limits,
      sourceNote: 'Pipeline step labels follow their source order. ColumnTransformer labels describe parallel column-routing branches, not a sequential order. This preview does not fit transformers, expose learned statistics, or prove that the pipeline is leakage-free.'
    };
  }

  const algorithm = [...MODEL_VISUALIZATION_CATALOG]
    .sort((left, right) => right.patterns.length - left.patterns.length)
    .find(definition => definition.requireAllPatterns
      ? definition.patterns.every(pattern => pattern.test(source))
      : definition.patterns.some(pattern => pattern.test(source)));
  if (algorithm) {
    const pattern = algorithm.patterns.find(candidate => candidate.test(source));
    const name = pattern ? source.match(pattern)?.[0]?.replace(/\s*\($/, '') ?? algorithm.name : algorithm.name;
    return {
      kind: 'algorithm',
      title: `${algorithm.name} concept in source`,
      summary: `The selected source references ${name}. The steps below describe the algorithm at a high level; they are not a record of this cell's execution.`,
      category: algorithm.category,
      steps: algorithm.process.map((detail, index) => ({
        title: ['Input or configuration', 'Fit or transform', 'Prediction or result'][index] ?? `Algorithm step ${index + 1}`,
        detail,
        line: pattern ? lineFor(source, pattern) : undefined
      })),
      sourceFacts: [`The selected source references ${name}.`, `ModelMind categorizes this visualization as ${algorithm.category}.`],
      limits: algorithm.limits,
      sourceNote: 'This conceptual view is based on estimator or algorithm names in the selected source. It does not show fitted parameters, dataset-specific behavior, or measured performance.'
    };
  }

  return genericFlow(source);
}

/** Add source-only overlays after building the primary view; this function never executes Python. */
export function createCodeVisualization(code: string): CodeVisualizationSpec {
  const source = code.slice(0, 3000);
  return { ...buildCodeVisualization(source), sourceOverlays: buildSourceOverlays(source) };
}
