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
import { INITIAL_BOUNDS } from '@consts';
import RegionalProjects from './RegionalProjects';
import getLayers from './mapLayers';
import RemoveSelectionPopup from './RemoveSelectionPopup';
import {
  useMapSelections,
  geoLengthSourceMap,
  CSA_POLYGON_SOURCE,
} from './hooks/useMapSelections';
import { useMapHover } from './hooks/useMapHover';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface Props {
  projects: ProjectType[] | undefined;
  hoveredGeographies: Geography[] | null;
  setHoveredGeographies: (geographies: Geography[] | null) => void;
  setSelectedPanelProject: (project: ProjectType | null) => void;
  setHoveredProjectId: (projectId: number | null) => void;
  hoveredCsaPubId: string | null;
}

export const tooltip = new Popup({
  closeButton: false,
  closeOnClick: false,
  anchor: 'left',
  offset: 25,
});

const INTERACTIVE_LAYERS = [
  'county-bubbles',
  'municipal-bubbles',
  'state-bubbles',
  'custom-study-area-polygons',
];

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
    setHoveredProjectId,
    hoveredCsaPubId,
  } = props;
  const { searchParams, updateSearchParams } = useUpdateSearchParams();
  const { state, county, mcd } = useGisSourcesFromUrl();

  const {
    setFeatureStateForGeo,
    addSelection,
    addCsaSelection,
    clearAllSelections,
  } = useMapSelections();
  const { clearHover, setHover, clearHoverRef } = useMapHover(
    setFeatureStateForGeo
  );

  const updateSearchParamsRef = useRef(updateSearchParams);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const prevGeoRef = useRef<string | null>(null);
  const hoveredGeoidsRef = useRef<string[]>([]);
  const projectsRef = useRef(projects);

  projectsRef.current = projects;
  updateSearchParamsRef.current = updateSearchParams;

  function findProjectByPubId(pubId: string) {
    return projectsRef.current?.find((p) => p.product.pub_id === pubId);
  }

  function updateCustomStudyAreaFilters(map: mapboxgl.Map) {
    const csaProjectPubIds = [
      ...new Set(
        (projectsRef.current ?? [])
          .filter((p) => p.geographies[0]?.geo_type === 'csa')
          .map((p) => p.product.pub_id)
      ),
    ];
    const filter = csaProjectPubIds.length
      ? ([
          'match',
          ['get', 'pub_id'],
          csaProjectPubIds,
          true,
          false,
        ] as mapboxgl.ExpressionSpecification)
      : ([
          '==',
          ['get', 'pub_id'],
          '__no_csa_projects__',
        ] as mapboxgl.ExpressionSpecification);

    for (const layerId of [
      'custom-study-area-lines',
      'custom-study-area-polygons',
    ]) {
      if (map.getLayer(layerId)) map.setFilter(layerId, filter);
    }
  }

  const totalRegionalProjects = projects?.filter(
    (p) => p.geographies[0].geo_type === 'regional'
  ).length;

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
    const map = mapRef.current;
    map.getCanvas().style.cursor = 'pointer';

    const feature = e.features[0];
    clearHover(map);

    if (feature.layer?.id === 'custom-study-area-polygons') {
      const pubId = String(feature.properties?.pub_id ?? '');
      const project = findProjectByPubId(pubId);
      setHover({
        id: pubId,
        source: feature.source as string,
        sourceLayer: feature.sourceLayer,
      });
      map.setFeatureState(
        {
          source: feature.source as string,
          sourceLayer: feature.sourceLayer,
          id: pubId,
        },
        { hover: true }
      );
      setHoveredProjectId(project?.project_id ?? null);
      return;
    }

    const topSource = feature.source as string;
    const foundHoverId = feature.id + '';
    setHover({ id: foundHoverId, source: topSource });
    setFeatureStateForGeo(map, foundHoverId, topSource, { hover: true });

    let tooltipDisplayName = '';
    if (topSource === 'stateCentroids') {
      tooltipDisplayName = e.features[0].properties?.state;
    } else if (topSource === 'countyCentroids') {
      tooltipDisplayName = e.features[0].properties?.co_name;
    } else if (topSource === 'municipalCentroids') {
      tooltipDisplayName = e.features[0].properties?.mun_name;
    }
    const tooltipHTML = `<span className='text-lg text-dvrpc-gray-1'>${tooltipDisplayName}</span>`;
    tooltip.setLngLat(e.lngLat.wrap()).setHTML(tooltipHTML).addTo(map);
  };

  const leaveGeoFill = () => {
    if (!mapRef.current) return;
    mapRef.current.getCanvas().style.cursor = '';
    setHoveredProjectId(null);
    tooltip.remove();
    clearHover(mapRef.current);
    clearHoverRef();
  };

  const handleClick = (e: MouseEvent) => {
    if (!mapRef.current || !e.features) return;
    const map = mapRef.current;

    const feature = e.features[0];
    if (feature.layer?.id === 'custom-study-area-polygons') {
      const pubId = String(feature.properties?.pub_id ?? '');
      const project = findProjectByPubId(pubId);
      if (project) {
        clearAllSelections(map);
        addCsaSelection(
          map,
          pubId,
          feature.source as string,
          feature.sourceLayer as string
        );
        updateSearchParamsRef.current(
          { project: String(project.project_id), geo: '0' },
          { replace: true }
        );
        setSelectedPanelProject(project);
      }
      return;
    }

    const clickedId = feature.id + '';
    const clickedSource = feature.source + '';

    clearAllSelections(map);
    addSelection(map, clickedId, clickedSource, (ids) => {
      updateSearchParamsRef.current({ geo: ids.join(',') }, { replace: true });
    });
    setSelectedPanelProject(null);
    setHoveredGeographies(null);
  };

  async function zoomToBbox(path: string) {
    if (!mapRef.current) return;
    try {
      const bbox = await apiGet<Bbox>(path);
      mapRef.current.fitBounds(
        [
          [bbox.min_lng, bbox.min_lat],
          [bbox.max_lng, bbox.max_lat],
        ],
        { padding: 40, duration: 1200, easing: (t) => t * (2 - t) }
      );
    } catch (err) {
      console.error(`Failed to fetch bbox from ${path}`, err);
    }
  }

  function zoomToGeoid(geoids: string) {
    return zoomToBbox(`/gis/bbox/${geoids}`);
  }

  function zoomToCsa(pubId: string) {
    return zoomToBbox(`/gis/bbox/csa/${pubId}`);
  }

  const handleRegionalProjectsClick = () => {
    updateSearchParamsRef.current({ geo: '1' }, { replace: true });
  };

  useEffect(() => {
    const geo = searchParams.get('geo');
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;

    const map = mapRef.current;

    clearAllSelections(map);

    if (!geo) {
      prevGeoRef.current = null;
      return;
    }

    if (geo === '0') {
      const projectId = searchParams.get('project');
      const project = projectsRef.current?.find(
        (p) => String(p.project_id) === projectId
      );
      const pubId = project?.product.pub_id;
      if (pubId) {
        addCsaSelection(map, pubId, CSA_POLYGON_SOURCE, CSA_POLYGON_SOURCE);
        if (geo !== prevGeoRef.current) zoomToCsa(pubId);
      }
      prevGeoRef.current = geo;
      return;
    }

    const geoIds = geo.split(',').filter(Boolean);

    geoIds.forEach((id) => {
      const source = geoLengthSourceMap[id.length];
      if (!source) return;
      addSelection(map, id, source);
    });

    if (geo !== prevGeoRef.current && geo !== '1') {
      zoomToGeoid(geo);
    }
    prevGeoRef.current = geo;
  }, [searchParams]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.style) return;

    const sourceData: Record<string, GeoJSON.FeatureCollection | undefined> = {
      stateCentroids: state.data,
      countyCentroids: county.data,
      municipalCentroids: mcd.data,
    };

    for (const [sourceId, data] of Object.entries(sourceData)) {
      if (!data) continue;
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource)?.setData(data);
    }
  }, [state.data, county.data, mcd.data]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !projects) return;
    updateCustomStudyAreaFilters(map);
  }, [projects]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear previous hover
    hoveredGeoidsRef.current.forEach((geoid) => {
      const source = geoLengthSourceMap[geoid.length];
      if (!source) return;
      setFeatureStateForGeo(map, geoid, source, { hover: false });
    });
    hoveredGeoidsRef.current = [];

    if (hoveredGeographies) {
      const geoids = hoveredGeographies
        .filter((g) => g.geo_type !== 'regional')
        .map((g) => g.geoid);
      geoids.forEach((geoid) => {
        const source = geoLengthSourceMap[geoid.length];
        if (!source) return;
        setFeatureStateForGeo(map, geoid, source, { hover: true });
      });
      hoveredGeoidsRef.current = geoids;
    }
  }, [hoveredGeographies]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !hoveredCsaPubId) return;

    const setCsaHover = (hover: boolean) => {
      map.setFeatureState(
        {
          source: CSA_POLYGON_SOURCE,
          sourceLayer: CSA_POLYGON_SOURCE,
          id: hoveredCsaPubId,
        },
        { hover }
      );
      map.setFeatureState(
        {
          source: 'project_inventory_tool_custom_study_areas',
          sourceLayer: 'project_inventory_tool_custom_study_areas',
          id: hoveredCsaPubId,
        },
        { hover }
      );
    };

    setCsaHover(true);
    return () => setCsaHover(false);
  }, [hoveredCsaPubId]);

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
      center: initialBounds.getCenter(),
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
      for (const layer in layers) map.addLayer(layers[layer]);
      updateCustomStudyAreaFilters(map);

      // Restore selections from URL on initial load
      const geoParam = urlParams.get('geo');
      if (geoParam) {
        if (geoParam === '0') {
          const projectId = urlParams.get('project');
          const project = projectsRef.current?.find(
            (p) => String(p.project_id) === projectId
          );
          const pubId = project?.product.pub_id;
          if (pubId) {
            addCsaSelection(map, pubId, CSA_POLYGON_SOURCE, CSA_POLYGON_SOURCE);
            zoomToCsa(pubId);
          }
        } else {
          const geoIds = geoParam.split(',').filter(Boolean);
          geoIds.forEach((geo) => {
            const source = geoLengthSourceMap[geo.length];
            if (!source) return;
            addSelection(map, geo, source);
          });

          if (geoParam !== '1') zoomToGeoid(geoParam);
        }
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

    map.on('mousemove', INTERACTIVE_LAYERS, hoverGeoFill);
    map.on('mouseleave', INTERACTIVE_LAYERS, leaveGeoFill);
    map.on('click', INTERACTIVE_LAYERS, handleClick);

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
