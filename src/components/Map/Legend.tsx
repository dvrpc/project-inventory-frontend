const legendIconSize = 22;
export default function Legend() {
  return (
    <div className="mt-2 absolute right-2 bottom-6 p-4 z-10 bg-white shadow rounded-md text-[1rem] flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <svg width={legendIconSize} height={legendIconSize}>
          <circle
            cx={legendIconSize / 2}
            cy={legendIconSize / 2}
            r={legendIconSize / 2}
            fill="#0078ae"
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
            fill="#9C2A7F"
          />
        </svg>
        <span>Municipal Projects</span>
      </div>
      <div className="flex items-center gap-2">
        <svg width={legendIconSize} height={legendIconSize}>
          <line
            x1={0}
            y1={legendIconSize / 2}
            x2={legendIconSize}
            y2={legendIconSize / 2}
            stroke="#E36C0A"
            strokeWidth={2.5}
          />
        </svg>
        <span>Custom Study Area</span>
      </div>
    </div>
  );
}
