import { useRef, useCallback } from 'react';
import { NJ_FIPS, PA_FIPS } from '@consts';

export const CSA_POLYGON_SOURCE =
  'project_inventory_tool_custom_study_areas_polygon';

export const geoLengthSourceMap: Record<number, string> = {
  2: 'stateCentroids',
  5: 'countyCentroids',
  10: 'municipalCentroids',
};

const centroidToFillSourceMap: Record<string, string> = {
  stateCentroids: 'countyboundaries',
  countyCentroids: 'countyboundaries',
  municipalCentroids: 'dvrpc_mcd_phicpa',
};

export function useMapSelections() {
  const selectionsRef = useRef<Map<string, string>>(new Map());

  const setFeatureStateForGeo = useCallback(
    (
      map: mapboxgl.Map,
      id: string,
      source: string,
      state: Record<string, boolean>
    ) => {
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
    },
    []
  );

  const addSelection = useCallback(
    (
      map: mapboxgl.Map,
      id: string,
      source: string,
      onSelect?: (ids: string[]) => void
    ) => {
      selectionsRef.current.set(id, source);
      setFeatureStateForGeo(map, id, source, { selected: true });
      onSelect?.(Array.from(selectionsRef.current.keys()));
    },
    [setFeatureStateForGeo]
  );

  const addCsaSelection = useCallback(
    (map: mapboxgl.Map, pubId: string, source: string, sourceLayer: string) => {
      selectionsRef.current.set(pubId, source);
      map.setFeatureState(
        { source, sourceLayer, id: pubId },
        { selected: true }
      );
    },
    []
  );

  const clearAllSelections = useCallback(
    (map: mapboxgl.Map) => {
      for (const [id, source] of selectionsRef.current) {
        if (source.startsWith(CSA_POLYGON_SOURCE)) {
          map.setFeatureState(
            { source, sourceLayer: source, id },
            { selected: false }
          );
        } else {
          setFeatureStateForGeo(map, id, source, { selected: false });
        }
      }
      selectionsRef.current.clear();
    },
    [setFeatureStateForGeo]
  );

  return {
    selectionsRef,
    setFeatureStateForGeo,
    addSelection,
    addCsaSelection,
    clearAllSelections,
  };
}
