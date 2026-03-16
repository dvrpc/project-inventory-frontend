import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import layers from './mapLayers';
import sources from './mapSources';
import Legend from './Legend';
import { decodeBoundsBase62, encodeBoundsBase62 } from './utils';
import { useSearchParams } from 'react-router-dom';
import { useUpdateSearchParams } from '@hooks/useUpdateSearchParams';
import { useGisSourcesFromUrl } from '@api/hooks';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

export default function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { searchParams, updateSearchParams } = useUpdateSearchParams();
  const { county, mcd } = useGisSourcesFromUrl();

  const updateSearchParamsRef = useRef(updateSearchParams);

  useEffect(() => {
    updateSearchParamsRef.current = updateSearchParams;
  }, [updateSearchParams]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || !county.data) return;
    (map.getSource('countyCentroids') as mapboxgl.GeoJSONSource)?.setData(
      county.data
    );
  }, [county.data]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || !mcd.data) return;
    (map.getSource('municipalCentroids') as mapboxgl.GeoJSONSource)?.setData(
      mcd.data
    );
  }, [mcd.data]);

  useEffect(() => {
    if (!mapContainer.current) return;

    console.log('render map');
    const urlParams = new URLSearchParams(window.location.search);
    const bbParam = urlParams.get('bb');

    const initialZoom = 12;
    let initialBounds = new mapboxgl.LngLatBounds(
      [-76.09405517578125, 39.49211914385648],
      [-74.32525634765625, 40.614734298694216]
    );

    if (bbParam) {
      const decodedBounds = decodeBoundsBase62(bbParam);
      if (decodedBounds) {
        initialBounds = decodedBounds;
      }
    }

    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/crvanpollard/cm1qifnx400ik01pdehvw8xc6',
      center: [
        -(initialBounds.getWest() + initialBounds.getEast()) / 2,
        -(initialBounds.getNorth() + initialBounds.getSouth()) / 2,
      ],
      zoom: initialZoom,
      trackResize: true,
      bounds: initialBounds,
    }));

    map.on('load', () => {
      map.resize();

      for (const source in sources) map.addSource(source, sources[source]);
      for (const layer in layers) {
        map.addLayer(layers[layer]);
      }
      console.log(map.getStyle().layers);
    });

    mapRef.current = map;

    map.on('moveend', () => {
      const bounds = map.getBounds();

      if (!bounds) return;

      const encoded = encodeBoundsBase62(bounds);
      updateSearchParamsRef.current({ bb: encoded }, { replace: true });
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full"></div>
      <Legend />
    </div>
  );
}
