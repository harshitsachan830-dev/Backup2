export const MODEL_MIND_NOTEBOOK_TYPE = 'modelmind_notebook_type';

export type ModelMindNotebookRole = 'modelmind' | 'trainer' | 'plain';
export type NotebookCodeAction = 'preview' | 'copy' | 'insert';

export interface NotebookMetadataReader {
  getMetadata(key: string): unknown;
}

export function getModelMindNotebookRole(
  model?: NotebookMetadataReader | null
): ModelMindNotebookRole {
  const role = model?.getMetadata(MODEL_MIND_NOTEBOOK_TYPE);
  if (role === 'trainer' || role === 'plain') {
    return role;
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
