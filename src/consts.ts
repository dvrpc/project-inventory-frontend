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
