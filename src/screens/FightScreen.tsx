import { useState, useEffect, useRef } from 'react';
import type { Pokemon, Move } from '../types/pokemon';
import { getTypeEffectiveness } from '../utils/pokemon';
import RosterPanel from '../components/rosterPanel/RosterPanel';
import type { PathNode } from '../types/overworld';
import { ITEMS } from './ItemScreen';
import './FightScreen.css';

interface Props {
  roster: Pokemon[];
  enemyRoster: Pokemon[];
  encounterNode: PathNode;
  inventory?: string[];
  onUseItem?: (itemId: string, pokemonId: number) => void;
  onFinish: (result: 'win' | 'loss', remainingRoster: Pokemon[]) => void;
}

export default function FightScreen({
  roster,
  enemyRoster,
  inventory = [],
  onUseItem,
  onFinish,
}: Props) {
  const [localRoster, setLocalRoster] = useState(() =>
    roster.map((p) => ({
      ...p,
      currentHP: p.currentHP ?? p.stats.hp,
      maxHP: p.maxHP ?? p.stats.hp,
    }))
  );

  const [localEnemyRoster, setLocalEnemyRoster] = useState(() =>
    enemyRoster.map((p) => ({
      ...p,
      currentHP: p.currentHP ?? p.stats.hp,
      maxHP: p.maxHP ?? p.stats.hp,
    }))
  );

  const [activeFighterId, setActiveFighterId] = useState<number | null>(null);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [combatLog, setCombatLog] = useState<React.ReactNode[]>(['Battle started!']);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<'win' | 'loss' | null>(null);
  
  const [playerAnimating, setPlayerAnimating] = useState(false);
  const [enemyAnimating, setEnemyAnimating] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFinished && localRoster.every(p => p.currentHP <= 0)) {
      setIsFinished(true);
      setResult('loss');
    }
  }, [localRoster, isFinished]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLog]);

  useEffect(() => {
    if (activeFighterId) {
      const fighter = localRoster.find(p => p.id === activeFighterId);
      if (fighter && fighter.currentHP > 0) {
        return;
      }
    }
    const nextAlive = localRoster.find(p => p.currentHP > 0);
    if (nextAlive) {
      setActiveFighterId(nextAlive.id);
    }
  }, [localRoster, activeFighterId]);

  const activePokemonIndex = (() => {
    const idx = localRoster.findIndex(p => p.id === activeFighterId);
    if (idx !== -1) return idx;
    const alive = localRoster.findIndex((p) => p.currentHP > 0);
    return alive !== -1 ? alive : Math.max(0, localRoster.length - 1);
  })();

  const activeEnemyIndex = (() => {
    const alive = localEnemyRoster.findIndex((p) => p.currentHP > 0);
    return alive !== -1 ? alive : Math.max(0, localEnemyRoster.length - 1);
  })();

  const activePokemon = localRoster[activePokemonIndex];
  const activeEnemy = localEnemyRoster[activeEnemyIndex];

  useEffect(() => {
    if (!activePokemon || !activeEnemy) return;
    const playerFirst = activePokemon.stats.speed >= activeEnemy.stats.speed;
    setTurn(playerFirst ? 'player' : 'enemy');
  }, []); 

  const calculateDamage = (
    attacker: typeof activePokemon,
    defender: typeof activeEnemy,
    move: Move
  ) => {
    const attack = attacker.stats.attack;
    const defense = defender.stats.defense;
    const effectiveness = getTypeEffectiveness([move.type], defender.types);
    const stab = attacker.types.includes(move.type) ? 1.5 : 1;
    const variance = 0.85 + Math.random() * 0.3;
    const level = attacker.stats.level || 5;
    
    const baseDamage = ((2 * level / 5 + 2) * move.power * attack / defense) / 50 + 2;
    const damage = Math.floor(baseDamage * stab * effectiveness * variance);
    
    return { damage: Math.max(1, damage), effectiveness };
  };

  useEffect(() => {
    if (isFinished || !activePokemon || !activeEnemy) return;
    if (activePokemon.currentHP <= 0 || activeEnemy.currentHP <= 0) return;

    const timer = setTimeout(() => {
      if (turn === 'player') {
        setPlayerAnimating(true);
        setTimeout(() => setPlayerAnimating(false), 400);

        const move = activePokemon.moves[Math.floor(Math.random() * activePokemon.moves.length)];
        const { damage, effectiveness } = calculateDamage(activePokemon, activeEnemy, move);
        const newEnemyHP = Math.max(0, activeEnemy.currentHP - damage);

        setTimeout(() => {
          setEnemyHit(true);
          setTimeout(() => setEnemyHit(false), 300);
        }, 250);

        const updatedEnemyRoster = [...localEnemyRoster];
        updatedEnemyRoster[activeEnemyIndex] = {
          ...updatedEnemyRoster[activeEnemyIndex],
          currentHP: newEnemyHP,
        };
        setLocalEnemyRoster(updatedEnemyRoster);

        let effNode = null;
        if (effectiveness > 1) effNode = <span className="eff-super"> It's super effective!</span>;
        if (effectiveness < 1 && effectiveness > 0) effNode = <span className="eff-not"> It's not very effective...</span>;
        if (effectiveness === 0) effNode = <span className="eff-none"> It had no effect!</span>;

        setCombatLog((prev) => [
          ...prev,
          <span key={prev.length}>
            <span className="log-player">{activePokemon.name}</span> used {move.name}!{effNode}
          </span>,
        ]);

        if (newEnemyHP === 0) {
          setCombatLog((prev) => [
            ...prev,
            <span key={prev.length}>
              Enemy <span className="log-enemy">{activeEnemy.name}</span> fainted!
            </span>,
          ]);

          const hasMoreEnemies = updatedEnemyRoster.some((p) => p.currentHP > 0);
          if (hasMoreEnemies) {
            setCombatLog((prev) => [
              ...prev,
              <span key={prev.length}>Enemy is sending out their next Pokémon...</span>,
            ]);
            setTurn('enemy');
          } else {
            setCombatLog((prev) => [
              ...prev,
              <span key={prev.length}>All enemy Pokémon fainted! You win!</span>,
            ]);
            setIsFinished(true);
            setResult('win');
          }
        } else {
          setTurn('enemy');
        }
      } else if (turn === 'enemy') {
        setEnemyAnimating(true);
        setTimeout(() => setEnemyAnimating(false), 400);

        const move = activeEnemy.moves[Math.floor(Math.random() * activeEnemy.moves.length)];
        const { damage, effectiveness } = calculateDamage(activeEnemy, activePokemon, move);
        const newPlayerHP = Math.max(0, activePokemon.currentHP - damage);

        setTimeout(() => {
          setPlayerHit(true);
          setTimeout(() => setPlayerHit(false), 300);
        }, 250);

        const updatedRoster = [...localRoster];
        updatedRoster[activePokemonIndex] = {
          ...updatedRoster[activePokemonIndex],
          currentHP: newPlayerHP,
        };
        setLocalRoster(updatedRoster);

        let effNode = null;
        if (effectiveness > 1) effNode = <span className="eff-super"> It's super effective!</span>;
        if (effectiveness < 1 && effectiveness > 0) effNode = <span className="eff-not"> It's not very effective...</span>;
        if (effectiveness === 0) effNode = <span className="eff-none"> It had no effect!</span>;

        setCombatLog((prev) => [
          ...prev,
          <span key={prev.length}>
            Enemy <span className="log-enemy">{activeEnemy.name}</span> used {move.name}!{effNode}
          </span>,
        ]);

        if (newPlayerHP === 0) {
          setCombatLog((prev) => [
            ...prev,
            <span key={prev.length}>
              <span className="log-player">{activePokemon.name}</span> fainted!
            </span>,
          ]);

          const hasMorePokemon = updatedRoster.some((p) => p.currentHP > 0);
          if (hasMorePokemon) {
            setCombatLog((prev) => [
              ...prev,
              <span key={prev.length}>Sending out your next Pokémon...</span>,
            ]);
            setTurn('player');
          } else {
            setCombatLog((prev) => [
              ...prev,
              <span key={prev.length}>All your Pokémon fainted. Run over.</span>,
            ]);
            setIsFinished(true);
            setResult('loss');
          }
        } else {
          setTurn('player');
        }
      }
    }, 1400);

    return () => clearTimeout(timer);
  }, [turn, isFinished, activePokemon, activeEnemy]);

  useEffect(() => {
    if (!isFinished || !result) return;

    const timer = setTimeout(() => {
      onFinish(result, localRoster);
    }, 1800);

    return () => clearTimeout(timer);
  }, [isFinished, result, localRoster, onFinish]);

  if (!activePokemon || !activeEnemy) {
    return (
      <div className="fight-screen center">
        <p>Battle ended.</p>
      </div>
    );
  }

  const getHpPercent = (current: number, max: number) =>
    Math.max(0, (current / max) * 100);

  const getHpColor = (percent: number) => {
    if (percent > 50) return '#4ade80';
    if (percent > 20) return '#facc15';
    return '#f87171';
  };

  return (
    <div className={`fight-screen ${playerHit || enemyHit ? 'screen-shake' : ''}`}>
      <div className="battle-grid">
        <div className="roster-column left">
          <RosterPanel 
            roster={localRoster} 
            activeIndex={activePokemonIndex} 
            title="Your Team" 
            onReorder={(fromIndex, toIndex) => {
              if (fromIndex === activePokemonIndex || toIndex === activePokemonIndex) return;
              const updated = [...localRoster];
              const [moved] = updated.splice(fromIndex, 1);
              updated.splice(toIndex, 0, moved);
              setLocalRoster(updated);
            }}
          />
        </div>

        <div className="battle-center-column">
          <main className="battlefield">
            <div
              className={`fighter opponent ${enemyAnimating ? 'lunge-down' : ''} ${
                enemyHit ? 'hit-flash' : ''
              }`}
            >
              <div className="info-box">
                <div className="name-row">
                  <span className="name">{activeEnemy.name}</span>
                  <span className="level">Lv.{activeEnemy.stats.level || 5}</span>
                </div>
                <div className="hp-bar-container">
                  <span className="hp-label">HP</span>
                  <div className="hp-bar">
                    <div
                      className="hp-fill"
                      style={{
                        width: `${getHpPercent(activeEnemy.currentHP, activeEnemy.maxHP)}%`,
                        backgroundColor: getHpColor(
                          getHpPercent(activeEnemy.currentHP, activeEnemy.maxHP)
                        ),
                      }}
                    />
                  </div>
                </div>
                <div className="hp-text">
                  {activeEnemy.currentHP} / {activeEnemy.maxHP}
                </div>
              </div>
              <img
                src={activeEnemy.sprite}
                alt={activeEnemy.name}
                className="sprite opponent-sprite"
              />
            </div>

            <div
              className={`fighter player ${playerAnimating ? 'lunge-up' : ''} ${
                playerHit ? 'hit-flash' : ''
              }`}
            >
              <img
                src={activePokemon.backSprite || activePokemon.sprite}
                alt={activePokemon.name}
                className="sprite player-sprite"
              />
              <div className="info-box">
                <div className="name-row">
                  <span className="name">{activePokemon.name}</span>
                  <span className="level">Lv.{activePokemon.stats.level || 5}</span>
                </div>
                <div className="hp-bar-container">
                  <span className="hp-label">HP</span>
                  <div className="hp-bar">
                    <div
                      className="hp-fill"
                      style={{
                        width: `${getHpPercent(activePokemon.currentHP, activePokemon.maxHP)}%`,
                        backgroundColor: getHpColor(
                          getHpPercent(activePokemon.currentHP, activePokemon.maxHP)
                        ),
                      }}
                    />
                  </div>
                </div>
                <div className="hp-text">
                  {activePokemon.currentHP} / {activePokemon.maxHP}
                </div>
                <div className="exp-bar">
                  <div
                    className="exp-fill"
                    style={{ 
                      width: `${Math.min(100, Math.max(0, ((activePokemon.stats.exp || 0) / Math.floor(100 * Math.pow(activePokemon.stats.level || 5, 1.2))) * 100))}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </main>

          <div className="combat-log">
            {combatLog.map((line, index) => (
              <div key={index} className="log-line">
                {line}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        <div className="roster-column right">
          <RosterPanel 
            roster={localEnemyRoster} 
            activeIndex={activeEnemyIndex} 
            title="Enemy Team" 
          />
        </div>
      </div>

      {inventory.length > 0 && (
        <aside className="roster-panel items-panel">
          <h3>Items</h3>
          <div className="roster-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px' }}>
            {inventory.map((itemId, i) => {
                  const itemDef = ITEMS.find(it => it.id === itemId);
                  return (
                    <button
                      key={`${itemId}-${i}`}
                      className="inventory-item-btn"
                      onClick={() => {
                        if (itemId === 'exp_share') return;
                        
                        const updated = [...localRoster];
                        let targetIndex = activePokemonIndex;

                        if (itemId === 'revive') {
                          const deadIndex = updated.findIndex(p => p.currentHP <= 0);
                          if (deadIndex === -1) return; // No dead pokemon to revive
                          targetIndex = deadIndex;
                        }
                        
                        const target = updated[targetIndex];
                        const isDead = target.currentHP <= 0;
                        const isFullHP = target.currentHP >= target.maxHP;
                        
                        if (itemId === 'potion' && (isDead || isFullHP)) return;

                        if (itemId === 'potion') updated[targetIndex].currentHP = Math.min(target.currentHP + 20, target.maxHP);
                        if (itemId === 'revive') updated[targetIndex].currentHP = Math.floor(target.maxHP / 2);
                        if (itemId === 'xattack') updated[targetIndex].stats.attack += 10;
                        
                        setLocalRoster(updated);
                        if (onUseItem) onUseItem(itemId, target.id);
                        
                        setCombatLog((prev) => [
                          ...prev,
                          <span key={prev.length}>Used {itemDef?.name} on <span className="log-player">{target.name}</span>!</span>
                        ]);
                      }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '4px 8px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      {itemDef?.sprite && <img src={itemDef.sprite} style={{ width: 24, height: 24, imageRendering: 'pixelated' }} />}
                      {itemDef?.name || itemId}
                    </button>
                  );
                })}
          </div>
        </aside>
      )}
    </div>
  );
}