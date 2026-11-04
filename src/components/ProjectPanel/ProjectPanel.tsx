import { useEffect, useMemo, useRef, useState } from 'react';
import Project from './Project';
import { MemoizedProjectCard } from './ProjectCard';
import SortDropdown from './SortDropdown';
import type { Project as ProjectType, Geography, GeoType } from '@types';
import { Loader2, MapPin, Download, ChevronUp } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useGeographies } from '@api/hooks';
import { downloadCsv } from './utils';

interface Props {
  geographyName: string;
  projects: ProjectType[] | undefined;
  total: number;
  countsByGeoType?: Partial<Record<GeoType, number>>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
  onProjectHover: (geographies: Geography[] | null) => void;
  selectedProject: ProjectType | null;
  setSelectedProject: (project: ProjectType | null) => void;
  hoveredPubId: string | null;
  hoveredCsaPubId: string | null;
  onCsaHover: (pubId: string | null) => void;
}
export default function ProjectPanel(props: Props) {
  const {
    projects,
    total,
    countsByGeoType,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    isLoading,
    onProjectHover,
    selectedProject,
    setSelectedProject,
    hoveredPubId,
    hoveredCsaPubId,
    onCsaHover,
  } = props;
  const [pinHovered, setPinHovered] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const listRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data: geographies } = useGeographies();
  const searchParamsKey = searchParams.toString();

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [searchParamsKey]);

  useEffect(() => {
    const root = listRef.current;
    const sentinel = loadMoreRef.current;
    if (!root || !sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { root, rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore, selectedProject]);

  function handleShowMore() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('showMore', 'true');
      return next;
    });
  }

  function handleShowLess() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('showMore');
      return next;
    });
  }

  function handleProjectSelect(id: string) {
    const project = projects?.find((p) => p.id === id);
    if (!project) return;
    // onProjectHover(null);
    setSelectedProject(project);
  }

  function handleGeoSelect(id: string) {
    const geoid = projects
      ?.find((p) => p.id == id)
      ?.geographies.map((g) => g.geoid)
      .join(',');
    if (geoid) {
      setSearchParams({ project: id, geo: geoid });
    }
  }

  const geoParam = searchParams.get('geo');
  const showMore = searchParams.get('showMore') === 'true';

  const geoIds = useMemo(
    () => geoParam?.split(',').filter(Boolean) ?? [],
    [geoParam]
  );

  const selectedGeo = useMemo(() => {
    if (geoIds.length !== 1 || !geographies) return null;
    return geographies.find((g) => g.geoid === geoIds[0]) ?? null;
  }, [geoIds, geographies]);

  const isSingleMunicipality = selectedGeo?.geo_type === 'municipality';

  const parentNames = useMemo(() => {
    if (!isSingleMunicipality || !selectedGeo || !geographies) return null;
    const countyGeo = geographies.find(
      (g) => g.geoid === selectedGeo.geoid.slice(0, 5)
    );
    const stateFips = selectedGeo.geoid.slice(0, 2);
    const stateName =
      stateFips === '42'
        ? 'Pennsylvania'
        : stateFips === '34'
          ? 'New Jersey'
          : (geographies.find((g) => g.geoid === stateFips)?.name ?? null);
    if (!countyGeo || !stateName) return null;
    return { county: countyGeo.name, state: stateName };
  }, [isSingleMunicipality, selectedGeo, geographies]);

  const { originalProjects, extraProjects } = useMemo(() => {
    if (
      !showMore ||
      !isSingleMunicipality ||
      !projects ||
      geoIds.length !== 1
    ) {
      return {
        originalProjects: projects,
        extraProjects: null as ProjectType[] | null,
      };
    }
    const selectedId = geoIds[0];
    return {
      originalProjects: projects.filter((p) =>
        p.geographies.some((g) => g.geoid === selectedId)
      ),
      extraProjects: projects.filter(
        (p) => !p.geographies.some((g) => g.geoid === selectedId)
      ),
    };
  }, [showMore, isSingleMunicipality, projects, geoIds]);

  function renderProjectCard(project: ProjectType) {
    return (
      <MemoizedProjectCard
        key={project.id}
        id={project.id}
        title={project.title}
        agency={project.agency}
        geoType={project.geographies[0].geo_type}
        status={project.status}
        publicationDate={project.pub_date}
        abstract={project.abstract}
        thumbnailLink={project.thumbnail_link}
        needs={[]}
        recommendations={[]}
        geographies={project.geographies}
        handleGeoSelect={handleGeoSelect}
        handleClick={handleProjectSelect}
        onProjectHover={onProjectHover}
        onCsaHover={onCsaHover}
        isHovered={
          project.id === hoveredPubId || project.id === hoveredCsaPubId
        }
      />
    );
  }

  const geographyName = useMemo(() => {
    if (!geoParam || !geographies) return 'DVRPC Region';

    const names = geoParam
      .split(',')
      .map((geoid) => {
        const geo = geographies.find((g) => g.geoid === geoid);
        if (!geo) return null;
        return geo.name;
      })
      .filter(Boolean);

    return names.length > 0 ? names.join(', ') : 'DVRPC Region';
  }, [geoParam, geographies]);

  if (selectedProject) {
    return (
      <div className="overflow-y-auto">
        <div className="p-4 justify-between flex">
          <button onClick={() => setSelectedProject(null)}>
            &larr; Back to list
          </button>
          <button
            aria-label="zoom to project"
            onClick={(e) => {
              e.stopPropagation();
              handleGeoSelect(selectedProject.id);
            }}
            onMouseEnter={() => setPinHovered(true)}
            onMouseLeave={() => setPinHovered(false)}
          >
            <MapPin color={pinHovered ? '#005475' : '#0078ae'} />
          </button>
        </div>
        <Project
          key={selectedProject.id}
          id={selectedProject.id}
          title={selectedProject.title}
          agency={'DVRPC'}
          status={selectedProject.status}
          publicationDate={selectedProject.pub_date}
          wpids={selectedProject.wpids}
          keywords={selectedProject.keywords}
          topics={selectedProject.topics}
          projectContactName={selectedProject.contact_name}
          projectContactId={selectedProject.contact_email}
          projectLink={selectedProject.project_link}
          thumbnailLink={selectedProject.thumbnail_link}
          abstract={selectedProject.abstract}
          needs={[]}
          recommendations={[]}
          geographies={selectedProject.geographies}
        />
      </div>
    );
  }

  const breakdownItems = [
    {
      label: 'Custom Study Areas',
      value: countsByGeoType?.csa ?? 0,
      color: 'var(--color-csa)',
    },
    {
      label: 'Municipal',
      value: countsByGeoType?.municipality ?? 0,
      color: 'var(--color-municipality)',
    },
    {
      label: 'County',
      value: countsByGeoType?.county ?? 0,
      color: 'var(--color-county)',
    },
    {
      label: 'State',
      value: countsByGeoType?.state ?? 0,
      color: 'var(--color-state)',
    },
    {
      label: 'Regional',
      value: countsByGeoType?.regional ?? 0,
      color: 'var(--color-regional)',
    },
  ];

  return (
    <>
      <div className="p-4 border-b border-dvrpc-gray-7 flex justify-between items-end gap-3">
        <div>
          <h2 className="text-xl">{`${geographyName} Projects`}</h2>
          {!isLoading ? (
            <div>
              <div className="flex gap-4">
                <span>{total} Results</span>
                <button
                  type="button"
                  disabled={!projects || projects.length === 0}
                  onClick={() => downloadCsv(projects)}
                  className="flex items-center text-dvrpc-blue-3 hover:underline hover:text-dvrpc-blue-1 transition-colors text-sm"
                >
                  <Download className="mr-2" size={16} />
                  Export CSV
                </button>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-sm text-white">
                {breakdownItems.map((item) =>
                  item.value > 0 ? (
                    <span
                      key={item.label}
                      className="inline-flex items-center rounded-full px-2.5 py-1 font-medium"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.value} {item.label}
                    </span>
                  ) : (
                    <></>
                  )
                )}
              </div>
            </div>
          ) : (
            <Loader2 className="animate-spin" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <SortDropdown />
        </div>
      </div>
      <div
        ref={listRef}
        className="p-2 flex-1 flex flex-col gap-4 overflow-y-auto relative"
      >
        {!(showMore && isSingleMunicipality) &&
          projects?.map((project) => renderProjectCard(project))}

        {showMore && isSingleMunicipality && (
          <>
            {originalProjects?.map((project) => renderProjectCard(project))}
            {extraProjects !== null && extraProjects.length > 0 && (
              <>
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-dvrpc-gray-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-dvrpc-gray-3 text-center">
                    {parentNames
                      ? `${parentNames.county} and ${parentNames.state} Projects`
                      : 'County and state projects'}
                  </span>
                  <div className="h-px flex-1 bg-dvrpc-gray-5" />
                </div>
                <button
                  type="button"
                  onClick={handleShowLess}
                  className="mx-auto w-fit inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-dvrpc-gray-2 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <ChevronUp size={14} />
                  Show less
                </button>
                {extraProjects.map((project) => renderProjectCard(project))}
              </>
            )}
            <button
              type="button"
              onClick={handleShowLess}
              className="mx-auto w-fit inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-dvrpc-gray-2 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronUp size={14} />
              Show less
            </button>
          </>
        )}

        {!showMore && isSingleMunicipality && !isLoading && (
          <button
            type="button"
            onClick={handleShowMore}
            className="mx-auto w-fit rounded-2xl border border-dvrpc-blue-3 bg-white px-4 py-1.5 text-sm font-semibold text-dvrpc-blue-1 shadow-sm hover:bg-[#eff6fb] hover:shadow transition-all cursor-pointer"
          >
            {parentNames
              ? `+ Show ${parentNames.county} and ${parentNames.state} projects`
              : '+ Show ${parentNames.county} and ${parentNames.state} Projects'}
          </button>
        )}

        {showMore && !isSingleMunicipality && (
          <button
            type="button"
            onClick={handleShowLess}
            className="mx-auto w-fit inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-dvrpc-gray-2 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ChevronUp size={14} />
            Show less
          </button>
        )}

        <div ref={loadMoreRef} aria-hidden="true" />
        {isFetchingNextPage && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-dvrpc-gray-2">
            <Loader2 className="animate-spin" size={16} />
            Loading more projects...
          </div>
        )}
      </div>
    </>
  );
}
