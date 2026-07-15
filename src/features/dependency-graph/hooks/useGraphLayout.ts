import { useState, useCallback } from 'react';
import { Node, Edge, useReactFlow } from 'reactflow';
import { GraphNodeData, GraphEdgeData, LayoutMode } from '../types/graph';
import { applyLayout } from '../utils/layout';

export function useGraphLayout() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('LR');
  const [isApplying, setIsApplying] = useState(false);
  const { setNodes } = useReactFlow();

  const applyGraphLayout = useCallback(async (
    nodes: Node<GraphNodeData>[],
    edges: Edge<GraphEdgeData>[],
    mode?: LayoutMode
  ) => {
    const target = mode || layoutMode;
    setIsApplying(true);
    try {
      const laid = await applyLayout(nodes, edges, target);
      setNodes(laid);
    } finally {
      setIsApplying(false);
    }
  }, [layoutMode, setNodes]);

  const changeLayout = useCallback(async (
    mode: LayoutMode,
    nodes: Node<GraphNodeData>[],
    edges: Edge<GraphEdgeData>[]
  ) => {
    setLayoutMode(mode);
    await applyGraphLayout(nodes, edges, mode);
  }, [applyGraphLayout]);

  return { layoutMode, isApplying, applyGraphLayout, changeLayout };
}
