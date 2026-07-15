// Enterprise Dependency Graph - Type Definitions

export type NodeType =
  | 'component'
  | 'hook'
  | 'utility'
  | 'service'
  | 'class'
  | 'interface'
  | 'enum'
  | 'context'
  | 'store'
  | 'function'
  | 'unknown';

export type LayoutMode = 'LR' | 'TB' | 'RL' | 'BT' | 'radial';

export type EdgeType = 'import' | 'export' | 'circular' | 'dynamic' | 'unused';

export interface GraphNodeData {
  id: string;
  label: string;
  type: NodeType;
  file: string;
  isCircular: boolean;
  isUnused: boolean;
  imports?: string[];
  exports?: string[];
  lineCount?: number;
  usedBy?: number;
  warnings?: number;
  migrationStatus?: 'pending' | 'converted' | 'failed';
  // highlight state
  highlighted?: 'selected' | 'incoming' | 'outgoing' | 'faded' | 'none';
}

export interface GraphEdgeData {
  type: EdgeType;
  label?: string;
}

export interface FilterState {
  showComponents: boolean;
  showHooks: boolean;
  showUtilities: boolean;
  showServices: boolean;
  showClasses: boolean;
  showContexts: boolean;
  showStores: boolean;
  showUnused: boolean;
  showCircular: boolean;
}

export interface GraphSummary {
  totalComponents: number;
  totalHooks: number;
  totalUtilities: number;
  totalServices: number;
  totalNodes: number;
  totalEdges: number;
  circularCount: number;
  unusedCount: number;
  avgConnections: number;
  maxDepth: number;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
  nodeData: GraphNodeData | null;
}

export const DEFAULT_FILTERS: FilterState = {
  showComponents: true,
  showHooks: true,
  showUtilities: true,
  showServices: true,
  showClasses: true,
  showContexts: true,
  showStores: true,
  showUnused: true,
  showCircular: true,
};
