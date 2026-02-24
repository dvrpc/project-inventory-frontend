import { useQuery } from '@tanstack/react-query'
import { apiGet } from './api'
import type { Project } from '../types'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiGet<Project[]>('/projects/'),
  })
}
