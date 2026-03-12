import ReactSelect from 'react-select';
import type { Option } from '@types';
import { filterCustomStyles, defaultCustomStyles } from './consts';

type Props = {
  options: Option[];
  value?: Option | null;
  onChange: (value: Option | null) => void;
  placeholder?: string;
  className?: string;
  isAdmin?: boolean;
};

export default function AutocompleteSelect({
  options,
  value = null,
  onChange,
  placeholder = 'Start typing to search...',
  className = '',
  isAdmin = false,
}: Props) {
  return (
    <ReactSelect
      options={options}
      value={value}
      onChange={(v) => onChange(v as Option | null)}
      isSearchable
      placeholder={placeholder}
      className={className}
      styles={isAdmin ? defaultCustomStyles : filterCustomStyles}
    />
  );
}
