import { useMemo, useState } from 'react';
import Project from './Project';
import { MemoizedProjectCard } from './ProjectCard';
import SortDropdown from './SortDropdown';
import type { Project as ProjectType, Geography } from '@types';
import { Loader2, MapPin } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useGeographies } from '@api/hooks';

interface Props {
  geographyName: string;
  projects: ProjectType[] | undefined;
  isLoading: boolean;
  onProjectHover: (geographies: Geography[] | null) => void;
  selectedProject: ProjectType | null;
  setSelectedProject: (project: ProjectType | null) => void;
}
export default function ProjectPanel(props: Props) {
  const {
    projects,
    isLoading,
    onProjectHover,
    selectedProject,
    setSelectedProject,
  } = props;
  const [pinHovered, setPinHovered] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: geographies } = useGeographies();

  function handleProjectSelect(project_id: number) {
    const project = projects?.find((p) => p.project_id === project_id);
    if (!project) return;
    // onProjectHover(null);
    setSelectedProject(project);
  }

  function handleGeoSelect(project_id: number) {
    const geoid = projects
      ?.find((p) => p.project_id == project_id)
      ?.geographies.map((g) => g.geoid)
      .join(',');
    if (geoid) {
      setSearchParams({ project: String(project_id), geo: geoid });
    }
  }

  const geoParam = searchParams.get('geo');

  const geographyName = useMemo(() => {
    if (!geoParam || !geographies) return 'DVRPC Region';

    const names = geoParam
      .split(',')
      .map((geoid) => {
        const geo = geographies.find((g) => g.geoid === geoid);
        if (!geo) return null;
        return geo.geo_type === 'county' ? `${geo.name} County` : geo.name;
      })
      .filter(Boolean);

    return names.length > 0 ? names.join(', ') : 'DVRPC Region';
  }, [geoParam, geographies]);

  if (selectedProject) {
    return (
      <div className="overflow-y-auto">
        <div className="p-4 justify-between flex">
          <button onClick={() => setSelectedProject(null)}>
            &larr; Back to list
          </button>
          <button
            aria-label="zoom to project"
            onClick={(e) => {
              e.stopPropagation();
              handleGeoSelect(selectedProject.project_id);
            }}
            onMouseEnter={() => setPinHovered(true)}
            onMouseLeave={() => setPinHovered(false)}
          >
            <MapPin color={pinHovered ? '#005475' : '#0078ae'} />
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
          wpids={selectedProject.product.wpids}
          lastUpdate={selectedProject.product.lastupdatedate}
          dateCreated={selectedProject.product.createdate}
          keywords={selectedProject.keywords}
          projectContactName={selectedProject.product.s1}
          projectContactId={selectedProject.product.s1_id}
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
          <h2 className="text-xl">{`${geographyName} Projects`}</h2>
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
            geographies={project.geographies}
            handleGeoSelect={handleGeoSelect}
            handleClick={handleProjectSelect}
            onProjectHover={onProjectHover}
          />
        ))}
      </div>
    </>
  );
}
