import type { Project } from '@types';
import { formatDate } from '@utils';

interface Props {
  projects: Project[];
}
export default function ProjectTable(props: Props) {
  const { projects } = props;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-zinc-100">
          {['ID', 'Title', 'Date', 'Geographies', 'Needs', 'Recs'].map((h) => (
            <th
              key={h}
              className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 whitespace-nowrap"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {projects.map((p, i) => (
          <tr
            key={p.project_id}
            className={`border-b border-zinc-50 ${i % 2 === 0 ? 'bg-zinc-50/50' : 'bg-white'}`}
          >
            <td className="px-4 py-3">
              <span className="font-mono text-xs bg-zinc-100 text-zinc-500 rounded px-1.5 py-0.5">
                {p.project_id}
              </span>
            </td>
            <td className="px-4 py-3 max-w-xs">
              <span className="line-clamp-2 text-zinc-800 leading-snug">
                {p.product?.title ?? (
                  <em className="text-zinc-400">External</em>
                )}
              </span>
            </td>
            <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
              {p.product?.pub_date ? formatDate(p.product.pub_date) : '—'}
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-1">
                {p.geographies.slice(0, 2).map((g) => (
                  <span
                    key={g.geography_id}
                    className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5 whitespace-nowrap"
                  >
                    {g.name}
                  </span>
                ))}
                {p.geographies.length > 2 && (
                  <span className="text-xs bg-zinc-100 text-zinc-500 rounded px-1.5 py-0.5">
                    +{p.geographies.length - 2}
                  </span>
                )}
              </div>
            </td>
            <td className="px-4 py-3 text-center text-zinc-600">
              {p.needs.length}
            </td>
            <td className="px-4 py-3 text-center text-zinc-600">
              {p.recommendations.length}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
