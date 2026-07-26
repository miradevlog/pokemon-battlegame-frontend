import { useState, useEffect } from 'react';
import PokemonSelectionScreen from './screens/PokemonSelectionScreen';
import OverworldScreen from './screens/OverworldScreen';
import FightScreen from './screens/FightScreen';
import ItemScreen from './screens/ItemScreen';
import RerollScreen from './screens/RerollScreen';
import type { Pokemon } from './types/pokemon';
import { fetchPokemon, fetchRandomPokemonByTier, generateEnemyRoster } from './utils/pokemon';
import { TIER_1 } from './utils/tiers';
import type { PathNode } from './types/overworld';
import { generateMap } from './utils/mapGenerator';
import { addExpToPokemon } from './utils/progression';
import './App.css';

type GameScreen =
  | 'choose-pokemon'
  | 'overworld'
  | 'capture'
  | 'fight'
  | 'item'
  | 'reroll';

function App() {
  const [screen, setScreen] = useState<GameScreen>('choose-pokemon');
  const [playerRoster, setPlayerRoster] = useState<Pokemon[]>([]);
  const [enemyRoster, setEnemyRoster] = useState<Pokemon[]>([]);
  const [loadingEnemy, setLoadingEnemy] = useState(false);
  const [selectedNode, setSelectedNode] = useState<PathNode | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string>('node-0-0');
  const [hasExpShare, setHasExpShare] = useState(false);
  const [mapNodes, setMapNodes] = useState<PathNode[]>([]);
  const [visitedNodes, setVisitedNodes] = useState<string[]>(['node-0-0']);
  const [inventory, setInventory] = useState<string[]>([]);
  const [badges, setBadges] = useState<number>(0);

  const score = playerRoster.reduce((total, p) => total + (p.stats.exp || 0), 0);

  const leadPokemon =
    playerRoster.find((p) => (p.currentHP ?? 0) > 0) ?? playerRoster[0] ?? null;

  useEffect(() => {
    if (screen !== 'fight') return;
    if (enemyRoster.length > 0) return;

    async function loadEnemy() {
      setLoadingEnemy(true);
      try {
        const enemies = await generateEnemyRoster(selectedNode, badges);
        setEnemyRoster(enemies);
      } catch (err) {
        console.error('Failed to load enemy:', err);
        setEnemyRoster([]);
      } finally {
        setLoadingEnemy(false);
      }
    }

    loadEnemy();
  }, [screen, enemyRoster.length, selectedNode, badges]);

  const handleUseItem = (itemId: string, pokemonId: number) => {
    setInventory((prev) => {
      const index = prev.indexOf(itemId);
      if (index === -1) return prev;
      const newInv = [...prev];
      newInv.splice(index, 1);
      return newInv;
    });
    
    if (itemId === 'exp_share') {
      setHasExpShare(true);
      return;
    }

    setPlayerRoster((prev) =>
      prev.map((p) => {
        if (p.id !== pokemonId) return p;
        if (itemId === 'potion') {
          return { ...p, currentHP: Math.min((p.currentHP ?? 0) + 20, p.maxHP ?? p.stats.hp) };
        } else if (itemId === 'revive') {
          return { ...p, currentHP: (p.currentHP ?? 0) <= 0 ? Math.floor((p.maxHP ?? p.stats.hp) / 2) : p.currentHP };
        } else if (itemId === 'xattack') {
          return { ...p, stats: { ...p.stats, attack: p.stats.attack + 10 } };
        }
        return p;
      })
    );
  };

  if (screen === 'choose-pokemon') {
    return (
      <PokemonSelectionScreen
        title="Choose your Pokémon"
        subtitle="Starter Pokémon with Stats"
        fetchOptions={async () => {
          const STARTER_IDS = [1, 4, 7];
          return Promise.all(STARTER_IDS.map(fetchPokemon));
        }}
        onConfirm={(pokemon) => {
          setPlayerRoster([pokemon]);
          setMapNodes(generateMap());
          setVisitedNodes(['node-0-0']);
          setCurrentNodeId('node-0-0');
          setInventory([]);
          setBadges(0);
          setHasExpShare(false);
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
        nodes={mapNodes}
        visited={visitedNodes}
        inventory={inventory}
        badges={badges}
        score={score}
        onUseItem={handleUseItem}
        onNodeSelect={(node: PathNode) => {
          setSelectedNode(node);
          setCurrentNodeId(node.id);
          setVisitedNodes((prev) => prev.includes(node.id) ? prev : [...prev, node.id]);

          if (node.type === 'heal') {
            setPlayerRoster((prev) =>
              prev.map((p) => ({
                ...p,
                currentHP: p.maxHP ?? p.stats.hp,
              }))
            );
          } else if (node.type === 'capture') {
            setScreen('capture');
          } else if (node.type === 'item') {
            setScreen('item');
          } else if (node.type === 'reroll') {
            setScreen('reroll');
          } else if (node.type === 'fight' || node.type === 'trainer') {
            setScreen('fight');
          }
        }}
        onReorder={(fromIndex, toIndex) => {
          setPlayerRoster((prev) => {
            const newRoster = [...prev];
            const [moved] = newRoster.splice(fromIndex, 1);
            newRoster.splice(toIndex, 0, moved);
            return newRoster;
          });
        }}
      />
    );
  }

  if (screen === 'capture') {
    return (
      <PokemonSelectionScreen
        title="Wild Encounter!"
        subtitle="Choose one Pokémon to catch, or flee."
        confirmText="Catch!"
        cancelText="Flee"
        fetchOptions={async () => {
          const WILD_COUNT = 3;
          return Promise.all(
            Array.from({ length: WILD_COUNT }, () => fetchRandomPokemonByTier(TIER_1))
          );
        }}
        onConfirm={(pokemon) => {
          setPlayerRoster((prev) => [...prev, pokemon]);
          setScreen('overworld');
        }}
        onCancel={() => setScreen('overworld')}
      />
    );
  }

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
        inventory={inventory}
        onUseItem={(itemId, pokemonId) => {
          handleUseItem(itemId, pokemonId);
        }}
        onFinish={(result, updatedRoster) => {
          let finalRoster = [...updatedRoster];

          if (result === 'win') {
            const xpPerEnemy = 850;
            const totalXp = enemyRoster.length * xpPerEnemy;

            if (hasExpShare) {
              const aliveCount = finalRoster.filter((p) => (p.currentHP ?? 0) > 0).length;
              const xpPerPokemon = Math.floor(totalXp / Math.max(1, aliveCount));
              finalRoster = finalRoster.map((p) =>
                (p.currentHP ?? 0) > 0 ? addExpToPokemon(p, xpPerPokemon) : p
              );
            } else {
              const leadIndex = finalRoster.findIndex((p) => (p.currentHP ?? 0) > 0);
              if (leadIndex !== -1) {
                finalRoster[leadIndex] = addExpToPokemon(finalRoster[leadIndex], totalXp);
              }
            }

            if (selectedNode.label === 'Boss') {
              alert('You defeated the Arena Leader! Moving to the next area...');
              setBadges((prev) => prev + 1);
              setMapNodes(generateMap());
              setVisitedNodes(['node-0-0']);
              setCurrentNodeId('node-0-0');
            }
            setScreen('overworld');
          } else {
            finalRoster = [];
            setCurrentNodeId('node-0-0');
            setSelectedNode(null);
            setInventory([]);
            setBadges(0);
            setScreen('choose-pokemon');
          }

          setPlayerRoster(finalRoster);
          setEnemyRoster([]);
        }}
      />
    );
  }

  if (screen === 'item') {
    return (
      <ItemScreen
        roster={playerRoster}
        hasExpShare={hasExpShare || inventory.includes('exp_share')}
        onPick={(itemId) => {
          setInventory((prev) => [...prev, itemId]);
          setScreen('overworld');
        }}
        onSkip={() => setScreen('overworld')}
      />
    );
  }

  if (screen === 'reroll') {
  return (
    <RerollScreen
      roster={playerRoster}
      onConfirm={(newRoster) => {
        setPlayerRoster(newRoster);
        setScreen('overworld');
      }}
      onCancel={() => setScreen('overworld')}
    />
  );
}

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p>Loading…</p>
      <button onClick={() => setScreen('choose-pokemon')}>Back to Start</button>
    </div>
  );
}

export default App;