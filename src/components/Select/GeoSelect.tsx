// GeoSelect.tsx
import ReactSelect from 'react-select';
import type { Option } from '@types';
import { filterCustomStyles } from './consts';

type MunicipalityOption = {
  label: string;
  value: string;
  county: string;
};

type CountyOption = {
  label: string;
  value: string;
};

type Props = {
  counties: CountyOption[];
  municipalities: MunicipalityOption[];
  value?: Option | null;
  onChange: (value: Option) => void;
  placeholder?: string;
  className?: string;
};

export default function GeoSelect(props: Props) {
  const {
    counties,
    municipalities,
    value = null,
    onChange,
    placeholder = 'Search counties or municipalities...',
    className = '',
  } = props;

  const groupedOptions = [
    {
      label: 'Counties',
      options: counties.map((c) => ({
        label: c.label,
        value: c.value,
        type: 'county',
      })),
    },
    ...counties
      .map((county) => ({
        label: county.label,
        options: municipalities
          .filter((m) => m.county === county.value)
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((m) => ({
            label: m.label,
            value: m.value,
            type: 'municipality',
          })),
      }))
      .filter((group) => group.options.length > 0),
  ];

  return (
    <ReactSelect
      options={groupedOptions}
      value={value}
      onChange={(v) => onChange(v as Option)}
      isSearchable
      placeholder={placeholder}
      className={className}
      styles={filterCustomStyles}
      formatGroupLabel={(group) => (
        <span
          style={{
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
          }}
        >
          {group.label}
        </span>
      )}
    />
  );
}
