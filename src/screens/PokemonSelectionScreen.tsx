import { useState, useEffect } from 'react';
import PokemonCard from '../components/pokemon/PokemonCard';
import SelectionLayout from '../components/layout/SelectionLayout';
import type { Pokemon } from '../types/pokemon';

interface Props {
  title: string;
  subtitle?: string;
  loadingText?: string;
  errorText?: string;
  confirmText?: string;
  cancelText?: string;
  fetchOptions: () => Promise<Pokemon[]>;
  onConfirm: (pokemon: Pokemon) => void;
  onCancel?: () => void;
}

export default function PokemonSelectionScreen({
  title,
  subtitle,
  loadingText = 'Loading Pokémon…',
  errorText = 'Could not load Pokémon.',
  confirmText = 'Confirm',
  cancelText,
  fetchOptions,
  onConfirm,
  onCancel,
}: Props) {
  const [options, setOptions] = useState<Pokemon[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoading(true);
        setError(null);
        const results = await fetchOptions();
        setOptions(results);
      } catch (err) {
        console.error(err);
        setError(errorText);
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, [fetchOptions, errorText]);

  const handleConfirm = () => {
    const chosen = options.find((p) => p.id === selectedId);
    if (chosen) onConfirm(chosen);
  };

  if (loading) {
    return (
      <SelectionLayout title={title} subtitle={subtitle}>
        <p className="loading">{loadingText}</p>
      </SelectionLayout>
    );
  }

  if (error) {
    return (
      <SelectionLayout
        title={title}
        subtitle={subtitle}
        primaryAction={{
          label: 'Retry',
          onClick: () => window.location.reload(),
        }}
        secondaryAction={
          onCancel && cancelText
            ? {
                label: cancelText,
                onClick: onCancel,
              }
            : undefined
        }
      >
        <p className="error">{error}</p>
      </SelectionLayout>
    );
  }

  return (
    <SelectionLayout
      title={title}
      subtitle={subtitle}
      primaryAction={{
        label: confirmText,
        onClick: handleConfirm,
        disabled: !selectedId,
      }}
      secondaryAction={
        onCancel && cancelText
          ? {
              label: cancelText,
              onClick: onCancel,
            }
          : undefined
      }
    >
      <div className="cards">
        {options.map((pokemon, i) => (
          <PokemonCard
            key={`${pokemon.id}-${i}`}
            pokemon={pokemon}
            selected={selectedId === pokemon.id}
            onClick={() => setSelectedId(pokemon.id)}
          />
        ))}
      </div>
    </SelectionLayout>
  );
}
