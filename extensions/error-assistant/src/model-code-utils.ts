function parenthesisDelta(line: string): number {
  let depth = 0;
  let quote: string | null = null;
  let escaped = false;

  for (const character of line) {
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '(') {
      depth += 1;
    } else if (character === ')') {
      depth -= 1;
    }
  }

  return depth;
}

function getRaiseStatementEnd(lines: string[], start: number): number {
  let depth = 0;

  for (let index = start; index < lines.length; index += 1) {
    depth += parenthesisDelta(lines[index]);
    if (depth <= 0) {
      return index;
    }
  }

  return lines.length - 1;
}

export function removeModelAdvisorRaiseGuards(code: string): string {
  const lines = code.split('\n');
  const result: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const conditional = line.match(/^(\s*)if\b.*:\s*$/);
    const raiseIndex = index + 1;
    const raiseLine = lines[raiseIndex];
    const raiseIndent = raiseLine?.match(/^(\s*)raise\b/);

    if (
      conditional &&
      raiseIndent &&
      raiseIndent[1].length > conditional[1].length
    ) {
      index = getRaiseStatementEnd(lines, raiseIndex);
      continue;
    }

    if (raiseIndent) {
      let previousLine = result.length - 1;
      while (previousLine >= 0 && !result[previousLine].trim()) {
        previousLine -= 1;
      }

      const previousConditional =
        result[previousLine]?.match(/^(\s*)if\b.*:\s*$/);
      if (
        previousConditional &&
        previousConditional[1].length < raiseIndent[1].length
      ) {
        result.splice(previousLine);
      }

      index = getRaiseStatementEnd(lines, index);
      continue;
    }

    result.push(line);
  }

  return result.join('\n').replace(/\n{3,}/g, '\n\n');
}

export function normalizeModelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/regressor$/, 'regression')
    .replace(/classifier$/, 'classification');
}

export interface IAdvisorModelCode {
  name: string;
  code: string;
  defaultCode: string;
  tuned_code?: string;
  code_available?: boolean;
  tuned_configuration_applied?: boolean;
  tuned_params?: Record<string, unknown>;
  tuned_changes?: Array<{ parameter: string; default: unknown; recommended: unknown }>;
  tuned_score?: number | string;
  tuned_recommendation_status?: string;
  tuned_code_error?: string;
  refreshCode?: () => void;
}

export function resetTunedModelCode(models: IAdvisorModelCode[]): void {
  models.forEach(model => {
    model.code = model.defaultCode;
    delete model.tuned_code;
    model.code_available = Boolean(model.defaultCode);
    model.tuned_configuration_applied = false;
    delete model.tuned_params;
    delete model.tuned_changes;
    delete model.tuned_score;
    delete model.tuned_recommendation_status;
    delete model.tuned_code_error;
    model.refreshCode?.();
  });
}

export function applyTunedModelCode(
  models: IAdvisorModelCode[],
  results: unknown
): { updated: number; errors: string[] } {
  if (!Array.isArray(results)) {
    return { updated: 0, errors: [] };
  }

  let updated = 0;
  const errors: string[] = [];

  results.forEach(result => {
    if (!result || typeof result !== 'object') {
      return;
    }

    const item = result as {
      model?: unknown;
      code?: unknown;
      code_error?: unknown;
      best_params?: unknown;
      recommended_changes?: unknown;
      score?: unknown;
      best_score?: unknown;
      mean_score?: unknown;
      recommendation_status?: unknown;
    };

    if (typeof item.model !== 'string') {
      return;
    }

    const itemModelName = item.model.trim();
    const itemNorm = normalizeModelName(itemModelName);

    // Exact match first, then normalized and abbreviation matching
    const model = models.find(candidate => {
      if (candidate.name === itemModelName) return true;
      const candidateNorm = normalizeModelName(candidate.name);
      if (candidateNorm === itemNorm) return true;
      // SVM / SVR matching
      if (
        (itemNorm.includes('svr') || itemNorm.includes('supportvectorreg')) &&
        (candidateNorm.includes('svr') || candidateNorm.includes('supportvectorreg'))
      ) {
        return true;
      }
      if (
        (itemNorm.includes('svm') || itemNorm.includes('supportvector')) &&
        (candidateNorm.includes('svm') || candidateNorm.includes('supportvector'))
      ) {
        return true;
      }
      return false;
    });

    if (!model) {
      return;
    }

    if (typeof item.code === 'string' && item.code.trim()) {
      // IMPORTANT: Do NOT overwrite model.code — it is the baseline used by the
      // "Insert into Notebook" button. Only store tuned code in model.tuned_code.
      model.tuned_code = item.code;
      model.code_available = true;
      model.tuned_configuration_applied = true;
      model.tuned_params =
        item.best_params && typeof item.best_params === 'object' && !Array.isArray(item.best_params)
          ? (item.best_params as Record<string, unknown>)
          : undefined;
      model.tuned_changes = Array.isArray(item.recommended_changes)
        ? (item.recommended_changes as Array<{ parameter: string; default: unknown; recommended: unknown }>)
        : undefined;
      const scoreVal = item.best_score ?? item.mean_score ?? item.score;
      model.tuned_score = typeof scoreVal === 'number' ? scoreVal : undefined;
      model.tuned_recommendation_status =
        typeof item.recommendation_status === 'string'
          ? item.recommendation_status
          : undefined;
      delete model.tuned_code_error;
      model.refreshCode?.();
      updated += 1;

    } else if (typeof item.code_error === 'string') {
      model.tuned_code_error = item.code_error;
      errors.push(`${model.name}: ${item.code_error}`);
    }
  });

  return { updated, errors };
}
