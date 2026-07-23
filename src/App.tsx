import { useState } from 'react';
import ChoosePokemonScreen from './screens/ChoosePokemonScreen';
import OverworldScreen from './screens/OverworldScreen';
//import CaptureScreen from './screens/CaptureScreen';
import FightScreen from './screens/FightScreen';
import type { Pokemon } from './types/pokemon'
import type { PathNode } from './types/overworld';
import './App.css'

type GameScreen = 'choose-pokemon' | 'overworld' | 'capture' | 'fight'

function App() {
  const [screen, setScreen] = useState<GameScreen>('choose-pokemon');
  const [playerRoster, setPlayerRoster] = useState<Pokemon []>([]);
  const [selectedNode, setSelectedNode] = useState<PathNode | null>(null)

  const leadPokemon = playerRoster.find(p => p.currentHP > 0) || playerRoster[0]
  
  if (screen === 'choose-pokemon') {
    return (
      <ChoosePokemonScreen
        onSelect={(pokemon) => {
          setPlayerRoster([pokemon]);
          setScreen('overworld');
        }}
      />
    );
  }

  if (screen === 'overworld' && leadPokemon) {
    return (
      <OverworldScreen
        playerPokemon={leadPokemon}
        onNodeSelect={(node: PathNode) => {
          setSelectedNode(node)

          if (node.type === 'capture') setScreen('capture')
          if (node.type === 'fight') setScreen('fight')
          console.log('Player selected node:', node)
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
    const mockEnemyTeam: Pokemon[] = [
      {
        id: 1,
        name: 'Bulbasaur',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
        types: ['grass', 'poison'],
        stats: { hp: 45, attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 },
        maxHP: 45,
        currentHP: 45
      }
    ];
    
    return (
      <FightScreen
        roster={playerRoster}
        enemyRoster={mockEnemyTeam}
        encounterNode={selectedNode}
        onFinish={(result, updatedRoster) => {
          console.log('Fight finished with result:', result)
          setPlayerRoster(updatedRoster)

          if (result === 'win') {
          setScreen('overworld')
          } else {
            setPlayerRoster([])
            setScreen('choose-pokemon')
          }
        }}
      />
    )
  }

  return<div>Next screen</div>
}

export default App