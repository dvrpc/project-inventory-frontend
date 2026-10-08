import { useMemo, useState } from 'react';
import Project from './Project';
import { MemoizedProjectCard } from './ProjectCard';
import SortDropdown from './SortDropdown';
import type { Project as ProjectType, Geography } from '@types';
import { Loader2, MapPin, Download, ChevronUp } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useGeographies } from '@api/hooks';
import { downloadCsv } from './utils';

interface Props {
  geographyName: string;
  projects: ProjectType[] | undefined;
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

  const { data: geographies } = useGeographies();

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

  function handleProjectSelect(pub_id: string) {
    const project = projects?.find((p) => p.pub_id === pub_id);
    if (!project) return;
    // onProjectHover(null);
    setSelectedProject(project);
  }

  function handleGeoSelect(pub_id: string) {
    const geoid = projects
      ?.find((p) => p.pub_id == pub_id)
      ?.geographies.map((g) => g.geoid)
      .join(',');
    if (geoid) {
      setSearchParams({ project: pub_id, geo: geoid });
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
        key={project.pub_id}
        pub_num={project.pub_num}
        pub_id={project.pub_id}
        title={project.title}
        agency={'DVRPC'}
        geoType={project.geographies[0].geo_type}
        status={project.status}
        publicationDate={project.pub_date}
        abstract={project.abstract}
        needs={[]}
        recommendations={[]}
        geographies={project.geographies}
        handleGeoSelect={handleGeoSelect}
        handleClick={handleProjectSelect}
        onProjectHover={onProjectHover}
        onCsaHover={onCsaHover}
        isHovered={
          project.pub_id === hoveredPubId || project.pub_id === hoveredCsaPubId
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
        return geo.geo_type === 'county' ? `${geo.name} County` : geo.name;
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
              handleGeoSelect(selectedProject.pub_id);
            }}
            onMouseEnter={() => setPinHovered(true)}
            onMouseLeave={() => setPinHovered(false)}
          >
            <MapPin color={pinHovered ? '#005475' : '#0078ae'} />
          </button>
        </div>
        <Project
          key={selectedProject.pub_id}
          pub_num={selectedProject.pub_num}
          pub_id={selectedProject.pub_id}
          title={selectedProject.title}
          agency={'DVRPC'}
          status={selectedProject.status}
          publicationDate={selectedProject.pub_date}
          wpids={selectedProject.wpids}
          lastUpdate={selectedProject.lastupdatedate}
          dateCreated={selectedProject.createdate}
          keywords={selectedProject.keywords}
          topics={selectedProject.topics}
          projectContactName={selectedProject.s1}
          projectContactId={selectedProject.s1_id}
          abstract={selectedProject.abstract}
          needs={[]}
          recommendations={[]}
          geographies={selectedProject.geographies}
        />
      </div>
    );
  }

  const municipalTotal = projects?.filter((p) =>
    p.geographies.some((g) => g.geo_type === 'municipality')
  ).length;
  const countyTotal = projects?.filter((p) =>
    p.geographies.some((g) => g.geo_type === 'county')
  ).length;
  const stateTotal = projects?.filter((p) =>
    p.geographies.some((g) => g.geo_type === 'state')
  ).length;
  const regionalTotal = projects?.filter((p) =>
    p.geographies.some((g) => g.geo_type === 'regional')
  ).length;
  const csaTotal = projects?.filter((p) =>
    p.geographies.some((g) => g.geo_type === 'csa')
  ).length;

  const breakdownItems = [
    {
      label: 'Custom Study Areas',
      value: csaTotal ?? 0,
      color: 'var(--color-csa)',
    },
    {
      label: 'Municipal',
      value: municipalTotal ?? 0,
      color: 'var(--color-municipality)',
    },
    {
      label: 'County',
      value: countyTotal ?? 0,
      color: 'var(--color-county)',
    },
    {
      label: 'State',
      value: stateTotal ?? 0,
      color: 'var(--color-state)',
    },
    {
      label: 'Regional',
      value: regionalTotal ?? 0,
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
                <span>{projects?.length || 0} Results</span>
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
      <div className="p-2 flex-1 flex flex-col gap-4 overflow-y-auto relative">
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
      </div>
    </>
  );
}
