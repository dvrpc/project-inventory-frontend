import { useGeographies, useKeywords } from '@api/hooks';
import GeoMultiSelect from '@components/Select/GeoMultiSelect';
import SearchMultiSelect from '@components/Select/SearchMultiSelect';
import Select from '@components/Select/Select';
import type { Option } from '@types';
import { useUpdateSearchParams } from '@hooks/useUpdateSearchParams';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'; // or 'next/navigation' if Next.js
import { SlidersHorizontal } from 'lucide-react';

const ALL_FILTERS_BTN_WIDTH = 120;
const GAP = 16;

const filterWidths: Record<FilterKey, number> = {
  geography: 400,
  keywords: 320,
  category: 240,
  status: 240,
  agency: 240,
  type: 240,
};

const filterKeys = [
  'geography',
  'keywords',
  'category',
  'status',
  'agency',
  'type',
] as const;
type FilterKey = (typeof filterKeys)[number];

const simpleFilterKeys = ['category', 'status', 'agency', 'type'] as const;
type SimpleFilterKey = (typeof simpleFilterKeys)[number];

export default function Filters() {
  const [searchParams] = useSearchParams();
  const { updateSearchParams } = useUpdateSearchParams();

  const { data: geographies } = useGeographies();
  const { data: keywords = [] } = useKeywords();

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState<number>(filterKeys.length);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const keywordOptions = useMemo(
    () => keywords.map((k) => ({ label: k.name, value: String(k.keyword_id) })),
    [keywords]
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
    const ids = new Set(param.split(','));
    return [...counties, ...municipalities].filter((o) => ids.has(o.value));
  }, [searchParams, counties, municipalities]);

  const selectedKeywords = useMemo<Option[]>(() => {
    const param = searchParams.get('keywords');
    if (!param) return [];
    const ids = new Set(param.split(','));
    return keywordOptions.filter((o) => ids.has(o.value));
  }, [searchParams, keywordOptions]);

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

  function handleKeywordChange(selected: Option[]) {
    updateSearchParams({
      keywords: selected.length ? selected.map((k) => k.value).join(',') : null,
    });
  }

  function handleGeographyChange(selected: Option[]) {
    updateSearchParams({
      geo: selected.length ? selected.map((g) => g.value).join(',') : null,
    });
  }

  function handleSimpleChange(key: SimpleFilterKey) {
    return (option: Option | null) => {
      updateSearchParams({ [key]: option?.value ?? null });
    };
  }

  const measureVisible = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    let available = container.offsetWidth - ALL_FILTERS_BTN_WIDTH - GAP;
    let count = 0;
    for (const key of filterKeys) {
      const width = filterWidths[key] + GAP;
      if (available >= width) {
        available -= width;
        count++;
      } else {
        break;
      }
    }
    setVisibleCount(count);
  }, []);

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

  const visibleFilters = filterKeys.slice(0, visibleCount);
  const overflowFilters = filterKeys.slice(visibleCount);

  function renderFilter(key: FilterKey, className = '') {
    const base = `rounded-xl w-${filterWidths[key] / 4} shrink-0 ${className}`;
    switch (key) {
      case 'geography':
        return (
          <GeoMultiSelect
            key={key}
            counties={counties}
            municipalities={municipalities}
            values={selectedGeographies}
            onChange={handleGeographyChange}
            placeholder="Select geographies..."
            className={base}
          />
        );
      case 'keywords':
        return (
          <SearchMultiSelect
            key={key}
            options={keywordOptions}
            values={selectedKeywords}
            onChange={handleKeywordChange}
            placeholder="Select keywords..."
            className={`h-10 ${base}`}
          />
        );
      case 'category':
      case 'status':
      case 'agency':
      case 'type':
        return (
          <Select
            key={key}
            options={[]} // populate when real options are available
            value={simpleValues[key]}
            onChange={handleSimpleChange(key)}
            placeholder={`Select ${key}...`}
            className={`h-10 ${base}`}
          />
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
