import { Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Button from '../../../shared/components/Button';
import { useAppDispatch, useAppSelector } from '../../../store';
import { clearNodeDetails } from '../../../store/slices/graphSlice';

export default function InspectorPanel() {
  const dispatch = useAppDispatch();
  const selectedNode = useAppSelector((state) => state.graph.selectedNode);

  return (
    <div className="flex flex-col justify-between h-full min-h-[300px] select-none">
      {selectedNode ? (
        <div className="space-y-4">
          <div>
            <span className="px-2 py-0.5 bg-primary/20 border border-primary/30 rounded text-[9px] font-bold uppercase text-primary font-mono tracking-wider">
              {selectedNode.type}
            </span>
            <h4 className="text-sm font-bold text-white mt-2.5 font-mono truncate" title={selectedNode.label}>
              {selectedNode.label}
            </h4>
            <p className="text-[10px] text-gray-500 font-mono mt-1 truncate" title={selectedNode.file}>
              File: {selectedNode.file}
            </p>
          </div>

          <div className="space-y-2 border-t border-[#1E1F35] pt-4">
            {selectedNode.isCircular && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-xs text-error flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Circular Cycle Detected</strong>
                  Symbol belongs to a circular dependency loop. We suggest refactoring imports or splitting helper definitions.
                </div>
              </div>
            )}

            {selectedNode.isUnused ? (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl text-xs text-warning flex items-start gap-2 leading-relaxed">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Dead Component Code</strong>
                  Symbol is declared but has 0 incoming workspace dependencies. Consider removing this component.
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-success/5 border border-success/15 rounded-xl text-xs text-success flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
                <span>Symbol is actively referenced.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500 flex-1">
          <div className="p-3 bg-[#1E1F35] border border-[#2B2C4E]/40 text-gray-400 rounded-xl mb-3">
            <Info className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white">Select a Node</p>
          <p className="text-[10px] text-gray-500 mt-1 max-w-[170px] leading-relaxed">
            Click a symbol in the graph viewport to view its analysis metrics.
          </p>
        </div>
      )}

      {selectedNode && (
        <Button variant="outline" size="sm" onClick={() => dispatch(clearNodeDetails())} className="w-full mt-4">
          Clear Details
        </Button>
      )}
    </div>
  );
}
