import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import layers from './mapLayers';
import sources from './mapSources';
import Legend from './Legend';
import { decodeBoundsBase62, encodeBoundsBase62 } from './utils';
import { useUpdateSearchParams } from '@hooks/useUpdateSearchParams';
import { useGisSourcesFromUrl } from '@api/hooks';
import type { MouseEvent } from '@types';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface Feature {
  id: string;
  source: string;
}

export default function Map() {
  const { searchParams, updateSearchParams } = useUpdateSearchParams();
  const { county, mcd } = useGisSourcesFromUrl();

  const updateSearchParamsRef = useRef(updateSearchParams);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const hoverRef = useRef<Feature | null>(null);
  const selectRef = useRef<Feature | null>(null);

  function setHover(val: Feature | null) {
    hoverRef.current = val;
  }

  function setSelect(val: Feature | null) {
    selectRef.current = val;
    if (val) {
      updateSearchParamsRef.current({ geo: val?.id }, { replace: true });
    }
  }

  function removeSelection() {
    if (!mapRef.current || !selectRef.current) return;
    mapRef.current.removeFeatureState({ source: 'countyCentroids' });
    mapRef.current.removeFeatureState({ source: 'municipalCentroids' });

    setSelect(null);
  }

  const hoverGeoFill = (e: MouseEvent) => {
    if (!e.features) return;
    if (!mapRef.current) return;
    mapRef.current.getCanvas().style.cursor = 'pointer';

    const topSource = e.features[0].source;

    if (topSource) {
      if (hoverRef.current?.source) {
        mapRef.current.setFeatureState(
          {
            source: hoverRef.current.source,
            id: hoverRef.current.id,
          },
          { hover: false }
        );
      }

      const foundHoverId = e.features[0].id + '';
      const foundHoverSource = e.features[0].source + '';

      setHover({
        id: foundHoverId,
        source: foundHoverSource,
      });

      mapRef.current.setFeatureState(
        {
          source: foundHoverSource,
          id: foundHoverId,
        },
        { hover: true }
      );
    }
  };

  const leaveGeoFill = () => {
    if (!mapRef.current) return;

    mapRef.current.getCanvas().style.cursor = '';

    if (hoverRef.current) {
      mapRef.current.setFeatureState(
        {
          source: hoverRef.current.source,
          id: hoverRef.current.id,
        },
        { hover: false }
      );
    }
    setHover(null);
  };

  const handleClick = (e: MouseEvent) => {
    if (!mapRef.current || !e.features) return;

    if (selectRef.current) {
      removeSelection();
    }
    const foundSelectId = e.features[0].id + '';
    const foundSelectSource = e.features[0].source + '';

    setSelect({
      id: foundSelectId,
      source: foundSelectSource,
    });

    mapRef.current.setFeatureState(
      {
        source: foundSelectSource,
        id: foundSelectId,
      },
      { selected: true }
    );
  };

  useEffect(() => {
    updateSearchParamsRef.current = updateSearchParams;
  }, [updateSearchParams]);

  useEffect(() => {
    if (!searchParams.get('geo')) {
      removeSelection();
    }
  }, [searchParams]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !county.data) return;
    (map.getSource('countyCentroids') as mapboxgl.GeoJSONSource)?.setData(
      county.data
    );
  }, [county.data]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mcd.data) return;
    (map.getSource('municipalCentroids') as mapboxgl.GeoJSONSource)?.setData(
      mcd.data
    );
  }, [mcd.data]);

  useEffect(() => {
    if (!mapContainer.current) return;

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
    });

    mapRef.current = map;

    map.on('moveend', () => {
      const bounds = map.getBounds();

      if (!bounds) return;

      const encoded = encodeBoundsBase62(bounds);
      updateSearchParamsRef.current({ bb: encoded }, { replace: true });
    });

    map.on('mousemove', ['county-bubbles', 'municipal-bubbles'], hoverGeoFill);
    map.on('mouseleave', ['county-bubbles', 'municipal-bubbles'], leaveGeoFill);
    map.on('click', ['county-bubbles', 'municipal-bubbles'], handleClick);

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
