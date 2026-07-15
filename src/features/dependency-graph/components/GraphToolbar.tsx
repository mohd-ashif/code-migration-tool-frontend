import { useRef, ChangeEvent } from 'react';
import { Search, X, SlidersHorizontal, BarChart2, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector, RootState } from '../../../store';
import { setSearch } from '../../../store/slices/graphSlice';

interface GraphToolbarProps {
  onToggleFilters: () => void;
  onToggleStats: () => void;
  onRefetch: () => void;
  isLoading: boolean;
  totalNodes: number;
  totalEdges: number;
}

export default function GraphToolbar({
  onToggleFilters, onToggleStats, onRefetch, isLoading, totalNodes, totalEdges,
}: GraphToolbarProps) {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state: RootState) => state.graph.search);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearch(e.target.value));
  };

  const clearSearch = () => {
    dispatch(setSearch(''));
    inputRef.current?.focus();
  };

  return (
    <div className="flex items-center gap-3 select-none" style={{ marginBottom: '12px' }}>
      {/* Search — fixed width so it never grows to push buttons off screen */}
      <div className="relative" style={{ width: '260px', flexShrink: 0 }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search nodes, files..."
          className="w-full pl-9 pr-8 py-2 bg-[#12131F] border border-[#1E1F35] rounded-xl text-[11px] font-mono text-white placeholder-gray-600 outline-none focus:border-primary/50 transition-colors"
        />
        {search && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Stats badge */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 whitespace-nowrap">
        <span className="text-primary font-bold">{totalNodes}</span>
        <span>nodes</span>
        <span className="text-gray-700">·</span>
        <span className="text-[#A68CFF] font-bold">{totalEdges}</span>
        <span>edges</span>
      </div>

      {/* Action buttons — pushed to right */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onToggleFilters}
          title="Toggle Filters"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1E1F35] bg-[#12131F] text-[10px] font-mono font-bold text-gray-400 hover:text-white hover:bg-[#1E1F35] transition-all cursor-pointer whitespace-nowrap"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
        </button>
        <button
          onClick={onToggleStats}
          title="Toggle Analytics"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1E1F35] bg-[#12131F] text-[10px] font-mono font-bold text-gray-400 hover:text-white hover:bg-[#1E1F35] transition-all cursor-pointer whitespace-nowrap"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Stats
        </button>
        <button
          onClick={onRefetch}
          disabled={isLoading}
          title="Refresh (F5)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1E1F35] bg-[#12131F] text-[10px] font-mono font-bold text-gray-400 hover:text-white hover:bg-[#1E1F35] transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}
