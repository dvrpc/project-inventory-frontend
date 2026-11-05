import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import { apiGet } from './api';
import type {
  AgencyGroup,
  CustomStudyArea,
  Geography,
  Keyword,
  ProjectsParams,
  ProjectsResponse,
  Topic,
} from '@types';
import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { decodeBoundsToString } from '@components/Map/utils';
import { useAuth } from '../auth/AuthContext';

export const PROJECT_PAGE_SIZE = 20;

export function getProjectsParams(
  searchParams: URLSearchParams
): ProjectsParams {
  return {
    bbox: decodeBoundsToString(searchParams.get('bb') ?? '') ?? undefined,
    geographies: searchParams.get('geo') ?? undefined,
    keywords: searchParams.get('keywords') ?? undefined,
    topics: searchParams.get('topics') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    project: searchParams.get('project') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    zoom: searchParams.get('zoom') ?? undefined,
    yearFrom: searchParams.get('yearFrom') ?? undefined,
    yearTo: searchParams.get('yearTo') ?? undefined,
    wpids: searchParams.get('wpids') ?? undefined,
    fs: searchParams.get('fs') ?? undefined,
    ag: searchParams.get('ag') ?? undefined,
    showMore: searchParams.get('showMore') ?? undefined,
  };
}

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
    queryFn: () => apiGet<ProjectsResponse>('/project', params),
  });
}

export function useProjectsFromUrl() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const params = getProjectsParams(searchParams);

  const query = useInfiniteQuery({
    queryKey: ['project', 'infinite', params, isAuthenticated],
    queryFn: ({ pageParam }) =>
      apiGet<ProjectsResponse>('/project', {
        ...params,
        page: String(pageParam),
        page_size: String(PROJECT_PAGE_SIZE),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });

  const projects = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );

  const firstPage = query.data?.pages[0];

  return {
    ...query,
    projects,
    total: firstPage?.total ?? 0,
    countsByGeoType: firstPage?.counts_by_geo_type,
    hasNextPage: query.isPlaceholderData ? false : query.hasNextPage,
  };
}

export function useGeographies() {
  return useQuery({
    queryKey: ['geographies'],
    queryFn: () => apiGet<Geography[]>('/geography'),
  });
}

export function useKeywords() {
  return useQuery({
    queryKey: ['keyword'],
    queryFn: () => apiGet<Keyword[]>('/keyword'),
  });
}

export function useTopics() {
  return useQuery({
    queryKey: ['topics'],
    queryFn: () => apiGet<Topic[]>('/topic'),
  });
}

export function useAgencyGroups() {
  return useQuery({
    queryKey: ['agency-groups'],
    queryFn: () => apiGet<AgencyGroup[]>('/agency-group'),
  });
}

export function useWpids() {
  return useQuery({
    queryKey: ['wpids'],
    queryFn: () => apiGet<string[]>('/project-wpid'),
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
    topics: searchParams.get('topics') ?? undefined,
    project: searchParams.get('project') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    yearFrom: searchParams.get('yearFrom') ?? undefined,
    yearTo: searchParams.get('yearTo') ?? undefined,
    wpids: searchParams.get('wpids') ?? undefined,
    fs: searchParams.get('fs') ?? undefined,
    ag: searchParams.get('ag') ?? undefined,
    showMore: searchParams.get('showMore') ?? undefined,
  };

  const county = useCountyProjects(params);
  const mcd = useMcdPhicpaProjects(params);
  const state = useStateProjects(params);

  return { state, county, mcd };
}

export function useCSA(id: string) {
  return useQuery({
    queryKey: ['csa', id],
    queryFn: () => apiGet<CustomStudyArea>(`/csa/${id}`),
    enabled: Boolean(id),
  });
}
