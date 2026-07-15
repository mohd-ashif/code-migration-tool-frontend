import { Node, Edge } from 'reactflow';
import { GraphNodeData, GraphSummary } from '../types/graph';

export function computeAnalytics(
  nodes: Node<GraphNodeData>[],
  edges: Edge[]
): GraphSummary {
  const totalNodes = nodes.length;
  const totalEdges = edges.length;
  const circularCount = nodes.filter(n => n.data.isCircular).length;
  const unusedCount = nodes.filter(n => n.data.isUnused).length;

  const componentCount = nodes.filter(n => n.data.type === 'component').length;
  const hookCount = nodes.filter(n => n.data.type === 'hook').length;
  const utilityCount = nodes.filter(n => n.data.type === 'utility' || n.data.type === 'function').length;
  const serviceCount = nodes.filter(n => n.data.type === 'service').length;

  const avgConnections = totalNodes > 0
    ? Math.round((totalEdges / totalNodes) * 10) / 10
    : 0;

  // BFS to find max depth from any root node (no incoming edges)
  const incomingCount = new Map<string, number>();
  for (const e of edges) {
    incomingCount.set(e.target, (incomingCount.get(e.target) || 0) + 1);
  }
  const roots = nodes.filter(n => !incomingCount.has(n.id));
  let maxDepth = 0;

  for (const root of roots) {
    const visited = new Set<string>();
    const queue: [string, number][] = [[root.id, 0]];
    while (queue.length > 0) {
      const [id, depth] = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      maxDepth = Math.max(maxDepth, depth);
      const children = edges.filter(e => e.source === id).map(e => e.target);
      for (const child of children) {
        if (!visited.has(child)) {
          queue.push([child, depth + 1]);
        }
      }
    }
  }

  return {
    totalComponents: componentCount,
    totalHooks: hookCount,
    totalUtilities: utilityCount,
    totalServices: serviceCount,
    totalNodes,
    totalEdges,
    circularCount,
    unusedCount,
    avgConnections,
    maxDepth,
  };
}
