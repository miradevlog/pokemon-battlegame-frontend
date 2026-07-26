import { useState, useEffect } from 'react';
import SelectionLayout from '../components/layout/SelectionLayout';
import RosterPanel from '../components/rosterPanel/RosterPanel';
import type { Pokemon } from '../types/pokemon';

export const ITEMS = [
  { id: 'potion', name: 'Potion', desc: 'Heal 20 HP', effect: 'heal20', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png' },
  { id: 'xattack', name: 'X Attack', desc: '+10 Attack (run)', effect: 'atk', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-attack.png' },
  { id: 'revive', name: 'Revive', desc: 'Revive fainters to 50%', effect: 'revive', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/revive.png' },
  { id: 'exp_share', name: 'Exp Share', desc: 'Share XP across roster', effect: 'expshare', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/exp-share.png' },
];

interface Props {
  roster: Pokemon[];
  hasExpShare: boolean;
  onPick: (itemId: string) => void;
  onSkip: () => void;
}

export default function ItemScreen({ roster, hasExpShare, onPick, onSkip }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [randomItems, setRandomItems] = useState<typeof ITEMS>([]);

  useEffect(() => {
    const availableItems = ITEMS.filter(item => {
      if (item.id === 'exp_share' && hasExpShare) return false;
      return true;
    });
    
    const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
    setRandomItems(shuffled.slice(0, 3));
  }, [hasExpShare]);

  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 10 }}>
        <RosterPanel roster={roster} />
      </div>
      <SelectionLayout
        title="Item Found!"
      subtitle="Pick one to keep"
      primaryAction={{
        label: 'Take',
        onClick: () => selected && onPick(selected),
        disabled: !selected,
      }}
      secondaryAction={{
        label: 'Skip',
        onClick: onSkip,
      }}
    >
      <div className="cards">
        {randomItems.map((item) => (
          <button
            key={item.id}
            className={`pokemon-card ${selected === item.id ? 'selected' : ''}`}
            onClick={() => setSelected(item.id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <img src={item.sprite} alt={item.name} style={{ width: 48, height: 48, imageRendering: 'pixelated' }} />
            <h3>{item.name}</h3>
            <p>{item.desc}</p>
          </button>
        ))}
      </div>
    </SelectionLayout>
    </>
  );
}