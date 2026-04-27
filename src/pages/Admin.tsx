import { useProjects } from '@api/hooks';
import ProjectTable from '@components/Admin/ProjectTable';
import NewProjectForm from '@components/Admin/NewProjectForm';

export default function AdminPage() {
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

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
        <NewProjectForm />

        <div className="bg-white border border-zinc-200 rounded-xl flex-1 min-w-0 overflow-hidden flex flex-col min-h-0 h-full">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100">
            <span className="text-xs font-semibold tracking-widest uppercase text-zinc-600">
              All Projects
            </span>
            <span className="ml-auto text-xs font-mono text-zinc-400">
              {projects.length} Projects
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
