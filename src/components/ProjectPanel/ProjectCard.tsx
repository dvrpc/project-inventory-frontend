import { PRODUCT_IMAGE_BASE_URL } from '@consts';
import type { Geography, GeoType, Need, Recommendation } from '@types';
import { formatDate } from '@utils';
import { MapPin } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
interface Props {
  pub_id: string;
  title: string;
  agency: string;
  status: string;
  geoType: GeoType;
  publicationDate: string;
  abstract: string;
  needs: Need[];
  recommendations: Recommendation[];
  geographies: Geography[];
  handleClick: (pub_id: string) => void;
  handleGeoSelect: (pub_id: string) => void;
  onProjectHover: (geographies: Geography[] | null) => void;
  onCsaHover: (pubId: string | null) => void;
  isHovered: boolean;
}

const clampClass: Record<number, string> = {
  2: 'line-clamp-2',
  3: 'line-clamp-3',
};

const borderColorMap: Record<GeoType, string> = {
  regional: 'border-l-regional',
  state: 'border-l-state',
  county: 'border-l-county',
  municipality: 'border-l-municipality',
  csa: 'border-l-csa',
};

const projectTypeText: Record<GeoType, string> = {
  regional: 'Regional Project',
  state: 'State Project',
  county: 'County Project',
  municipality: 'Municipal Project',
  csa: 'Custom Study Area',
};
const ProjectCard = (props: Props) => {
  const {
    pub_id,
    title,
    agency,
    publicationDate,
    abstract,
    geoType,
    needs,
    recommendations,
    geographies,
    handleClick,
    handleGeoSelect,
    onProjectHover,
    onCsaHover,
  } = props;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [clamp, setClamp] = useState(3);
  const [pinHovered, setPinHovered] = useState(false);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const lineHeight = parseInt(getComputedStyle(el).lineHeight);
      const lines = Math.round(el.offsetHeight / lineHeight);
      setClamp(lines > 1 ? 2 : 3);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const borderColor = borderColorMap[geoType];

  return (
    <div
      onClick={() => handleClick(pub_id)}
      onMouseEnter={() =>
        geoType === 'csa' ? onCsaHover(pub_id) : onProjectHover(geographies)
      }
      onMouseLeave={() =>
        geoType === 'csa' ? onCsaHover(null) : onProjectHover(null)
      }
      className={`flex border-l-6 ${borderColor} w-full min-w-0 shadow-[0px_2px_4px_0px_#0000004d] border-t border-dvrpc-gray-7 rounded p-2 hover:shadow-[0px_4px_8px_0px_#0000004d] transition-colors hover:cursor-pointer pr-4 `}
    >
      <div className="w-54 h-42">
        <img
          src={`${PRODUCT_IMAGE_BASE_URL}/201px/${pub_id}.png`}
          alt={`Thumbnail of ${title}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 relative ml-2 w-full">
        <div className="flex justify-between">
          <h3 ref={titleRef} className="text-lg line-clamp-2">
            {title}
          </h3>
          <button
            aria-label="zoom to project"
            onClick={(e) => {
              e.stopPropagation();
              handleGeoSelect(pub_id);
            }}
            onMouseEnter={() => setPinHovered(true)}
            onMouseLeave={() => setPinHovered(false)}
            className="relative rounded-full transition-transform duration-150 hover:scale-110 hover:drop-shadow-md focus:outline-none"
          >
            <MapPin
              color={pinHovered ? '#005475' : '#0078ae'}
              fill={pinHovered ? '#0078ae66' : 'none'}
            />
            <span
              role="tooltip"
              className={`pointer-events-none absolute top-full right-0 z-10 mt-1 rounded bg-dvrpc-gray-1 px-2 py-1 text-xs whitespace-nowrap text-white shadow-md transition-opacity duration-150 ${
                pinHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Zoom to project
            </span>
          </button>
        </div>
        <p className="italic line-clamp-1">{`${agency} - ${formatDate(publicationDate)}: ${projectTypeText[geoType]}`}</p>
        <p
          className={`${clampClass[clamp]} mt-3`}
          dangerouslySetInnerHTML={{ __html: abstract }}
        ></p>

        <div className="absolute bottom-0 left-0 flex gap-4 line-clamp-1 ">
          <a className="line-clamp-1 ">{`${needs.length} needs`}</a>
          <a className="line-clamp-1 ">{`${recommendations.length} recommendations`}</a>
        </div>
      </div>
    </div>
  );
};

export const MemoizedProjectCard = memo(
  ProjectCard,
  (prev, next) =>
    prev.pub_id === next.pub_id && prev.isHovered === next.isHovered
);
