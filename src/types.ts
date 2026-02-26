import type {
  SourceSpecification,
  LayerSpecification,
  MapMouseEvent,
  GeoJSONFeature,
} from 'mapbox-gl'

// API TYPES

export interface Project {
  project_id: number
  internal: boolean
  created_at: string
  updated_at: string
  product: Product
  needs: Need[]
  recommendations: Recommendation[]
}

export interface Product {
  pub_id: string
  typecode: string
  pub_num: string
  title: string
  subtitle: any
  keywords: string
  abstract: string
  createdate: string
  livedate: string
  lastupdatedate: string
  pub_date: string
  createby: string
  status: string
}

export interface Need {
  need_id: number
  project_id: number
  description: string
  created_at: string
  updated_at: string
}

export interface Recommendation {
  recommendation_id: number
  project_id: number
  description: string
  created_at: string
  updated_at: string
}

export interface Agency {
  agency_id: number
  name: string
  address: string | null
  email: string | null
  phone: string | null
}

// UI TYPES

export interface Option {
  value: string
  label: string
}

// Map Types

export type MouseEvent = MapMouseEvent & {
  features?: GeoJSONFeature[]
}
export type GeoJSONProperties = Record<string, string | number | boolean>

export interface LayerMap {
  [key: string]: LayerSpecification
}

export interface SourceMap {
  [key: string]: SourceSpecification
}
