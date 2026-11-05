import { API_BASE_URL } from '@consts';

const AUTH_EXPIRED_EVENT = 'authExpired';

function getAuthHeaders(): Record<string, string> | undefined {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function handleUnauthorized() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('access_token_expiry');
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res.json() as Promise<T>;
}

function buildUrl(
  path: string,
  params: Record<string, string | undefined> | undefined,
  baseUrl: string
) {
  const url = new URL(`${baseUrl}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value);
    });
  }

  return url;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | undefined>,
  baseUrl = API_BASE_URL
) {
  const url = buildUrl(path, params, baseUrl);

  const res = await fetch(url, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<T>(res);
}

export async function apiGetBlob(
  path: string,
  params?: Record<string, string | undefined>,
  baseUrl = API_BASE_URL
) {
  const url = buildUrl(path, params, baseUrl);

  const res = await fetch(url, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res.blob();
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

  return handleResponse<T>(res);
}

export async function apiDelete(path: string, baseUrl = API_BASE_URL) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });

  return handleResponse(res);
}
