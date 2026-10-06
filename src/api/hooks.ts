import {
  useMutation,
  useQuery,
  type MutationOptions,
} from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost } from './api';
import type {
  CustomStudyArea,
  Geography,
  Keyword,
  Project,
  ProjectsParams,
} from '@types';
import { useSearchParams } from 'react-router-dom';
import { decodeBoundsToString } from '@components/Map/utils';
import { useAuth } from '../auth/AuthContext';

export function useAdminStatus(isAuthenticated: boolean, authSession: number) {
  return useQuery({
    queryKey: ['admin-status', authSession],
    queryFn: () => apiGet<{ is_admin: boolean }>('/user'),
    enabled: isAuthenticated,
    retry: false,
  });
}

export function useProjects(params?: ProjectsParams) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['project', params ?? null, isAuthenticated],
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
    project: searchParams.get('project') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    zoom: searchParams.get('zoom') ?? undefined,
    yearFrom: searchParams.get('yearFrom') ?? undefined,
    yearTo: searchParams.get('yearTo') ?? undefined,
    wpids: searchParams.get('wpids') ?? undefined,
  };

  return useProjects(params);
}

export function useGeographies() {
  return useQuery({
    queryKey: ['geographies'],
    queryFn: () => apiGet<Geography[]>('/geography'),
  });
}

export function useCreateProjectGeography() {
  return useMutation({
    mutationFn: ({ pub_id, geoid }: { pub_id: string; geoid: string }) =>
      apiPost('/project-geography', { pub_id, geography_id: geoid }),
  });
}

export function useCreateProject(
  options?: MutationOptions<Project, Error, string>
) {
  const { mutateAsync: createProjectGeography } = useCreateProjectGeography();

  return {
    createProjectGeography,
    ...useMutation({
      mutationFn: (pubId: string) =>
        apiPost<Project>('/project', { pub_id: pubId }),
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

export function useWpids() {
  return useQuery({
    queryKey: ['wpids'],
    queryFn: () => apiGet<string[]>('/project-wpid'),
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
      pub_id,
      keyword_id,
    }: {
      pub_id: string;
      keyword_id: number;
    }) => apiPost('/project-keyword', { pub_id, keyword_id }),
  });
}

export function useCreateProjectKeywords() {
  const { mutateAsync: createKeyword } = useCreateKeyword();
  const { mutateAsync: createProjectKeyword } = useCreateProjectKeyword();

  return useMutation({
    mutationFn: async ({
      pub_id,
      keywords,
    }: {
      pub_id: string;
      keywords: { name: string; keyword_id?: number }[];
    }) => {
      return Promise.all(
        keywords.map(async (k) => {
          const keyword_id =
            k.keyword_id ?? (await createKeyword(k.name)).keyword_id;
          return createProjectKeyword({ pub_id, keyword_id });
        })
      );
    },
  });
}

export function useDeleteProject() {
  return useMutation({
    mutationFn: ({ pub_id }: { pub_id: string }) =>
      apiDelete(`/project/${pub_id}`),
  });
}

export function useDeleteProjectKeyword() {
  return useMutation({
    mutationFn: ({
      pub_id,
      keyword_id,
    }: {
      pub_id: string;
      keyword_id: number;
    }) => apiDelete(`/project-keyword/${pub_id}/${keyword_id}`),
  });
}

export function useDeleteProjectGeography() {
  return useMutation({
    mutationFn: ({ pub_id, geoid }: { pub_id: string; geoid: string }) =>
      apiDelete(`/project-geography/${pub_id}/${geoid}`),
  });
}

export function useStateProjects(params?: ProjectsParams) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['gis', 'state-projects', params ?? null, isAuthenticated],
    queryFn: () =>
      apiGet<GeoJSON.FeatureCollection>('/gis/state_projects', params),
  });
}

export function useCountyProjects(params?: ProjectsParams) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['gis', 'county-projects', params ?? null, isAuthenticated],
    queryFn: () =>
      apiGet<GeoJSON.FeatureCollection>('/gis/county_projects', params),
  });
}

export function useMcdPhicpaProjects(params?: ProjectsParams) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['gis', 'mcd-phicpa-projects', params ?? null, isAuthenticated],
    queryFn: () =>
      apiGet<GeoJSON.FeatureCollection>('/gis/mcd_phicpa_projects', params),
  });
}

export function useGisSourcesFromUrl() {
  const [searchParams] = useSearchParams();

  const params: ProjectsParams = {
    geographies: searchParams.get('geo') ?? undefined,
    keywords: searchParams.get('keywords') ?? undefined,
    project: searchParams.get('project') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    yearFrom: searchParams.get('yearFrom') ?? undefined,
    yearTo: searchParams.get('yearTo') ?? undefined,
    wpids: searchParams.get('wpids') ?? undefined,
  };

  const county = useCountyProjects(params);
  const mcd = useMcdPhicpaProjects(params);
  const state = useStateProjects(params);

  return { state, county, mcd };
}

export function useCSA(pub_id: string) {
  return useQuery({
    queryKey: ['csa', pub_id],
    queryFn: () => apiGet<CustomStudyArea>(`/csa/${pub_id}`),
    enabled: Boolean(pub_id),
  });
}
