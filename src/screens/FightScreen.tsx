import { useState, useEffect } from 'react';
import type { Pokemon } from '../types/pokemon';
import type { PathNode } from '../types/overworld';

interface Props {
  roster: Pokemon[];
  enemyRoster: Pokemon[];
  encounterNode: PathNode;
  onFinish: (result: 'win' | 'loss', remainingRoster: Pokemon[]) => void;
}

export default function FightScreen({ roster, enemyRoster, encounterNode, onFinish }: Props) {
  const [localRoster, setLocalRoster] = useState<Pokemon[]>(() => 
    roster.map(p => ({...p}))
  );
  
  const [localEnemyRoster, setLocalEnemyRoster] = useState<Pokemon[]>(() => 
    enemyRoster.map(p => ({...p}))
  );
  
  const activePokemonIndex = localRoster.findIndex(p => p.currentHP > 0);
  const activePokemon = localRoster[activePokemonIndex];

  const activeEnemyIndex = localEnemyRoster.findIndex(p => p.currentHP > 0);
  const activeEnemy = localEnemyRoster[activeEnemyIndex];

  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [combatLog, setCombatLog] = useState<string[]>(['Battle started!']);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isFinished || !activePokemon || !activeEnemy) return;

    const timer = setTimeout(() => {
      
      if (turn === 'player') {
        const damage = 25; 
        const newEnemyHP = Math.max(0, activeEnemy.currentHP - damage);
        
        const updatedEnemyRoster = [...localEnemyRoster];
        updatedEnemyRoster[activeEnemyIndex].currentHP = newEnemyHP;
        setLocalEnemyRoster(updatedEnemyRoster);

        setCombatLog(prev => [...prev, `${activePokemon.name} attacks ${activeEnemy.name} for ${damage} damage!`]);
        
        if (newEnemyHP === 0) {
          setCombatLog(prev => [...prev, `Enemy ${activeEnemy.name} fainted!`]);
          
          const hasMoreEnemies = updatedEnemyRoster.some(p => p.currentHP > 0);
          
          if (hasMoreEnemies) {
            setCombatLog(prev => [...prev, `Enemy is sending out their next Pokémon...`]);
            setTurn('enemy'); 
          } else {
            setCombatLog(prev => [...prev, 'All enemy Pokémon fainted! You win!']);
            setIsFinished(true);
            setTimeout(() => onFinish('win', localRoster as Pokemon[]), 2000); 
          }
        } else {
          setTurn('enemy');
        }
      } 
      
      else if (turn === 'enemy') {
        const damage = 35;
        const newPlayerHP = Math.max(0, activePokemon.currentHP - damage);
        
        const updatedRoster = [...localRoster];
        updatedRoster[activePokemonIndex].currentHP = newPlayerHP;
        setLocalRoster(updatedRoster);

        setCombatLog(prev => [...prev, `Enemy ${activeEnemy.name} attacks ${activePokemon.name} for ${damage} damage!`]);
        
        if (newPlayerHP === 0) {
          setCombatLog(prev => [...prev, `${activePokemon.name} fainted!`]);
          
          const hasMorePokemon = updatedRoster.some(p => p.currentHP > 0);
          
          if (hasMorePokemon) {
            setCombatLog(prev => [...prev, `Sending out your next Pokémon...`]);
            setTurn('player');
          } else {
            setCombatLog(prev => [...prev, 'All your Pokémon fainted. Run over.']);
            setIsFinished(true);
            setTimeout(() => onFinish('loss', updatedRoster as Pokemon[]), 2000);
          }
        } else {
          setTurn('player');
        }
      }

    }, 1500);

    return () => clearTimeout(timer);
  }, [turn, isFinished, activePokemon, activeEnemy]); 

  if (!activePokemon || !activeEnemy) return null;

  return (
    <div className="fight-screen flex flex-col items-center justify-center h-full p-8">
      <div className="battlefield flex justify-between w-full max-w-2xl mb-8">
        
        <div className="player-side text-center w-48">
          <img src={activePokemon.sprite} alt={activePokemon.name} className="w-32 h-32 mb-4 mx-auto" />
          <div className="text-xl font-bold">{activePokemon.name}</div>
          <div className="hp-bar bg-gray-700 w-full h-4 rounded mt-2">
            <div 
              className="bg-green-500 h-full rounded transition-all duration-300" 
              style={{ width: `${(activePokemon.currentHP / activePokemon.maxHP) * 100}%` }} 
            />
          </div>
          <div>{activePokemon.currentHP} / {activePokemon.maxHP} HP</div>
          
          <div className="flex gap-1 justify-center mt-2">
            {localRoster.map((p, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${p.currentHP > 0 ? 'bg-green-400' : 'bg-red-900'}`} />
            ))}
          </div>
        </div>

        <div className="text-4xl font-bold self-center mx-8">VS</div>

        <div className="enemy-side text-center w-48">
          <img src={activeEnemy.sprite} alt={activeEnemy.name} className="w-32 h-32 mb-4 mx-auto" />
          <div className="text-xl font-bold">{activeEnemy.name}</div>
          <div className="hp-bar bg-gray-700 w-full h-4 rounded mt-2">
            <div 
              className="bg-red-500 h-full rounded transition-all duration-300" 
              style={{ width: `${(activeEnemy.currentHP / activeEnemy.maxHP) * 100}%` }} 
            />
          </div>
          <div>{activeEnemy.currentHP} / {activeEnemy.maxHP} HP</div>

          <div className="flex gap-1 justify-center mt-2">
            {localEnemyRoster.map((p, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${p.currentHP > 0 ? 'bg-green-400' : 'bg-red-900'}`} />
            ))}
          </div>
        </div>

      </div>

      <div className="combat-log bg-gray-800 p-4 rounded w-full max-w-2xl h-48 overflow-y-auto font-mono text-sm flex flex-col gap-2 shadow-inner">
        {combatLog.map((log, index) => (
          <div key={index} className="opacity-90">{log}</div>
        ))}
      </div>
    </div>
  );
}