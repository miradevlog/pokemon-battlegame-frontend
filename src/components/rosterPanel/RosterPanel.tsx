import './RosterPanel.css';
import type { Pokemon } from '../../types/pokemon';

interface Props {
  roster: Pokemon[];
  activeIndex?: number;
  title?: string;
}

export default function RosterPanel({
  roster,
  activeIndex,
  title = 'Your Team',
}: Props) {
  const getHpPercent = (current: number, max: number) =>
    Math.max(0, (current / max) * 100);

  const getHpColor = (percent: number) => {
    if (percent > 50) return '#4ade80';
    if (percent > 20) return '#facc15';
    return '#f87171';
  };

  return (
    <aside className="roster-panel">
      <h3>{title}</h3>
      <div className="roster-list">
        {roster.map((p, i) => {
          const currentHP = p.currentHP ?? p.stats.hp;
          const maxHP = p.maxHP ?? p.stats.hp;
          const percent = getHpPercent(currentHP, maxHP);
          const isActive = activeIndex === i;
          const isFainted = currentHP <= 0;

          return (
            <div
              key={`${p.id}-${i}`}
              className={`roster-item ${isActive ? 'active' : ''} ${isFainted ? 'fainted' : ''}`}
            >
              <img src={p.sprite} alt={p.name} className="roster-sprite" />
              <div className="roster-info">
                <span className="roster-name">{p.name}</span>
                <div className="mini-hp-bar">
                  <div
                    className="mini-hp-fill"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: getHpColor(percent),
                    }}
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