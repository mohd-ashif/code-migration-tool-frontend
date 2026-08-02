import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState, useReactFlow, Node } from 'reactflow';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setSelectedNode, clearNodeDetails } from '../../../store/slices/graphSlice';
import { useDependencyGraph } from '../hooks/useDependencyGraph';
import { useGraphFilters } from '../hooks/useGraphFilters';
import { useGraphLayout } from '../hooks/useGraphLayout';
import { useGraphExport } from '../hooks/useGraphExport';
import { buildNodes, buildEdges, applyFilters, applyHighlight } from '../utils/graphBuilder';
import { computeAnalytics } from '../utils/analytics';
import { GraphNodeData, GraphEdgeData, LayoutMode } from '../types/graph';

import MetricsCards from './MetricsCards';
import GraphToolbar from './GraphToolbar';
import GraphCanvas from './GraphCanvas';
import FiltersPanel from './FiltersPanel';
import StatisticsPanel from './StatisticsPanel';
import InspectorPanel from './InspectorPanel';
import EmptyState from '../../../components/ui/EmptyState';
import { Network, ShieldAlert, RotateCcw } from 'lucide-react';
import PageHeader from '../../../shared/components/PageHeader';
import { motion } from 'framer-motion';
import { fadeIn } from '../../../animations/variants';
import ShortcutContext from '../../../shortcuts/shortcutContext';
import { useContext } from 'react';
import { useGraphShortcut } from '../../../shortcuts/hooks/useGraphShortcut';
import { setActiveTab } from '../../../store/slices/uiSlice';
import { setSelectedJobId } from '../../../store/slices/workspaceSlice';
import { useRecentJobs } from '../../jobs/hooks/useRecentJobs';

