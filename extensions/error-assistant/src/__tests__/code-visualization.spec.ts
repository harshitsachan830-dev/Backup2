import { createCodeVisualization } from '../code-visualization';
import { CODE_VISUALIZATION_OVERLAYS, getVisualizationLabel, MODEL_VISUALIZATION_CATALOG } from '../visualization-registry';

describe('source-grounded code visualizations', () => {
  it('keeps pipeline steps in source order and avoids claiming runtime results', () => {
    const result = createCodeVisualization(`
from sklearn.decomposition import PCA
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
workflow = Pipeline(steps=[
    ("scale", StandardScaler()),
    ("pca", PCA(n_components=2)),
])
`);

    expect(result.kind).toBe('pipeline');
    expect(result.steps.map(step => step.title)).toEqual(['scale', 'pca']);
    expect(result.sourceFacts).toContain('PCA is configured as a source stage; the named stage list preserves the order visible in the pipeline declaration.');
    expect(result.limits.join(' ')).toMatch(/does not read the CSV or calculate transformed values/i);
  });

  it('has a source-grounding entry for every report visualization and overlay', () => {
    expect(MODEL_VISUALIZATION_CATALOG).toHaveLength(25);
    expect(CODE_VISUALIZATION_OVERLAYS).toHaveLength(24);
    expect(new Set(MODEL_VISUALIZATION_CATALOG.map(item => item.id)).size).toBe(25);
    expect(new Set(CODE_VISUALIZATION_OVERLAYS.map(([id]) => id)).size).toBe(24);
  });

  it('resolves recommendation labels only for registered visualization IDs', () => {
    expect(getVisualizationLabel('pca')).toBe('PCA');
    expect(getVisualizationLabel('P04')).toBe('Pipeline and ColumnTransformer');
    expect(getVisualizationLabel('untrusted-model-output')).toBeUndefined();
  });

  it('describes a recognized algorithm without inventing fitted metrics', () => {
    const result = createCodeVisualization(`
from sklearn.linear_model import LogisticRegression
model = LogisticRegression(C=0.5)
`);

    expect(result.kind).toBe('algorithm');
    expect(result.title).toContain('Logistic Regression');
    expect(result.category).toBe('Classification');
    expect(result.limits.join(' ')).toMatch(/require model evaluation/i);
  });

  it('shows nested control-flow, recursion, and complexity cues from source only', () => {
    const result = createCodeVisualization(`
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

for item in values:
    for other in values:
        compare(item, other)
`);

    const flow = result.sourceOverlays?.find(overlay => overlay.id === 'C01');
    const recursion = result.sourceOverlays?.find(overlay => overlay.id === 'C05');
    const complexity = result.sourceOverlays?.find(overlay => overlay.id === 'C12');
    expect(flow?.steps.some(step => step.indent === 1 && step.title.startsWith('Return'))).toBe(true);
    expect(recursion?.steps[0].title).toContain('factorial() calls itself');
    expect(complexity?.steps[0].detail).toMatch(/does not establish a bound/i);
  });

  it('recognizes array, sorting, and binary-search source operations', () => {
    const result = createCodeVisualization(`
import numpy as np
from bisect import bisect_left
matrix = np.array(values).reshape(2, 3)
ordered = sorted(values)
position = bisect_left(ordered, target)
`);

    expect(result.sourceOverlays?.map(overlay => overlay.id)).toEqual(expect.arrayContaining(['C07', 'C10', 'C11']));
    expect(result.sourceOverlays?.find(overlay => overlay.id === 'C11')?.steps[0].line).toBe(6);
  });
});
