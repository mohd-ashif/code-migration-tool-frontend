import { FilterState } from '../types/graph';
import { X } from 'lucide-react';

interface FiltersPanelProps {
  filters: FilterState;
  onToggle: (key: keyof FilterState) => void;
  onReset: () => void;
  onClose: () => void;
}

const FILTER_ITEMS: { key: keyof FilterState; label: string; color: string; icon: string }[] = [
  { key: 'showComponents', label: 'Components', color: '#7C6CFF', icon: '⚛' },
  { key: 'showHooks', label: 'Hooks', color: '#A68CFF', icon: '🪝' },
  { key: 'showUtilities', label: 'Utilities', color: '#16C784', icon: '🔧' },
  { key: 'showServices', label: 'Services', color: '#06B6D4', icon: '⚡' },
  { key: 'showClasses', label: 'Classes / Interfaces', color: '#F5A623', icon: '🏛' },
  { key: 'showContexts', label: 'Contexts', color: '#EC4899', icon: '🌐' },
  { key: 'showStores', label: 'Stores', color: '#D946EF', icon: '🗄' },
  { key: 'showUnused', label: 'Dead Code', color: '#52525B', icon: '⚠' },
  { key: 'showCircular', label: 'Circular Deps', color: '#FF5D73', icon: '🔄' },
];

export default function FiltersPanel({ filters, onToggle, onReset, onClose }: FiltersPanelProps) {
  return (
    <div className="w-56 bg-[#0B0B12] border border-[#1E1F35] rounded-2xl shadow-2xl overflow-hidden flex flex-col select-none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E1F35] bg-[#12131F]/60">
        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 font-mono">Filters</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="text-[8px] font-mono font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer"
          >
            Reset
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-1">
        {FILTER_ITEMS.map(item => {
          const enabled = filters[item.key];
          return (
            <button
              key={item.key}
              onClick={() => onToggle(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                enabled ? 'bg-[#1E1F35]/80' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <span className="text-sm leading-none">{item.icon}</span>
              <span className="text-[10px] font-mono font-semibold text-gray-300 flex-1">{item.label}</span>
              <div
                className={`w-3 h-3 rounded-full border-2 transition-all ${
                  enabled ? 'border-transparent' : 'border-current'
                }`}
                style={{ background: enabled ? item.color : 'transparent', borderColor: item.color }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
