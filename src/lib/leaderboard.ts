import { api } from './api';
import type { Pokemon } from '../types/pokemon';

export function newRunId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `run-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function scoreForRoster(roster: Pokemon[]): number {
  return roster.reduce((total, p) => total + (p.stats.exp || 0), 0);
}

export async function submitRun(runId: string, roster: Pokemon[]): Promise<void> {
  const names = roster.map((p) => p.name).filter(Boolean);

  if (names.length === 0) {
    return;
  }

  await api('/leaderboard', {
    method: 'POST',
    auth: true,
    body: {
      runId,
      score: scoreForRoster(roster),
      roster: names,
    },
  });
}
