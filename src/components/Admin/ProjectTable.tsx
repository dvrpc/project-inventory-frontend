import { useState } from 'react';
import {
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import type { Project } from '@types';
import { formatDate } from '@utils';
import DeleteConfirmPrompt from './DeleteConfirmPrompt';
import EditProjectModal from './EditProjectModal';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteProject } from '@api/hooks';

interface Props {
  projects: Project[];
}

type SortKey =
  | 'project_id'
  | 'pub_id'
  | 'title'
  | 'date'
  | 'status'
  | 'geographies'
  | 'keywords'
  | 'needs'
  | 'recs';

type SortDir = 'asc' | 'desc';

const COLUMNS: { label: string; key: SortKey | null }[] = [
  { label: 'ID', key: 'project_id' },
  { label: 'PUB_ID', key: 'pub_id' },
  { label: 'Title', key: 'title' },
  { label: 'Date', key: 'date' },
  { label: 'Status', key: 'status' },
  { label: 'Geographies', key: 'geographies' },
  { label: 'Keywords', key: 'keywords' },
  { label: 'Needs', key: 'needs' },
  { label: 'Recs', key: 'recs' },
  { label: 'Actions', key: null },
];

function getSortValue(p: Project, key: SortKey): string | number {
  switch (key) {
    case 'project_id':
      return p.project_id;
    case 'pub_id':
      return p.product?.pub_id ?? '';
    case 'title':
      return p.product?.title?.toLowerCase() ?? '';
    case 'date':
      return p.product?.pub_date ? new Date(p.product.pub_date).getTime() : 0;
    case 'status':
      return p.product?.status?.toLowerCase() ?? '';
    case 'geographies':
      return p.geographies.length;
    case 'keywords':
      return p.keywords.length;
    case 'needs':
      return p.needs.length;
    case 'recs':
      return p.recommendations.length;
  }
}

export default function ProjectTable({ projects }: Props) {
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('project_id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const { mutateAsync: deleteProject } = useDeleteProject();
  const queryClient = useQueryClient();

  async function handleDeleteConfirm() {
    if (!deletingProject) return;
    await deleteProject({ project_id: deletingProject.project_id });
    queryClient.invalidateQueries({ queryKey: ['project'] });
    setDeletingProject(null);
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = [...projects].sort((a, b) => {
    const av = getSortValue(a, sortKey);
    const bv = getSortValue(b, sortKey);
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (col !== sortKey)
      return <ChevronsUpDown size={12} className="text-zinc-300" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-dvrpc-blue-3" />
    ) : (
      <ChevronDown size={12} className="text-dvrpc-blue-3" />
    );
  }

  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100">
            {COLUMNS.map(({ label, key }) => (
              <th
                key={label}
                className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 whitespace-nowrap"
              >
                {key ? (
                  <button
                    onClick={() => handleSort(key)}
                    className="flex items-center gap-1 hover:text-zinc-600 transition-colors"
                  >
                    {label}
                    <SortIcon col={key} />
                  </button>
                ) : (
                  label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => (
            <tr
              key={p.project_id}
              className={`border-b border-zinc-50 ${
                i % 2 === 0 ? 'bg-zinc-50/50' : 'bg-white'
              }`}
            >
              <td className="px-4 py-3">
                <span className="font-mono text-xs bg-zinc-100 text-zinc-500 rounded px-1.5 py-0.5">
                  {p.project_id}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs bg-zinc-100 text-zinc-500 rounded px-1.5 py-0.5">
                  {p.product.pub_id}
                </span>
              </td>
              <td className="px-4 py-3 max-w-xs">
                <span className="line-clamp-2 text-zinc-800 leading-snug">
                  {p.product?.title ?? (
                    <em className="text-zinc-400">External</em>
                  )}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                {p.product?.pub_date ? formatDate(p.product.pub_date) : '—'}
              </td>
              <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                {p.product?.status ?? '—'}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {p.geographies.slice(0, 2).map((g) => (
                    <span
                      key={g.geoid}
                      className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5 whitespace-nowrap"
                    >
                      {g.name}
                    </span>
                  ))}
                  {p.geographies.length > 2 && (
                    <span className="text-xs bg-zinc-100 text-zinc-500 rounded px-1.5 py-0.5">
                      +{p.geographies.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-zinc-600">
                {p.keywords.map((k) => k.name).join(', ')}
              </td>
              <td className="px-4 py-3 text-center text-zinc-600">
                {p.needs.length}
              </td>
              <td className="px-4 py-3 text-center text-zinc-600">
                {p.recommendations.length}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingProject(p)}
                    title="Edit project"
                    className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                    aria-label={`Edit project ${p.project_id}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingProject(p)}
                    title="Delete project"
                    className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label={`Delete project ${p.project_id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deletingProject && (
        <DeleteConfirmPrompt
          projectId={deletingProject.project_id}
          projectTitle={deletingProject.product?.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingProject(null)}
        />
      )}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </>
  );
}
