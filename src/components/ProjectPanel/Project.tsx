import { PRODUCT_IMAGE_BASE_URL } from '@consts';
import type { Need, Recommendation } from '@types';
import { formatDate } from '@utils';

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
}
export default function Project(props: Props) {
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
  } = props;

  return (
    <div className="flex shadow-[0px_2px_4px_0px_#0000004d] border-t border-dvrpc-gray-7 rounded p-2 hover:shadow-[0px_4px_8px_0px_#0000004d] transition-colors hover:cursor-pointer pr-4">
      <div className="w-54 h-42">
        <img
          src={`${PRODUCT_IMAGE_BASE_URL}/${product_id}.png`}
          alt={`Thumbnail of ${title}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 relative ml-2">
        <h3 className="text-lg">{title}</h3>
        <p className="italic">{`${agency} - ${formatDate(publicationDate)} - ${project_id}`}</p>
        <p
          className="overflow-hidden wrap-break-word mt-3"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
          dangerouslySetInnerHTML={{ __html: abstract }}
        ></p>

        <div className="absolute bottom-0 left-0 flex gap-4">
          <a>{`${needs.length} needs`}</a>
          <a>{`${recommendations.length} recommendations`}</a>
        </div>
      </div>
    </div>
  );
}
