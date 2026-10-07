import { PRODUCT_IMAGE_BASE_URL } from '@consts';
import type { Geography, Keyword, Need, Recommendation, Topic } from '@types';
import { formatDate } from '@utils';

interface Props {
  pub_id: string;
  pub_num: string;
  title: string;
  agency: string;
  status: string;
  publicationDate: string;
  abstract: string;
  needs: Need[];
  recommendations: Recommendation[];
  wpids: string[];
  geographies?: Geography[];
  topics?: Topic[];
  keywords?: Keyword[];
  projectContactName?: string;
  projectContactId?: string;
  lastUpdate?: string;
  dateCreated?: string;
}

function MetaField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="py-2 border-b border-dvrpc-gray-6">
      <span className="text-sm font-semibold ">{label}</span>
      <p className="text-sm mt-0.5">{value ?? '—'}</p>
    </div>
  );
}

export default function Project(props: Props) {
  const {
    pub_id,
    pub_num,
    title,
    agency,
    status,
    publicationDate,
    abstract,
    needs,
    recommendations,
    geographies,
    topics,
    keywords,
    projectContactName,
    projectContactId,
    wpids,
  } = props;

  return (
    <div className="p-2 ml-4 mr-8">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="italic mb-3">{`${agency} - ${formatDate(publicationDate)}`}</p>

      <div>
        <a href={`https://www.dvrpc.org/products/${pub_id}`} target="_blank">
          <img
            src={`${PRODUCT_IMAGE_BASE_URL}/201px/${pub_num}.png`}
            alt={`Thumbnail of ${title}`}
            className="h-42 object-cover float-left mr-4"
          />
        </a>
        <div
          className="text-justify"
          dangerouslySetInnerHTML={{ __html: abstract }}
        />
      </div>
      <br className="clear-both" />

      <a href={`https://www.dvrpc.org/products/${pub_id}`} target="_blank">
        Product Link
      </a>

      <h4 className="font-bold mt-4">Needs</h4>
      <ul className="ml-8 list-disc mt-1">
        {needs.map((need) => (
          <li key={need.description}>{need.description}</li>
        ))}
      </ul>
      <br />

      <h4 className="font-bold">Recommendations</h4>
      <ul className="ml-8 list-disc mt-1">
        {recommendations.map((rec) => (
          <li key={rec.description}>{rec.description}</li>
        ))}
      </ul>
      <br />

      <h4 className="font-bold mb-2 border-b border-dvrpc-gray-6 pb-1">
        Metadata
      </h4>
      <div className="grid grid-cols-2 gap-x-8">
        <MetaField label="Status" value={status} />
        <MetaField
          label="Geographies"
          value={geographies?.map((l) => l.name).join(', ')}
        />
        <MetaField
          label="Topics"
          value={topics?.map((t) => t.topic_name).join(', ')}
        />
        <MetaField
          label="Keywords"
          value={keywords?.map((k) => k.name).join(', ')}
        />
        <MetaField label="Agency" value={agency} />
        <MetaField label="Status" value={status} />
        <MetaField
          label="Publication Date"
          value={formatDate(publicationDate)}
        />
        <div className="py-2 border-b border-dvrpc-gray-6">
          <span className="text-sm font-semibold">Project Contact</span>
          <p className="text-sm mt-0.5">
            {projectContactName && projectContactId ? (
              <a
                href={`mailto:${projectContactId}@dvrpc.org`}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {projectContactName}
              </a>
            ) : (
              '—'
            )}
          </p>
        </div>

        <MetaField label="Pub ID" value={pub_num} />
        <MetaField label="WPIDs" value={wpids.join(', ')} />
      </div>
    </div>
  );
}
