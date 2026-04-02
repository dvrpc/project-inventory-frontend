import { useGeographies, useKeywords, useProjects, useWpids } from '@api/hooks';
import GeoMultiSelect from '@components/Select/GeoMultiSelect';
import SearchMultiSelect from '@components/Select/SearchMultiSelect';
import Select from '@components/Select/Select';
import type { Option, StatusOption } from '@types';
import { useUpdateSearchParams } from '@hooks/useUpdateSearchParams';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListRestart, SlidersHorizontal } from 'lucide-react';
import SearchSelect from '@components/Select/SearchSelect';
import { STATUS_OPTIONS } from '@consts';
import { useAuth } from '../../auth/AuthContext';
import { nonApiGeoOptins } from './consts';

const ALL_FILTERS_BTN_WIDTH = 120;
const GAP = 16;

const filterWidths: Record<FilterKey, number> = {
  geography: 400,
  keywords: 320,
  project: 320,
  status: 240,
  agency: 240,
  type: 240,
  yearFrom: 180,
  yearTo: 180,
  wpids: 240,
  reset: 160,
};

const filterKeys = [
  'geography',
  'keywords',
  'project',
  'status',
  'agency',
  'type',
  'yearFrom',
  'yearTo',
  'wpids',
  'reset',
] as const;
type FilterKey = (typeof filterKeys)[number];

const simpleFilterKeys = ['category', 'status', 'agency', 'type'] as const;
type SimpleFilterKey = (typeof simpleFilterKeys)[number];

const CURRENT_YEAR = new Date().getFullYear();
const ALL_YEAR_OPTIONS: Option[] = Array.from(
  { length: CURRENT_YEAR - 2000 + 1 },
  (_, i) => {
    const year = String(2000 + i);
    return { label: year, value: year };
  }
);

const statusOptions = STATUS_OPTIONS.map((s) => ({
  label: s,
  value: s,
}));

