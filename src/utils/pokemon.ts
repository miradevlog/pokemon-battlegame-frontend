import type { Pokemon } from '../types/pokemon';
import type { PathNode } from '../types/overworld';
import { getRandomAuthenticMoves } from './apiMoves';
import { TIER_1, TIER_2, TIER_3 } from './tiers';

export async function fetchPokemon(id: number): Promise<Pokemon> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch Pokémon ${id}`);

  const data = await res.json();

  const getStat = (name: string) =>
    data.stats.find((s: any) => s.stat.name === name)?.base_stat ?? 0;

  const baseHp = getStat('hp');
  
  const allMoveUrls = data.moves.map((m: any) => m.move.url);
  const authenticMoves = await getRandomAuthenticMoves(allMoveUrls, 4);

  return {
    id: data.id,
    name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
    sprite:
      data.sprites.other?.showdown?.front_default ??
      data.sprites.front_default,
    backSprite:
      data.sprites.other?.showdown?.back_default ??
      data.sprites.back_default ??
      data.sprites.front_default,
    types: data.types.map((t: any) => t.type.name),
    stats: {
      hp: baseHp,
      attack: getStat('attack'),
      defense: getStat('defense'),
      specialAttack: getStat('special-attack'),
      specialDefense: getStat('special-defense'),
      speed: getStat('speed'),
      level: 5,
      exp: 0,
    },
    currentHP: baseHp,
    maxHP: baseHp,
    moves: authenticMoves,
  };
}

export async function fetchRandomPokemon(maxId = 151): Promise<Pokemon> {
  const id = Math.floor(Math.random() * maxId) + 1;
  return fetchPokemon(id);
}

export async function fetchRandomPokemonByTier(tier: number[]): Promise<Pokemon> {
  const id = tier[Math.floor(Math.random() * tier.length)];
  return fetchPokemon(id);
}

const TYPE_CHART: Record<string, Record<string, number>> = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

export function getTypeEffectiveness(
  attackerTypes: string[],
  defenderTypes: string[]
): number {
  let multiplier = 1;

  for (const atk of attackerTypes) {
    for (const def of defenderTypes) {
      const chart = TYPE_CHART[atk.toLowerCase()];
      if (chart && chart[def.toLowerCase()] !== undefined) {
        multiplier *= chart[def.toLowerCase()];
      }
    }
  }

  return multiplier;
}

export async function generateEnemyRoster(
  node: PathNode | null,
  badges: number
): Promise<Pokemon[]> {
  const isBoss = node?.label === 'Boss';
  const isTrainer = node?.type === 'trainer';
  const count = isBoss
    ? badges === 0
      ? 4
      : 4 + Math.floor(Math.random() * 3)
    : isTrainer
      ? 2
      : 1;

  const depth = node?.row ?? 1;

  const getTier = (enemyIndex: number, totalEnemies: number) => {
    if (isBoss) {
      if (enemyIndex === totalEnemies - 1) return TIER_3;
      return Math.random() > 0.8 ? TIER_1 : TIER_2;
    }

    if (depth <= 1) {
      return TIER_1;
    } else if (depth <= 3) {
      if (isTrainer) return Math.random() > 0.8 ? TIER_2 : TIER_1;
      return TIER_1;
    } else {
      if (isTrainer) return Math.random() > 0.3 ? TIER_2 : TIER_1;
      return Math.random() > 0.5 ? TIER_2 : TIER_1;
    }
  };

  const enemies = await Promise.all(
    Array.from({ length: count }, (_, idx) => {
      return fetchRandomPokemonByTier(getTier(idx, count));
    })
  );
  return enemies;
}