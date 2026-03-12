import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Save } from 'lucide-react';
import {
  useGeographies,
  useKeywords,
  useCreateKeyword,
  useCreateProjectKeyword,
  useDeleteProjectKeyword,
  useDeleteProjectGeography,
  useCreateProjectGeography,
} from '@api/hooks';
import GeoMultiSelect from '@components/Select/GeoMultiSelect';
import CreateMultiSelect from '@components/Select/CreateMultiSelect';
import type { Project, Option } from '@types';
import { useSyncProjectGeographies } from '@hooks/useSyncProjectGeographies';
import { useSyncProjectKeywords } from '@hooks/useSyncProjectKeywords';

interface Props {
  project: Project;
  onClose: () => void;
}

export default function EditProjectModal({ project, onClose }: Props) {
  const queryClient = useQueryClient();

  const { data: geographies = [] } = useGeographies();
  const { data: keywords = [] } = useKeywords();

  const { sync: syncGeographies, hasChanges: geoHasChanges } =
    useSyncProjectGeographies(project.project_id);
  const { sync: syncKeywords, hasChanges: keywordHasChanges } =
    useSyncProjectKeywords(project.project_id);

  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Seed initial values from the project
  const [selectedGeographies, setSelectedGeographies] = useState<Option[]>(() =>
    project.geographies.map((g) => ({
      label: g.name,
      value: g.geoid,
    }))
  );

  const [selectedKeywords, setSelectedKeywords] = useState<Option[]>(() =>
    project.keywords.map((k) => ({
      label: k.name,
      value: String(k.keyword_id),
    }))
  );

  const countyOptions = useMemo(
    () =>
      geographies
        .filter((g) => g.geo_type === 'county')
        .map((g) => ({ label: g.name + ' County', value: g.geoid })),
    [geographies]
  );

  const municipalityOptions = useMemo(
    () =>
      geographies
        .filter((g) => g.geo_type === 'municipality')
        .map((g) => ({
          label: g.name,
          value: g.geoid,
          county: g.geoid.slice(0, 5),
        })),
    [geographies]
  );

  const keywordOptions = useMemo(
    () => keywords.map((k) => ({ label: k.name, value: String(k.keyword_id) })),
    [keywords]
  );

  const handleCreateKeyword = (name: string) => {
    const newOption: Option = { label: name, value: name };
    setSelectedKeywords((prev) => [...prev, newOption]);
  };

  async function handleSave() {
    setIsPending(true);
    setStatus(null);
    try {
      await Promise.all([
        syncGeographies(project.geographies, selectedGeographies),
        syncKeywords(project.keywords, selectedKeywords),
      ]);

      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['keyword'] });
      setStatus({ type: 'success', message: 'Project updated successfully.' });
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message });
    } finally {
      setIsPending(false);
    }
  }
  const canSubmit =
    selectedGeographies.length > 0 &&
    (geoHasChanges(project.geographies, selectedGeographies) ||
      keywordHasChanges(project.keywords, selectedKeywords)) &&
    !isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 bg-white rounded-xl shadow-xl border border-zinc-200 w-80">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-dvrpc-blue-3" />
            <span className="text-xs font-semibold tracking-widest uppercase text-zinc-600">
              Edit Project
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Product
            </label>
            <div className="text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 line-clamp-2 leading-snug">
              {project.product?.title ?? (
                <em className="text-zinc-400">External</em>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Geographies
            </label>
            <GeoMultiSelect
              counties={countyOptions}
              municipalities={municipalityOptions}
              values={selectedGeographies}
              onChange={setSelectedGeographies}
              placeholder="Select geographies…"
              isAdmin
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Keywords
            </label>
            <CreateMultiSelect
              values={selectedKeywords}
              onChange={setSelectedKeywords}
              onCreateOption={handleCreateKeyword}
              placeholder="Add and create keywords..."
              options={keywordOptions}
            />
          </div>

          {status && (
            <div
              className={`text-xs px-3 py-2 rounded-md border ${
                status.type === 'success'
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {status.message}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={handleSave}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-dvrpc-blue-3 text-white
              hover:bg-[#006699] transition-colors flex items-center gap-1.5
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={12} />
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
