import type { GIS_FILTER_PARAMS, STATUS_OPTIONS } from '@consts';
import type {
  SourceSpecification,
  LayerSpecification,
  MapMouseEvent,
  GeoJSONFeature,
} from 'mapbox-gl';

// API TYPES

export type ProjectsParams = {
  bbox?: string;
  geographies?: string;
  keywords?: string;
  sort?: string;
  project?: string;
  status?: string;
  zoom?: string;
  yearFrom?: string;
  yearTo?: string;
};

export interface Project {
  project_id: number;
  internal: boolean;
  created_at: string;
  updated_at: string;
  product: Product;
  needs: Need[];
  recommendations: Recommendation[];
  geographies: Geography[];
  keywords: Keyword[];
}

export interface Product {
  pub_id: string;
  typecode: string;
  pub_num: string;
  title: string;
  subtitle: any;
  keywords: string;
  abstract: string;
  createdate: string;
  livedate: string;
  lastupdatedate: string;
  pub_date: string;
  createby: string;
  status: string;
}

export interface Need {
  need_id: number;
  project_id: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  recommendation_id: number;
  project_id: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Agency {
  agency_id: number;
  name: string;
  address: string | null;
  email: string | null;
  phone: string | null;
}

export type GeoType = 'regional' | 'county' | 'municipality' | 'csa';

export interface Geography {
  name: string;
  geo_type: GeoType;
  geoid: string;
  dvrpc_reg: boolean;
}

export interface Keyword {
  keyword_id: number;
  name: string;
}

export type Bbox = {
  min_lng: number;
  min_lat: number;
  max_lng: number;
  max_lat: number;
};

// UI TYPES

export interface Option {
  value: string;
  label: string;
}

// Map Types

export type MouseEvent = MapMouseEvent & {
  features?: GeoJSONFeature[];
};
export type GeoJSONProperties = Record<string, string | number | boolean>;

export interface LayerMap {
  [key: string]: LayerSpecification;
}

export interface SourceMap {
  [key: string]: SourceSpecification;
}

export type GisFilterParam = (typeof GIS_FILTER_PARAMS)[number];
export type GisParams = Partial<Record<GisFilterParam, string>>;

// other types

export type StatusOption = (typeof STATUS_OPTIONS)[number];
