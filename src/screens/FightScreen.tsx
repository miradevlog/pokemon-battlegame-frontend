import { useState, useEffect, useRef } from 'react';
import type { Pokemon } from '../types/pokemon';
import type { PathNode } from '../types/overworld';
import './FightScreen.css';

interface Props {
  roster: Pokemon[];
  enemyRoster: Pokemon[];
  encounterNode: PathNode;
  onFinish: (result: 'win' | 'loss', remainingRoster: Pokemon[]) => void;
}

export default function FightScreen({
  roster,
  enemyRoster,
  encounterNode,
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

  const activePokemonIndex = localRoster.findIndex((p) => p.currentHP > 0);
  const activePokemon = localRoster[activePokemonIndex];

  const activeEnemyIndex = localEnemyRoster.findIndex((p) => p.currentHP > 0);
  const activeEnemy = localEnemyRoster[activeEnemyIndex];

  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [combatLog, setCombatLog] = useState<string[]>(['Battle started!']);
  const [isFinished, setIsFinished] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLog]);

  useEffect(() => {
    if (!activePokemon || !activeEnemy) return;
    const playerFirst = activePokemon.stats.speed >= activeEnemy.stats.speed;
    setTurn(playerFirst ? 'player' : 'enemy');
  }, []);

  const calculateDamage = (
    attacker: typeof activePokemon,
    defender: typeof activeEnemy
  ) => {
    const attack = attacker.stats.attack;
    const defense = defender.stats.defense;
    const variance = 0.85 + Math.random() * 0.3;

    let damage = Math.floor(
      ((attack * 1.6) / (defense * 0.7 + 25)) * 14 * variance
    );
    return Math.max(1, damage);
  };

  useEffect(() => {
    if (isFinished || !activePokemon || !activeEnemy) return;

    const timer = setTimeout(() => {
      if (turn === 'player') {
        const damage = calculateDamage(activePokemon, activeEnemy);
        const newEnemyHP = Math.max(0, activeEnemy.currentHP - damage);

        const updatedEnemyRoster = [...localEnemyRoster];
        updatedEnemyRoster[activeEnemyIndex] = {
          ...updatedEnemyRoster[activeEnemyIndex],
          currentHP: newEnemyHP,
        };
        setLocalEnemyRoster(updatedEnemyRoster);

        setCombatLog((prev) => [
          ...prev,
          `${activePokemon.name} attacks ${activeEnemy.name} for ${damage} damage!`,
        ]);

        if (newEnemyHP === 0) {
          setCombatLog((prev) => [
            ...prev,
            `Enemy ${activeEnemy.name} fainted!`,
          ]);

          const hasMoreEnemies = updatedEnemyRoster.some((p) => p.currentHP > 0);
          if (hasMoreEnemies) {
            setCombatLog((prev) => [
              ...prev,
              `Enemy is sending out their next Pokémon...`,
            ]);
            setTurn('enemy');
          } else {
            setCombatLog((prev) => [
              ...prev,
              'All enemy Pokémon fainted! You win!',
            ]);
            setIsFinished(true);
            setTimeout(() => onFinish('win', localRoster), 2000);
          }
        } else {
          setTurn('enemy');
        }
      } else if (turn === 'enemy') {
        const damage = calculateDamage(activeEnemy, activePokemon);
        const newPlayerHP = Math.max(0, activePokemon.currentHP - damage);

        const updatedRoster = [...localRoster];
        updatedRoster[activePokemonIndex] = {
          ...updatedRoster[activePokemonIndex],
          currentHP: newPlayerHP,
        };
        setLocalRoster(updatedRoster);

        setCombatLog((prev) => [
          ...prev,
          `Enemy ${activeEnemy.name} attacks ${activePokemon.name} for ${damage} damage!`,
        ]);

        if (newPlayerHP === 0) {
          setCombatLog((prev) => [
            ...prev,
            `${activePokemon.name} fainted!`,
          ]);

          const hasMorePokemon = updatedRoster.some((p) => p.currentHP > 0);
          if (hasMorePokemon) {
            setCombatLog((prev) => [
              ...prev,
              `Sending out your next Pokémon...`,
            ]);
            setTurn('player');
          } else {
            setCombatLog((prev) => [
              ...prev,
              'All your Pokémon fainted. Run over.',
            ]);
            setIsFinished(true);
            setTimeout(() => onFinish('loss', updatedRoster), 2000);
          }
        } else {
          setTurn('player');
        }
      }
    }, 1400);

    return () => clearTimeout(timer);
  }, [turn, isFinished, activePokemon, activeEnemy]);

  if (!activePokemon || !activeEnemy) return null;

  const getHpPercent = (current: number, max: number) =>
    Math.max(0, (current / max) * 100);

  const getHpColor = (percent: number) => {
    if (percent > 50) return '#4ade80';
    if (percent > 20) return '#facc15';
    return '#f87171';
  };

  return (
    <div className="fight-screen">
      <div className="fighter opponent">
        <div className="info-box">
          <div className="name-row">
            <span className="name">{activeEnemy.name}</span>
            <span className="level">Lv.5</span>
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

          {/* Team indicators */}
          <div className="team-dots">
            {localEnemyRoster.map((p, i) => (
              <div
                key={i}
                className={`dot ${p.currentHP > 0 ? 'alive' : 'fainted'}`}
              />
            ))}
          </div>
        </div>

        <img
          src={activeEnemy.sprite}
          alt={activeEnemy.name}
          className="sprite opponent-sprite"
        />
      </div>

      <div className="fighter player">
        <img
          src={activePokemon.sprite}
          alt={activePokemon.name}
          className="sprite player-sprite"
        />

        <div className="info-box">
          <div className="name-row">
            <span className="name">{activePokemon.name}</span>
            <span className="level">Lv.5</span>
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

          <div className="team-dots">
            {localRoster.map((p, i) => (
              <div
                key={i}
                className={`dot ${p.currentHP > 0 ? 'alive' : 'fainted'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="combat-log">
        {combatLog.map((line, index) => (
          <div key={index} className="log-line">
            {line}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}