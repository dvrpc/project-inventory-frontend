import { useQuery } from '@tanstack/react-query'
import { apiGet } from './api'
import type { Project } from '@types'

export function useProjects() {
  return useQuery({
    queryKey: ['project'],
    queryFn: () => apiGet<Project[]>('/project'),
  })
}
