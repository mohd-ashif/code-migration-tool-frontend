import { Node, Edge } from 'reactflow';
import { GraphNodeData, GraphEdgeData, FilterState } from '../types/graph';
import { detectNodeType, getNodeStyle } from './nodeStyles';

export function buildNodes(rawNodes: any[]): Node<GraphNodeData>[] {
  return rawNodes.map((n, idx) => {
    const type = detectNodeType(n.type);
    const style = getNodeStyle(type, n.isCircular, n.isUnused);
    const cols = 4;
    const x = (idx % cols) * 270 + 60;
    const y = Math.floor(idx / cols) * 160 + 60;

    // Prefer new API fields; fall back gracefully
    const imports: string[] = n.imports || [];
    const importCount: number = n.importCount ?? imports.length;
    const usedBy: number = n.usedByCount ?? n.usedBy ?? 0;

    return {
      id: n.id,
      type: type === 'component' ? 'component' :
            type === 'hook' ? 'hook' :
            type === 'utility' ? 'utility' :
            type === 'service' ? 'service' : 'default',
      position: { x, y },
      data: {
        id: n.id,
        label: n.label,
        type,
        file: n.file || '',
        isCircular: n.isCircular || false,
        isUnused: n.isUnused || false,
        imports,
        exports: n.exports || [],
        lineCount: n.lineCount,
        usedBy,
        warnings: n.warnings ?? 0,
        migrationStatus: n.migrationStatus,
        highlighted: 'none',
        // Extra field: raw import count for node badge
        importCount,
      } as GraphNodeData & { importCount: number },
      style: {
        background: style.background,
        border: `1.5px ${n.isUnused ? 'dashed' : 'solid'} ${style.border}`,
        color: style.color,
        borderRadius: '14px',
        boxShadow: style.glow || 'none',
      },
    };
  });
}

export function buildEdges(rawEdges: any[]): Edge<GraphEdgeData>[] {
  return rawEdges.map((e) => {
    const isCircular = e.isCircular || false;
    const isDynamic = e.type === 'dynamic';

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: isCircular ? 'circular' : 'animated',
      animated: isDynamic || e.type === 'import',
      label: e.label,
      data: {
        type: isCircular ? 'circular' : (e.type || 'import'),
        label: e.label,
      },
      style: {
        stroke: isCircular ? '#FF5D73' : e.type === 'import' ? '#7C6CFF' : '#3F3F46',
        strokeWidth: isCircular ? 2 : 1.5,
        strokeDasharray: e.type === 'unused' ? '5,5' : undefined,
      },
      markerEnd: {
        type: 'arrowclosed' as any,
        color: isCircular ? '#FF5D73' : '#7C6CFF',
      },
    };
  });
}

export function applyFilters(nodes: Node<GraphNodeData>[], filters: FilterState): Node<GraphNodeData>[] {
  return nodes.filter((n) => {
    const d = n.data;
    if (!filters.showComponents && d.type === 'component') return false;
    if (!filters.showHooks && d.type === 'hook') return false;
    if (!filters.showUtilities && (d.type === 'utility' || d.type === 'function')) return false;
    if (!filters.showServices && d.type === 'service') return false;
    if (!filters.showClasses && (d.type === 'class' || d.type === 'interface' || d.type === 'enum')) return false;
    if (!filters.showContexts && d.type === 'context') return false;
    if (!filters.showStores && d.type === 'store') return false;
    if (!filters.showUnused && d.isUnused) return false;
    if (!filters.showCircular && d.isCircular) return false;
    return true;
  });
}

export function applyHighlight(
  nodes: Node<GraphNodeData>[],
  edges: Edge<GraphEdgeData>[],
  selectedNodeId: string | null
): { nodes: Node<GraphNodeData>[]; edges: Edge<GraphEdgeData>[] } {
  if (!selectedNodeId) {
    return {
      nodes: nodes.map(n => ({ ...n, data: { ...n.data, highlighted: 'none' as const } })),
      edges: edges.map(e => ({
        ...e,
        style: { ...e.style, opacity: 1 },
      })),
    };
  }

  const incomingIds = new Set(
    edges.filter(e => e.target === selectedNodeId).map(e => e.source)
  );
  const outgoingIds = new Set(
    edges.filter(e => e.source === selectedNodeId).map(e => e.target)
  );

  const highlightedNodes = nodes.map((n) => {
    let highlighted: GraphNodeData['highlighted'] = 'faded';
    if (n.id === selectedNodeId) highlighted = 'selected';
    else if (incomingIds.has(n.id)) highlighted = 'incoming';
    else if (outgoingIds.has(n.id)) highlighted = 'outgoing';
    return { ...n, data: { ...n.data, highlighted } };
  });

  const highlightedEdges = edges.map((e) => {
    const isRelated = e.source === selectedNodeId || e.target === selectedNodeId;
    return {
      ...e,
      style: {
        ...e.style,
        opacity: isRelated ? 1 : 0.1,
        strokeWidth: isRelated ? 2.5 : 1,
      },
    };
  });

  return { nodes: highlightedNodes, edges: highlightedEdges };
}
