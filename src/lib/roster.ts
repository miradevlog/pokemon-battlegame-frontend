import type { Pokemon } from '../types/pokemon';

const ROSTER_KEY = 'pokemon-battle-roster';

export function getRoster(): Pokemon[] {
  const raw = localStorage.getItem(ROSTER_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Pokemon[];
  } catch {
    return [];
  }
}

export function addToRoster(pokemon: Pokemon): void {
  const roster = getRoster();
  if (roster.some((p) => p.id === pokemon.id)) return;
  roster.push(pokemon);
  localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
}

export function removeFromRoster(id: number): void {
  const roster = getRoster().filter((p) => p.id !== id);
  localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
}
