import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string
console.log('TOKEN:', import.meta.env.VITE_MAPBOX_TOKEN)
export default function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/crvanpollard/cm1qifnx400ik01pdehvw8xc6',
      center: [-75.2273, 40.071],
      trackResize: true,
      bounds: [
        [-76.09405517578125, 39.49211914385648],
        [-74.32525634765625, 40.614734298694216],
      ],
    }))

    map.on('load', () => {
      map.resize()
    })

    mapRef.current = map

    return () => {
      map.remove()
    }
  }, [])

  return <div ref={mapContainer} className="w-full h-full" />
}
