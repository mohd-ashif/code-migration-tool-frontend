import { Info, AlertTriangle, CheckCircle2, FileText, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import Button from '../../../shared/components/Button';
import { useAppDispatch, useAppSelector } from '../../../store';
import { clearNodeDetails } from '../../../store/slices/graphSlice';
import { NODE_STYLES } from '../utils/nodeStyles';
import { detectNodeType } from '../utils/nodeStyles';

const STATUS_CONFIG = {
  converted: { color: '#16C784', icon: '✅', label: 'Converted' },
  pending: { color: '#F5A623', icon: '⏳', label: 'Pending' },
  failed: { color: '#FF5D73', icon: '❌', label: 'Failed' },
};

export default function InspectorPanel() {
  const dispatch = useAppDispatch();
  const selectedNode = useAppSelector(state => state.graph.selectedNode);

  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 text-gray-500">
        <div className="p-3 bg-[#1E1F35] border border-[#2B2C4E]/40 text-gray-400 rounded-xl mb-3">
          <Info className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-white">Select a Node</p>
        <p className="text-[10px] text-gray-500 mt-1 max-w-[170px] leading-relaxed">
          Click any graph node to inspect its metadata and relationships.
        </p>
      </div>
    );
  }

  const nodeType = detectNodeType(selectedNode.type || 'unknown');
  const style = NODE_STYLES[nodeType];
  const statusCfg = STATUS_CONFIG[selectedNode.migrationStatus as keyof typeof STATUS_CONFIG];

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Type badge + title */}
      <div>
        <span
          className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest font-mono border"
          style={{ color: style.color, borderColor: `${style.border}40`, background: `${style.border}15` }}
        >
          {selectedNode.type || 'unknown'}
        </span>
        <h4 className="text-sm font-bold text-white mt-2 font-mono truncate" title={selectedNode.label}>
          {selectedNode.label}
        </h4>
        <p className="text-[9px] text-gray-500 font-mono mt-0.5 truncate" title={selectedNode.file}>
          {selectedNode.file?.split('/').slice(-2).join('/') || '—'}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { icon: FileText, label: 'Lines', value: selectedNode.lineCount ?? '—' },
          { icon: ArrowDownToLine, label: 'Imports', value: (selectedNode as any).importCount ?? selectedNode.imports?.length ?? '—' },
          { icon: ArrowUpFromLine, label: 'Used By', value: selectedNode.usedBy ?? '—' },
          { icon: AlertTriangle, label: 'Warnings', value: selectedNode.warnings ?? 0 },
        ].map(item => (
          <div key={item.label} className="bg-[#1E1F35]/50 rounded-xl px-2.5 py-2 flex items-center gap-2">
            <item.icon className="w-3 h-3 text-gray-500 shrink-0" />
            <div>
              <div className="text-[8px] text-gray-500 font-mono">{item.label}</div>
              <div className="text-[11px] font-bold font-mono text-white">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      {statusCfg && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-mono font-bold"
          style={{ background: `${statusCfg.color}12`, borderColor: `${statusCfg.color}30`, color: statusCfg.color }}
        >
          {statusCfg.icon} Migration: {statusCfg.label}
        </div>
      )}

      {/* Alerts */}
      {selectedNode.isCircular && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-xs text-error flex items-start gap-2 leading-relaxed">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Circular Cycle Detected</strong>
            This symbol participates in a circular dependency loop.
          </div>
        </div>
      )}

      {selectedNode.isUnused ? (
        <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl text-xs text-warning flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Dead Code</strong>
            No incoming workspace references found.
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-success/5 border border-success/15 rounded-xl text-xs text-success flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Actively referenced.</span>
        </div>
      )}

      {/* Imports list */}
      {selectedNode.imports && selectedNode.imports.length > 0 && (
        <div>
          <div className="text-[8px] font-bold uppercase tracking-widest text-gray-500 font-mono mb-1.5">
            Imports ({selectedNode.imports.length})
          </div>
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {selectedNode.imports.slice(0, 8).map((imp: string) => (
              <div key={imp} className="text-[9px] font-mono text-gray-400 px-2 py-1 rounded bg-[#1E1F35]/40 truncate" title={imp}>
                {imp}
              </div>
            ))}
          </div>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={() => dispatch(clearNodeDetails())} className="w-full mt-1">
        Clear Selection
      </Button>
    </div>
  );
}