// ── Inner component: needs ReactFlow provider to use hooks ──────────────────
function DependencyGraphInner() {
  const dispatch = useAppDispatch();
  const jobId = useAppSelector(state => state.workspace.selectedJobId);
  const { selectedNode, search, page } = useAppSelector(state => state.graph);

  const limit = 24;
  const { jobs: recentJobs } = useRecentJobs();
  const { data, isLoading, error, refetch } = useDependencyGraph(jobId, page, limit, search);

  // Auto-select latest completed job if none is currently selected
  useEffect(() => {
    if (!jobId && recentJobs && recentJobs.length > 0) {
      const latest = recentJobs.find((j: any) => j.status?.toLowerCase() === 'completed') || recentJobs[0];
      if (latest) {
        dispatch(setSelectedJobId(latest.id));
      }
    }
  }, [jobId, recentJobs, dispatch]);

  const [nodes, setNodes, onNodesChange] = useNodesState<GraphNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<GraphEdgeData>([]);
  const [hiddenNodeIds, setHiddenNodeIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const { filters, toggleFilter, resetFilters } = useGraphFilters();
  const { layoutMode, applyGraphLayout, changeLayout } = useGraphLayout();
  const { canvasRef, exportAsJSON } = useGraphExport();

  const { fitView, zoomIn, zoomOut, zoomTo } = useReactFlow();

  // Shortcut scope (registered but not used directly in render)
  useContext(ShortcutContext);

  // Keyboard shortcuts
  useGraphShortcut('graph-zoom-in', () => zoomIn());
  useGraphShortcut('graph-zoom-out', () => zoomOut());
  useGraphShortcut('graph-reset-zoom', () => zoomTo(1));
  useGraphShortcut('graph-fit', () => fitView({ duration: 300 }));
  useGraphShortcut('graph-clear-selection', () => dispatch(clearNodeDetails()));

  // Build graph when data arrives
  useEffect(() => {
    if (!data?.success) return;

    const rawNodes = data.nodes || [];
    const rawEdges = data.edges || [];

    const builtNodes = buildNodes(rawNodes);
    const builtEdges = buildEdges(rawEdges);

    setNodes(builtNodes);
    setEdges(builtEdges);

    // Apply auto-layout: delay so ReactFlow finishes mounting nodes first
    setTimeout(() => {
      applyGraphLayout(builtNodes, builtEdges, layoutMode);
    }, 350);
  }, [data]);

  // Apply filters + highlight
  const visibleNodes = useMemo(() => {
    const filtered = applyFilters(nodes, filters);
    const noHidden = filtered.filter(n => !hiddenNodeIds.has(n.id));
    const { nodes: highlighted } = applyHighlight(noHidden, edges, selectedNode?.id || null);
    return highlighted;
  }, [nodes, edges, filters, hiddenNodeIds, selectedNode]);

  const visibleEdges = useMemo(() => {
    const visibleIds = new Set(visibleNodes.map(n => n.id));
    const filtered = edges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target));
    const { edges: highlighted } = applyHighlight(visibleNodes, filtered, selectedNode?.id || null);
    return highlighted;
  }, [edges, visibleNodes, selectedNode]);

  // Analytics
  const analytics = useMemo(() => computeAnalytics(visibleNodes, visibleEdges), [visibleNodes, visibleEdges]);

  // Search: auto-focus node
  useEffect(() => {
    if (!search) return;
    const match = visibleNodes.find(n =>
      n.data.label?.toLowerCase().includes(search.toLowerCase()) ||
      n.data.file?.toLowerCase().includes(search.toLowerCase())
    );
    if (match) {
      setTimeout(() => {
        fitView({ nodes: [{ id: match.id }], duration: 500, padding: 0.3 });
      }, 100);
    }
  }, [search, visibleNodes]);

  const handleNodeClick = useCallback((_: any, node: Node<GraphNodeData>) => {
    dispatch(setSelectedNode(node.data));
  }, [dispatch]);

  const handleNodeDoubleClick = useCallback((_: any, node: Node<GraphNodeData>) => {
    fitView({ nodes: [{ id: node.id }], duration: 400, padding: 0.3 });
  }, [fitView]);

  const handleHighlightDeps = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) dispatch(setSelectedNode(node.data));
  }, [nodes, dispatch]);

  const handleHideNode = useCallback((nodeId: string) => {
    setHiddenNodeIds(prev => new Set([...prev, nodeId]));
    dispatch(clearNodeDetails());
  }, [dispatch]);

  const handleChangeLayout = useCallback((mode: LayoutMode) => {
    changeLayout(mode, nodes, edges);
  }, [changeLayout, nodes, edges]);

  const handleExportJSON = useCallback(() => {
    exportAsJSON(visibleNodes, visibleEdges);
  }, [exportAsJSON, visibleNodes, visibleEdges]);

  if (!jobId) {
    return (
      <EmptyState
        icon={<Network className="w-8 h-8 text-primary" />}
        title="No Migration Job Selected"
        description="Select a completed migration job to visualize its dependency graph."
      />
    );
  }

  const summaryForCards = {
    totalComponents: analytics.totalComponents,
    totalHooks: analytics.totalHooks,
    unusedCount: analytics.unusedCount,
    circularCount: analytics.circularCount,
    architectureScore: analytics.architectureScore,
  };

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="flex flex-col gap-4 h-full">
      <PageHeader
        title="Dependency Graph"
        subtitle="Interactive architecture visualization for your migration project"
      />

      {/* Metrics row */}
      {!isLoading && <MetricsCards summary={summaryForCards} />}

      {/* Toolbar */}
      <GraphToolbar
        onToggleFilters={() => setShowFilters(v => !v)}
        onToggleStats={() => setShowStats(v => !v)}
        onRefetch={refetch}
        isLoading={isLoading}
        totalNodes={analytics.totalNodes}
        totalEdges={analytics.totalEdges}
      />

      {/* Main graph body: flex-col on mobile, flex-row on lg */}
      <div className="flex flex-col lg:flex-row gap-4 min-h-[480px] lg:h-[calc(100vh-270px)]">

        {/* Filters Panel */}
        {showFilters && (
          <div className="shrink-0" style={{ width: '224px' }}>
            <FiltersPanel
              filters={filters}
              onToggle={toggleFilter}
              onReset={resetFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}

        {/* Canvas — takes remaining space */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-[#1E1F35] bg-[#090A11] relative" style={{ minWidth: 0 }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-xs font-mono text-gray-500">Building dependency graph...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-6 text-center">
              <div className="max-w-md bg-[#0D0E1A] border border-rose-500/20 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl w-fit mx-auto border border-rose-500/20">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white">
                    {((error as any)?.response?.status === 403 || (error as any)?.response?.data?.message?.includes('Access denied'))
                      ? 'Feature Plan Restriction'
                      : 'Unable to Load Dependency Graph'}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {(error as any)?.response?.data?.message || (error as any)?.message || 'An unexpected error occurred while fetching graph analysis.'}
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  {((error as any)?.response?.status === 403 || (error as any)?.response?.data?.message?.includes('Access denied')) ? (
                    <button
                      onClick={() => dispatch(setActiveTab('billing'))}
                      className="px-4 py-2 bg-primary hover:bg-[#8D7EFF] text-white text-xs font-bold rounded-xl transition-all shadow-glow"
                    >
                      Upgrade Subscription Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => refetch()}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retry Request
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : visibleNodes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <EmptyState
                icon={<Network className="w-8 h-8 text-primary" />}
                title="No Nodes to Display"
                description="Adjust your filters or select a different migration job."
              />
            </div>
          ) : (
            <GraphCanvas
              nodes={visibleNodes}
              edges={visibleEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              layoutMode={layoutMode}
              onChangeLayout={handleChangeLayout}
              onExportJSON={handleExportJSON}
              onHighlightDeps={handleHighlightDeps}
              onHideNode={handleHideNode}
              canvasRef={canvasRef}
            />
          )}
        </div>

        {/* Right column — inspector + optional stats */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3 overflow-y-auto">
          {showStats && (
            <StatisticsPanel summary={analytics} onClose={() => setShowStats(false)} />
          )}
          <div
            className="bg-[#0B0B12] border border-[#1E1F35] rounded-2xl p-4 overflow-y-auto flex-1"
          >
            <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 font-mono mb-3">
              Node Inspector
            </div>
            <InspectorPanel />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Public export wrapped in ReactFlowProvider ───────────────────────────────
export default function DependencyGraph() {
  return (
    <ReactFlowProvider>
      <DependencyGraphInner />
    </ReactFlowProvider>
  );
}
