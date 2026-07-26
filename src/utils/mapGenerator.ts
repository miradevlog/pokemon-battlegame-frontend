import type { PathNode, NodeType } from '../types/overworld';


const LAYER_COUNTS = [1, 2, 3, 3, 3, 2, 1];

function getRandomType(types: NodeType[]): NodeType {
  return types[Math.floor(Math.random() * types.length)];
}

export function generateMap(): PathNode[] {
  const nodes: PathNode[] = [];
  const layers: PathNode[][] = [];

  for (let row = 0; row < LAYER_COUNTS.length; row++) {
    const layerSize = LAYER_COUNTS[row];
    const layerNodes: PathNode[] = [];

    const yPercent = 90 - (row / (LAYER_COUNTS.length - 1)) * 80;

    for (let col = 0; col < layerSize; col++) {
      let type: NodeType;
      let label: string;

      if (row === 0) {
        type = 'start';
        label = 'Start';
      } else if (row === LAYER_COUNTS.length - 1) {
        type = 'trainer';
        label = 'Boss';
      } else if (row === 1) {
        type = col === 0 ? 'capture' : 'fight';
        label = type.charAt(0).toUpperCase() + type.slice(1);
      } else if (row === 2) {
        const types: NodeType[] = ['item', 'fight', 'trainer'];
        type = types[col % types.length];
        label = type.charAt(0).toUpperCase() + type.slice(1);
      } else if (row === 3) {
        const types: NodeType[] = ['capture', 'trainer', 'reroll'];
        type = types[col % types.length];
        label = type.charAt(0).toUpperCase() + type.slice(1);
      } else if (row === 4) {
        type = col === 0 ? 'fight' : 'item';
        label = type.charAt(0).toUpperCase() + type.slice(1);
      } else if (row === 5) {
        type = 'heal';
        label = type.charAt(0).toUpperCase() + type.slice(1);
      } else {
        type = getRandomType(['fight', 'item', 'capture']);
        label = type.charAt(0).toUpperCase() + type.slice(1);
      }

      const xPercent = ((col + 1) / (layerSize + 1)) * 100;
      
      const jitterX = (row > 0 && row < LAYER_COUNTS.length - 1) ? (Math.random() * 4 - 2) : 0;
      const jitterY = (row > 0 && row < LAYER_COUNTS.length - 1) ? (Math.random() * 4 - 2) : 0;

      const node: PathNode = {
        id: `node-${row}-${col}`,
        type,
        label,
        row,
        col,
        x: xPercent + jitterX,
        y: yPercent + jitterY,
        connections: [],
      };
      
      layerNodes.push(node);
      nodes.push(node);
    }
    layers.push(layerNodes);
  }

  for (let row = 0; row < layers.length - 1; row++) {
    const currentLayer = layers[row];
    const nextLayer = layers[row + 1];

    let i = 0;
    let j = 0; 
    
    while (i < currentLayer.length || j < nextLayer.length) {
      const safeI = Math.min(i, currentLayer.length - 1);
      const safeJ = Math.min(j, nextLayer.length - 1);
      
      const currentNode = currentLayer[safeI];
      const nextNode = nextLayer[safeJ];
      
      if (!currentNode.connections.includes(nextNode.id)) {
        currentNode.connections.push(nextNode.id);
      }
      
      if (i >= currentLayer.length - 1 && j >= nextLayer.length - 1) {
        break;
      }
      
      if (i >= currentLayer.length - 1) {
        j++;
      } else if (j >= nextLayer.length - 1) {
        i++;
      } else {
        const r = Math.random();
        if (r < 0.3) {
          i++;
        } else if (r < 0.6) {
          j++;
        } else {
          i++;
          j++;
        }
      }
    }
  }

  return nodes;
}
