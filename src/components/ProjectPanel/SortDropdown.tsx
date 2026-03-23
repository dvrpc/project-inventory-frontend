import { useUpdateSearchParams } from '@hooks/useUpdateSearchParams';
import { ArrowUpDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type SortOption = 'newest' | 'oldest' | 'az' | 'za';

const optionsMap: Record<SortOption, string> = {
  newest: 'Newest (Default)',
  oldest: 'Oldest',
  az: 'Title A-Z',
  za: 'Title Z-A',
};

export default function SortDropdown() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SortOption>('newest');
  const { updateSearchParams } = useUpdateSearchParams();

  const containerRef = useRef<HTMLDivElement | null>(null);

  function handleSelectOption(option: SortOption) {
    setSelectedOption(option);
    updateSearchParams({
      sort: option == 'newest' ? null : option,
    });
    setDropdownOpen(false);
  }

  useEffect(() => {
    if (!dropdownOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setDropdownOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  return (
    <div
      ref={containerRef}
      className="sort-dropdown mr-4 flex self-end relative"
    >
      <button
        type="button"
        onClick={() => setDropdownOpen((open) => !open)}
        className="flex items-center text-dvrpc-blue-3 hover:underline hover:text-dvrpc-blue-1 transition-colors"
      >
        {`Sort: ${optionsMap[selectedOption]}`}
        <ArrowUpDown className="ml-2 align-middle" size={20} />
      </button>
      {dropdownOpen && (
        <div className="absolute mt-2 right-0 w-40 top-full bg-white border border-gray-300 rounded shadow-lg z-50">
          {Object.entries(optionsMap).map(([key, value]) => (
            <div
              key={key}
              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${key === selectedOption ? 'font-semibold' : ''}`}
              onClick={() => handleSelectOption(key as SortOption)}
            >
              {value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
