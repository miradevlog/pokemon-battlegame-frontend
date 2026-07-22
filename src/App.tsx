import { useState } from 'react';
import ChoosePokemonScreen from './screens/ChoosePokemonScreen';
import type { Pokemon } from './types/pokemon'
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

  return<div>Next screen</div>
}

export default App