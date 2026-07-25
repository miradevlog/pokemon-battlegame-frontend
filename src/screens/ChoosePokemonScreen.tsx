import { useState, useEffect } from 'react';
import PokemonCard from '../components/pokemon/PokemonCard';
import type { Pokemon } from '../types/pokemon';
import './ChoosePokemonScreen.css';

const Starter_Ids = [1, 4, 7]; 

interface Props {
  onSelect: (pokemon: Pokemon) => void;
}

export default function ChoosePokemonScreen({ onSelect }: Props) {
  const [starters, setStarters] = useState<Pokemon[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStarters() {
      try {
        setLoading(true);
        setError(null);

        const results = await Promise.all(
          Starter_Ids.map((id) =>
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => {
              if (!res.ok) throw new Error('Failed to fetch');
              return res.json();
            })
          )
        );

        const mapped: Pokemon[] = results.map((data) => {
        const getStat = (statName: string) =>
          data.stats.find((s: any) => s.stat.name === statName)?.base_stat ?? 0;
      
        const baseHp = getStat('hp');
      
        return {
          id: data.id,
          name: data.name,
          sprite: data.sprites.front_default,
          backSprite:                                          // ← camelCase
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
          },
          currentHP: baseHp,
          maxHP: baseHp,
      };
});

        setStarters(mapped);
      } catch (err) {
        console.error(err);
        setError('Could not load Pokémon. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadStarters();
  }, []);

  const handleConfirm = () => {
    const chosen = starters.find((p) => p.id === selectedId);
    if (chosen) {
      onSelect(chosen);
    }
  };

  if (loading) {
    return (
      <div className="choose-screen">
        <p className="loading">Loading starters…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="choose-screen">
        <p className="error">{error}</p>
        <button className="confirm-btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="choose-screen">
      <header>
        <h1>Choose your Pokémon</h1>
        <p>Starter Pokemon with Stats</p>
      </header>

      <div className="cards">
        {starters.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            selected={selectedId === pokemon.id}
            onClick={() => setSelectedId(pokemon.id)}
          />
        ))}
      </div>

      <button
        className="confirm-btn"
        disabled={!selectedId}
        onClick={handleConfirm}
      >
        Confirm
      </button>
    </div>
  );
}