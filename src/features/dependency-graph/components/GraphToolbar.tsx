import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setSearch, setFilter, setPage } from '../../../store/slices/graphSlice';

export default function GraphToolbar() {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.graph.search);
  const filter = useAppSelector((state) => state.graph.filter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setPage(1));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6 select-none">
      <div className="flex-1 relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            dispatch(setSearch(e.target.value));
            dispatch(setPage(1));
          }}
          placeholder="Search symbol by name..."
          className="w-full pl-10 pr-4 py-2.5 bg-darkCard border border-[#1E1F35] text-white placeholder-gray-500 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs transition-all"
        />
      </div>

      <div className="flex gap-2">
        <div className="relative flex items-center">
          <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
          <select
            value={filter}
            onChange={(e) => {
              dispatch(setFilter(e.target.value));
              dispatch(setPage(1));
            }}
            className="pl-9 pr-8 py-2.5 bg-darkCard border border-[#1E1F35] text-white rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs cursor-pointer font-medium appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 10px center',
              backgroundSize: '12px',
              backgroundRepeat: 'no-repeat',
            }}
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
          className="px-5 py-2.5 bg-primary hover:bg-[#8D7EFF] text-white rounded-xl text-xs font-semibold shadow-glow active:scale-[0.98] transition-all"
        >
          Search
        </button>
      </div>
    </form>
  );
}
