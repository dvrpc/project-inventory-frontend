import { useQuery } from '@tanstack/react-query';
import { apiGet } from './api';
import type { Project, ProjectsParams } from '@types';
import { useSearchParams } from 'react-router-dom';
import { decodeBoundsToString } from '@components/Map/utils';

export function useProjects(params?: ProjectsParams) {
  return useQuery({
    queryKey: ['project', params ?? null],
    queryFn: () => apiGet<Project[]>('/project', params),
  });
}

export function useProjectsFromUrl() {
  const [searchParams] = useSearchParams();
  const bb = searchParams.get('bb');
  const params: ProjectsParams = {
    bbox: bb ? (decodeBoundsToString(bb) ?? undefined) : undefined,
  };

  return useProjects(params);
}
