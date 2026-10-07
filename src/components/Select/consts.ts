export const filterCustomStyles = {
  control: (base: any, state: any) => {
    const isActive =
      Boolean(state?.hasValue) ||
      Boolean((state?.selectProps as any)?.hasActiveSelection);
    const activeBorder = '#0078ae';
    const inactiveBorder = '#cbd5da';
    return {
      ...base,
      borderRadius: '19px',
      borderColor: isActive ? activeBorder : inactiveBorder,
      borderWidth: '1px',
      backgroundColor: base.backgroundColor ?? '#fff',
      boxShadow: base.boxShadow,
      cursor: state?.isDisabled ? 'not-allowed' : 'pointer',
      minHeight: '2.5rem',
      maxHeight: state.menuIsOpen ? 'none' : '2.5rem',
      overflow: state.menuIsOpen ? 'visible' : 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      '&:hover': {
        borderColor: isActive ? '#005475' : '#0078ae',
        backgroundColor: isActive ? '#eff6fb' : '#f9fafb',
        cursor: state?.isDisabled ? 'not-allowed' : 'pointer',
      },
    };
  },
  valueContainer: (base: any, state: any) => ({
    ...base,
    flexWrap: state.selectProps.menuIsOpen ? 'wrap' : 'nowrap',
    overflow: state.selectProps.menuIsOpen ? 'visible' : 'hidden',
  }),
  input: (base: any) => ({
    ...base,
    marginLeft: '8px',
  }),
  placeholder: (base: any) => ({
    ...base,
    marginLeft: '8px',
    color: '#767676',
  }),
  singleValue: (base: any, state: any) => ({
    ...base,
    marginLeft: '8px',
    color:
      Boolean(state?.hasValue) ||
      Boolean((state?.selectProps as any)?.hasActiveSelection)
        ? '#005475'
        : base.color,
  }),
  multiValue: (base: any) => ({
    ...base,
    color: '#005475',
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: '#005475',
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: '#005475',
    ':hover': {
      ...base[':hover'],
      backgroundColor: '#deecf4',
      color: '#005475',
    },
  }),
  dropdownIndicator: (base: any, state: any) => {
    const isActive =
      Boolean(state?.hasValue) ||
      Boolean((state?.selectProps as any)?.hasActiveSelection);
    return {
      ...base,
      color: isActive ? '#005475' : base.color,
      ':hover': {
        ...base[':hover'],
        color: isActive ? '#005475' : base.color,
      },
    };
  },
  clearIndicator: (base: any, state: any) => {
    const isActive =
      Boolean(state?.hasValue) ||
      Boolean((state?.selectProps as any)?.hasActiveSelection);
    return {
      ...base,
      color: isActive ? '#005475' : base.color,
      ':hover': {
        ...base[':hover'],
        color: isActive ? '#005475' : base.color,
      },
    };
  },
  indicatorSeparator: (base: any, state: any) => {
    const isActive =
      Boolean(state?.hasValue) ||
      Boolean((state?.selectProps as any)?.hasActiveSelection);
    return {
      ...base,
      backgroundColor: isActive ? '#0078ae' : base.backgroundColor,
    };
  },
  menu: (base: any) => ({
    ...base,
    maxHeight: 'none',
  }),
  option: (base: any) => ({
    ...base,
    cursor: 'pointer',
  }),
  menuList: (base: any) => ({
    ...base,
    maxHeight: '300px',
  }),
};

export const defaultCustomStyles = {
  control: (base: any) => ({
    ...base,
    borderRadius: '19px',
    borderColor: '#cbd5da',
    '&:hover': {
      borderColor: '#cbd5da',
    },
  }),
  input: (base: any) => ({
    ...base,
    marginLeft: '8px',
  }),
  placeholder: (base: any) => ({
    ...base,
    marginLeft: '8px',
    color: '#767676',
  }),
  singleValue: (base: any) => ({
    ...base,
    marginLeft: '8px',
  }),
};
