export type NodeType = 'start' | 'fight' | 'capture' | 'reroll' | 'item' | 'heal' | 'trainer'

export interface PathNode {
    id: string,
    type: NodeType,
    label: string,
    row: number,
    col: number,
    x: number, 
    y: number,
    connections: string [],
}

export interface OverworldState {
    nodes: PathNode[],
    currentNodeId: string,
    visited: string [],
}