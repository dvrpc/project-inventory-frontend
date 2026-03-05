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
      'line-width': 0.5,
      'line-color': '#505a5e',
    },
    filter: ['==', 'dvrpc_reg', 'Yes'],
    minzoom: 9,
  },
  countyBubbles: {
    id: 'county-bubbles',
    type: 'circle',
    source: 'countyCentroids',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 9, 14, 25],
      'circle-color': '#0078ae',
      'circle-opacity': 0.7,
    },
    filter: [
      'case',
      ['>=', ['zoom'], 9],
      ['>', ['get', 'county_project_count'], 0],
      ['>', ['get', 'total_project_count'], 0],
    ],
  },
  countyBubbleLabels: {
    id: 'county-bubble-labels',
    type: 'symbol',
    source: 'countyCentroids',
    layout: {
      'text-field': [
        'step',
        ['zoom'],
        ['to-string', ['get', 'total_project_count']],
        9,
        ['to-string', ['get', 'county_project_count']],
      ],
      'text-font': ['DIN Pro Medium'],
      'text-size': 12,
      'text-anchor': 'center',
      'text-allow-overlap': true,
    },
    filter: [
      'case',
      ['>=', ['zoom'], 9],
      ['>', ['get', 'county_project_count'], 0],
      ['>', ['get', 'total_project_count'], 0],
    ],
  },
  municipalBubbles: {
    id: 'municipal-bubbles',
    type: 'circle',
    source: 'municipalCentroids',
    minzoom: 9,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 11, 14, 20],
      'circle-color': '#9C2A7F',
      'circle-opacity': 0.7,
    },
    filter: ['>', ['get', 'project_count'], 0],
  },
  municipalBubbleLabels: {
    id: 'municipal-bubble-labels',
    type: 'symbol',
    source: 'municipalCentroids',
    minzoom: 9,
    layout: {
      'text-field': '{project_count}',
      'text-font': ['DIN Pro Medium'],
      'text-size': 12,
      'text-anchor': 'center',
      'text-allow-overlap': true,
    },
    filter: ['>', ['get', 'project_count'], 0],
  },
};

export default layers;
