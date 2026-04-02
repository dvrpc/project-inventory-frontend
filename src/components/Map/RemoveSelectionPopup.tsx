import { X } from 'lucide-react';
interface Props {
  onClick: () => void;
}

export default function RemoveSelectionPopup(props: Props) {
  const { onClick } = props;

  return (
    <button
      onClick={onClick}
      className="absolute top-2.5 left-2/5 -translate-x-1/2 z-10 bg-white rounded h-9 shadow-lg px-4 py-2 flex items-center gap-2 hover:bg-dvrpc-gray-5"
    >
      <X />
      <span> Remove Selection </span>
    </button>
  );
}
