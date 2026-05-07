import { useEffect, useRef } from 'react';
import mapboxgl, { Popup } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import sources from './mapSources';
import Legend from './Legend';
import { decodeBoundsBase62, encodeBoundsBase62 } from './utils';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { useUpdateSearchParams } from '@hooks/useUpdateSearchParams';
import { useGisSourcesFromUrl } from '@api/hooks';
import type { Bbox, MouseEvent, Geography } from '@types';
import type { Project as ProjectType } from '@types';

import { apiGet } from '@api/api';
import { CustomNavigationControl } from './CustomNavigationControl';
import { INITIAL_BOUNDS, NJ_FIPS, PA_FIPS } from '@consts';
import RegionalProjects from './RegionalProjects';
import getLayers from './mapLayers';
import RemoveSelectionPopup from './RemoveSelectionPopup';
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface Feature {
  id: string;
  source: string;
}

interface Props {
  projects: ProjectType[] | undefined;
  hoveredGeographies: Geography[] | null;
  setHoveredGeographies: (geographies: Geography[] | null) => void;
  setSelectedPanelProject: (project: ProjectType | null) => void;
}

export const tooltip = new Popup({
  closeButton: false,
  closeOnClick: false,
  anchor: 'left',
  offset: 25,
});

const geoLengthSourceMap: Record<number, string> = {
  2: 'stateCentroids',
  5: 'countyCentroids',
  10: 'municipalCentroids',
};

const centroidToFillSourceMap: Record<string, string> = {
  stateCentroids: 'countyboundaries',
  countyCentroids: 'countyboundaries',
  municipalCentroids: 'dvrpc_mcd_phicpa',
};

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  placeholder: 'Search to location',
  bbox: [
    -76.09405517578125, 39.49211914385648, -74.32525634765625,
    40.614734298694216,
  ],
  marker: false,
});

