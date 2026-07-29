import type { Pokemon } from '../types/pokemon';
import type { PathNode } from '../types/overworld';
import { getRandomAuthenticMoves } from './apiMoves';
import { TIER_1, TIER_2, TIER_3 } from './tiers';

export async function fetchPokemon(id: number, level: number = 5): Promise<Pokemon> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch Pokémon ${id}`);

  const data = await res.json();

  const statMultiplier = Math.pow(1.03, level - 1);

  const getStat = (name: string) =>
    Math.floor((data.stats.find((s: any) => s.stat.name === name)?.base_stat ?? 0) * statMultiplier);

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
      level: level,
      exp: 0,
    },
    currentHP: baseHp,
    maxHP: baseHp,
    moves: authenticMoves,
  };
}

export async function fetchRandomPokemon(maxId = 151, level = 5): Promise<Pokemon> {
  const id = Math.floor(Math.random() * maxId) + 1;
  return fetchPokemon(id, level);
}

export async function fetchRandomPokemonByTier(tier: number[], level = 5): Promise<Pokemon> {
  const id = tier[Math.floor(Math.random() * tier.length)];
  return fetchPokemon(id, level);
}

const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

export function getTypeEffectiveness(attackerTypes: string[], defenderTypes: string[]): number {
  let multiplier = 1;
  
  for (const attackType of attackerTypes) {
    const atk = attackType.toLowerCase();
    for (const defendType of defenderTypes) {
      const def = defendType.toLowerCase();
      const modifier = TYPE_CHART[atk]?.[def];
      if (modifier !== undefined) {
        multiplier *= modifier;
      }
    }
  }
  
  return multiplier;
}

export async function generateEnemyRoster(
  node: PathNode | null,
  badges: number,
  playerLevel: number
): Promise<Pokemon[]> {
  const isBoss = node?.label === 'Boss';
  const isTrainer = node?.type === 'trainer';
  
  const count = isBoss
    ? badges === 0 ? 3 : 4 + Math.floor(Math.random() * 2)
    : isTrainer ? 2 : 1;

  const depth = node?.row ?? 1;

  const getTier = (enemyIndex: number, totalEnemies: number) => {
    if (isBoss) {
      if (enemyIndex === totalEnemies - 1) return TIER_3;
      return Math.random() > 0.8 ? TIER_1 : TIER_2;
    }
    if (depth <= 1) return TIER_1;
    else if (depth <= 3) return isTrainer ? (Math.random() > 0.8 ? TIER_2 : TIER_1) : TIER_1;
    else return isTrainer ? (Math.random() > 0.3 ? TIER_2 : TIER_1) : (Math.random() > 0.5 ? TIER_2 : TIER_1);
  };

  const baseEnemyLevel = Math.max(3, playerLevel - 2);

  const enemies = await Promise.all(
    Array.from({ length: count }, (_, idx) => {
      const isAce = isBoss && idx === count - 1;
      const finalLevel = baseEnemyLevel + (isBoss ? 1 : 0) + (isAce ? 1 : 0);
      return fetchRandomPokemonByTier(getTier(idx, count), finalLevel);
    })
  );

  return enemies;
}

export async function checkEvolution(pokemonId: number, currentLevel: number): Promise<number | null> {
  try {
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
    if (!speciesRes.ok) return null;
    const speciesData = await speciesRes.json();
    
    if (!speciesData.evolution_chain?.url) return null;

    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();

    let currentLink = evoData.chain;
    
    while (currentLink && currentLink.species.name !== speciesData.name) {
      const nextLink = currentLink.evolves_to.find((e: any) => 
        JSON.stringify(e).includes(speciesData.name)
      );
      currentLink = nextLink || currentLink.evolves_to[0];
    }

    if (currentLink && currentLink.evolves_to.length > 0) {
      const nextEvolution = currentLink.evolves_to[0];
      const evolutionDetails = nextEvolution.evolution_details[0];

      if (
        evolutionDetails &&
        evolutionDetails.trigger.name === 'level-up' &&
        evolutionDetails.min_level &&
        currentLevel >= evolutionDetails.min_level
      ) {
        const urlParts = nextEvolution.species.url.split('/').filter(Boolean);
        const nextId = parseInt(urlParts[urlParts.length - 1], 10);
        return nextId;
      }
    }
    
    return null;
  } catch (err) {
    console.error("Failed to check evolution:", err);
    return null;
  }
}

export async function evolvePokemon(pokemon: Pokemon): Promise<Pokemon> {
  try {
    const evolvedId = await checkEvolution(pokemon.id, pokemon.stats.level);
    if (!evolvedId || evolvedId === pokemon.id) return pokemon;

    const evolvedPokemon = await fetchPokemon(evolvedId, pokemon.stats.level);
    const previousMaxHP = pokemon.maxHP ?? pokemon.stats.hp;
    const previousCurrentHP = pokemon.currentHP ?? pokemon.stats.hp;
    const healthRatio = previousMaxHP > 0 ? previousCurrentHP / previousMaxHP : 0;

    const newMaxHP = evolvedPokemon.maxHP;
    const newCurrentHP = previousCurrentHP <= 0
      ? 0
      : Math.max(1, Math.floor(newMaxHP * healthRatio));

    return {
      ...evolvedPokemon,
      stats: {
        ...evolvedPokemon.stats,
        exp: pokemon.stats.exp,
        level: pokemon.stats.level,
      },
      currentHP: newCurrentHP,
      maxHP: newMaxHP,
    };
  } catch (err) {
    console.error('Failed to evolve pokemon:', err);
    return pokemon;
  }
}