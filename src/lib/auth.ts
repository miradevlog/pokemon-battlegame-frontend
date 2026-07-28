export const TOKEN_KEY = 'pokemon-battle-token';
export const USERNAME_KEY = 'username';

interface TokenPayload {
  sub?: string;
  exp?: number;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

export function setUsername(username: string): void {
  localStorage.setItem(USERNAME_KEY, username);
}

export function getPayload(): TokenPayload | null {
  const token = getToken();

  if (!token) {
    return null;
  }

  const segments = token.split('.');

  if (segments.length !== 3) {
    return null;
  }

  try {
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    return JSON.parse(atob(padded)) as TokenPayload;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const payload = getPayload();

  if (!payload || typeof payload.exp !== 'number') {
    return false;
  }

  return payload.exp * 1000 > Date.now();
}
