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

// UI TYPES

export interface Option {
  value: string
  label: string
}

//
