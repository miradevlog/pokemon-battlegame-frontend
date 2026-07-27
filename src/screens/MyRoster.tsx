import { useEffect, useState } from 'react';
import type { Pokemon } from '../types/pokemon';
import { getRoster, removeFromRoster } from '../lib/roster';

export default function MyRoster() {
  const [roster, setRoster] = useState<Pokemon[]>([]);

  useEffect(() => {
    setRoster(getRoster());
  }, []);

  const handleRemove = (id: number) => {
    removeFromRoster(id);
    setRoster((prev) => prev.filter((p) => p.id !== id));
  };

  if (roster.length === 0) {
    return (
      <div>
        <h2>My Roster</h2>
        <p>Your roster is empty. Add Pokémon from their details page.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>My Roster</h2>
      <div>
        {roster.map((pokemon) => (
          <div key={pokemon.id}>
            <img src={pokemon.sprite} alt={pokemon.name} />
            <p>{pokemon.name}</p>
            <button onClick={() => handleRemove(pokemon.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