export default function MapboxMap(props: Props) {
  const {
    projects,
    hoveredGeographies,
    setHoveredGeographies,
    setSelectedPanelProject,
  } = props;
  const { searchParams, updateSearchParams } = useUpdateSearchParams();
  const { state, county, mcd } = useGisSourcesFromUrl();

  const updateSearchParamsRef = useRef(updateSearchParams);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const hoverRef = useRef<Feature | null>(null);
  const selectionsRef = useRef<Map<string, string>>(
    new (globalThis.Map as any)()
  );
  const prevGeoRef = useRef<string | null>(null);
  const hoveredGeoidsRef = useRef<string[]>([]);

  const totalRegionalProjects = projects?.filter(
    (p) => p.geographies[0].geo_type === 'regional'
  ).length;

  function setFeatureStateForGeo(
    map: mapboxgl.Map,
    id: string,
    source: string,
    state: Record<string, boolean>
  ) {
    map.setFeatureState({ source, id }, state);

    const fillSource = centroidToFillSourceMap[source] ?? '';
    if (id.length >= 5) {
      map.setFeatureState(
        { source: fillSource, sourceLayer: fillSource, id },
        state
      );
    } else {
      const ids = id === '42' ? PA_FIPS : NJ_FIPS;
      ids.forEach((fips) => {
        map.setFeatureState(
          { source: fillSource, sourceLayer: fillSource, id: fips },
          state
        );
      });
    }
  }

  function addSelection(map: mapboxgl.Map, id: string, source: string) {
    selectionsRef.current.set(id, source);
    setFeatureStateForGeo(map, id, source, { selected: true });
    const ids = Array.from(selectionsRef.current.keys());
    updateSearchParamsRef.current({ geo: ids.join(',') }, { replace: true });
  }

  function clearAllSelections(map: mapboxgl.Map) {
    for (const [id, source] of selectionsRef.current) {
      setFeatureStateForGeo(map, id, source, { selected: false });
    }
    selectionsRef.current.clear();
  }

  function clearGeo() {
    if (!mapRef.current) return;
    clearAllSelections(mapRef.current);
    setHoveredGeographies(null);
    setSelectedPanelProject(null);
    updateSearchParamsRef.current(
      { geo: null, project: null },
      { replace: true }
    );
  }

  const hoverGeoFill = (e: MouseEvent) => {
    if (!e.features || !mapRef.current) return;
    mapRef.current.getCanvas().style.cursor = 'pointer';

    const topSource = e.features[0].source as string;

    if (hoverRef.current) {
      setFeatureStateForGeo(
        mapRef.current,
        hoverRef.current.id,
        hoverRef.current.source,
        { hover: false }
      );
    }

    const foundHoverId = e.features[0].id + '';
    hoverRef.current = { id: foundHoverId, source: topSource };

    setFeatureStateForGeo(mapRef.current, foundHoverId, topSource, {
      hover: true,
    });

    let tooltipDisplayName = '';
    if (topSource === 'stateCentroids') {
      tooltipDisplayName = e.features[0].properties?.state;
    } else if (topSource === 'countyCentroids') {
      tooltipDisplayName = e.features[0].properties?.co_name;
    } else if (topSource === 'municipalCentroids') {
      tooltipDisplayName = e.features[0].properties?.mun_name;
    }
    const tooltipHTML = `<span className='text-lg text-dvrpc-gray-1'>${tooltipDisplayName}</span>`;
    tooltip
      .setLngLat(e.lngLat.wrap())
      .setHTML(tooltipHTML)
      .addTo(mapRef.current);
  };

  const leaveGeoFill = () => {
    if (!mapRef.current) return;
    mapRef.current.getCanvas().style.cursor = '';
    tooltip.remove();
    if (hoverRef.current) {
      setFeatureStateForGeo(
        mapRef.current,
        hoverRef.current.id,
        hoverRef.current.source,
        { hover: false }
      );
      hoverRef.current = null;
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (!mapRef.current || !e.features) return;

    const clickedId = e.features[0].id + '';
    const clickedSource = e.features[0].source + '';

    clearAllSelections(mapRef.current);
    addSelection(mapRef.current, clickedId, clickedSource);
    setSelectedPanelProject(null);
    setHoveredGeographies(null);
  };

  async function zoomToGeoid(geoid: string) {
    if (!mapRef.current) return;
    const bbox = await apiGet<Bbox>(`/gis/bbox/${geoid}`);
    mapRef.current.fitBounds(
      [
        [bbox.min_lng, bbox.min_lat],
        [bbox.max_lng, bbox.max_lat],
      ],
      { padding: 40, duration: 1200, easing: (t) => t * (2 - t) }
    );
  }

  const handleRegionalProjectsClick = () => {
    updateSearchParamsRef.current({ geo: '1' }, { replace: true });
  };

  useEffect(() => {
    updateSearchParamsRef.current = updateSearchParams;
  }, [updateSearchParams]);

  useEffect(() => {
    const geo = searchParams.get('geo');
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;

    const map = mapRef.current;

    clearAllSelections(map);

    if (!geo) {
      prevGeoRef.current = null;
      return;
    }

    const geoIds = geo.split(',').filter(Boolean);

    geoIds.forEach((id) => {
      const source = geoLengthSourceMap[id.length];
      if (!source) return;

      selectionsRef.current.set(id, source);
      setFeatureStateForGeo(map, id, source, { selected: true });
    });
    if (geo !== prevGeoRef.current) {
      zoomToGeoid(geo);
    }
    prevGeoRef.current = geo;
  }, [searchParams]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.style || !state.data) return;
    (map.getSource('stateCentroids') as mapboxgl.GeoJSONSource)?.setData(
      state.data
    );
  }, [state.data]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.style || !county.data) return;
    (map.getSource('countyCentroids') as mapboxgl.GeoJSONSource)?.setData(
      county.data
    );
  }, [county.data]);

  useEffect(() => {
    const map = mapRef.current;
    console.log(map?.style);

    if (!map || !map.style || !mcd.data) return;
    (map.getSource('municipalCentroids') as mapboxgl.GeoJSONSource)?.setData(
      mcd.data
    );
  }, [mcd.data]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous hover
    hoveredGeoidsRef.current.forEach((geoid) => {
      const source = geoLengthSourceMap[geoid.length];
      if (!source) return;
      setFeatureStateForGeo(mapRef.current!, geoid, source, { hover: false });
    });
    hoveredGeoidsRef.current = [];

    if (hoveredGeographies) {
      const geoids = hoveredGeographies
        .filter((g) => g.geo_type !== 'regional') // Skip regional for now
        .map((g) => g.geoid);
      geoids.forEach((geoid) => {
        const source = geoLengthSourceMap[geoid.length];
        if (!source) return;
        setFeatureStateForGeo(mapRef.current!, geoid, source, { hover: true });
      });
      hoveredGeoidsRef.current = geoids;
    }
  }, [hoveredGeographies]);

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
      style: 'mapbox://styles/ckirby98/cmndm12qu000m01qlb48t3970',
      center: [
        -(initialBounds.getWest() + initialBounds.getEast()) / 2,
        -(initialBounds.getNorth() + initialBounds.getSouth()) / 2,
      ],
      zoom: initialZoom,
      trackResize: true,
      bounds: initialBounds,
    }));

    map.on('load', () => {
      const layers = getLayers();

      map.resize();

      map.addControl(geocoder, 'top-right');
      map.addControl(new CustomNavigationControl({}, INITIAL_BOUNDS));

      for (const source in sources) map.addSource(source, sources[source]);
      for (const layer in layers) {
        map.addLayer(layers[layer]);
      }

      // Restore selections from URL on initial load
      const geoParam = urlParams.get('geo');
      if (geoParam) {
        geoParam.split(',').forEach((geo) => {
          const source = geoLengthSourceMap[geo.length];
          if (!source) return;
          selectionsRef.current.set(geo, source);
          setFeatureStateForGeo(map, geo, source, { selected: true });
        });
        prevGeoRef.current = geoParam;
      }
    });

    map.on('moveend', () => {
      const bounds = map.getBounds();
      if (!bounds) return;
      const encoded = encodeBoundsBase62(bounds);
      const zoom = Math.floor(map.getZoom());
      updateSearchParamsRef.current(
        { bb: encoded, zoom: zoom.toString() },
        { replace: true }
      );
    });

    map.on(
      'mousemove',
      ['county-bubbles', 'municipal-bubbles', 'state-bubbles'],
      hoverGeoFill
    );
    map.on(
      'mouseleave',
      ['county-bubbles', 'municipal-bubbles', 'state-bubbles'],
      leaveGeoFill
    );
    map.on(
      'click',
      ['county-bubbles', 'municipal-bubbles', 'state-bubbles'],
      handleClick
    );

    return () => {
      map.remove();
    };
  }, []);

  const hasSelections = !!searchParams.get('geo');

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full"></div>
      {hasSelections && <RemoveSelectionPopup onClick={clearGeo} />}
      {totalRegionalProjects !== undefined && totalRegionalProjects > 0 && (
        <RegionalProjects
          regionalProjectCount={totalRegionalProjects}
          onClick={handleRegionalProjectsClick}
          selected={searchParams.get('geo') === '1'}
        />
      )}
      <Legend />
    </div>
  );
}
