import { summarizeLoopTrace, TraceSnapshot } from '../trace-visualization';

describe('trace-backed loop visualization', () => {
  it('summarizes only captured visits and exposes the captured for-loop target', () => {
    const source = 'total = 0\nfor item in values:\n    total += item\nprint(total)';
    const events: TraceSnapshot[] = [
      { line: 1, variables: { total: '0' } },
      { line: 2, variables: { total: '0', item: '2' } },
      { line: 3, variables: { total: '2', item: '2' } },
      { line: 2, variables: { total: '2', item: '5' } },
      { line: 3, variables: { total: '7', item: '5' } },
      { line: 4, variables: { total: '7' } }
    ];

    expect(summarizeLoopTrace(source, events, 4)).toEqual({
      line: 2,
      header: 'for item in values',
      visits: [{ eventIndex: 1, visitNumber: 1 }, { eventIndex: 3, visitNumber: 2 }],
      capturedVariables: ['item = 5']
    });
  });

  it('selects the innermost containing loop and does not invent values for while loops', () => {
    const source = 'for row in rows:\n    while ready:\n        work(row)\n    finish(row)';
    const events = [{ line: 3, variables: { row: 'r1' } }];

    expect(summarizeLoopTrace(source, events, 0)).toEqual({
      line: 2,
      header: 'while ready',
      visits: [],
      capturedVariables: []
    });
  });

  it('returns no loop summary for a trace line outside loop blocks', () => {
    expect(summarizeLoopTrace('for item in values:\n    use(item)\nfinish()', [{ line: 3, variables: {} }], 0)).toBeNull();
  });
});