export default function Filters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { updateSearchParams } = useUpdateSearchParams();
  const { isAuthenticated } = useAuth();

  const { data: geographies } = useGeographies();
  const { data: keywords = [] } = useKeywords();
  const { data: projects } = useProjects();
  const { data: wpids } = useWpids();

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const effectiveFilterKeys = isAuthenticated
    ? filterKeys
    : (filterKeys.filter(
        (key) => key !== 'status' && key !== 'wpids'
      ) as FilterKey[]);

  const [visibleCount, setVisibleCount] = useState<number>(
    effectiveFilterKeys.length
  );

  const projectOptions = useMemo(
    () =>
      projects?.map((p) => ({
        label: `${p.product.pub_id}: ${p.product.title}`,
        value: String(p.project_id),
      })) ?? [],
    [projects]
  );

  const keywordOptions = useMemo(
    () => keywords.map((k) => ({ label: k.name, value: String(k.keyword_id) })),
    [keywords]
  );

  const wpidOptions = useMemo(
    () => wpids?.map((w) => ({ label: w, value: w })) ?? [],
    [wpids]
  );

  const counties = useMemo(
    () =>
      geographies
        ? geographies
            .filter((g) => g.geo_type === 'county' && g.dvrpc_reg)
            .map((g) => ({ label: g.name + ' County', value: g.geoid }))
        : [],
    [geographies]
  );

  const municipalities = useMemo(
    () =>
      geographies
        ? geographies
            .filter((g) => g.geo_type === 'municipality')
            .map((g) => ({
              label: g.name,
              value: g.geoid,
              county: g.geoid.slice(0, 5),
            }))
        : [],
    [geographies]
  );

  const selectedGeographies = useMemo<Option[]>(() => {
    const param = searchParams.get('geo');
    if (!param) return [];

    if (param === '1' || param === '42' || param === '34') {
      const geoOption = nonApiGeoOptins[param];
      return [geoOption];
    }

    const ids = new Set(param.split(','));
    return [...counties, ...municipalities].filter((o) => ids.has(o.value));
  }, [searchParams, counties, municipalities]);

  const selectedKeywords = useMemo<Option[]>(() => {
    const param = searchParams.get('keywords');
    if (!param) return [];
    const ids = new Set(param.split(','));
    return keywordOptions.filter((o) => ids.has(o.value));
  }, [searchParams, keywordOptions]);

  const selectedProject = useMemo<Option | null>(() => {
    const param = searchParams.get('project');
    if (!param) return null;
    return projectOptions.find((o) => o.value === param) ?? null;
  }, [searchParams, projectOptions]);

  const selectedStatus = useMemo<Option | null>(() => {
    const param = searchParams.get('status');
    if (!param) return null;
    return statusOptions.find((o) => o.value === param) ?? null;
  }, [searchParams]);

  const selectedYearFrom = useMemo<Option | null>(() => {
    const param = searchParams.get('yearFrom');
    if (!param) return null;
    return ALL_YEAR_OPTIONS.find((o) => o.value === param) ?? null;
  }, [searchParams]);

  const selectedYearTo = useMemo<Option | null>(() => {
    const param = searchParams.get('yearTo');
    if (!param) return null;
    return ALL_YEAR_OPTIONS.find((o) => o.value === param) ?? null;
  }, [searchParams]);

  const selectedWpids = useMemo<Option[]>(() => {
    const param = searchParams.get('wpids');
    if (!param) return [];
    const ids = new Set(param.split(','));
    return wpidOptions.filter((o) => ids.has(o.value));
  }, [searchParams]);

  const yearFromOptions = useMemo<Option[]>(() => {
    const toVal = selectedYearTo ? Number(selectedYearTo.value) : null;
    return toVal !== null
      ? ALL_YEAR_OPTIONS.filter((o) => Number(o.value) <= toVal)
      : ALL_YEAR_OPTIONS;
  }, [selectedYearTo]);

  const yearToOptions = useMemo<Option[]>(() => {
    const fromVal = selectedYearFrom ? Number(selectedYearFrom.value) : null;
    return fromVal !== null
      ? ALL_YEAR_OPTIONS.filter((o) => Number(o.value) >= fromVal)
      : ALL_YEAR_OPTIONS;
  }, [selectedYearFrom]);

  const simpleValues = useMemo<Record<SimpleFilterKey, Option | null>>(
    () =>
      Object.fromEntries(
        simpleFilterKeys.map((key) => {
          const raw = searchParams.get(key);
          return [key, raw ? { label: raw, value: raw } : null];
        })
      ) as Record<SimpleFilterKey, Option | null>,
    [searchParams]
  );

  function handleProjectChange(option: Option | null) {
    if (option) {
      const geoid = projects?.find((p) => String(p.project_id) == option.value)
        ?.geographies[0].geoid;
      if (geoid) {
        setSearchParams({ project: option.value, geo: geoid });
      }
    } else {
      updateSearchParams({ project: null });
    }
  }

  function handleKeywordChange(selected: Option[]) {
    updateSearchParams({
      keywords: selected.length ? selected.map((k) => k.value).join(',') : null,
    });
  }

  function handleGeographyChange(selected: Option[]) {
    const lastSelected = selected[selected.length - 1];

    if (lastSelected && lastSelected.value.length <= 2) {
      updateSearchParams({ geo: lastSelected.value });
      return;
    }

    const next = selected.filter((g) => g.value.length > 2);
    updateSearchParams({
      geo: next.length ? next.map((g) => g.value).join(',') : null,
    });
  }

  function handleWpidChange(selected: Option[]) {
    updateSearchParams({
      wpids: selected.length ? selected.map((w) => w.value).join(',') : null,
    });
  }

  function handleSimpleChange(key: SimpleFilterKey) {
    return (option: Option | null) => {
      updateSearchParams({ [key]: option?.value ?? null });
    };
  }

  function handleYearFromChange(option: Option | null) {
    const updates: Record<string, string | null> = {
      yearFrom: option?.value ?? null,
    };
    if (
      option &&
      selectedYearTo &&
      Number(selectedYearTo.value) < Number(option.value)
    ) {
      updates.yearTo = null;
    }
    updateSearchParams(updates);
  }

  function handleYearToChange(option: Option | null) {
    const updates: Record<string, string | null> = {
      yearTo: option?.value ?? null,
    };
    if (
      option &&
      selectedYearFrom &&
      Number(selectedYearFrom.value) > Number(option.value)
    ) {
      updates.yearFrom = null;
    }
    updateSearchParams(updates);
  }

  function resetFilters() {
    const bb = searchParams.get('bb');
    setSearchParams(bb ? { bb } : {});
  }

  const measureVisible = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    let available = container.offsetWidth - ALL_FILTERS_BTN_WIDTH - GAP;
    let count = 0;
    for (const key of effectiveFilterKeys) {
      const width = filterWidths[key] + GAP;
      if (available >= width) {
        available -= width;
        count++;
      } else {
        break;
      }
    }
    setVisibleCount(count);
  }, [effectiveFilterKeys]);

  useEffect(() => {
    measureVisible();
    const observer = new ResizeObserver(measureVisible);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [measureVisible]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleFilters = effectiveFilterKeys.slice(0, visibleCount);
  const overflowFilters = effectiveFilterKeys.slice(visibleCount);
  const isProjectSelected = selectedProject !== null;

  function renderFilter(key: FilterKey, className = '') {
    const base = `rounded-xl h-10 shrink-0 ${className}`;
    switch (key) {
      case 'geography':
        return (
          <GeoMultiSelect
            key={key}
            counties={counties}
            municipalities={municipalities}
            values={selectedGeographies}
            onChange={handleGeographyChange}
            label="Geographies"
            placeholder="Select geographies..."
            className={`w-100 ${base}`}
            isDisabled={isProjectSelected}
          />
        );
      case 'keywords':
        return (
          <SearchMultiSelect
            key={key}
            options={keywordOptions}
            values={selectedKeywords}
            label="Keywords"
            onChange={handleKeywordChange}
            placeholder="Select keywords..."
            className={`w-80 ${base}`}
            isDisabled={isProjectSelected}
          />
        );
      case 'project':
        return (
          <SearchSelect
            key={key}
            options={projectOptions}
            value={selectedProject}
            label="Project"
            onChange={handleProjectChange}
            placeholder="Search projects..."
            className={`w-80 ${base}`}
          />
        );
      case 'status':
        return (
          <Select
            key={key}
            options={statusOptions}
            value={selectedStatus}
            label="Status"
            onChange={handleSimpleChange('status')}
            placeholder="Select a status..."
            className={`w-60 ${base}`}
            isDisabled={isProjectSelected}
          />
        );
      case 'agency':
      case 'type':
        return (
          <Select
            key={key}
            options={[]}
            value={simpleValues[key]}
            label="Type"
            onChange={handleSimpleChange(key)}
            placeholder={`Select ${key}...`}
            className={`w-60 ${base}`}
            isDisabled={isProjectSelected}
          />
        );
      case 'yearFrom':
        return (
          <Select
            key={key}
            options={yearFromOptions}
            value={selectedYearFrom}
            label="Year From"
            onChange={handleYearFromChange}
            placeholder="Year from..."
            className={`w-44 ${base}`}
            isDisabled={isProjectSelected}
          />
        );
      case 'yearTo':
        return (
          <Select
            key={key}
            options={yearToOptions}
            value={selectedYearTo}
            label="Year To"
            onChange={handleYearToChange}
            placeholder="Year to..."
            className={`w-44 ${base}`}
            isDisabled={isProjectSelected}
          />
        );
      case 'wpids':
        return (
          <SearchMultiSelect
            key={key}
            options={wpidOptions}
            values={selectedWpids}
            label="Work program IDs"
            onChange={handleWpidChange}
            placeholder="Select WPIDs..."
            className={`w-60 ${base}`}
            isDisabled={isProjectSelected}
          />
        );
      case 'reset':
        return (
          <a
            key={key}
            onClick={resetFilters}
            className="text-center cursor-pointer"
          >
            <span>Reset All Filters</span>
          </a>
        );
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex gap-4 h-10 items-start w-full relative"
    >
      {visibleFilters.map((key) => renderFilter(key))}

      {overflowFilters.length > 0 && (
        <div ref={dropdownRef} className="relative ml-auto shrink-0">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="h-10 px-4 rounded-2xl border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
          >
            <SlidersHorizontal />
            <span>All Filters</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 flex flex-col gap-3 min-w-64">
              {overflowFilters.map((key) => renderFilter(key, 'w-full'))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
