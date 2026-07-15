import { Node, Edge, Position } from 'reactflow';
import { LayoutMode } from '../types/graph';

// ── Pure TypeScript graph layout — no external dependencies ──────────────────
// Implements a simple topological level-based layout (similar to Dagre)
// using BFS for level assignment and column packing.

interface NodePos { x: number; y: number }

function buildAdjacency(edges: Edge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source)!.push(e.target);
  }
  return adj;
}

function topoLevels(nodeIds: string[], edges: Edge[]): Map<string, number> {
  const inDegree = new Map<string, number>();
  for (const id of nodeIds) inDegree.set(id, 0);
  for (const e of edges) {
    if (inDegree.has(e.target)) inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  }

  const adj = buildAdjacency(edges);
  const levels = new Map<string, number>();
  const queue: string[] = [];

  // Start from roots (in-degree 0)
  for (const [id, deg] of inDegree) {
    if (deg === 0) { queue.push(id); levels.set(id, 0); }
  }
  // Handle cycles: assign level 0 to any unvisited nodes
  for (const id of nodeIds) {
    if (!levels.has(id)) { queue.push(id); levels.set(id, 0); }
  }

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const currLevel = levels.get(curr) || 0;
    for (const child of (adj.get(curr) || [])) {
      const existing = levels.get(child) ?? -1;
      const newLevel = currLevel + 1;
      if (newLevel > existing) {
        levels.set(child, newLevel);
        queue.push(child);
      }
    }
  }

  return levels;
}

function layoutLR(nodes: Node[], edges: Edge[], hGap = 280, vGap = 100): NodePos[] {
  const ids = nodes.map(n => n.id);
  const levels = topoLevels(ids, edges);

  // Group nodes by level
  const byLevel = new Map<number, string[]>();
  for (const [id, lv] of levels) {
    if (!byLevel.has(lv)) byLevel.set(lv, []);
    byLevel.get(lv)!.push(id);
  }

  const posMap = new Map<string, NodePos>();
  for (const [lv, members] of byLevel) {
    const totalHeight = members.length * vGap;
    const startY = -totalHeight / 2;
    members.forEach((id, i) => {
      posMap.set(id, { x: lv * hGap + 60, y: startY + i * vGap + 60 });
    });
  }

  return nodes.map(n => posMap.get(n.id) || { x: 60, y: 60 });
}

function layoutTB(nodes: Node[], edges: Edge[], hGap = 220, vGap = 160): NodePos[] {
  const ids = nodes.map(n => n.id);
  const levels = topoLevels(ids, edges);

  const byLevel = new Map<number, string[]>();
  for (const [id, lv] of levels) {
    if (!byLevel.has(lv)) byLevel.set(lv, []);
    byLevel.get(lv)!.push(id);
  }

  const maxPerRow = Math.max(...Array.from(byLevel.values()).map(a => a.length));

  const posMap = new Map<string, NodePos>();
  for (const [lv, members] of byLevel) {
    const totalWidth = members.length * hGap;
    const startX = (maxPerRow * hGap - totalWidth) / 2;
    members.forEach((id, i) => {
      posMap.set(id, { x: startX + i * hGap + 60, y: lv * vGap + 60 });
    });
  }

  return nodes.map(n => posMap.get(n.id) || { x: 60, y: 60 });
}

function layoutRadial(nodes: Node[]): NodePos[] {
  const count = nodes.length;
  if (count === 0) return [];
  if (count === 1) return [{ x: 400, y: 300 }];

  const cx = 500, cy = 350;
  // Multiple rings
  const rings = [1, 8, 16, 24, 32, 40];
  let ring = 0, posInRing = 0;
  const positions: NodePos[] = [];

  for (let i = 0; i < count; i++) {
    const capacity = rings[Math.min(ring, rings.length - 1)];
    const radius = ring === 0 ? 0 : ring * 180;
    const angle = capacity === 1 ? 0 : (2 * Math.PI * posInRing) / capacity;
    positions.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
    posInRing++;
    if (posInRing >= capacity) { ring++; posInRing = 0; }
  }

  return positions;
}

function layoutGrid(nodes: Node[], colCount = 4, hGap = 260, vGap = 150): NodePos[] {
  return nodes.map((_, i) => ({
    x: (i % colCount) * hGap + 60,
    y: Math.floor(i / colCount) * vGap + 60,
  }));
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function applyLayout(
  nodes: Node[],
  edges: Edge[],
  mode: LayoutMode,
): Promise<Node[]> {
  if (nodes.length === 0) return nodes;

  let positions: NodePos[];

  switch (mode) {
    case 'LR':
    case 'RL':
      positions = layoutLR(nodes, edges);
      if (mode === 'RL') positions = positions.map(p => ({ ...p, x: -p.x + 1200 }));
      break;
    case 'TB':
    case 'BT':
      positions = layoutTB(nodes, edges);
      if (mode === 'BT') positions = positions.map(p => ({ ...p, y: -p.y + 900 }));
      break;
    case 'radial':
      positions = layoutRadial(nodes);
      break;
    default:
      positions = layoutGrid(nodes);
  }

  const isHorizontal = mode === 'LR' || mode === 'RL';

  return nodes.map((node, i) => ({
    ...node,
    targetPosition: isHorizontal ? Position.Left : Position.Top,
    sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
    position: positions[i] || { x: 0, y: 0 },
  }));
}
