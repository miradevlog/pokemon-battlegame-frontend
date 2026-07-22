import { useState } from 'react'
import PokemonCard from '../components/pokemon/PokemonCard'
import type { Pokemon } from '../types/pokemon'
import './ChoosePokemonScreen.css'

const Starters: Pokemon[] = [
    {
        id: 1,
        name: 'Bulbasaur',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
        types: ['Grass'],
        stats: { atk: 3, def: 2}
    },

    {
        id: 4,
        name: 'Charmander',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
        types: ['Fire'],
        stats: { atk: 3, def: 2 },
    },

    {
        id: 7,
        name: 'Squirtle',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
        types: ['Water'],
        stats: { atk: 3, def: 2 },
    },
]

interface Props {
    onSelect: (pokemon: Pokemon ) => void
}

export default function ChoosePokemonScreen({ onSelect }: Props) {
    const [ selectedId, setSelectedId ] = useState<number | null> (null)

    const handleConfirm = () => {
        const chosen = Starters.find((p) => p.id === selectedId);
        if (chosen) onSelect(chosen)
    }

    return (
        <div className='choose-screen'>
            <header>
                <h1>Choose your Pokemon</h1>
                <p>See Stats, Type etc.</p>
            </header>

            <div className='cards'>
                {Starters.map((pokemon) => (
                    <PokemonCard
                        key={ pokemon.id }
                        pokemon= { pokemon }
                        selected= {selectedId === pokemon.id}
                        onClick={() => setSelectedId(pokemon.id)}
                    />
                ))}
            </div>

            <button
                className='confirm-btn'
                disabled={!selectedId}
                onClick={handleConfirm}
            >
                Confirm
            </button>
        </div>
    )
}