import {
  useMutation,
  useQuery,
  type MutationOptions,
} from '@tanstack/react-query';
import { apiGet, apiPost } from './api';
import type { Geography, Product, Project, ProjectsParams } from '@types';
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

  const params: ProjectsParams = {
    bbox: decodeBoundsToString(searchParams.get('bb') ?? '') ?? undefined,
    geographies: searchParams.get('geo') ?? undefined,
  };

  return useProjects(params);
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => apiGet<Product[]>('/product'),
  });
}

export function useGeographies() {
  return useQuery({
    queryKey: ['geographies'],
    queryFn: () => apiGet<Geography[]>('/geography'),
  });
}

export function useCreateProjectGeography() {
  return useMutation({
    mutationFn: ({
      project_id,
      geography_id,
    }: {
      project_id: number;
      geography_id: number;
    }) => apiPost('/project-geography', { project_id, geography_id }),
  });
}

export function useCreateProject(
  options?: MutationOptions<Project, Error, string>
) {
  const { mutateAsync: createProjectGeography } = useCreateProjectGeography();

  return {
    createProjectGeography,
    ...useMutation({
      mutationFn: (productId: string) =>
        apiPost<Project>('/project', { product_id: productId, internal: true }),
      ...options,
    }),
  };
}
