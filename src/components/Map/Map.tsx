import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import sources from './mapSources';
import Legend from './Legend';
import { decodeBoundsBase62, encodeBoundsBase62 } from './utils';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { useUpdateSearchParams } from '@hooks/useUpdateSearchParams';
import { useGisSourcesFromUrl } from '@api/hooks';
import type { Bbox, MouseEvent } from '@types';
import type { Project as ProjectType } from '@types';

import { apiGet } from '@api/api';
import { CustomNavigationControl } from './CustomNavigationControl';
import { INITIAL_BOUNDS } from '@consts';
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
}

const geoLengthSourceMap: Record<number, string> = {
  2: 'stateCentroids',
  5: 'countyCentroids',
  10: 'municipalCentroids',
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

export default function Map(props: Props) {
  const { projects } = props;
  const { searchParams, updateSearchParams } = useUpdateSearchParams();
  const { state, county, mcd } = useGisSourcesFromUrl();

  const updateSearchParamsRef = useRef(updateSearchParams);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const hoverRef = useRef<Feature | null>(null);
  const selectRef = useRef<Feature | null>(null);
  const prevGeoRef = useRef<string | null>(null);

  const totalRegionalProjects = projects?.filter(
    (p) => p.geographies[0].geo_type === 'regional'
  ).length;

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
    mapRef.current.removeFeatureState({ source: 'stateCentroids' });

    setSelect(null);
  }

  function clearGeo() {
    removeSelection();
    updateSearchParamsRef.current(
      { geo: null, project: null },
      { replace: true }
    );
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
    if (!geo) {
      prevGeoRef.current = null;
      removeSelection();
      return;
    }

    const source = geoLengthSourceMap[geo.length];

    if (!mapRef.current) return;
    if (!mapRef.current.isStyleLoaded()) return;

    removeSelection();
    setSelect({ id: geo, source });
    mapRef.current.setFeatureState({ source, id: geo }, { selected: true });

    if (geo !== prevGeoRef.current) {
      zoomToGeoid(geo);
    }

    prevGeoRef.current = geo;
  }, [searchParams]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !state.data) return;
    (map.getSource('stateCentroids') as mapboxgl.GeoJSONSource)?.setData(
      state.data
    );
  }, [state.data]);

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

      const geoParam = urlParams.get('geo');
      if (geoParam && !geoParam.includes(',')) {
        const source = geoLengthSourceMap[geoParam.length];

        setSelect({ id: geoParam, source });
        map.setFeatureState({ source, id: geoParam }, { selected: true });
        prevGeoRef.current = geoParam;
      }
    });

    mapRef.current = map;

    map.on('moveend', () => {
      const bounds = map.getBounds();
      if (!bounds) return;

      const encoded = encodeBoundsBase62(bounds);
      const zoom = Math.floor(map.getZoom());
      console.log(map.getZoom());
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

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full"></div>
      {searchParams.get('geo') && <RemoveSelectionPopup onClick={clearGeo} />}
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
