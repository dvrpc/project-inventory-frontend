import ReactSelect from 'react-select';
import type { Option } from '@types';
import { filterCustomStyles } from './consts';

type Props = {
  options: Option[];
  value?: Option | null;
  onChange: (value: Option | null) => void;
  placeholder?: string;
  isClearable?: boolean;
  className?: string;
  isDisabled?: boolean;
};

export default function Select({
  options,
  value = null,
  onChange,
  placeholder = 'Select...',
  isClearable = true,
  className = '',
  isDisabled = false,
}: Props) {
  return (
    <ReactSelect
      options={options}
      value={value}
      onChange={(v) => onChange(v as Option | null)}
      placeholder={placeholder}
      isClearable={isClearable}
      className={className}
      styles={filterCustomStyles}
      isDisabled={isDisabled}
    />
  );
}
