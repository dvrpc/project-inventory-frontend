import { useGeographies } from '@api/hooks';
import GeoSelect from '@components/Select/GeoSelect';
import SearchMultiSelect from '@components/Select/SearchMultiSelect';
import Select from '@components/Select/Select';
import type { Option } from '@types';
import { useMemo, useState } from 'react';

export default function Filters() {
  const [selectedGeography, setSelectedGeography] = useState<Option | null>(
    null
  );
  const { data: geographies } = useGeographies();

  const counties = useMemo(() => {
    return geographies
      ? geographies
          .filter((g) => g.geo_type == 'county')
          .map((g) => {
            return {
              label: g.name + ' County',
              value: g.geoid,
            };
          })
      : [];
  }, [geographies]);

  const municipalities = useMemo(() => {
    return geographies
      ? geographies
          .filter((g) => g.geo_type == 'municipality')
          .map((g) => {
            return {
              label: g.name,
              value: g.geoid,
              county: g.geoid.slice(0, 5),
            };
          })
      : [];
  }, [geographies]);

  return (
    <div className="flex gap-4">
      <GeoSelect
        counties={counties}
        municipalities={municipalities}
        value={selectedGeography}
        onChange={setSelectedGeography}
        placeholder="Select geographies..."
        className="rounded-xl h-10 w-100"
      />
      <SearchMultiSelect
        options={[]}
        values={[]}
        onChange={() => {}}
        placeholder="Select keywords..."
        className="rounded-xl w-100"
      />
      <Select
        options={[]}
        value={null}
        onChange={() => {}}
        placeholder="Select category..."
        className="rounded-xl w-50"
      />
    </div>
  );
}
