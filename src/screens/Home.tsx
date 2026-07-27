import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface PokemonListItem {
  id: number;
  name: string;
}

function extractIdFromUrl(url: string): number {
  const segments = url.split('/').filter(Boolean);
  return Number(segments[segments.length - 1]);
}

export default function Home() {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadList() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=24');
        if (!res.ok) throw new Error('Failed to fetch Pokémon list');
        const data = await res.json();

        const mapped: PokemonListItem[] = data.results.map(
          (entry: { name: string; url: string }) => ({
            id: extractIdFromUrl(entry.url),
            name: entry.name,
          })
        );

        setPokemonList(mapped);
      } catch (err) {
        console.error(err);
        setError('Could not load Pokémon list.');
      } finally {
        setLoading(false);
      }
    }

    loadList();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Pokédex</h2>
      <div>
        {pokemonList.map((pokemon) => (
          <Link key={pokemon.id} to={`/pokemon/${pokemon.id}`}>
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
              alt={pokemon.name}
            />
            <p>{pokemon.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
