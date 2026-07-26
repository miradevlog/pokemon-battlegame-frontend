import type { Pokemon } from '../types/pokemon';

export function calculateExpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.2));
}

export function levelUp(pokemon: Pokemon): Pokemon {
  const newLevel = pokemon.stats.level + 1;
  const multiplier = 1.03;

  const oldMaxHp = pokemon.maxHP;
  const newMaxHp = Math.floor(pokemon.stats.hp * multiplier);
  const hpIncrease = newMaxHp - (oldMaxHp ?? pokemon.stats.hp);

  return {
    ...pokemon,
    stats: {
      ...pokemon.stats,
      level: newLevel,
      hp: newMaxHp,
      attack: Math.floor(pokemon.stats.attack * multiplier),
      defense: Math.floor(pokemon.stats.defense * multiplier),
      specialAttack: Math.floor(pokemon.stats.specialAttack * multiplier),
      specialDefense: Math.floor(pokemon.stats.specialDefense * multiplier),
      speed: Math.floor(pokemon.stats.speed * multiplier),
    },
    maxHP: newMaxHp,
    currentHP: (pokemon.currentHP ?? pokemon.stats.hp) + hpIncrease,
  };
}

export function addExpToPokemon(pokemon: Pokemon, expGained: number): Pokemon {
  let updatedPokemon = { ...pokemon, stats: { ...pokemon.stats } };
  updatedPokemon.stats.exp += expGained;

  let expRequired = calculateExpForNextLevel(updatedPokemon.stats.level);

  while (updatedPokemon.stats.exp >= expRequired) {
    updatedPokemon.stats.exp -= expRequired;
    updatedPokemon = levelUp(updatedPokemon);
    expRequired = calculateExpForNextLevel(updatedPokemon.stats.level);
  }

  return updatedPokemon;
}
