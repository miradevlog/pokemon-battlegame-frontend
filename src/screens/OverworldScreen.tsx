import { useMemo, useState } from 'react';
import type { Pokemon } from '../types/pokemon';
import RosterPanel from '../components/rosterPanel/RosterPanel';
import type { PathNode, NodeType } from '../types/overworld';
import { ITEMS } from './ItemScreen';
import './OverworldScreen.css';

interface Props {
  roster: Pokemon[];
  currentNodeId: string;
  nodes: PathNode[];
  visited: string[];
  inventory: string[];
  badges: number;
  score: number;
  onUseItem: (itemId: string, pokemonId: number) => void;
  onNodeSelect: (node: PathNode) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
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

const MapLines = ({ nodes, visited, availableIds }: { nodes: PathNode[], visited: string[], availableIds: string[] }) => {
  return (
    <svg className="map-lines-svg">
      {nodes.map((node) => {
        return node.connections.map((targetId) => {
          const target = nodes.find((n) => n.id === targetId);
          if (!target) return null;
          
          const isPathVisited = visited.includes(node.id) && visited.includes(target.id);
          const isPathAvailable = visited.includes(node.id) && availableIds.includes(target.id);

          return (
            <line
              key={`${node.id}-${targetId}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${target.x}%`}
              y2={`${target.y}%`}
              className={`map-line ${isPathVisited ? 'visited' : ''} ${isPathAvailable ? 'available' : ''}`}
            />
          );
        });
      })}
    </svg>
  );
};

export default function OverworldScreen({
  roster,
  currentNodeId,
  nodes,
  visited,
  inventory,
  badges,
  score,
  onUseItem,
  onNodeSelect,
  onReorder,
}: Props) {
  const [itemToUse, setItemToUse] = useState<string | null>(null);

  const currentNode = useMemo(() => {
    return nodes.find((n) => n.id === currentNodeId) ?? nodes[0];
  }, [nodes, currentNodeId]);

  const availableIds = currentNode?.connections || [];

  const handleNodeClick = (node: PathNode) => {
    if (!availableIds.includes(node.id)) return;
    onNodeSelect(node);
  };

  const renderNode = (node: PathNode) => {
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
        style={{ left: `${node.x}%`, top: `${node.y}%` }}
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
              return <img src={icon} alt={node.label} className="node-icon" />;
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
      <RosterPanel roster={roster} onReorder={onReorder} />

      <main className="path-area">
        <h2>Choose your path</h2>
        <div className="path-map">
          <MapLines nodes={nodes} visited={visited} availableIds={availableIds} />
          {nodes.map((node) => renderNode(node))}
        </div>
      </main>

      <aside className="badges-panel">
        <h3>Badges</h3>
        <div className="badges-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '1.5rem' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span 
              key={i} 
              className={`badge-icon ${i < badges ? 'active' : 'inactive'}`} 
              title={i < badges ? 'Badge Earned' : 'Locked'}
            >
              ◆
            </span>
          ))}
        </div>
        
        <h3 style={{ marginTop: '1.5rem' }}>Score</h3>
        <div className="score">{score}</div>

        <h3 style={{ marginTop: '1.5rem' }}>Inventory</h3>
        <div className="inventory-list">
          {inventory.length > 0 ? (
            inventory.map((itemId, i) => {
              const itemDef = ITEMS.find(item => item.id === itemId);
              return (
                <button
                  key={`${itemId}-${i}`}
                  className="inventory-item-btn"
                  onClick={() => {
                    if (itemId === 'exp_share') {
                      onUseItem(itemId, -1);
                    } else {
                      setItemToUse(itemId);
                    }
                  }}
                  title={itemDef?.desc}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {itemDef?.sprite && (
                    <img 
                      src={itemDef.sprite} 
                      alt={itemDef.name} 
                      style={{ width: 24, height: 24, imageRendering: 'pixelated' }} 
                    />
                  )}
                  {itemDef?.name || itemId}
                </button>
              );
            })
          ) : (
            <div style={{ opacity: 0.6, fontSize: '0.9rem' }}>Empty</div>
          )}
        </div>
      </aside>

      {itemToUse && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Use {ITEMS.find(i => i.id === itemToUse)?.name} on...</h3>
            <div className="modal-roster">
              {roster.map(p => {
                const isDead = (p.currentHP ?? p.stats.hp) <= 0;
                const isFullHP = (p.currentHP ?? p.stats.hp) >= (p.maxHP ?? p.stats.hp);
                
                let disabled = false;
                if (itemToUse === 'revive' && !isDead) disabled = true;
                if (itemToUse === 'potion' && (isDead || isFullHP)) disabled = true;

                return (
                  <button
                    key={p.id}
                    className="modal-roster-btn"
                    disabled={disabled}
                    style={{ opacity: disabled ? 0.4 : 1 }}
                    onClick={() => {
                      onUseItem(itemToUse, p.id);
                      setItemToUse(null);
                    }}
                  >
                    <img src={p.sprite} alt={p.name} />
                    <span>{p.name} {disabled && (itemToUse === 'revive' ? '(Alive)' : itemToUse === 'potion' && isDead ? '(Fainted)' : itemToUse === 'potion' && isFullHP ? '(Full HP)' : '')}</span>
                    <small>HP: {p.currentHP ?? p.stats.hp}/{p.maxHP ?? p.stats.hp}</small>
                  </button>
                );
              })}
            </div>
            <button className="btn secondary" onClick={() => setItemToUse(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}