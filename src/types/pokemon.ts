export interface PokemonStats {
    atk: number;
    def: number;
}

export interface Pokemon {
    id: number;
    name: string;
    sprite: string;
    types: string [];
    stats: PokemonStats;
}