import { ArrowUpDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const options = ['Newest', 'Oldest', 'Title A-Z', 'Title Z-A']

export default function SortDropdown() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  function handleSelectOption(option: string) {
    setSelectedOption(option)
    setDropdownOpen(false)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setDropdownOpen(false)
      })
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

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
        {`Sort:${selectedOption ? ` ${selectedOption}` : ''}`}
        <ArrowUpDown className="ml-2 align-middle" size={20} />
      </button>
      {dropdownOpen && (
        <div className="absolute mt-2 right-0 w-40 top-full bg-white border border-gray-300 rounded shadow-lg z-50">
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectOption(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
