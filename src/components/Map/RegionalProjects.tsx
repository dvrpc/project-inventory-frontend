import dvrpcRegion from '../../assets/dvrpc_region_gray.svg';

interface Props {
  regionalProjectCount: number;
  selected: boolean;
  onClick?: () => void;
}
export default function RegionalProjects(props: Props) {
  const { regionalProjectCount, selected, onClick } = props;

  return (
    <button
      className={`group absolute top-2 left-2 w-22 h-22 z-10 text-center flex items-center justify-center appearance-none border-0 bg-transparent cursor-pointer transition-transform duration-150 hover:scale-110 active:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-regional ${selected ? 'scale-110' : ''}`}
      style={{
        backgroundImage: `url(${dvrpcRegion})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        filter: selected
          ? 'drop-shadow(0 0 4px rgb(0 120 174 / 0.95)) drop-shadow(0 2px 3px rgb(0 0 0 / 0.35))'
          : 'drop-shadow(0 2px 3px rgb(0 0 0 / 0.35))',
      }}
      onClick={onClick}
      aria-label={`${regionalProjectCount} regional projects`}
    >
      <span className="ml-1.5 text-[1.75rem] text-white font-bold">
        {regionalProjectCount}
      </span>
      <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded bg-dvrpc-gray-1 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        Regional projects
      </span>
    </button>
  );
}
