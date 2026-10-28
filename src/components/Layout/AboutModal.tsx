import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, X } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

type Tab = 'about' | 'contact' | 'disclaimer';

const PROJECT_STAFF = [
  {
    name: 'Colin Kirby',
    title: 'Data Specialist',
    email: 'ckirby@dvrpc.org',
    phone: '',
  },
  {
    name: 'Mike Ruane',
    title: 'Chief Data and Technology Officer',
    email: 'mruane@dvrpc.org',
    phone: '',
  },
  {
    name: 'Chris Pollard',
    title: 'Manager, Office of GIS',
    email: 'cpollard@dvrpc.org',
    phone: '',
  },
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
  { id: 'disclaimer', label: 'Disclaimer' },
];

export default function AboutModal({ onClose }: AboutModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const tablistRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({
    about: null,
    contact: null,
    disclaimer: null,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    tabRefs.current.about?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleTabKeys = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const index = TABS.findIndex((t) => t.id === activeTab);
    const delta = e.key === 'ArrowRight' ? 1 : -1;
    const next = TABS[(index + delta + TABS.length) % TABS.length].id;
    setActiveTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col text-dvrpc-gray-1"
      >
        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-dvrpc-gray-7">
          <h2 id="about-title" className="text-xl font-bold text-dvrpc-blue-3">
            Project Inventory Tool
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close about dialog"
            className="p-1 rounded text-dvrpc-gray-3 hover:text-dvrpc-gray-1 hover:bg-dvrpc-gray-7 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div
          ref={tablistRef}
          role="tablist"
          aria-label="About dialog sections"
          className="flex px-5 border-b border-dvrpc-gray-7 gap-4"
          onKeyDown={handleTabKeys}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              id={`${tab.id}-tab`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-1 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-dvrpc-blue-3 text-dvrpc-blue-1'
                  : 'border-transparent text-dvrpc-gray-3 hover:text-dvrpc-gray-1'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="px-5 py-4 overflow-y-auto">
          {activeTab === 'about' ? (
            <div
              id="about-panel"
              role="tabpanel"
              tabIndex={0}
              aria-labelledby="about-tab"
              className="space-y-5"
            >
              <p>
                The Project Inventory Tool is a geospatial inventory of planning
                projects in the Greater Philadelphia region. It lets you explore
                recent and historical planning studies that have been conducted
                by DVRPC, or funded through DVRPC's{' '}
                <a href="https://www.dvrpc.org/funding-assistance/transportation-and-community-development-initiative-tcdi">
                  TCDI Program
                </a>
                .
              </p>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-dvrpc-gray-3 border-b border-dvrpc-gray-6 pb-1 mb-2">
                  How to Use
                </h3>
                <ul className="ml-8 list-disc space-y-1">
                  <li>
                    Use the filter bar above the map to narrow projects by
                    geography, keywords, category, status (only available to
                    DVRPC users), type, and year.
                  </li>
                  <li>
                    Filters can be combined to narrow results. Some filters,
                    like geography and keywords allow multiple selections
                  </li>
                  <li>
                    Panning and zooming the map will continously update the
                    project panel to show only projects within the extent of the
                    map. Any projects within a municipality, county, or state
                    that clips the extent of the map will appear in the results,
                    even if that geography is not fully visible on the map.
                  </li>
                  <li>
                    Click a project card to view more information about a
                    project.
                  </li>
                  <li>
                    Select the pin icon on a project card to zoom the map to
                    that project.
                  </li>
                  <li>
                    Use the sort control in the project panel to reorder
                    results. Projects can be sorted by geography (default),
                    year, and alphabetically. The geography sort shows projects
                    depending on your zoom level. Lower level geography projects
                    are prioritized when zoomed further in, while higher level
                    geography projects are prioritized when zoomed further out
                  </li>
                  <li>
                    Sign in with a DVRPC account to access additional features
                  </li>
                </ul>
              </section>
            </div>
          ) : activeTab === 'contact' ? (
            <div
              id="contact-panel"
              role="tabpanel"
              tabIndex={0}
              aria-labelledby="contact-tab"
              className="space-y-4"
            >
              <section>
                <p>
                  The Project Inventory Tool is maintained by the Delaware
                  Valley Regional Planning Commission (DVRPC). Contact the staff
                  below with any questions about the application.
                </p>
              </section>

              <section className="space-y-3">
                {PROJECT_STAFF.map((staff, i) => (
                  <div
                    key={i}
                    className="border border-dvrpc-gray-7 rounded px-4 py-3 space-y-1"
                  >
                    <p className="font-semibold">{staff.name || '—'}</p>
                    {staff.title && (
                      <p className="text-sm text-dvrpc-gray-2">{staff.title}</p>
                    )}
                    {staff.email && (
                      <p className="flex items-center gap-2 text-sm">
                        <Mail size={16} className="text-dvrpc-blue-3" />
                        <a href={`mailto:${staff.email}`}>{staff.email}</a>
                      </p>
                    )}
                    {staff.phone && (
                      <p className="flex items-center gap-2 text-sm text-dvrpc-gray-2">
                        <Phone size={16} className="text-dvrpc-blue-3" />
                        <a href={`tel:${staff.phone}`}>{staff.phone}</a>
                      </p>
                    )}
                  </div>
                ))}
              </section>
            </div>
          ) : (
            <div
              id="disclaimer-panel"
              role="tabpanel"
              tabIndex={0}
              aria-labelledby="disclaimer-tab"
              className="space-y-4"
            >
              <p>
                This web page is a public resource of general information. The
                Delaware Valley Regional Planning Commission (DVRPC) makes no
                warranty, representation, or guarantee as to the content,
                sequence, accuracy, timeliness, or completeness of any of the
                spatial data or database information provided herein. DVRPC and
                partner state, local, and other agencies shall assume no
                liability for errors, omissions, or inaccuracies in the
                information provided regardless of how caused; or any decision
                made or action taken or not taken by any person relying on any
                information or data furnished within.
              </p>

              <p>
                Esta página web es un recurso público de información general. La
                Comisión de Planificación Regional del Valle Delaware (DVRPC) no
                expresa ninguna garantía, representación, o promesa con respecto
                al contenido, secuencia, precisión, actualización o completud de
                cualquiera de los datos espaciales o información de base de
                datos suministrados aquí. DVRPC y sus asociadas agencias
                estatales, locales, y otros socios no asumirán responsabilidad
                ninguna por errores, omisiones, o inexactitudes presentes en la
                información providenciada, independientemente de cómo se
                produjeron; o, por cualquiera decisión hecha o acción tomada o
                no tomada por cualquier persona que dependa de cualquier
                información o dato suministrado aquí
              </p>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-dvrpc-gray-7 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-dvrpc-blue-3 bg-white px-4 py-1.5 text-sm font-semibold text-dvrpc-blue-1 shadow-sm hover:bg-[#eff6fb] hover:shadow transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
