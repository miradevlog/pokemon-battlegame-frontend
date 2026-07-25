import { useState } from 'react';
import type { Pokemon } from '../types/pokemon';
import RosterPanel from '../components/rosterPanel/RosterPanel';
import type { PathNode, NodeType } from '../types/overworld';
import './OverworldScreen.css';

interface Props {
  roster: Pokemon[];
  currentNodeId: string;
  onNodeSelect: (node: PathNode) => void;
}

const TRAINER_SPRITES = [
  'https://play.pokemonshowdown.com/sprites/trainers/youngster.png',
  'https://play.pokemonshowdown.com/sprites/trainers/lass.png',
  'https://play.pokemonshowdown.com/sprites/trainers/bugcatcher.png',
  'https://play.pokemonshowdown.com/sprites/trainers/schoolkid-gen4.png',
  'https://play.pokemonshowdown.com/sprites/trainers/richboy.png',
];

const getNodeIcon = (type: NodeType): string | null => {
  switch (type) {
    case 'start':
      return TRAINER_SPRITES[Math.floor(Math.random() * TRAINER_SPRITES.length)];
    case 'capture':
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
    case 'item':
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png';
    case 'heal':
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png';
    case 'reroll':
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png';
    case 'fight':
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/muscle-band.png';
    case 'trainer':
      return TRAINER_SPRITES[Math.floor(Math.random() * TRAINER_SPRITES.length)];
    default:
      return null;
  }
};

const NODE_COLORS: Record<NodeType, string> = {
  start: '#a6e3a1',
  fight: '#f38ba8',
  capture: '#89b4fa',
  reroll: '#cba6f7',
  item: '#f9e2af',
  heal: '#94e2d5',
  trainer: '#fab387',
};

const INITIAL_NODES: PathNode[] = [
  {
    id: 'start',
    type: 'start',
    label: 'Start',
    row: 0,
    col: 1,
    connections: ['capture', 'fight'],
  },
  {
    id: 'capture',
    type: 'capture',
    label: 'Capture',
    row: 1,
    col: 0,
    connections: ['heal', 'item'],
  },
  {
    id: 'fight',
    type: 'fight',
    label: 'Fight',
    row: 1,
    col: 2,
    connections: ['trainer', 'reroll'],
  },
  {
    id: 'heal',
    type: 'heal',
    label: 'Heal',
    row: 2,
    col: 0,
    connections: [],
  },
  {
    id: 'item',
    type: 'item',
    label: 'Item',
    row: 2,
    col: 1,
    connections: [],
  },
  {
    id: 'trainer',
    type: 'trainer',
    label: 'Trainer',
    row: 2,
    col: 2,
    connections: [],
  },
  {
    id: 'reroll',
    type: 'reroll',
    label: 'Reroll',
    row: 2,
    col: 3,
    connections: [],
  },
];

export default function OverworldScreen({
  roster,
  currentNodeId,
  onNodeSelect,
}: Props) {
  const [visited, setVisited] = useState<string[]>(['start']);

  const currentNode =
    INITIAL_NODES.find((n) => n.id === currentNodeId) ?? INITIAL_NODES[0];
  const availableIds = currentNode.connections;

  const handleNodeClick = (node: PathNode) => {
    if (!availableIds.includes(node.id)) return;
    setVisited((prev) =>
      prev.includes(node.id) ? prev : [...prev, node.id]
    );
    onNodeSelect(node);
  };

  const renderNode = (id: string) => {
    const node = INITIAL_NODES.find((n) => n.id === id)!;
    const isCurrent = node.id === currentNodeId;
    const isAvailable = availableIds.includes(node.id);
    const isVisited = visited.includes(node.id);

    return (
      <button
        key={node.id}
        className={`
          path-node
          ${isCurrent ? 'current' : ''}
          ${isAvailable ? 'available' : ''}
          ${isVisited ? 'visited' : ''}
        `}
        onClick={() => handleNodeClick(node)}
        disabled={!isAvailable && !isCurrent}
      >
        <div
          className="node-circle"
          style={{ backgroundColor: NODE_COLORS[node.type] }}
        >
          {(() => {
            const icon = getNodeIcon(node.type);
            if (icon) {
              return (
                <img src={icon} alt={node.label} className="node-icon" />
              );
            }
            return isCurrent ? '●' : node.label[0];
          })()}
        </div>
        <span className="node-label">{node.label}</span>
      </button>
    );
  };

  return (
    <div className="overworld-screen">
      <RosterPanel roster={roster} />

      <main className="path-area">
        <h2>Choose your path</h2>
        <div className="path-map">
          <div className="path-row">{renderNode('start')}</div>
          <div className="path-row">
            {renderNode('capture')}
            {renderNode('fight')}
          </div>
          <div className="path-row">
            {renderNode('heal')}
            {renderNode('item')}
            {renderNode('trainer')}
            {renderNode('reroll')}
          </div>
        </div>
      </main>

      <aside className="badges-panel">
        <h3>Badges</h3>
        <div className="badges-placeholder">◆ ◆ ◆</div>
        <h3>Score</h3>
        <div className="score">0</div>
      </aside>
    </div>
  );
}