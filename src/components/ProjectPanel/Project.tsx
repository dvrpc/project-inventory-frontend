import { PRODUCT_IMAGE_BASE_URL } from '@consts';
import type { Geography, Keyword, Need, Recommendation } from '@types';
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
  wpids: string[];
  geographies?: Geography[];
  categories?: string[];
  keywords?: Keyword[];
  projectContact?: string;
  createdBy?: string;
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
    product_id,
    project_id,
    title,
    agency,
    status,
    publicationDate,
    abstract,
    needs,
    recommendations,
    geographies,
    categories,
    keywords,
    projectContact,
    createdBy,
    wpids,
    lastUpdate,
    dateCreated,
  } = props;

  return (
    <div className="p-2 ml-4 mr-8">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="italic mb-3">{`${agency} - ${formatDate(publicationDate)}`}</p>

      <div>
        <a
          href={`https://www.dvrpc.org/products/${product_id}`}
          target="_blank"
        >
          <img
            src={`${PRODUCT_IMAGE_BASE_URL}/201px/${product_id}.png`}
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

      <a href={`https://www.dvrpc.org/products/${product_id}`} target="_blank">
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
        <MetaField label="Categories" value={categories?.join(', ')} />
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
        <MetaField label="Project Contact" value={projectContact} />
        <MetaField label="Created By" value={createdBy} />
        <MetaField
          label="Last Update"
          value={lastUpdate ? formatDate(lastUpdate) : undefined}
        />
        <MetaField
          label="Date Created"
          value={dateCreated ? formatDate(dateCreated) : undefined}
        />
        <MetaField label="Product ID" value={product_id} />
        <MetaField label="Project ID" value={project_id + ''} />
        <MetaField label="WPIDs" value={wpids.join(', ')} />
      </div>
    </div>
  );
}
