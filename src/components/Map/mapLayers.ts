import type { LayerMap } from '@types';

const layers: LayerMap = {
  countyOutline: {
    id: 'county-outline-base',
    type: 'line',
    source: 'countyboundaries',
    'source-layer': 'countyboundaries',
    paint: {
      'line-width': 2.5,
      'line-color': '#505a5e',
    },
    filter: ['==', 'dvrpc_reg', 'Yes'],
  },
  muniOutline: {
    id: 'muni-outline-base',
    type: 'line',
    source: 'municipalboundaries',
    'source-layer': 'municipalboundaries',
    paint: {
      'line-width': 1,
      'line-color': '#505a5e',
    },
    filter: ['==', 'dvrpc_reg', 'Yes'],
    minzoom: 10,
  },
  countyBubbles: {
    id: 'county-bubbles',
    type: 'circle',
    source: 'countyCentroids',
    maxzoom: 10,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 8, 10, 14],
      'circle-color': '#0078ae',

      'circle-opacity': [
        'case',
        ['boolean', ['feature-state', 'visible'], false],
        0.8,
        0,
      ],
    },
  },
  countyBubbleLabels: {
    id: 'county-bubble-labels',
    type: 'symbol',
    source: 'countyCentroids',
    maxzoom: 10,
    layout: {
      'text-field': '{project_count}',
      'text-font': ['DIN Pro Medium'],
      'text-size': 12,
    },
  },
  municipalBubbles: {
    id: 'municipal-bubbles',
    type: 'circle',
    source: 'municipalCentroids',
    minzoom: 10,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 8, 14, 12],
      'circle-color': '#9C2A7F',
      'circle-opacity': [
        'case',
        ['boolean', ['feature-state', 'visible'], false],
        0.8,
        0,
      ],
    },
  },
};

export default layers;
