import { X } from 'lucide-react';
import { useState } from 'react';

const legendIconSize = 22;

export default function Legend() {
  const [open, setOpen] = useState(true);

  if (open)
    return (
      <div className="mt-2 absolute right-2 bottom-2 sm:p-4 p-2 pr-8 z-10 bg-white shadow rounded-md text-[1rem] sm:flex sm:flex-col gap-1 grid grid-cols-2">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-2 top-2 text-dvrpc-gray-3 hover:text-dvrpc-gray-1"
          aria-label="Close legend"
        >
          <X height={16} />
        </button>
        <div className="flex items-center gap-2">
          <svg width={legendIconSize} height={legendIconSize}>
            <circle
              cx={legendIconSize / 2}
              cy={legendIconSize / 2}
              r={legendIconSize / 2}
              fill="var(--color-regional)"
            />
          </svg>
          <span>Regional Projects</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width={legendIconSize} height={legendIconSize}>
            <circle
              cx={legendIconSize / 2}
              cy={legendIconSize / 2}
              r={legendIconSize / 2}
              fill="var(--color-state)"
            />
          </svg>
          <span>State Projects</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width={legendIconSize} height={legendIconSize}>
            <circle
              cx={legendIconSize / 2}
              cy={legendIconSize / 2}
              r={legendIconSize / 2}
              fill="var(--color-county)"
            />
          </svg>
          <span>County Projects</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width={legendIconSize} height={legendIconSize}>
            <circle
              cx={legendIconSize / 2}
              cy={legendIconSize / 2}
              r={legendIconSize / 2}
              fill="var(--color-municipality)"
            />
          </svg>
          <span>Municipal Projects</span>
        </div>
        <div className="col-span-2 place-self-center flex items-center gap-2">
          <svg width={legendIconSize} height={legendIconSize}>
            <line
              x1={0}
              y1={legendIconSize / 2}
              x2={legendIconSize}
              y2={legendIconSize / 2}
              stroke="var(--color-csa)"
              strokeWidth={2.5}
            />
          </svg>
          <span>Custom Study Area</span>
        </div>
      </div>
    );

  return (
    <button
      onClick={() => setOpen(true)}
      className="mt-2 absolute right-2 bottom-2 p-2 z-10 bg-white shadow rounded-md text-[1rem] hover:bg-gray-50"
    >
      Show Legend
    </button>
  );
}
