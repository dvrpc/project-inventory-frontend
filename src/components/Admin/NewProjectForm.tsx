import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useProducts,
  useGeographies,
  useCreateProject,
  useKeywords,
  useCreateProjectKeyword,
  useCreateKeyword,
  useProjects,
} from '@api/hooks';
import SearchSelect from '@components/Select/SearchSelect';
import GeoMultiSelect from '@components/Select/GeoMultiSelect';
import CreateMultiSelect from '@components/Select/CreateMultiSelect';
import { formatDate } from '@utils';
import { type Option } from '@types';

type Props = {
  onSuccess?: () => void;
};

const isNewKeyword = (option: Option) => option.value === option.label;

export default function NewProjectForm({ onSuccess }: Props) {
  const queryClient = useQueryClient();

  const { data: products = [] } = useProducts();
  const { data: geographies = [] } = useGeographies();
  const { data: keywords = [] } = useKeywords();
  const { data: projects = [] } = useProjects();

  const [selectedProduct, setSelectedProduct] = useState<Option | null>(null);
  const [selectedGeographies, setSelectedGeographies] = useState<Option[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Option[]>([]);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { mutateAsync: createKeyword } = useCreateKeyword();
  const { mutateAsync: createProjectKeyword } = useCreateProjectKeyword();

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

  const countyOptions = useMemo(
    () =>
      geographies
        .filter((g) => g.geo_type === 'county' && g.dvrpc_reg)
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

  const isDuplicateProduct = useMemo(
    () =>
      selectedProduct
        ? projects.some((p) => p.product.pub_id === selectedProduct.value)
        : false,
    [projects, selectedProduct]
  );

  const keywordOptions = useMemo(
    () => keywords.map((k) => ({ label: k.name, value: String(k.keyword_id) })),
    [keywords]
  );

  const handleCreateKeyword = (name: string) => {
    const newOption: Option = { label: name, value: name };
    setSelectedKeywords((prev) => [...prev, newOption]);
  };

  const { createProjectGeography, ...createProject } = useCreateProject({
    onSuccess: async (project) => {
      try {
        await Promise.all(
          selectedGeographies.map((g) =>
            createProjectGeography({
              project_id: project.project_id,
              geoid: g.value,
            })
          )
        );

        await Promise.all(
          selectedKeywords.map(async (k) => {
            const keyword_id = isNewKeyword(k)
              ? (await createKeyword(k.label)).keyword_id
              : Number(k.value);
            return createProjectKeyword({
              project_id: project.project_id,
              keyword_id,
            });
          })
        );

        queryClient.invalidateQueries({ queryKey: ['project'] });
        queryClient.invalidateQueries({ queryKey: ['keyword'] });
        setSelectedProduct(null);
        setSelectedGeographies([]);
        setSelectedKeywords([]);
        setStatus({
          type: 'success',
          message: 'Project created successfully.',
        });
        setTimeout(() => setStatus(null), 4000);
        onSuccess?.();
      } catch (err) {
        setStatus({ type: 'error', message: (err as Error).message });
      }
    },
    onError: (err) => setStatus({ type: 'error', message: err.message }),
  });

  const canSubmit =
    selectedProduct &&
    selectedGeographies.length > 0 &&
    !isDuplicateProduct &&
    !createProject.isPending;

  return (
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
          isAdmin
        />
        {isDuplicateProduct && (
          <p className="mt-1.5 text-xs text-red-600">
            This product is already linked to an existing project.
          </p>
        )}
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
          isAdmin
        />
      </div>

      <div className="mb-5">
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
  );
}
