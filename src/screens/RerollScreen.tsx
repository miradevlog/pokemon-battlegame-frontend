// src/screens/RerollScreen.tsx
import { useState, useCallback } from 'react';
import PokemonSelectionScreen from './PokemonSelectionScreen';
import type { Pokemon } from '../types/pokemon';
import { fetchRandomPokemon } from '../utils/pokemon';

interface Props {
  roster: Pokemon[];
  onConfirm: (newRoster: Pokemon[]) => void;
  onCancel: () => void;
}

export default function RerollScreen({ roster, onConfirm, onCancel }: Props) {
  const [selectedToReplaceIndex, setSelectedToReplaceIndex] = useState<number | null>(null);

  const fetchRosterOptions = useCallback(async () => {
    return roster;
  }, [roster]);

  const fetchReplacementOptions = useCallback(async () => {
    return Promise.all([fetchRandomPokemon(), fetchRandomPokemon(), fetchRandomPokemon()]);
  }, []);

  if (selectedToReplaceIndex === null) {
    return (
      <PokemonSelectionScreen
        title="Ditto Reroll - Step 1"
        subtitle="Pick a team member to replace"
        confirmText="Next"
        cancelText="Cancel"
        fetchOptions={fetchRosterOptions}
        onConfirm={(pokemon) => {
          const idx = roster.findIndex((p) => p.id === pokemon.id);
          setSelectedToReplaceIndex(idx !== -1 ? idx : 0);
        }}
        onCancel={onCancel}
      />
    );
  }

  return (
    <PokemonSelectionScreen
      title="Ditto Reroll - Step 2"
      subtitle="Pick a replacement Pokémon"
      confirmText="Transform!"
      cancelText="Back"
      fetchOptions={fetchReplacementOptions}
      onConfirm={(pokemon) => {
        const next = [...roster];
        next[selectedToReplaceIndex] = pokemon;
        onConfirm(next);
      }}
      onCancel={() => setSelectedToReplaceIndex(null)}
    />
  );
}