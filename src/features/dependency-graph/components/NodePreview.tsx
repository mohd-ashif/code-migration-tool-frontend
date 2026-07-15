import { useEffect, useRef } from 'react';
import { GraphNodeData } from '../types/graph';

interface NodePreviewProps {
  data: GraphNodeData;
  x: number;
  y: number;
}

const STATUS_COLORS: Record<string, string> = {
  converted: '#16C784',
  pending: '#F5A623',
  failed: '#FF5D73',
};

export default function NodePreview({ data, x, y }: NodePreviewProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Reposition if going off-screen
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (rect.right > vw) el.style.left = `${x - rect.width - 12}px`;
    if (rect.bottom > vh) el.style.top = `${y - rect.height - 12}px`;
  }, [x, y]);

  return (
    <div
      ref={ref}
      className="fixed z-[9999] w-64 bg-[#0B0B12] border border-[#1E1F35] rounded-2xl shadow-2xl overflow-hidden pointer-events-none select-none"
      style={{ left: x + 12, top: y + 12 }}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-[#12131F] border-b border-[#1E1F35]">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">
            {data.isCircular ? '🔄' : data.isUnused ? '⚠' : '⚛'}
          </span>
          <div>
            <div className="text-[11px] font-bold text-white font-mono truncate" title={data.label}>
              {data.label}
            </div>
            <div className="text-[9px] text-gray-500 font-mono mt-0.5">{data.type?.toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {[
          { label: 'File', value: data.file?.split('/').pop() || '—' },
          { label: 'Lines', value: data.lineCount ?? '—' },
          { label: 'Imports', value: data.imports?.length ?? '—' },
          { label: 'Used By', value: data.usedBy ?? '—' },
          { label: 'Warnings', value: data.warnings ?? 0 },
          { label: 'Status', value: data.migrationStatus || 'N/A' },
        ].map(item => (
          <div key={item.label} className="bg-[#1E1F35]/40 rounded-xl px-2.5 py-2">
            <div className="text-[8px] text-gray-500 font-mono uppercase tracking-wider">{item.label}</div>
            <div
              className="text-[11px] font-bold font-mono mt-0.5 truncate"
              style={{
                color: item.label === 'Status'
                  ? STATUS_COLORS[String(item.value)] || '#71717A'
                  : '#E4E4F0',
              }}
            >
              {String(item.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="px-3 pb-3 flex gap-2">
        {data.isCircular && (
          <span className="px-2 py-1 rounded-lg bg-[#FF5D73]/15 border border-[#FF5D73]/30 text-[8px] font-bold font-mono text-[#FF5D73]">
            🔄 CIRCULAR
          </span>
        )}
        {data.isUnused && (
          <span className="px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-[8px] font-bold font-mono text-yellow-400">
            ⚠ DEAD CODE
          </span>
        )}
      </div>
    </div>
  );
}
