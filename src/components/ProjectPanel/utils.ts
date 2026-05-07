import type { Project } from '@types';

function stringifyCsvValue(value: unknown) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function downloadCsv(projects: Project[] | undefined) {
  if (!projects || projects.length === 0) return;

  const headers = new Set<string>();
  projects.forEach((project) => {
    Object.keys(project.product).forEach((key) => headers.add(key));
  });
  const headerList = Array.from(headers);

  const csvRows = [
    headerList,
    ...projects.map((project) =>
      headerList.map((key) => {
        const rawValue = (
          project.product as unknown as Record<string, string | number>
        )[key];
        const cell = stringifyCsvValue(rawValue).replace(/"/g, '""');
        return `"${cell}"`;
      })
    ),
  ];

  const csvContent = csvRows.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `project-export-${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
