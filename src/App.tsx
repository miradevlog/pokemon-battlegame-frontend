import { useState, useEffect } from 'react';
import ChoosePokemonScreen from './screens/ChoosePokemonScreen';
import OverworldScreen from './screens/OverworldScreen';
//import CaptureScreen from './screens/CaptureScreen';
import FightScreen from './screens/FightScreen';
import type { Pokemon } from './types/pokemon'
import { fetchPokemon } from './utils/pokemon';
import type { PathNode } from './types/overworld';
import './App.css'

type GameScreen = 'choose-pokemon' | 'overworld' | 'capture' | 'fight'

function App() {
  const [screen, setScreen] = useState<GameScreen>('choose-pokemon');
  const [playerRoster, setPlayerRoster] = useState<Pokemon []>([]);
  const [enemyRoster, setEnemyRoster] = useState<Pokemon[]>([]);
  const [loadingEnemy, setLoadingEnemy] = useState(false);
  const [selectedNode, setSelectedNode] = useState<PathNode | null>(null)
  const [currentNodeId, setCurrentNodeId] = useState<string>('start')

  const leadPokemon = playerRoster.find((p) => p.currentHP > 0) ?? playerRoster[0] ?? null
  
  useEffect(() => {
  if (screen !== 'fight') return;
  if (enemyRoster.length > 0) return;

  async function loadEnemy() {
      setLoadingEnemy(true);
      try {
        const randomId = Math.floor(Math.random() * 151) + 1;
        const enemy = await fetchPokemon(randomId);
        setEnemyRoster([enemy]);
      } catch (err) {
        console.error('Failed to load enemy:', err);
        setEnemyRoster([]);
      } finally {
        setLoadingEnemy(false);
      }
    }

    loadEnemy();
  }, [screen, enemyRoster.length]);

    if (screen === 'choose-pokemon') {
    return (
      <ChoosePokemonScreen
        onSelect={(pokemon) => {
          setPlayerRoster([pokemon]);
          setCurrentNodeId('start')
          setScreen('overworld');
        }}
      />
    );
  }

  if (screen === 'overworld' && leadPokemon) {
    return (
      <OverworldScreen
        roster={playerRoster}
        currentNodeId={currentNodeId}
        onNodeSelect={(node) => {
          setSelectedNode(node)
          setCurrentNodeId(node.id)

          if (node.type === 'capture') {
            setScreen('capture')
          } else if (node.type === 'fight' || node.type === 'trainer') { 
            setScreen('fight')
          }
        }}
      />
    )
  }

//if (screen === 'capture' && leadPokemon) {
//    return (
//      <CaptureScreen
//        onCapture={(pokemon) => {
//          setPlayerRoster(prev => [...prev, pokemon])
//          setScreen('overworld')
//        }}
//        onCancel={() => setScreen('overworld')}
//        />
//      )
//     }

  if (screen === 'fight' && playerRoster.length > 0 && selectedNode) {
    if (loadingEnemy || enemyRoster.length === 0) {
        return (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p>Loading opponent…</p>
          </div>
        );
      }
    
    return (
      <FightScreen
        roster={playerRoster}
        enemyRoster={enemyRoster}
        encounterNode={selectedNode}
        onFinish={(result, updatedRoster) => {
          setPlayerRoster(updatedRoster)

          if (result === 'win') {
          setScreen('overworld')
          } else {
            setPlayerRoster([])
            setCurrentNodeId('start')
            setSelectedNode(null)
            setScreen('choose-pokemon')
          }
        }}
      />
    )
  }

    return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p>Loading…</p>
          <button onClick={() => setScreen('choose-pokemon')}>
            Back to Start
          </button>
        </div>
      );
    }


export default App