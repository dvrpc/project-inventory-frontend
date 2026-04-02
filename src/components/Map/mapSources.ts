import { API_BASE_URL } from '@consts';
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
    data: `${API_BASE_URL}/gis/county_projects`,
    promoteId: 'geoid',
  },
  municipalCentroids: {
    type: 'geojson',
    data: `${API_BASE_URL}/gis/mcd_phicpa_projects`,
    promoteId: 'geoid',
  },
  stateCentroids: {
    type: 'geojson',
    data: `${API_BASE_URL}/gis/state_projects`,
    promoteId: 'geoid',
  },
};

export default sources;
