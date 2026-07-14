import { useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import 'reactflow/dist/style.css';

import { useAppDispatch, useAppSelector } from '../../../store';
import { setSelectedNode, setPage } from '../../../store/slices/graphSlice';
import { useDependencyGraph } from '../hooks/useDependencyGraph';

import Card from '../../../shared/components/Card';
import MetricsCards from './MetricsCards';
import GraphToolbar from './GraphToolbar';
import InspectorPanel from './InspectorPanel';
import PageHeader from '../../../shared/components/PageHeader';

export default function DependencyGraph() {
  const dispatch = useAppDispatch();
  const jobId = useAppSelector((state) => state.workspace.selectedJobId);
  const { selectedNode, search, filter, page } = useAppSelector((state) => state.graph);

  const limit = 12;
  const { data, isLoading } = useDependencyGraph(jobId, page, limit, search, filter);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (data?.success) {
      // Map backend nodes into React Flow nodes
      const rfNodes = (data.nodes || []).map((n: any, idx: number) => {
        const cols = 3;
        const x = (idx % cols) * 230 + 40;
        const y = Math.floor(idx / cols) * 140 + 40;

        let bg = '#12131F'; 
        let border = '#1E1F35'; 
        let color = '#a1a1aa';

        if (n.type === 'component') {
          border = '#7C6CFF'; 
          color = '#ffffff';
        } else if (n.type === 'hook') {
          border = '#A68CFF'; 
          color = '#ffffff';
        } else if (n.type === 'function') {
          border = '#16C784'; 
          color = '#ffffff';
        } else if (n.type === 'class' || n.type === 'interface' || n.type === 'enum') {
          border = '#F5A623'; 
          color = '#ffffff';
        }

        if (n.isCircular) {
          border = '#FF5D73';
          color = '#FF5D73';
        }

        if (n.isUnused) {
          border = '#F5A623';
          color = '#F5A623';
        }

        return {
          id: n.id,
          type: 'default',
          position: { x, y },
          data: {
            label: (
              <div className="text-center font-mono text-[9px] select-none leading-tight py-1">
                <div className="font-bold flex items-center justify-center gap-1">
                  {n.isCircular && <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping shrink-0" />}
                  {n.label}
                </div>
                <div className="text-[7.5px] opacity-60 uppercase mt-0.5 font-bold tracking-wider">{n.type}</div>
                {n.isUnused && (
                  <span className="mt-1 inline-block px-1.5 py-0.5 bg-warning/10 text-warning border border-warning/20 rounded text-[6.5px] font-extrabold uppercase font-mono tracking-wide">
                    UNUSED
                  </span>
                )}
              </div>
            ),
            raw: n
          },
          style: {
            background: bg,
            color,
            border: `1.5px ${n.isUnused ? 'dashed' : 'solid'} ${border}`,
            borderRadius: '12px',
            padding: '8px',
            width: 160,
            fontSize: '11px',
            boxShadow: n.isCircular 
              ? '0 0 15px rgba(255, 93, 115, 0.25)' 
              : n.isUnused
                ? 'none'
                : '0 4px 12px rgba(0, 0, 0, 0.4)',
          }
        };
      });

      // Map backend edges to React Flow edges
      const rfEdges = (data.edges || []).map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.type === 'import',
        style: { stroke: e.type === 'import' ? '#7C6CFF' : '#1E1F35', strokeWidth: 1.5 },
      }));

      setNodes(rfNodes);
      setEdges(rfEdges);
    }
  }, [data, setNodes, setEdges]);

  const handleNodeClick = (_e: any, node: any) => {
    dispatch(setSelectedNode(node.data.raw));
  };

  const totalPages = data?.pagination?.totalPages || 1;
  const totalNodes = data?.pagination?.totalNodes || 0;
  const summary = data?.summary || {
    totalComponents: 0,
    totalHooks: 0,
    circularCount: 0,
    unusedCount: 0,
  };

  if (!jobId) return null;

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader 
          title="Dependency Architecture Graph" 
          subtitle={`job ${jobId.slice(0, 8)} • target: next • page ${page} of ${totalPages || 1}`} 
        />
        
        {/* Pagination buttons */}
        <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
          <span>
            {totalNodes} symbols
          </span>
          <div className="flex gap-1.5 ml-2">
            <button
              onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
              disabled={page <= 1 || isLoading}
              className="p-2 bg-darkCard border border-[#1E1F35] hover:bg-[#1E1F35] text-gray-400 hover:text-white rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => dispatch(setPage(Math.min(totalPages, page + 1)))}
              disabled={page >= totalPages || isLoading}
              className="p-2 bg-darkCard border border-[#1E1F35] hover:bg-[#1E1F35] text-gray-400 hover:text-white rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <MetricsCards summary={summary} />

      {/* Toolbar Search/Filter */}
      <GraphToolbar />

      {/* Graph Workspace container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* React Flow Viewport Card */}
        <div className="lg:col-span-8 border border-[#1E1F35] bg-darkCard rounded-2xl overflow-hidden min-h-[380px] h-[450px] relative shadow-lg">
          {isLoading && (
            <div className="absolute inset-0 bg-darkBg/80 backdrop-blur-xs flex items-center justify-center z-10 text-xs font-semibold text-gray-400 gap-2 font-mono">
              <RefreshCw className="w-4 h-4 text-primary animate-spin" />
              Recalculating graph...
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            fitView
            maxZoom={1.5}
            minZoom={0.5}
          >
            <Background color="#1E1F35" gap={18} size={1} />
            <Controls className="!bg-[#12131F] !border-[#1E1F35] !shadow-none !rounded-xl overflow-hidden [&>button]:!border-[#1E1F35]" />
            <MiniMap 
              nodeStrokeColor={(n: any) => n.style?.border?.split(' ').pop() || '#ccc'}
              nodeColor={(n: any) => n.style?.background || '#eee'}
              className="!border-[#1E1F35] !shadow-none !rounded-xl overflow-hidden"
              maskColor="rgba(11, 11, 18, 0.6)"
            />
          </ReactFlow>
        </div>

        {/* Selected Node Inspector Sidebar Card */}
        <Card className="lg:col-span-4 flex flex-col h-full min-h-[380px]">
          <InspectorPanel />
        </Card>
      </div>
    </div>
  );
}
