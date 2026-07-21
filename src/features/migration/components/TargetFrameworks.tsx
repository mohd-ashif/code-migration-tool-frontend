import { useState, useMemo, useCallback } from 'react';
import { useWorkspace } from '../../../hooks/useWorkspace';
import { useFrameworks } from '../../../hooks/useFrameworks';
import { useCompilerHealth } from '../../../hooks/useCompilerHealth';
import { useMigrationMatrix } from '../../../hooks/useMigrationMatrix';
import PageHeader from '../../../shared/components/PageHeader';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import { AnimatePresence } from 'framer-motion';
import { Sliders, Search, Filter, XCircle } from 'lucide-react';

import { FrameworkCard } from './FrameworkCard';
import FrameworkDetailPanel from './FrameworkDetailPanel';

export default function TargetFrameworks() {
  const { workspace } = useWorkspace();
  const isAdmin = workspace?.role === 'owner';

  // Live Queries
  const { data: frameworks = [], isLoading: isFwLoading, error: fwError } = useFrameworks();
  const { data: health } = useCompilerHealth();
  const { data: matrix = [] } = useMigrationMatrix();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected framework for panel
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | null>(null);

  // Compute live widgets stats
  const stats = useMemo(() => {
    const totalFws = frameworks.length;
    const supportedRoutes = matrix.filter((m) => m.supported).length;
    const engineCount = health?.engines ?? 0;

    // sum active codemods from frameworks
    const activeCodemods = frameworks.reduce((acc, curr) => acc + (curr.codemodCount ?? 0), 0);

    // avg success rate
    const validRates = frameworks.filter((f) => f.avgSuccessRate != null && f.avgSuccessRate > 0);
    const avgSuccess = validRates.length
      ? validRates.reduce((acc, curr) => acc + (curr.avgSuccessRate ?? 0), 0) / validRates.length
      : 85.0;

    // compiler health label
    let healthLabel = 'Normal';
    if (health) {
      if (health.failed === 0 && health.warnings === 0) {
        healthLabel = '100% Healthy';
      } else if (health.failed === 0) {
        healthLabel = 'Degraded (LTS Warning)';
      } else {
        healthLabel = `Offline (${health.failed} down)`;
      }
    }

    return {
      totalFws,
      supportedRoutes,
      engineCount,
      activeCodemods,
      avgSuccess,
      healthLabel,
    };
  }, [frameworks, health, matrix]);

  // Filter frameworks list based on search/status
  const filteredFrameworks = useMemo(() => {
    return frameworks.filter((fw) => {
      const matchSearch = fw.displayName.toLowerCase().includes(search.toLowerCase()) ||
                          (fw.description && fw.description.toLowerCase().includes(search.toLowerCase())) ||
                          fw.category.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || fw.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [frameworks, search, statusFilter]);

  const handleCardClick = useCallback((id: string) => {
    setSelectedFrameworkId(id);
  }, []);

  const handlePanelClose = useCallback(() => {
    setSelectedFrameworkId(null);
  }, []);

  if (isFwLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <LoadingSpinner size="lg" className="text-primary" />
        <p className="text-xs text-gray-400 font-sans animate-pulse font-medium">Loading compiler engines...</p>
      </div>
    );
  }

  if (fwError) {
    return (
      <div className="p-8 border border-rose-500/20 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center gap-3 font-mono text-xs">
        <XCircle className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-bold">Failed to load compilers pipeline</p>
          <p className="text-[10px] text-rose-300 mt-1">{(fwError as any).message || 'Database server is unreachable.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      <PageHeader
        title="Compiler Engine Management"
        subtitle="Live control console for AST mapping compiler engines, optimization parameters, and codemods."
      />

      {/* Analytics widgets row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-4 bg-[#0F101D] border border-zinc-800/40 rounded-2xl flex flex-col justify-between">
          <p className="text-[9px] text-gray-500 uppercase font-mono font-bold tracking-wider">Active Compilers</p>
          <p className="text-lg font-bold font-mono mt-1 text-white">{stats.engineCount}</p>
        </div>
        <div className="p-4 bg-[#0F101D] border border-zinc-800/40 rounded-2xl flex flex-col justify-between">
          <p className="text-[9px] text-gray-500 uppercase font-mono font-bold tracking-wider">Targets Supported</p>
          <p className="text-lg font-bold font-mono mt-1 text-white">{stats.totalFws}</p>
        </div>
        <div className="p-4 bg-[#0F101D] border border-zinc-800/40 rounded-2xl flex flex-col justify-between col-span-2">
          <p className="text-[9px] text-gray-500 uppercase font-mono font-bold tracking-wider">Pipeline Health Status</p>
          <p className={`text-xs font-bold font-mono mt-1 ${health?.failed && health.failed > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
            {stats.healthLabel}
          </p>
        </div>
        <div className="p-4 bg-[#0F101D] border border-zinc-800/40 rounded-2xl flex flex-col justify-between">
          <p className="text-[9px] text-gray-500 uppercase font-mono font-bold tracking-wider">Total Codemods</p>
          <p className="text-lg font-bold font-mono mt-1 text-white">{stats.activeCodemods}</p>
        </div>
        <div className="p-4 bg-[#0F101D] border border-zinc-800/40 rounded-2xl flex flex-col justify-between">
          <p className="text-[9px] text-gray-500 uppercase font-mono font-bold tracking-wider">Avg Transformation</p>
          <p className="text-lg font-bold font-mono mt-1 text-success">{stats.avgSuccess.toFixed(1)}%</p>
        </div>
      </div>

      {/* Main Frameworks List Workspace Grid */}
      <div className="flex gap-6 h-[calc(100vh-270px)] relative overflow-hidden">
        
        {/* Left Side: Frameworks Grid and Filtering */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between gap-3 mb-4 select-none shrink-0">
            <div className="relative max-w-sm flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search compilers, frameworks, categories..."
                className="w-full bg-[#121324] border border-zinc-850 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:border-primary outline-none transition-all placeholder:text-zinc-500 font-mono"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Filter className="w-3.5 h-3.5" />
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#121324] border border-zinc-850 rounded-xl text-xs pl-9 pr-8 py-2.5 text-white outline-none focus:border-primary font-mono cursor-pointer appearance-none"
                >
                  <option value="all">All States</option>
                  <option value="active">Active Only</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="experimental">Experimental</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards Grid Box */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFrameworks.map((fw) => (
                <FrameworkCard
                  key={fw.id}
                  framework={fw}
                  onClick={handleCardClick}
                />
              ))}
            </div>
            {filteredFrameworks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center select-none text-zinc-500">
                <Sliders className="w-10 h-10 mb-2 text-zinc-600 animate-pulse" />
                <p className="text-xs font-semibold">No compilers found</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">Try altering search keywords or filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Slider Drawer Panel details container */}
        <AnimatePresence mode="wait">
          {selectedFrameworkId && (
            <div 
              onClick={handlePanelClose}
              className="absolute inset-0 z-30 flex justify-end bg-black/40 backdrop-blur-sm pointer-events-auto"
            >
              <FrameworkDetailPanel
                frameworkId={selectedFrameworkId}
                onClose={handlePanelClose}
                isAdmin={isAdmin}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
