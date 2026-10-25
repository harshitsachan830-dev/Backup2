export const MODEL_MIND_NOTEBOOK_TYPE = 'modelmind_notebook_type';

export type ModelMindNotebookRole = 'modelmind' | 'trainer';
export type NotebookCodeAction = 'preview' | 'copy' | 'insert';

export interface NotebookMetadataReader {
  getMetadata(key: string): unknown;
}

export function getModelMindNotebookRole(
  model?: NotebookMetadataReader | null
): ModelMindNotebookRole {
  return model?.getMetadata(MODEL_MIND_NOTEBOOK_TYPE) === 'trainer'
    ? 'trainer'
    : 'modelmind';
}

export function canUseNotebookCodeAction(
  role: ModelMindNotebookRole,
  action: NotebookCodeAction
): boolean {
  return role !== 'trainer' || action === 'preview';
}
