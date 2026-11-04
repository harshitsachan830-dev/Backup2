export const MODEL_MIND_NOTEBOOK_TYPE = 'modelmind_notebook_type';

export type ModelMindNotebookRole = 'modelmind' | 'trainer' | 'plain' | 'practice';
export type NotebookCodeAction = 'preview' | 'copy' | 'insert';

export interface NotebookMetadataReader {
  getMetadata(key: string): unknown;
}

export function getModelMindNotebookRole(
  model?: NotebookMetadataReader | null,
  pathOrTitle?: string | null
): ModelMindNotebookRole {
  const role = model?.getMetadata(MODEL_MIND_NOTEBOOK_TYPE);
  if (role === 'trainer' || role === 'plain' || role === 'practice') {
    return role;
  }
  if (pathOrTitle) {
    const lower = pathOrTitle.toLowerCase();
    if (lower.includes('practice')) {
      return 'practice';
    }
    if (lower.includes('plain')) {
      return 'plain';
    }
    if (lower.includes('trainer')) {
      return 'trainer';
    }
  }
  return 'modelmind';
}

export function canUseNotebookCodeAction(
  role: ModelMindNotebookRole,
  action: NotebookCodeAction
): boolean {
  if (role === 'plain') {
    return false;
  }
  return role !== 'trainer' || action === 'preview';
}
