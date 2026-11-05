export function downloadCsvBlob(blob: Blob) {
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
