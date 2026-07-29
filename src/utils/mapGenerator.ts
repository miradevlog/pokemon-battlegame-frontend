import type { PathNode, NodeType } from '../types/overworld';

const LAYER_COUNTS = [1, 2, 3, 4, 3, 4, 3, 2, 1];

function getRandomType(types: NodeType[]): NodeType {
  return types[Math.floor(Math.random() * types.length)];
}

function getValidPaths(colIndex: number, currentSize: number, nextSize: number): number[] {
  if (nextSize > currentSize) {
    return [colIndex, colIndex + 1];
  } else if (nextSize < currentSize) {
    const paths = [];
    if (colIndex > 0) paths.push(colIndex - 1);
    if (colIndex < nextSize) paths.push(colIndex);
    return paths;
  }
  return [colIndex]; 
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
      } else if (row === LAYER_COUNTS.length - 2) {
        type = 'heal';
        label = 'Heal';
      } else if (row === 1) {
        type = 'capture';
        label = 'Capture';
      } else if (row === 2) {
        const types: NodeType[] = ['fight', 'capture', 'item'];
        type = types[col % types.length];
        label = type.charAt(0).toUpperCase() + type.slice(1);
      } else {
        const types: NodeType[] = ['fight', 'capture', 'item', 'trainer', 'reroll'];
        type = getRandomType(types);
        label = type.charAt(0).toUpperCase() + type.slice(1);
      }


      const xPercent = 50 + (col - (layerSize - 1) / 2) * 22;

      const node: PathNode = {
        id: `node-${row}-${col}`,
        type,
        label,
        row,
        col,
        x: xPercent,
        y: yPercent, 
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
    
    const currentSize = currentLayer.length;
    const nextSize = nextLayer.length;


    for (let i = 0; i < currentSize; i++) {
      const validPaths = getValidPaths(i, currentSize, nextSize);

      const chosen = validPaths[Math.floor(Math.random() * validPaths.length)];
      currentLayer[i].connections.push(nextLayer[chosen].id);
    }


    for (let j = 0; j < nextSize; j++) {
      const hasIncoming = currentLayer.some(n => n.connections.includes(nextLayer[j].id));
      if (!hasIncoming) {

        const validParents = [];
        for (let i = 0; i < currentSize; i++) {
          if (getValidPaths(i, currentSize, nextSize).includes(j)) {
            validParents.push(i);
          }
        }

        if (validParents.length > 0) {
          const chosenParent = validParents[Math.floor(Math.random() * validParents.length)];
          currentLayer[chosenParent].connections.push(nextLayer[j].id);
        }
      }
    }

    for (let i = 0; i < currentSize; i++) {
      if (Math.random() < 0.3) {
        const validPaths = getValidPaths(i, currentSize, nextSize);
        for (const p of validPaths) {
          if (!currentLayer[i].connections.includes(nextLayer[p].id)) {
            currentLayer[i].connections.push(nextLayer[p].id);
          }
        }
      }
    }
  }

  return nodes;
}