import { useState } from 'react';
import Project from './Project';
import { MemoizedProjectCard } from './ProjectCard';
import SortDropdown from './SortDropdown';
import type { Project as ProjectType } from '@types';
import { Loader2 } from 'lucide-react';

interface Props {
  geographyName: string;
  projects: ProjectType[] | undefined;
  isLoading: boolean;
}
export default function ProjectPanel(props: Props) {
  const { projects, isLoading } = props;
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
    null
  );
  function handleProjectSelect(project_id: number) {
    const project = projects?.find((p) => p.project_id === project_id);
    if (!project) return;
    setSelectedProject(project);
  }

  if (selectedProject) {
    return (
      <div className="overflow-y-auto">
        <div className="p-4">
          <button onClick={() => setSelectedProject(null)}>
            &larr; Back to list
          </button>
        </div>
        <Project
          key={selectedProject.project_id}
          product_id={selectedProject.product.pub_num}
          project_id={selectedProject.project_id}
          title={selectedProject.product.title}
          agency={'DVRPC'}
          status={selectedProject.product.status}
          publicationDate={selectedProject.product.pub_date}
          lastUpdate={selectedProject.product.lastupdatedate}
          dateCreated={selectedProject.product.createdate}
          keywords={selectedProject.keywords}
          createdBy={selectedProject.product.createby}
          abstract={selectedProject.product.abstract}
          needs={selectedProject.needs}
          recommendations={selectedProject.recommendations}
          geographies={selectedProject.geographies}
        />
      </div>
    );
  }
  return (
    <>
      <div className="p-4 border-b border-dvrpc-gray-7 flex justify-between">
        <div>
          <h2 className="text-xl">{`${props.geographyName} Projects`}</h2>
          {!isLoading ? (
            <span>{projects?.length || 0} Results</span>
          ) : (
            <Loader2 className="animate-spin" />
          )}
        </div>

        <SortDropdown />
      </div>
      <div className="p-2 flex-1 flex flex-col gap-4 overflow-y-auto relative">
        {projects?.map((project) => (
          <MemoizedProjectCard
            key={project.project_id}
            product_id={project.product.pub_num}
            project_id={project.project_id}
            title={project.product.title}
            agency={'DVRPC'}
            geoType={project.geographies[0].geo_type}
            status={project.product.status}
            publicationDate={project.product.pub_date}
            abstract={project.product.abstract}
            needs={project.needs}
            recommendations={project.recommendations}
            handleClick={handleProjectSelect}
          />
        ))}
      </div>
    </>
  );
}
