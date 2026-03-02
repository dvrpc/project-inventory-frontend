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
  },
  municipalCentroids: {
    type: 'geojson',
    data: '/geojson/mcd_phicpa_centroids.geojson',
  },
};

export default sources;
