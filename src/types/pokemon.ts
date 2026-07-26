export interface PokemonStats {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
    level: number;
    exp: number;
}

export interface Move {
    name: string;
    type: string;
    power: number;
}

export interface Pokemon {
    id: number;
    name: string;
    sprite: string;
    backSprite: string;
    types: string [];
    stats: PokemonStats;
    currentHP: number;
    maxHP: number;
    moves: Move[];
}

export const Type_Ids: Record<string, number> = {
  normal: 1,
  fighting: 2,
  flying: 3,
  poison: 4,
  ground: 5,
  rock: 6,
  bug: 7,
  ghost: 8,
  steel: 9,
  fire: 10,
  water: 11,
  grass: 12,
  electric: 13,
  psychic: 14,
  ice: 15,
  dragon: 16,
  dark: 17,
  fairy: 18,
};

export const getTypeIconUrl = (type: string): string => {
  const id = Type_Ids[type.toLowerCase()];
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/${id}.png`;
};