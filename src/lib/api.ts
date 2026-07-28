import { clearToken, getToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

function logout(): void {
  clearToken();

  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();

    if (!token) {
      logout();
      throw new ApiError(401, 'You are not logged in.');
    }

    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401) {
    logout();
    throw new ApiError(401, 'Your session has expired. Please log in again.');
  }

  const text = await response.text();
  let data: any = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(response.status, `Server did not return JSON (${response.status}).`);
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, data?.message || `Request failed (${response.status}).`);
  }

  return data as T;
}
