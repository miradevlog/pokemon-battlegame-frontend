import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Pokemon } from '../types/pokemon';
import { getTypeIconUrl } from '../types/pokemon';
import { fetchPokemon } from '../utils/pokemon';

export default function PokemonDetails() {
  const { id } = useParams<{ id: string }>();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [abilities, setAbilities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [pokemonData, abilitiesData] = await Promise.all([
          fetchPokemon(Number(id)),
          fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then((res) => {
              if (!res.ok) throw new Error('Failed to fetch abilities');
              return res.json();
            })
            .then((data) =>
              data.abilities.map((a: { ability: { name: string } }) => a.ability.name)
            ),
        ]);

        setPokemon(pokemonData);
        setAbilities(abilitiesData);
      } catch (err) {
        console.error(err);
        setError('Could not load Pokémon.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const handleAddToRoster = () => {
    // TODO: wire up to roster.ts once card 3 (roster system) is built
    console.log('Add to roster:', pokemon);
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;
  if (!pokemon) return null;

  return (
    <div>
      <h2>{pokemon.name}</h2>
      <img src={pokemon.sprite} alt={pokemon.name} />

      <div>
        {pokemon.types.map((type) => (
          <img key={type} src={getTypeIconUrl(type)} alt={type} title={type} />
        ))}
      </div>

      <h3>Stats</h3>
      <ul>
        <li>HP: {pokemon.stats.hp}</li>
        <li>Attack: {pokemon.stats.attack}</li>
        <li>Defense: {pokemon.stats.defense}</li>
        <li>Special Attack: {pokemon.stats.specialAttack}</li>
        <li>Special Defense: {pokemon.stats.specialDefense}</li>
        <li>Speed: {pokemon.stats.speed}</li>
      </ul>

      <h3>Abilities</h3>
      <ul>
        {abilities.map((ability) => (
          <li key={ability}>{ability}</li>
        ))}
      </ul>

      <button onClick={handleAddToRoster}>Add to Roster</button>
    </div>
  );
}
