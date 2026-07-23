import type { Pokemon } from '../../types/pokemon';
import { getTypeIconUrl } from '../../types/pokemon';
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
            <img
                key={type}
                src={getTypeIconUrl(type)}
                alt={type}
                title={type}
                className='type-icon'
            />
        ))}
      </div>

      <div className="stats">
        <div><span>HP</span> {pokemon.stats.hp}</div>
        <div><span>Atk</span> {pokemon.stats.attack}</div>
        <div><span>Def</span> {pokemon.stats.defense}</div>
        <div><span>SpA</span> {pokemon.stats.specialAttack}</div>
        <div><span>SpD</span> {pokemon.stats.specialDefense}</div>
        <div><span>Spe</span> {pokemon.stats.speed}</div>
      </div>
    </button>
  )
}
