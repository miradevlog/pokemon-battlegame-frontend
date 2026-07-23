import { useState } from 'react';
import ChoosePokemonScreen from './screens/ChoosePokemonScreen';
import OverworldScreen from './screens/OverworldScreen';
import type { Pokemon } from './types/pokemon'
import type { PathNode } from './types/overworld';
import './App.css'

type GameScreen = 'choose-pokemon' | 'overworld' 

function App() {
  const [screen, setScreen] = useState<GameScreen>('choose-pokemon');
  const [playerPokemon, setPlayerPokemon] = useState<Pokemon | null>(null);

  if (screen === 'choose-pokemon') {
    return (
      <ChoosePokemonScreen
        onSelect={(pokemon) => {
          setPlayerPokemon(pokemon);
          setScreen('overworld');   // next frame of the loop
        }}
      />
    );
  }

  if (screen === 'overworld' && playerPokemon) {
    return (
      <OverworldScreen
        playerPokemon={playerPokemon}
        onNodeSelect={(node: PathNode) => {
          console.log('Player selected node:', node)
        }}
      />
    )
  }

  return<div>Next screen</div>
}

export default App