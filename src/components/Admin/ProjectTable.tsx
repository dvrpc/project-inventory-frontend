import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Project } from '@types';
import { formatDate } from '@utils';
import DeleteConfirmPrompt from './DeleteConfirmPrompt';
import EditProjectModal from './EditProjectModal';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteProject } from '@api/hooks';

interface Props {
  projects: Project[];
}

export default function ProjectTable({ projects }: Props) {
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { mutateAsync: deleteProject } = useDeleteProject();
  const queryClient = useQueryClient();

  async function handleDeleteConfirm() {
    if (!deletingProject) return;
    await deleteProject({ project_id: deletingProject.project_id });
    queryClient.invalidateQueries({ queryKey: ['project'] });
    setDeletingProject(null);
  }

  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100">
            {[
              'ID',
              'PUB_ID',
              'Title',
              'Date',
              'Geographies',
              'Keywords',
              'Needs',
              'Recs',
              'Actions',
            ].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
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
