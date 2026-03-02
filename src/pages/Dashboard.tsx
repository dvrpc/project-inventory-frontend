import Filters from '@components/Filters/Filters';
import Header from '@components/Layout/Header';
import Map from '@components/Map/Map';
import ProjectPanel from '@components/ProjectPanel/ProjectPanel';
export default function Dashboard() {
  return (
    <div className="h-screen flex flex-col">
      <Header />

      <main className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <div className="h-15 w-full shadow-md flex items-center px-6 z-10 ">
          <Filters />
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="flex-1 h-full min-h-0">
            <Map />
          </div>
          <div className="flex-1 flex flex-col h-full z-10 border-t border-l border-dvrpc-gray-5 min-h-0">
            <ProjectPanel geographyName={'DVRPC Region'} />
          </div>
        </div>
      </main>
    </div>
  );
}
