import { Sparkles, CheckSquare } from 'lucide-react';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';

interface AIReviewPanelProps {
  confidenceScore: number;
  healedCount: number;
  warningsCount: number;
  manualCount: number;
  onClose: () => void;
}

export default function AIReviewPanel({
  confidenceScore = 94,
  healedCount = 0,
  warningsCount = 0,
  manualCount = 0,
  onClose
}: AIReviewPanelProps) {
  return (
    <div className="flex flex-col h-full bg-[#0E0F1A] border-l border-border font-sans select-none w-full">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border bg-[#12131F]/40 px-4 py-3 shrink-0">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" /> AI Summary
        </span>
        <button
          onClick={onClose}
          aria-label="Close AI Summary panel"
          className="text-gray-500 hover:text-white text-xs font-mono px-2 py-0.5 rounded hover:bg-white/5 cursor-pointer"
        >
          ✕ Close
        </button>
      </div>

      {/* Review details */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar space-y-6">
        {/* Confidence Ring card */}
        <div className="bg-[#12131F]/30 border border-border p-4 rounded-xl flex flex-col items-center justify-center text-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Background circle track */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#1E1F35"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Progress track */}
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="var(--primary)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="213"
                strokeDashoffset={213 - (213 * confidenceScore) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center font-mono">
              <span className="text-lg font-black text-white">
                <AnimatedCounter value={confidenceScore} />
              </span>
              <span className="text-[7.5px] uppercase font-bold text-gray-500">score</span>
            </div>
          </div>
          <h4 className="text-xs font-bold text-white mt-3 font-mono">Migration Confidence</h4>
          <p className="text-[9.5px] text-gray-500 mt-1 max-w-[170px] leading-relaxed">
            AI code analyzer confidence metrics based on resolved AST schemas.
          </p>
        </div>

        {/* Breakdown counters */}
        <div className="space-y-2 font-mono text-[11px]">
          <div className="p-3 bg-success/5 border border-success/15 rounded-xl flex justify-between items-center">
            <span className="text-gray-400">Issues Self-Healed</span>
            <span className="text-success font-bold font-mono">
              <AnimatedCounter value={healedCount} />
            </span>
          </div>

          <div className="p-3 bg-warning/5 border border-warning/15 rounded-xl flex justify-between items-center">
            <span className="text-gray-400">Warnings Left</span>
            <span className="text-warning font-bold font-mono">
              <AnimatedCounter value={warningsCount} />
            </span>
          </div>

          <div className="p-3 bg-destructive/5 border border-destructive/15 rounded-xl flex justify-between items-center">
            <span className="text-gray-400">Needs Manual Check</span>
            <span className="text-destructive font-bold font-mono">
              <AnimatedCounter value={manualCount} />
            </span>
          </div>
        </div>

        {/* AI Checks Checkbox list */}
        <div className="space-y-3">
          <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">
            Automated Checks
          </span>
          <div className="space-y-2 text-[10.5px] text-gray-300 font-mono" role="list">
            <div className="flex items-center gap-2" role="listitem">
              <CheckSquare className="w-3.5 h-3.5 text-success shrink-0" aria-hidden="true" />
              <span className="sr-only">Passed check: </span>
              <span>Converted React Context API</span>
            </div>
            <div className="flex items-center gap-2" role="listitem">
              <CheckSquare className="w-3.5 h-3.5 text-success shrink-0" aria-hidden="true" />
              <span className="sr-only">Passed check: </span>
              <span>Resolved React Router bindings</span>
            </div>
            <div className="flex items-center gap-2" role="listitem">
              <CheckSquare className="w-3.5 h-3.5 text-success shrink-0" aria-hidden="true" />
              <span className="sr-only">Passed check: </span>
              <span>Cleaned unused import imports</span>
            </div>
            <div className="flex items-center gap-2" role="listitem">
              <CheckSquare className="w-3.5 h-3.5 text-success shrink-0" aria-hidden="true" />
              <span className="sr-only">Passed check: </span>
              <span>Inlined styled-component values</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer advice */}
      <div className="p-3 bg-[#07070C] border-t border-border text-[9px] font-mono text-gray-500 leading-relaxed text-center">
        💡 Double check red manual warnings before deploying build bundle exports.
      </div>
    </div>
  );
}
