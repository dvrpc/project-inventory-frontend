import ReactSelect from 'react-select'
import type { Option } from '@types'
import { customStyles } from './consts'

type Props = {
  options: Option[]
  value?: Option | null
  onChange: (value: Option | null) => void
  placeholder?: string
  isClearable?: boolean
  className?: string
}

export default function Select({
  options,
  value = null,
  onChange,
  placeholder = 'Select...',
  isClearable = true,
  className = '',
}: Props) {
  return (
    <ReactSelect
      options={options}
      value={value}
      onChange={(v) => onChange(v as Option | null)}
      placeholder={placeholder}
      isClearable={isClearable}
      className={className}
      styles={customStyles}
    />
  )
}
