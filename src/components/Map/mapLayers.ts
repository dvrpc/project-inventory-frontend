import type { LayerMap } from '@types'

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
  countyBubbles: {
    id: 'county-bubbles',
    type: 'circle',
    source: 'countyCentroids',
    minzoom: 9,
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['coalesce', ['feature-state', 'project_count'], 0],
        0,
        0,
        1,
        6,
        10,
        16,
        25,
        28,
      ],
      'circle-color': '#2563eb',
      'circle-opacity': 0.75,
    },
  },
  municipalBubbles: {
    id: 'municipal-bubbles',
    type: 'circle',
    source: 'municipalCentroids',
    maxzoom: 9,
    paint: {
      'circle-radius': 4,
      'circle-color': '#f28cb1',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff',
    },
  },
}

export default layers
