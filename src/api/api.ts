import { API_BASE_URL } from '@consts';

function getAuthHeaders(): Record<string, string> | undefined {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

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

  const res = await fetch(url, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  baseUrl = API_BASE_URL
) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<T>;
}

export async function apiDelete(path: string, baseUrl = API_BASE_URL) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}
