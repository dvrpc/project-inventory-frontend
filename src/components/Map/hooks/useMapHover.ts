import { useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

interface HoveredFeature {
  id: string;
  source: string;
  sourceLayer?: string;
}

/**
 * Owns the single "currently hovered feature" ref and the logic for
 * clearing its hover feature-state. Both `hoverGeoFill` and `leaveGeoFill`
 * in the map component previously duplicated the
 * `sourceLayer ? ... : setFeatureStateForGeo(...)` branch — that branch
 * now lives here once.
 */
export function useMapHover(
  setFeatureStateForGeo: (
    map: mapboxgl.Map,
    id: string,
    source: string,
    state: Record<string, boolean>
  ) => void
) {
  const hoverRef = useRef<HoveredFeature | null>(null);

  const clearHover = useCallback(
    (map: mapboxgl.Map) => {
      const hover = hoverRef.current;
      if (!hover) return;

      if (hover.sourceLayer) {
        map.setFeatureState(
          {
            source: hover.source,
            sourceLayer: hover.sourceLayer,
            id: hover.id,
          },
          { hover: false }
        );
      } else {
        setFeatureStateForGeo(map, hover.id, hover.source, { hover: false });
      }
    },
    [setFeatureStateForGeo]
  );

  const setHover = useCallback((feature: HoveredFeature) => {
    hoverRef.current = feature;
  }, []);

  const clearHoverRef = useCallback(() => {
    hoverRef.current = null;
  }, []);

  return { hoverRef, clearHover, setHover, clearHoverRef };
}
