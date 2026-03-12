import {
  useCreateKeyword,
  useCreateProjectKeyword,
  useDeleteProjectKeyword,
} from '@api/hooks';
import type { Keyword, Option } from '@types';

const isNewKeyword = (option: Option) => option.value === option.label;

// Used for editing project geographies. Deletes removed existing ones, and adds new selected ones, creates and adds newly createed ones
export function useSyncProjectKeywords(project_id: number) {
  const { mutateAsync: createKeyword } = useCreateKeyword();
  const { mutateAsync: createProjectKeyword } = useCreateProjectKeyword();
  const { mutateAsync: deleteProjectKeyword } = useDeleteProjectKeyword();

  const getDiff = (original: Keyword[], selected: Option[]) => {
    const originalIds = new Set(original.map((k) => k.keyword_id));
    const selectedIds = new Set(
      selected.filter((k) => !isNewKeyword(k)).map((k) => Number(k.value))
    );
    return {
      toRemove: original.filter((k) => !selectedIds.has(k.keyword_id)),
      toAdd: selected.filter(
        (k) => !isNewKeyword(k) && !originalIds.has(Number(k.value))
      ),
      toCreate: selected.filter(isNewKeyword),
    };
  };

  const hasChanges = (original: Keyword[], selected: Option[]) => {
    const { toRemove, toAdd, toCreate } = getDiff(original, selected);
    return toRemove.length > 0 || toAdd.length > 0 || toCreate.length > 0;
  };

  const sync = async (original: Keyword[], selected: Option[]) => {
    const { toRemove, toAdd, toCreate } = getDiff(original, selected);
    if (toRemove.length === 0 && toAdd.length === 0 && toCreate.length === 0)
      return;
    return Promise.all([
      ...toRemove.map((k) =>
        deleteProjectKeyword({ project_id, keyword_id: k.keyword_id })
      ),
      ...toAdd.map((k) =>
        createProjectKeyword({ project_id, keyword_id: Number(k.value) })
      ),
      ...toCreate.map(async (k) => {
        const { keyword_id } = await createKeyword(k.label);
        return createProjectKeyword({ project_id, keyword_id });
      }),
    ]);
  };

  return { sync, hasChanges };
}
