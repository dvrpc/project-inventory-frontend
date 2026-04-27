import { useProjectsFromUrl } from '@api/hooks';
import Filters from '@components/Filters/Filters';
import Header from '@components/Layout/Header';
import MapboxMap from '@components/Map/MapboxMap';
import ProjectPanel from '@components/ProjectPanel/ProjectPanel';
import type { Geography, Project as ProjectType } from '@types';
import { useEffect, useState } from 'react';
export default function Dashboard() {
  const { data, isLoading } = useProjectsFromUrl();
  const [projects, setProjects] = useState(data);
  const [hoveredGeographies, setHoveredGeographies] = useState<
    Geography[] | null
  >(null);
  const [selectedPanelProject, setSelectedPanelProject] =
    useState<ProjectType | null>(null);
  useEffect(() => {
    if (!isLoading && data) {
      setProjects(data);
    }
  }, [data, isLoading]);

  const geographyName = data?.[0]?.geographies?.[0]?.name || 'DVRPC Region';
  return (
    <div className="h-screen flex flex-col">
      <Header />

      <main className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <div className="h-15 w-full shadow-md flex items-center px-6 z-20 ">
          <Filters />
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="w-1/2 h-full min-h-0">
            <MapboxMap
              projects={projects}
              hoveredGeographies={hoveredGeographies}
              setHoveredGeographies={setHoveredGeographies}
              setSelectedPanelProject={setSelectedPanelProject}
            />
          </div>
          <div className="w-1/2 flex flex-col h-full z-10 border-t border-l border-dvrpc-gray-5 min-h-0 ">
            <ProjectPanel
              projects={projects}
              geographyName={geographyName}
              isLoading={isLoading}
              onProjectHover={setHoveredGeographies}
              selectedProject={selectedPanelProject}
              setSelectedProject={setSelectedPanelProject}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
