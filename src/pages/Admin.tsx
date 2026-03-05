import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useProjects,
  useProducts,
  useGeographies,
  useCreateProject,
} from '@api/hooks';
import SearchSelect from '@components/Select/SearchSelect';
import ProjectTable from '@components/Admin/ProjectTable';
import { formatDate } from '@utils';
import type { Option } from '@types';
import GeoMultiSelect from '@components/Select/GeoMultiSelect';

export default function AdminPage() {
  const queryClient = useQueryClient();

  const { data: products = [] } = useProducts();
  const { data: geographies = [] } = useGeographies();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  const [selectedProduct, setSelectedProduct] = useState<Option | null>(null);
  const [selectedGeographies, setSelectedGeographies] = useState<Option[]>([]);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const productOptions: Option[] = useMemo(
    () =>
      [...products]
        .sort(
          (a, b) =>
            new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime()
        )
        .map((p) => ({
          value: p.pub_id,
          label: `${p.title} — ${formatDate(p.pub_date)}`,
        })),
    [products]
  );

  const countyOptions = useMemo(() => {
    return geographies
      ? geographies
          .filter((g) => g.geo_type == 'county')
          .map((g) => {
            return {
              label: g.name + ' County',
              value: g.geoid,
            };
          })
      : [];
  }, [geographies]);

  const municipalityOptions = useMemo(() => {
    return geographies
      ? geographies
          .filter((g) => g.geo_type == 'municipality')
          .map((g) => {
            return {
              label: g.name,
              value: g.geoid,
              county: g.geoid.slice(0, 5),
            };
          })
      : [];
  }, [geographies]);

  const { createProjectGeography, ...createProject } = useCreateProject({
    onSuccess: (project) => {
      Promise.all(
        selectedGeographies.map((g) =>
          createProjectGeography({
            project_id: project.project_id,
            geography_id: Number(g.value),
          })
        )
      )
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['project'] });
          setSelectedProduct(null);
          setSelectedGeographies([]);
          setStatus({
            type: 'success',
            message: 'Project created successfully.',
          });
          setTimeout(() => setStatus(null), 4000);
        })
        .catch((err: Error) =>
          setStatus({ type: 'error', message: err.message })
        );
    },
    onError: (err) => setStatus({ type: 'error', message: err.message }),
  });

  const canSubmit =
    selectedProduct &&
    selectedGeographies.length > 0 &&
    !createProject.isPending;

  return (
    <div className="h-screen flex flex-col bg-zinc-100">
      <div className="bg-dvrpc-blue-3 px-8 py-5 flex items-baseline gap-4 shrink-0">
        <span className="text-xs font-semibold tracking-widest text-white/60 uppercase font-mono">
          Admin
        </span>
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Project Management
        </h1>
      </div>
      <div className="flex gap-6 p-8 pb-6 flex-1 min-h-0 items-star">
        <div className="bg-white border border-zinc-200 rounded-xl p-6 w-80 shrink-0 self-start">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-dvrpc-blue-3" />
            <span className="text-xs font-semibold tracking-widest uppercase text-zinc-600">
              New Project
            </span>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Product
            </label>
            <SearchSelect
              options={productOptions}
              value={selectedProduct}
              onChange={setSelectedProduct}
              placeholder="Search by title or ID…"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Geographies
            </label>
            <GeoMultiSelect
              counties={countyOptions}
              municipalities={municipalityOptions}
              values={selectedGeographies}
              onChange={setSelectedGeographies}
              placeholder="Select geographies…"
            />
          </div>

          {status && (
            <div
              className={`text-xs px-3 py-2 rounded-md border mb-4 ${
                status.type === 'success'
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {status.message}
            </div>
          )}

          <button
            disabled={!canSubmit}
            onClick={() => createProject.mutate(selectedProduct!.value)}
            className="w-full py-2.5 bg-dvrpc-blue-3 text-white text-sm font-semibold rounded-lg
              disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#006699] transition-colors"
          >
            {createProject.isPending ? 'Creating…' : 'Create Project'}
          </button>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl flex-1 min-w-0 overflow-hidden flex flex-col min-h-0 h-full">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100">
            <div className="w-2 h-2 rounded-full bg-[#9C2A7F]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-zinc-600">
              All Projects
            </span>
            <span className="ml-auto text-xs font-mono text-zinc-400">
              {projects.length}
            </span>
          </div>

          {projectsLoading ? (
            <div className="py-16 text-center text-sm text-zinc-400">
              Loading…
            </div>
          ) : projects.length === 0 ? (
            <div className="py-16 text-center text-sm text-zinc-400">
              No projects found.
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              <ProjectTable projects={projects} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
