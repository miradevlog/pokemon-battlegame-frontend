import { useState } from 'react';
import './RosterPanel.css';
import type { Pokemon } from '../../types/pokemon';

interface Props {
  roster: Pokemon[];
  activeIndex?: number;
  title?: string;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export default function RosterPanel({
  roster,
  activeIndex,
  title = 'Your Team',
  onReorder,
}: Props) {
  const [selectedSwapIndex, setSelectedSwapIndex] = useState<number | null>(null);

  const getHpPercent = (current: number, max: number) =>
    Math.max(0, (current / max) * 100);

  const getHpColor = (percent: number) => {
    if (percent > 50) return '#4ade80';
    if (percent > 20) return '#facc15';
    return '#f87171';
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (onReorder) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (!onReorder) return;
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
    }
    setSelectedSwapIndex(null);
  };

  const handleItemClick = (index: number) => {
    if (!onReorder) return;
    if (selectedSwapIndex === null) {
      setSelectedSwapIndex(index);
    } else if (selectedSwapIndex === index) {
      setSelectedSwapIndex(null);
    } else {
      onReorder(selectedSwapIndex, index);
      setSelectedSwapIndex(null);
    }
  };

  return (
    <aside className="roster-panel">
      <h3>{title}</h3>
      <div className="roster-list">
        {roster.map((p, i) => {
          const currentHP = p.currentHP ?? p.stats.hp;
          const maxHP = p.maxHP ?? p.stats.hp;
          const hpPercent = getHpPercent(currentHP, maxHP);
          const isActive = activeIndex === i;
          const isFainted = currentHP <= 0;
          const isSelectedSwap = selectedSwapIndex === i;
          
          const level = p.stats.level || 5;
          const exp = p.stats.exp || 0;
          const requiredExp = Math.floor(100 * Math.pow(level, 1.2));
          const expPercent = Math.min(100, Math.max(0, (exp / requiredExp) * 100));

          return (
            <div
              key={`${p.id}-${i}`}
              className={`roster-item ${isActive ? 'active' : ''} ${isFainted ? 'fainted' : ''} ${onReorder ? 'draggable' : ''} ${isSelectedSwap ? 'swap-pending' : ''}`}
              draggable={!!onReorder}
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i)}
              onClick={() => handleItemClick(i)}
            >
              <img src={p.sprite} alt={p.name} className="roster-sprite" />
              <div className="roster-info">
                <span className="roster-name">{p.name} <span className="roster-level">Lv.{level}</span></span>
                <div className="mini-hp-bar">
                  <div
                    className="mini-hp-fill"
                    style={{
                      width: `${hpPercent}%`,
                      backgroundColor: getHpColor(hpPercent),
                    }}
                  />
                </div>
                <div className="mini-exp-bar">
                  <div
                    className="mini-exp-fill"
                    style={{ width: `${expPercent}%` }}
                  />
                </div>
                <span className="roster-hp">
                  {currentHP}/{maxHP}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}