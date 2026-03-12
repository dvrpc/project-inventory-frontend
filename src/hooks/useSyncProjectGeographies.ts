import {
  useCreateProjectGeography,
  useDeleteProjectGeography,
} from '@api/hooks';
import type { Geography, Option } from '@types';

// Used for editing project geographies. Deletes removed existing ones, and adds new selected ones
export function useSyncProjectGeographies(project_id: number) {
  const { mutateAsync: createProjectGeography } = useCreateProjectGeography();
  const { mutateAsync: deleteProjectGeography } = useDeleteProjectGeography();

  const getDiff = (original: Geography[], selected: Option[]) => {
    const originalIds = new Set(original.map((g) => g.geoid));
    const selectedIds = new Set(selected.map((g) => g.value));
    return {
      toRemove: original.filter((g) => !selectedIds.has(g.geoid)),
      toAdd: selected.filter((g) => !originalIds.has(g.value)),
    };
  };

  const hasChanges = (original: Geography[], selected: Option[]) => {
    const { toRemove, toAdd } = getDiff(original, selected);
    return toRemove.length > 0 || toAdd.length > 0;
  };

  const sync = async (original: Geography[], selected: Option[]) => {
    const { toRemove, toAdd } = getDiff(original, selected);
    if (toRemove.length === 0 && toAdd.length === 0) return;
    return Promise.all([
      ...toRemove.map((g) =>
        deleteProjectGeography({ project_id, geoid: g.geoid })
      ),
      ...toAdd.map((g) =>
        createProjectGeography({ project_id, geoid: g.value })
      ),
    ]);
  };

  return { sync, hasChanges };
}
