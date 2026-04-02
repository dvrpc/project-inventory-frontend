import type { LayerMap } from '@types';
import { themeColor } from '@utils';

const getLayers = (): LayerMap => ({
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
  stateBubbles: {
    id: 'state-bubbles',
    type: 'circle',
    source: 'stateCentroids',
    maxzoom: 9,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 12, 14, 32],
      'circle-color': themeColor('--color-state'),
      'circle-opacity': 0.9,
      'circle-stroke-color': 'red',
      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        3,
        ['boolean', ['feature-state', 'selected'], false],
        3,
        0,
      ],
    },
    filter: ['>', ['get', 'project_count'], 0],
  },
  stateBubbleLabels: {
    id: 'state-bubble-labels',
    type: 'symbol',
    source: 'stateCentroids',
    maxzoom: 9,
    layout: {
      'text-field': '{project_count}',
      'text-font': ['DIN Pro Bold'],
      'text-size': 16,
      'text-anchor': 'center',
      'text-allow-overlap': true,
    },
    paint: {
      'text-color': 'white',
    },
    filter: ['>', ['get', 'project_count'], 0],
  },
  countyBubbles: {
    id: 'county-bubbles',
    type: 'circle',
    source: 'countyCentroids',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 9, 14, 25],
      'circle-color': themeColor('--color-county'),
      'circle-opacity': 0.9,
      'circle-stroke-color': 'red',
      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        3,
        ['boolean', ['feature-state', 'selected'], false],
        3,
        0,
      ],
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
      'text-font': ['DIN Pro Bold'],
      'text-size': 14,
      'text-anchor': 'center',
      'text-allow-overlap': true,
    },
    paint: {
      'text-color': 'white',
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
      'circle-color': themeColor('--color-municipality'),
      'circle-opacity': 0.9,
      'circle-stroke-color': 'red',
      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        3,
        ['boolean', ['feature-state', 'selected'], false],
        3,
        0,
      ],
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
      'text-font': ['DIN Pro Bold'],
      'text-size': 12,
      'text-anchor': 'center',
      'text-allow-overlap': true,
    },
    paint: {
      'text-color': 'white',
    },
    filter: ['>', ['get', 'project_count'], 0],
  },
});

export default getLayers;
