import { useProjectsFromUrl } from '@api/hooks';
import Filters from '@components/Filters/Filters';
import Header from '@components/Layout/Header';
import MapboxMap from '@components/Map/MapboxMap';
import ProjectPanel from '@components/ProjectPanel/ProjectPanel';
import type { Geography, Project as ProjectType } from '@types';
import { useState } from 'react';
export default function Dashboard() {
  const {
    projects,
    total,
    countsByGeoType,
    isLoading,
    isPlaceholderData,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useProjectsFromUrl();
  const [hoveredGeographies, setHoveredGeographies] = useState<
    Geography[] | null
  >(null);
  const [selectedPanelProject, setSelectedPanelProject] =
    useState<ProjectType | null>(null);
  const [hoveredPubId, setHoveredPubId] = useState<string | null>(null);
  const [hoveredCsaPubId, setHoveredCsaPubId] = useState<string | null>(null);

  const geographyName = projects?.[0]?.geographies?.[0]?.name || 'DVRPC Region';
  return (
    <div className="h-screen flex flex-col">
      <Header />

      <main className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <div className="h-15 w-full shadow-md flex items-center px-6 z-20 ">
          <Filters />
        </div>

        <div className="flex sm:flex-row flex-col flex-1 min-h-0">
          <div className="sm:w-1/2 h-full min-h-0">
            <MapboxMap
              projects={projects}
              regionalProjectCount={countsByGeoType?.regional}
              hoveredGeographies={hoveredGeographies}
              setHoveredGeographies={setHoveredGeographies}
              setSelectedPanelProject={setSelectedPanelProject}
              setHoveredPubId={setHoveredPubId}
              hoveredCsaPubId={hoveredCsaPubId}
            />
          </div>
          <div className="sm:w-1/2 flex flex-col h-full z-10 border-t border-l border-dvrpc-gray-5 min-h-0 ">
            <ProjectPanel
              projects={projects}
              total={total}
              countsByGeoType={countsByGeoType}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
              geographyName={geographyName}
              isLoading={isLoading || isPlaceholderData}
              onProjectHover={setHoveredGeographies}
              selectedProject={selectedPanelProject}
              setSelectedProject={setSelectedPanelProject}
              hoveredPubId={hoveredPubId}
              hoveredCsaPubId={hoveredCsaPubId}
              onCsaHover={setHoveredCsaPubId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
