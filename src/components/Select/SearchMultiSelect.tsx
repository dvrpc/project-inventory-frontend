import ReactSelect from 'react-select'
import type { Option } from '@types'
import { customStyles } from './consts'

type Props = {
  options: Option[]
  values?: Option[]
  onChange: (values: Option[]) => void
  placeholder?: string
  className?: string
}

export default function SearchMultiSelect({
  options,
  values = [],
  onChange,
  placeholder = 'Select... (multi)',
  className = '',
}: Props) {
  return (
    <ReactSelect
      options={options}
      value={values}
      onChange={(v) => onChange((v as Option[]) || [])}
      isMulti
      isSearchable
      placeholder={placeholder}
      className={className}
      styles={customStyles}
    />
  )
}
