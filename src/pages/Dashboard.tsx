import Filters from '../components/Filters/Filters'
import Header from '../components/Layout/Header'
import Map from '../components/Map/Map'
export default function Dashboard() {
  return (
    <div className="h-screen flex flex-col">
      <Header />

      <main className="flex flex-col flex-1 overflow-hidden">
        <div className="h-15 w-full shadow-md flex items-center px-6 z-10">
          <Filters />
        </div>

        <div className="flex flex-1">
          <div className="flex-1">
            <Map />
          </div>
          <div className="flex-1 z-10 border-t border-l border-dvrpc-gray-5">
            Right panel
          </div>
        </div>
      </main>
    </div>
  )
}
