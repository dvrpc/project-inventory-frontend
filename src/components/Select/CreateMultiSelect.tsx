import CreatableSelect from 'react-select/creatable';
import type { Option } from '@types';
import { defaultCustomStyles, filterCustomStyles } from './consts';

type Props = {
  options: Option[];
  values?: Option[];
  onChange: (values: Option[]) => void;
  onCreateOption?: (inputValue: string) => void;
  placeholder?: string;
  className?: string;
  createLabel?: (inputValue: string) => string;
};

export default function CreateMultiSelect({
  options,
  values = [],
  onChange,
  onCreateOption,
  placeholder = 'Select or type to add...',
  className = '',
  createLabel = (inputValue) => `Add "${inputValue}"`,
}: Props) {
  return (
    <CreatableSelect
      options={options}
      value={values}
      onChange={(v) => onChange((v as Option[]) || [])}
      onCreateOption={onCreateOption}
      isMulti
      isSearchable
      placeholder={placeholder}
      className={className}
      styles={defaultCustomStyles}
      formatCreateLabel={createLabel}
    />
  );
}
