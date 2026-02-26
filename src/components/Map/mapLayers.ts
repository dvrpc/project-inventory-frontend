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
}

export default layers
