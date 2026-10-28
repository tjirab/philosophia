import { Edge } from '../types';

export interface PathStep {
  fromNodeId: string;
  toNodeId: string;
  edge: Edge;
}

export interface PathResult {
  found: boolean;
  nodes: string[];
  steps: PathStep[];
  totalHops: number;
}

/**
 * Breadth-First Search (BFS) to find the shortest intellectual lineage path
 * between startNodeId and targetNodeId.
 * Treats the graph as directed by default, with option to allow bidirectional exploration.
 */
export function findInfluencePath(
  startNodeId: string,
  targetNodeId: string,
  edges: Edge[],
  allowUndirected: boolean = false
): PathResult {
  if (startNodeId === targetNodeId) {
    return {
      found: true,
      nodes: [startNodeId],
      steps: [],
      totalHops: 0,
    };
  }

  // Build adjacency list
  // node -> array of { neighborId, edge, isForward }
  const adj = new Map<string, Array<{ neighborId: string; edge: Edge }>>();

  for (const edge of edges) {
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    adj.get(edge.source)!.push({ neighborId: edge.target, edge });

    if (allowUndirected) {
      if (!adj.has(edge.target)) adj.set(edge.target, []);
      adj.get(edge.target)!.push({ neighborId: edge.source, edge });
    }
  }

  // Queue stores current node and the path of steps taken to reach it
  const queue: Array<{ nodeId: string; path: PathStep[]; visited: Set<string> }> = [
    { nodeId: startNodeId, path: [], visited: new Set([startNodeId]) },
  ];

  while (queue.length > 0) {
    const { nodeId, path, visited } = queue.shift()!;
    const neighbors = adj.get(nodeId) || [];

    for (const { neighborId, edge } of neighbors) {
      if (visited.has(neighborId)) continue;

      const newStep: PathStep = {
        fromNodeId: nodeId,
        toNodeId: neighborId,
        edge,
      };
      const newPath = [...path, newStep];

      if (neighborId === targetNodeId) {
        const pathNodes = [startNodeId, ...newPath.map((s) => s.toNodeId)];
        return {
          found: true,
          nodes: pathNodes,
          steps: newPath,
          totalHops: newPath.length,
        };
      }

      const newVisited = new Set(visited);
      newVisited.add(neighborId);
      queue.push({ nodeId: neighborId, path: newPath, visited: newVisited });
    }
  }

  // If directed search found nothing and undirected wasn't checked, try undirected fallback
  if (!allowUndirected) {
    return findInfluencePath(startNodeId, targetNodeId, edges, true);
  }

  return {
    found: false,
    nodes: [],
    steps: [],
    totalHops: 0,
  };
}
