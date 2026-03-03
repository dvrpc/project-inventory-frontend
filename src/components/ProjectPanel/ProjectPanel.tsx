import { useProjectsFromUrl } from '@api/hooks';
import { MemoizedProject } from './Project';
import SortDropdown from './SortDropdown';
import type { Project as ProjectType } from '@types';
import { useEffect, useState } from 'react';

interface Props {
  geographyName: string;
  projects: ProjectType[] | undefined;
}
export default function ProjectPanel(props: Props) {
  const { projects } = props;

  return (
    <>
      <div className="p-4 border-b border-dvrpc-gray-7 flex justify-between">
        <div>
          <h2 className="text-xl">{`${props.geographyName} Projects`}</h2>
          <span>{projects?.length || 0} Results</span>
        </div>
        <SortDropdown />
      </div>
      <div className="p-2 flex-1 flex flex-col gap-4 overflow-y-auto ">
        {projects?.map((project) => (
          <MemoizedProject
            key={project.project_id}
            product_id={project.product.pub_num}
            project_id={project.project_id}
            title={project.product.title}
            agency={'DVRPC'}
            status={project.product.status}
            publicationDate={project.product.pub_date}
            abstract={project.product.abstract}
            needs={project.needs}
            recommendations={project.recommendations}
          />
        ))}
      </div>
    </>
  );
}
