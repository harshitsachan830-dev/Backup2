export interface TraceSnapshot {
  line: number;
  variables: Record<string, string>;
}

export interface LoopTraceSummary {
  line: number;
  header: string;
  visits: Array<{ eventIndex: number; visitNumber: number }>;
  capturedVariables: string[];
}

/** Find the innermost source loop containing the selected trace line. */
export function summarizeLoopTrace(
  source: string,
  events: TraceSnapshot[],
  activeEventIndex: number
): LoopTraceSummary | null {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const active = events[activeEventIndex];
  if (!active) return null;

  const indentOf = (text: string): number => text.match(/^[ \t]*/)?.[0].replace(/\t/g, '    ').length ?? 0;
  const candidates: Array<{ index: number; end: number }> = [];
  lines.forEach((line, index) => {
    if (!/^\s*(?:for|while)\b/.test(line) || line.replace(/^\s+/, '').startsWith('#')) return;
    const indent = indentOf(line);
    let end = lines.length;
    for (let next = index + 1; next < lines.length; next += 1) {
      if (lines[next].trim() && indentOf(lines[next]) <= indent) {
        end = next;
        break;
      }
    }
    if (active.line >= index + 1 && active.line < end + 1) candidates.push({ index, end });
  });

  const loop = candidates.sort((left, right) => right.index - left.index)[0];
  if (!loop) return null;
  const line = loop.index + 1;
  const header = lines[loop.index].trim().replace(/:\s*(?:#.*)?$/, '');
  const visits = events.reduce<Array<{ eventIndex: number; visitNumber: number }>>((found, event, eventIndex) => {
    if (event.line === line) found.push({ eventIndex, visitNumber: found.length + 1 });
    return found;
  }, []);
  const target = lines[loop.index].match(/^\s*for\s+([A-Za-z_]\w*)\s+in\b/);
  const capturedVariables = target && active.variables[target[1]] !== undefined
    ? [`${target[1]} = ${active.variables[target[1]]}`]
    : [];

  return { line, header, visits, capturedVariables };
}
