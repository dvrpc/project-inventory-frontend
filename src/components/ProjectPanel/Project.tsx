import { PRODUCT_IMAGE_BASE_URL } from '@consts';
import type { Need, Recommendation } from '@types';
import { formatDate } from '@utils';
import { memo } from 'react';

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
    <div className="p-2 ml-4 mr-8">
      <div className="mr-2">
        <h3 className="text-lg">{title}</h3>
        <p className="italic mb-3">{`${agency} - ${formatDate(publicationDate)} - ${project_id}`}</p>
        <div className="flex gap-3">
          <p
            className="wrap-break-word"
            dangerouslySetInnerHTML={{ __html: abstract }}
          />
          <img
            src={`${PRODUCT_IMAGE_BASE_URL}/201px/${product_id}.png`}
            alt={`Thumbnail of ${title}`}
            className="h-55 w-auto object-cover flex-shrink-0"
          />
        </div>
        <div className="flex gap-4 mt-3">
          <a>{`${needs.length} needs`}</a>
          <a>{`${recommendations.length} recommendations`}</a>
        </div>
      </div>
    </div>
  );
}
