import { PRODUCT_IMAGE_BASE_URL } from '@consts';
import type { Need, Recommendation } from '@types';
import { formatDate } from '@utils';
import { memo, useEffect, useRef, useState } from 'react';

interface Props {
  product_id: string;
  project_id: number;
  title: string;
  agency: string;
  status: string;
  publicationDate: string;
  abstract: string;
  needs: Need[];
  recommendations: Recommendation[];
  handleClick: (project_id: number) => void;
}

const clampClass: Record<number, string> = {
  2: 'line-clamp-2',
  3: 'line-clamp-3',
};
const ProjectCard = (props: Props) => {
  const {
    product_id,
    project_id,
    title,
    agency,
    status,
    publicationDate,
    abstract,
    needs,
    recommendations,
    handleClick,
  } = props;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [clamp, setClamp] = useState(3);

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

  return (
    <div
      onClick={() => handleClick(project_id)}
      className="flex w-full min-w-0  shadow-[0px_2px_4px_0px_#0000004d] border-t border-dvrpc-gray-7 rounded p-2 hover:shadow-[0px_4px_8px_0px_#0000004d] transition-colors hover:cursor-pointer pr-4"
    >
      <div className="w-54 h-42">
        <img
          src={`${PRODUCT_IMAGE_BASE_URL}/201px/${product_id}.png`}
          alt={`Thumbnail of ${title}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 relative ml-2 w-full">
        <h3 ref={titleRef} className="text-lg line-clamp-2">
          {title}
        </h3>
        <p className="italic line-clamp-1">{`${agency} - ${formatDate(publicationDate)}`}</p>
        <p
          className={`${clampClass[clamp]} mt-3`}
          dangerouslySetInnerHTML={{ __html: abstract }}
        ></p>

        <div className="absolute bottom-0 left-0 flex gap-4 line-clamp-1 ">
          <a>{`${needs.length} needs`}</a>
          <a>{`${recommendations.length} recommendations`}</a>
        </div>
      </div>
    </div>
  );
};

export const MemoizedProjectCard = memo(
  ProjectCard,
  (prev, next) => prev.project_id === next.project_id
);
