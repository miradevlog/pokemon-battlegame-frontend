import type { Move } from '../types/pokemon';

const moveCache = new Map<string, Move | null>();

export async function fetchMoveDetails(url: string): Promise<Move | null> {
  if (moveCache.has(url)) {
    return moveCache.get(url)!;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch move at ${url}`);
    
    const data = await res.json();
    
    if (data.power === null || data.power === 0) {
      moveCache.set(url, null);
      return null;
    }

    const move: Move = {
      name: data.name.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      type: data.type.name,
      power: data.power,
    };

    moveCache.set(url, move);
    return move;
  } catch (err) {
    console.error('Error fetching move details:', err);
    moveCache.set(url, null);
    return null;
  }
}

export async function getRandomAuthenticMoves(
  moveUrls: string[],
  count: number = 4
): Promise<Move[]> {
  const selectedMoves: Move[] = [];
  const shuffledUrls = [...moveUrls].sort(() => 0.5 - Math.random());

  for (const url of shuffledUrls) {
    if (selectedMoves.length >= count) break;
    
    const move = await fetchMoveDetails(url);
    if (move && !selectedMoves.find(m => m.name === move.name)) {
      selectedMoves.push(move);
    }
  }

  if (selectedMoves.length === 0) {
    selectedMoves.push({ name: 'Struggle', type: 'normal', power: 50 });
  }

  return selectedMoves;
}
