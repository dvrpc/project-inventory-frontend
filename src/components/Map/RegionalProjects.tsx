interface Props {
  regionalProjectCount: number;
  onClick?: () => void;
  selected: boolean;
}
export default function RegionalProjects(props: Props) {
  const { regionalProjectCount, onClick, selected } = props;

  return (
    <button
      className={`absolute top-2 left-2 w-14 h-14 rounded-full z-10 text-white text-center flex items-center justify-center shadow-lg bg-regional hover:bg-regional-hover ${selected && 'border-3 border-red-500'}`}
      onClick={onClick}
    >
      <span className="text-3xl font-bold">{regionalProjectCount}</span>
    </button>
  );
}
