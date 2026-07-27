export const TOKEN_KEY = 'pokemon-battle-token'; // TODO: confirm with login author, may rename

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
