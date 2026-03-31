export const filterCustomStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderRadius: '19px',
    borderColor: '#cbd5da',
    minHeight: '2.5rem',
    maxHeight: state.menuIsOpen ? 'none' : '2.5rem',
    overflow: state.menuIsOpen ? 'visible' : 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    '&:hover': {
      borderColor: '#cbd5da',
    },
  }),
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
  singleValue: (base: any) => ({
    ...base,
    marginLeft: '8px',
  }),
  menu: (base: any) => ({
    ...base,
    maxHeight: 'none',
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
