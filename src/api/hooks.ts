import {
  useMutation,
  useQuery,
  type MutationOptions,
} from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost } from './api';
import type {
  Geography,
  Keyword,
  Product,
  Project,
  ProjectsParams,
} from '@types';
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
    keywords: searchParams.get('keywords') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
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
      geoid,
    }: {
      project_id: number;
      geoid: string;
    }) => apiPost('/project-geography', { project_id, geography_id: geoid }),
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

export function useKeywords() {
  return useQuery({
    queryKey: ['keyword'],
    queryFn: () => apiGet<Keyword[]>('/keyword'),
  });
}

export function useCreateKeyword() {
  return useMutation({
    mutationFn: (name: string) => apiPost<Keyword>('/keyword', { name }),
  });
}

export function useCreateProjectKeyword() {
  return useMutation({
    mutationFn: ({
      project_id,
      keyword_id,
    }: {
      project_id: number;
      keyword_id: number;
    }) => apiPost('/project-keyword', { project_id, keyword_id }),
  });
}

export function useCreateProjectKeywords() {
  const { mutateAsync: createKeyword } = useCreateKeyword();
  const { mutateAsync: createProjectKeyword } = useCreateProjectKeyword();

  return useMutation({
    mutationFn: async ({
      project_id,
      keywords,
    }: {
      project_id: number;
      keywords: { name: string; keyword_id?: number }[];
    }) => {
      return Promise.all(
        keywords.map(async (k) => {
          const keyword_id =
            k.keyword_id ?? (await createKeyword(k.name)).keyword_id;
          return createProjectKeyword({ project_id, keyword_id });
        })
      );
    },
  });
}

export function useDeleteProject() {
  return useMutation({
    mutationFn: ({ project_id }: { project_id: number }) =>
      apiDelete(`/project/${project_id}`),
  });
}

export function useDeleteProjectKeyword() {
  return useMutation({
    mutationFn: ({
      project_id,
      keyword_id,
    }: {
      project_id: number;
      keyword_id: number;
    }) => apiDelete(`/project-keyword/${project_id}/${keyword_id}`),
  });
}

export function useDeleteProjectGeography() {
  return useMutation({
    mutationFn: ({
      project_id,
      geoid,
    }: {
      project_id: number;
      geoid: string;
    }) => apiDelete(`/project-geography/${project_id}/${geoid}`),
  });
}

export function useCountyProjects(params?: ProjectsParams) {
  return useQuery({
    queryKey: ['gis', 'county-projects', params ?? null],
    queryFn: () =>
      apiGet<GeoJSON.FeatureCollection>('/gis/county_projects', params),
  });
}

export function useMcdPhicpaProjects(params?: ProjectsParams) {
  return useQuery({
    queryKey: ['gis', 'mcd-phicpa-projects', params ?? null],
    queryFn: () =>
      apiGet<GeoJSON.FeatureCollection>('/gis/mcd_phicpa_projects', params),
  });
}

export function useGisSourcesFromUrl() {
  const [searchParams] = useSearchParams();

  const params: ProjectsParams = {
    geographies: searchParams.get('geo') ?? undefined,
    keywords: searchParams.get('keywords') ?? undefined,
  };

  const county = useCountyProjects(params);
  const mcd = useMcdPhicpaProjects(params);

  return { county, mcd };
}
