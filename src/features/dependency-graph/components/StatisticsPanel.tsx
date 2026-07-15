import { GraphSummary } from '../types/graph';
import { X } from 'lucide-react';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';

interface StatisticsPanelProps {
  summary: GraphSummary;
  onClose: () => void;
}

const stats = (s: GraphSummary) => [
  { label: 'Total Nodes', value: s.totalNodes, color: '#7C6CFF' },
  { label: 'Total Edges', value: s.totalEdges, color: '#A68CFF' },
  { label: 'Components', value: s.totalComponents, color: '#7C6CFF' },
  { label: 'Hooks', value: s.totalHooks, color: '#A68CFF' },
  { label: 'Utilities', value: s.totalUtilities, color: '#16C784' },
  { label: 'Services', value: s.totalServices, color: '#06B6D4' },
  { label: 'Circular Deps', value: s.circularCount, color: '#FF5D73' },
  { label: 'Dead Code', value: s.unusedCount, color: '#F5A623' },
  { label: 'Avg Connections', value: s.avgConnections, color: '#16C784' },
  { label: 'Max Depth', value: s.maxDepth, color: '#EC4899' },
];

export default function StatisticsPanel({ summary, onClose }: StatisticsPanelProps) {
  return (
    <div className="w-52 bg-[#0B0B12] border border-[#1E1F35] rounded-2xl shadow-2xl overflow-hidden flex flex-col select-none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E1F35] bg-[#12131F]/60">
        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 font-mono">📊 Analytics</span>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 space-y-0.5">
        {stats(summary).map(stat => (
          <div
            key={stat.label}
            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#1E1F35]/60 transition-colors"
          >
            <span className="text-[9px] font-mono text-gray-500">{stat.label}</span>
            <span className="text-[13px] font-bold font-mono" style={{ color: stat.color }}>
              <AnimatedCounter value={Math.round(stat.value)} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
