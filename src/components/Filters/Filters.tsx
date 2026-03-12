import { useGeographies } from '@api/hooks';
import GeoMultiSelect from '@components/Select/GeoMultiSelect';
import SearchMultiSelect from '@components/Select/SearchMultiSelect';
import Select from '@components/Select/Select';
import type { Option } from '@types';
import { useUpdateSearchParams } from '@hooks/useUpdateSearchParams';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Filter, Sliders, SlidersHorizontal } from 'lucide-react';

const ALL_FILTERS_BTN_WIDTH = 120;
const GAP = 16;

const filterWidths: Record<FilterKey, number> = {
  geography: 400, // w-100
  keywords: 320, // w-80
  category: 240, // w-60
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

export default function Filters() {
  const [selectedGeographies, setSelectedGeographies] = useState<
    Option[] | null
  >(null);
  const { data: geographies } = useGeographies();
  const { updateSearchParams } = useUpdateSearchParams();
  const [visibleCount, setVisibleCount] = useState<number>(filterKeys.length);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const counties = useMemo(() => {
    return geographies
      ? geographies
          .filter((g) => g.geo_type == 'county' && g.dvrpc_reg)
          .map((g) => ({ label: g.name + ' County', value: g.geoid }))
      : [];
  }, [geographies]);

  const municipalities = useMemo(() => {
    return geographies
      ? geographies
          .filter((g) => g.geo_type == 'municipality')
          .map((g) => ({
            label: g.name,
            value: g.geoid,
            county: g.geoid.slice(0, 5),
          }))
      : [];
  }, [geographies]);

  function handleGeographyChange(geographies: Option[] | null) {
    setSelectedGeographies(geographies);
    updateSearchParams({
      geo: geographies ? geographies.map((g) => g.value).join(',') : null,
    });
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
            className={`rounded-xl w-${filterWidths[key] / 4} shrink-0 ${className}`}
          />
        );
      case 'keywords':
        return (
          <SearchMultiSelect
            key={key}
            options={[]}
            values={[]}
            onChange={() => {}}
            placeholder="Select keywords..."
            className={`rounded-xl h-10 w-${filterWidths[key] / 4} shrink-0 ${className}`}
          />
        );
      case 'category':
        return (
          <Select
            key={key}
            options={[]}
            value={null}
            onChange={() => {}}
            placeholder="Select category..."
            className={`rounded-xl h-10 w-${filterWidths[key] / 4} shrink-0 ${className}`}
          />
        );
      case 'status':
        return (
          <Select
            key={key}
            options={[]}
            value={null}
            onChange={() => {}}
            placeholder="Select status..."
            className={`rounded-xl h-10 w-${filterWidths[key] / 4} shrink-0 ${className}`}
          />
        );
      case 'agency':
        return (
          <Select
            key={key}
            options={[]}
            value={null}
            onChange={() => {}}
            placeholder="Select agency..."
            className={`rounded-xl h-10 w-${filterWidths[key] / 4} shrink-0 ${className}`}
          />
        );
      case 'type':
        return (
          <Select
            key={key}
            options={[]}
            value={null}
            onChange={() => {}}
            placeholder="Select type..."
            className={`rounded-xl h-10 w-${filterWidths[key] / 4} shrink-0 ${className}`}
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
            className="h-10 px-4 rounded-xl border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
          >
            <SlidersHorizontal color="" />
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
