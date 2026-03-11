import { useProjectsFromUrl } from '@api/hooks';
import Filters from '@components/Filters/Filters';
import Header from '@components/Layout/Header';
import Map from '@components/Map/Map';
import ProjectPanel from '@components/ProjectPanel/ProjectPanel';
import { useEffect, useState } from 'react';
export default function Dashboard() {
  const { data, isLoading } = useProjectsFromUrl();
  const [projects, setProjects] = useState(data);

  useEffect(() => {
    if (!isLoading && data) {
      setProjects(data);
    }
  }, [data, isLoading]);

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <main className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <div className="h-15 w-full shadow-md flex items-center px-6 z-20 ">
          <Filters />
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="w-1/2 h-full min-h-0">
            <Map />
          </div>
          <div className="w-1/2 flex flex-col h-full z-10 border-t border-l border-dvrpc-gray-5 min-h-0 ">
            <ProjectPanel projects={projects} geographyName={'DVRPC Region'} />
          </div>
        </div>
      </main>
    </div>
  );
}
