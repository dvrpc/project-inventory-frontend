import { TCDI_LOGO_URL } from '@consts';
import type { FundingSource, Geography, Keyword, Topic } from '@types';
import { formatDate } from '@utils';

interface Props {
  id: string;
  title: string;
  agency: string;
  status: string;
  publicationDate: string;
  abstract: string;

  wpids: string[];
  geographies?: Geography[];
  topics?: Topic[];
  keywords?: Keyword[];
  projectContactName?: string;
  fundingSource: FundingSource;
  projectContactId?: string;
  projectLink?: string;
  thumbnailLink?: string;
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
    id,
    title,
    agency,
    status,
    publicationDate,
    abstract,
    geographies,
    fundingSource,
    topics,
    keywords,
    projectContactName,
    projectContactId,
    projectLink,
    thumbnailLink,
    wpids,
  } = props;
  const isTcdi = fundingSource === 'TCDI';

  return (
    <div className="p-2 ml-4 mr-8">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="italic mb-3">{`${agency} - ${formatDate(publicationDate)}`}</p>

      <div>
        <a href={projectLink} target="_blank" rel="noopener noreferrer">
          <img
            src={thumbnailLink?.trim() || TCDI_LOGO_URL}
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

      <a href={projectLink} target="_blank" rel="noopener noreferrer">
        Product Link
      </a>

      <h4 className="font-bold mb-2 border-b border-dvrpc-gray-6 pb-1">
        Metadata
      </h4>
      <div className="grid grid-cols-2 gap-x-8">
        <MetaField label="Status" value={status} />
        <MetaField
          label="Geographies"
          value={geographies?.map((l) => l.name).join(', ')}
        />
        <MetaField label="Agency" value={agency} />
        <MetaField label="Funding Source" value={fundingSource} />
        <MetaField
          label="Publication Date"
          value={formatDate(publicationDate)}
        />
        <MetaField label="ID" value={id} />
        {!isTcdi && (
          <>
            <MetaField
              label="Topics"
              value={topics?.map((t) => t.topic_name).join(', ')}
            />
            <MetaField
              label="Keywords"
              value={keywords?.map((k) => k.name).join(', ')}
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
            <MetaField label="WPIDs" value={wpids.join(', ')} />
          </>
        )}
      </div>
    </div>
  );
}
