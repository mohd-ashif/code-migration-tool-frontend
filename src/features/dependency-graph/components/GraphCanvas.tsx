import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  NodeMouseHandler,
  OnNodesChange,
  OnEdgesChange,
  Node,
  Edge,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { GraphNodeData, GraphEdgeData, LayoutMode } from '../types/graph';
import {
  ComponentNode, HookNode, UtilityNode, ServiceNode, DefaultGraphNode,
} from './nodes/CustomNodes';
import { AnimatedImportEdge, CircularDepEdge } from './edges/CustomEdges';
import GraphControls from './GraphControls';
import NodePreview from './NodePreview';
import ContextMenu from './ContextMenu';
import { ContextMenuState } from '../types/graph';

const NODE_TYPES: NodeTypes = {
  component: ComponentNode,
  hook: HookNode,
  utility: UtilityNode,
  service: ServiceNode,
  default: DefaultGraphNode,
};

const EDGE_TYPES: EdgeTypes = {
  animated: AnimatedImportEdge,
  circular: CircularDepEdge,
};

interface GraphCanvasProps {
  nodes: Node<GraphNodeData>[];
  edges: Edge<GraphEdgeData>[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onNodeClick: NodeMouseHandler;
  onNodeDoubleClick: NodeMouseHandler;
  layoutMode: LayoutMode;
  onChangeLayout: (mode: LayoutMode) => void;
  onExportJSON: () => void;
  onHighlightDeps: (nodeId: string) => void;
  onHideNode: (nodeId: string) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export default function GraphCanvas({
  nodes, edges, onNodesChange, onEdgesChange,
  onNodeClick, onNodeDoubleClick, layoutMode, onChangeLayout,
  onExportJSON, onHighlightDeps, onHideNode, canvasRef,
}: GraphCanvasProps) {
  const [hoverNode, setHoverNode] = useState<{ data: GraphNodeData; x: number; y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false, x: 0, y: 0, nodeId: null, nodeData: null,
  });

  const handleNodeMouseEnter: NodeMouseHandler = useCallback((_e, node) => {
    const el = document.querySelector(`[data-id="${node.id}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setHoverNode({ data: node.data, x: rect.right, y: rect.top });
    }
  }, []);

  const handleNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    setHoverNode(null);
  }, []);

  const handleNodeContextMenu: NodeMouseHandler = useCallback((e, node) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: (e as unknown as MouseEvent).clientX,
      y: (e as unknown as MouseEvent).clientY,
      nodeId: node.id,
      nodeData: node.data,
    });
  }, []);

  const miniMapNodeColor = useCallback((node: Node<GraphNodeData>) => {
    const colors: Record<string, string> = {
      component: '#7C6CFF',
      hook: '#A68CFF',
      utility: '#16C784',
      service: '#06B6D4',
      class: '#F5A623',
      context: '#EC4899',
      store: '#D946EF',
    };
    if (node.data?.isCircular) return '#FF5D73';
    if (node.data?.isUnused) return '#52525B';
    return colors[node.data?.type || ''] || '#3F3F46';
  }, []);

  return (
    <div ref={canvasRef} className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onNodeContextMenu={handleNodeContextMenu}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        minZoom={0.05}
        maxZoom={4}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        onlyRenderVisibleElements={true}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1E1F35"
        />
        <MiniMap
          nodeColor={miniMapNodeColor}
          maskColor="rgba(11,11,18,0.7)"
          style={{
            background: '#12131F',
            border: '1px solid #1E1F35',
            borderRadius: 12,
            bottom: 80,
            right: 20,
          }}
          zoomable
          pannable
        />
        <GraphControls
          layoutMode={layoutMode}
          onChangeLayout={onChangeLayout}
          onExportJSON={onExportJSON}
          nodes={nodes}
          edges={edges}
        />
      </ReactFlow>

      {/* Hover Preview */}
      {hoverNode && (
        <NodePreview data={hoverNode.data} x={hoverNode.x} y={hoverNode.y} />
      )}

      {/* Context Menu */}
      <ContextMenu
        menu={contextMenu}
        onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
        onHighlightDeps={onHighlightDeps}
        onHideNode={onHideNode}
      />
    </div>
  );
}
