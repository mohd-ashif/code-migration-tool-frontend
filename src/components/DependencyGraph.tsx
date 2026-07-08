import { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
import { Search, Filter, ShieldAlert, ChevronLeft, ChevronRight, Info, AlertTriangle, RefreshCw } from 'lucide-react';
import 'reactflow/dist/style.css';

interface DependencyGraphProps {
  jobId: string | null;
}

export default function DependencyGraph({ jobId }: DependencyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNodes, setTotalNodes] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Summary counts
  const [summary, setSummary] = useState({
    totalComponents: 0,
    totalHooks: 0,
    circularCount: 0,
    unusedCount: 0,
  });

  useEffect(() => {
    if (jobId) {
      fetchGraph();
    }
  }, [jobId, page, filter]);

  const fetchGraph = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        jobId,
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(filter && { filter }),
      });

      const res = await fetch(`/api/graph?${query.toString()}`, {
        headers: { 'x-api-key': 'your-api-key-here' }
      });
      const data = await res.json();
      if (data.success) {
        // Map backend nodes into React Flow nodes
        const rfNodes = (data.nodes || []).map((n: any, idx: number) => {
          const cols = 3;
          const x = (idx % cols) * 230 + 40;
          const y = Math.floor(idx / cols) * 140 + 40;

          let bg = '#eff6ff'; // Blue-50
          let border = '#3b82f6'; // Blue-500
          let color = '#1e3a8a';

          if (n.type === 'hook') {
            bg = '#f5f3ff'; // Purple-50
            border = '#8b5cf6'; // Purple-500
            color = '#4c1d95';
          } else if (n.type === 'function') {
            bg = '#f0fdfa'; // Teal-50
            border = '#14b8a6'; // Teal-500
            color = '#115e59';
          } else if (n.type === 'class' || n.type === 'interface') {
            bg = '#fff7ed'; // Orange-50
            border = '#f97316'; // Orange-500
            color = '#7c2d12';
          }

          if (n.isCircular) {
            bg = '#fef2f2'; // Red-50
            border = '#ef4444';
            color = '#7f1d1d';
          }

          if (n.isUnused) {
            bg = '#f9fafb'; // Gray-50
            border = '#9ca3af';
            color = '#374151';
          }

          return {
            id: n.id,
            type: 'default',
            position: { x, y },
            data: {
              label: (
                <div className="text-center font-mono text-[9px] select-none leading-tight">
                  <div className="font-bold flex items-center justify-center gap-1">
                    {n.isCircular && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />}
                    {n.label}
                  </div>
                  <div className="text-[7.5px] opacity-60 uppercase mt-0.5">{n.type}</div>
                  {n.isUnused && (
                    <span className="mt-1 inline-block px-1 bg-gray-200 text-gray-700 rounded text-[7px] font-bold">
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
              borderRadius: '8px',
              padding: '8px',
              width: 160,
              fontSize: '11px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
            }
          };
        });

        // Map backend edges to React Flow edges
        const rfEdges = (data.edges || []).map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          animated: e.type === 'import',
          style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
        }));

        setNodes(rfNodes);
        setEdges(rfEdges);
        setTotalPages(data.pagination.totalPages);
        setTotalNodes(data.pagination.totalNodes);
        setSummary(data.summary);
      }
    } catch (e) {
      console.error("Failed to load dependency graph:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchGraph();
  };

  const handleNodeClick = (_e: any, node: any) => {
    setSelectedNode(node.data.raw);
  };

  if (!jobId) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">VISUALIZATION</span>
          <h3 className="text-lg font-bold text-gray-900 mt-1 flex items-center gap-1.5">
            🌐 Dependency Architecture Graph
          </h3>
        </div>
        
        {/* Pagination buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">
            Page {page} of {totalPages || 1} ({totalNodes} symbols)
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1 border border-gray-200 hover:bg-gray-50 rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1 border border-gray-200 hover:bg-gray-50 rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-center">
        <div className="bg-white p-2 rounded-lg border border-gray-50 shadow-sm">
          <span className="block text-xs text-gray-400 uppercase font-medium">Components</span>
          <span className="text-md font-bold text-indigo-600">{summary.totalComponents}</span>
        </div>
        <div className="bg-white p-2 rounded-lg border border-gray-50 shadow-sm">
          <span className="block text-xs text-gray-400 uppercase font-medium">Hooks</span>
          <span className="text-md font-bold text-violet-600">{summary.totalHooks}</span>
        </div>
        <div className="bg-white p-2 rounded-lg border border-gray-50 shadow-sm flex flex-col justify-center items-center">
          <span className="block text-xs text-gray-400 uppercase font-medium">Unused Code</span>
          <span className="text-md font-bold text-amber-600 flex items-center gap-1">
            {summary.unusedCount > 0 && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-bounce" />}
            {summary.unusedCount}
          </span>
        </div>
        <div className="bg-white p-2 rounded-lg border border-gray-50 shadow-sm flex flex-col justify-center items-center">
          <span className="block text-xs text-gray-400 uppercase font-medium">Circular Cycles</span>
          <span className="text-md font-bold text-rose-600 flex items-center gap-1">
            {summary.circularCount > 0 && <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" />}
            {summary.circularCount}
          </span>
        </div>
      </div>

      {/* Search and Filter Row */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol by name..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs appearance-none bg-white text-gray-600 font-medium"
            >
              <option value="">All Kinds</option>
              <option value="component">Components</option>
              <option value="hook">Hooks</option>
              <option value="class">Classes</option>
              <option value="interface">Interfaces</option>
              <option value="function">Functions</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Graph Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* React Flow Container */}
        <div className="lg:col-span-8 border border-gray-150 rounded-xl overflow-hidden min-h-[300px] h-[350px] relative bg-gray-50/20 shadow-inner">
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10 text-xs font-semibold text-gray-600 gap-1.5">
              <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
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
            <Background color="#f1f5f9" gap={16} size={1} />
            <Controls className="!bg-white !border-gray-200 !shadow-sm !rounded-lg" />
            <MiniMap 
              nodeStrokeColor={(n: any) => n.style?.border?.split(' ').pop() || '#ccc'}
              nodeColor={(n: any) => n.style?.background || '#eee'}
              className="!border-gray-200 !shadow-sm !rounded-lg"
            />
          </ReactFlow>
        </div>

        {/* Selected Node Sidebar Card */}
        <div className="lg:col-span-4 border border-gray-150 rounded-xl p-4 flex flex-col justify-between bg-white shadow-sm">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[9px] font-bold uppercase text-indigo-600 font-mono tracking-wider">
                  {selectedNode.type}
                </span>
                <h4 className="text-md font-bold text-gray-900 mt-1.5 font-mono truncate max-w-[200px]" title={selectedNode.label}>
                  {selectedNode.label}
                </h4>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-[200px]" title={selectedNode.file}>
                  File: {selectedNode.file}
                </p>
              </div>

              <div className="space-y-2 border-t border-gray-50 pt-3">
                {selectedNode.isCircular && (
                  <div className="p-2.5 bg-rose-50 border border-rose-100/50 rounded-lg text-[11px] text-rose-800 flex items-start gap-1.5 leading-relaxed">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block">Circular Reference</strong>
                      Symbol belongs to a dependency cycle loop. We recommend refactoring variables or splitting functions.
                    </div>
                  </div>
                )}

                {selectedNode.isUnused ? (
                  <div className="p-2.5 bg-amber-50 border border-amber-100/50 rounded-lg text-[11px] text-amber-800 flex items-start gap-1.5 leading-relaxed">
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block">Dead Component Code</strong>
                      Symbol is declared but has 0 incoming workspace dependencies. Consider removing this component.
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-emerald-50/50 border border-emerald-100/40 rounded-lg text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Symbol is actively referenced.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 text-gray-400 flex-1">
              <Info className="w-8 h-8 mb-2 text-gray-300" />
              <p className="font-semibold text-xs text-gray-700">Select a Node</p>
              <p className="text-[10px] text-gray-400 mt-0.5 max-w-[150px]">Click a symbol in the React Flow viewport to view its analysis metrics.</p>
            </div>
          )}

          {selectedNode && (
            <button
              onClick={() => setSelectedNode(null)}
              className="w-full mt-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Clear Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline helper for CheckCircle2 mapping to prevent layout issues
function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
