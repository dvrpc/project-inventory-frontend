import mapboxgl from 'mapbox-gl';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
export const PRODUCT_IMAGE_BASE_URL = 'https://www.dvrpc.org/asp/pubs';
export const GIS_FILTER_PARAMS = [
  'geo',
  'keywords',
  'category',
  'status',
  'agency',
  'type',
] as const;
export const STATUS_OPTIONS = [
  'Live',
  'Not Live',
  'Cancel',
  'Developing',
  'Restricted Access',
  'Obsolete',
  'Reviewing',
];
export const INITIAL_BOUNDS = new mapboxgl.LngLatBounds(
  [-76.09405517578125, 39.49211914385648],
  [-74.32525634765625, 40.614734298694216]
);

export const PA_FIPS = ['42029', '42045', '42091', '42101', '42017'];
export const NJ_FIPS = ['34015', '34007', '34005', '34021'];
