const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | undefined>,
  baseUrl = API_BASE_URL
) {
  const url = new URL(`${baseUrl}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value);
    });
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<T>;
}
