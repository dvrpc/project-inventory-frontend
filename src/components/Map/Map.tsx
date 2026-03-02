import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import layers from './mapLayers';
import sources from './mapSources';
import { useProjects } from '@api/hooks';
import Legend from './Legend';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

// Base64 encoding and decoding functions
// Encode bounds → compact hex string
function encodeBoundsHex(bounds: mapboxgl.LngLatBounds): string {
  const values = [
    bounds.getNorth(),
    bounds.getEast(),
    bounds.getSouth(),
    bounds.getWest(),
  ];

  return values
    .map((v) => Math.round(v * 1000)) // keep 3 decimals
    .map((v) => v.toString(16)) // convert to hex (keeps minus sign)
    .join('.');
}

// Decode hex string → LngLatBounds
function decodeBoundsHex(hex: string): mapboxgl.LngLatBounds | null {
  try {
    const parts = hex.split('.');
    if (parts.length !== 4) return null;

    const values = parts.map((p) => parseInt(p, 16) / 1000);

    const [north, east, south, west] = values;

    return new mapboxgl.LngLatBounds([west, south], [east, north]);
  } catch {
    return null;
  }
}

export default function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { data: projects } = useProjects();

  useEffect(() => {
    if (!mapContainer.current) return;

    // Check if the URL has a bounding box parameter
    const urlParams = new URLSearchParams(window.location.search);
    const bbParam = urlParams.get('bb');

    const initialZoom = 12;
    let initialBounds = new mapboxgl.LngLatBounds(
      [-76.09405517578125, 39.49211914385648],
      [-74.32525634765625, 40.614734298694216]
    );

    if (bbParam) {
      const decodedBounds = decodeBoundsHex(bbParam);
      if (decodedBounds) {
        initialBounds = decodedBounds;
      }
    }

    // Initialize the map
    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/crvanpollard/cm1qifnx400ik01pdehvw8xc6',
      center: [
        -(initialBounds.getWest() + initialBounds.getEast()) / 2,
        -(initialBounds.getNorth() + initialBounds.getSouth()) / 2,
      ],
      zoom: initialZoom,
      trackResize: true,
      bounds: initialBounds, // Set the initial bounds
    }));

    map.on('load', () => {
      map.resize();

      // Add sources and layers
      for (const source in sources) map.addSource(source, sources[source]);
      for (const layer in layers) {
        const beforeId =
          layers[layer].type === 'fill' ? 'waterway-shadow' : 'road-label';
        map.addLayer(layers[layer], beforeId);
      }
    });

    mapRef.current = map;

    // Update URL on map moveend
    map.on('moveend', () => {
      const bounds = map.getBounds();

      if (!bounds) return;

      const encoded = encodeBoundsHex(bounds);

      window.history.replaceState({}, '', `?bb=${encoded}`);
    });
    return () => {
      map.remove();
    };
  }, [projects]);

  return (
    <div ref={mapContainer} className="w-full h-full">
      <Legend />
    </div>
  );
}
