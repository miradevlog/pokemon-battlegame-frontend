import type { Pokemon } from '../../types/pokemon';
import './PokemonCard.css';

interface Props {
  pokemon: Pokemon;
  selected?: boolean;
  onClick: () => void;
}

export default function PokemonCard({ pokemon, selected, onClick }: Props) {
  return (
    <button
      className={`pokemon-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <img src={pokemon.sprite} alt={pokemon.name} className="sprite" />
      <h3 className="name">{pokemon.name}</h3>

      <div className="types">
        {pokemon.types.map((type) => (
          <span key={type} className={`type-badge type-${type.toLowerCase()}`}>
            {type}
          </span>
        ))}
      </div>

      <div className="stats">
        <div>Atk {pokemon.stats.atk}</div>
        <div>Def {pokemon.stats.def}</div>
      </div>
    </button>
  )
}
