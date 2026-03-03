import type { SourceMap } from '@types';

const sources: SourceMap = {
  countyboundaries: {
    type: 'vector',
    url: 'https://tiles.dvrpc.org/data/boundaries/countyboundaries',
  },
  municipalboundaries: {
    type: 'vector',
    url: 'https://tiles.dvrpc.org/data/boundaries/municipalboundaries',
  },
  countyCentroids: {
    type: 'geojson',
    data: '/geojson/county_centroids.geojson',
    promoteId: 'geoid',
  },
  municipalCentroids: {
    type: 'geojson',
    data: '/geojson/mcd_phicpa_centroids.geojson',
    promoteId: 'geoid',
  },
};

export default sources;
