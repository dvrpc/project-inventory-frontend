import ReactSelect from 'react-select';
import type { Option } from '@types';
import { defaultCustomStyles, filterCustomStyles } from './consts';

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
  values?: Option[];
  onChange: (values: Option[]) => void;
  placeholder?: string;
  className?: string;
  isAdmin?: boolean;
  isDisabled?: boolean;
};

export default function GeoMultiSelect(props: Props) {
  const {
    counties,
    municipalities,
    values,
    onChange,
    placeholder = 'Select geographies…',
    className = '',
    isAdmin = false,
    isDisabled = false,
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
      isMulti
      options={groupedOptions}
      value={values}
      onChange={(selected) => onChange(selected as Option[])}
      isSearchable
      isDisabled={isDisabled}
      placeholder={placeholder}
      className={className}
      styles={isAdmin ? defaultCustomStyles : filterCustomStyles}
      hideSelectedOptions={false}
      {...(!isAdmin && { menuPortalTarget: document.body })}
      {...(!isAdmin && { menuPosition: 'absolute' })}
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
