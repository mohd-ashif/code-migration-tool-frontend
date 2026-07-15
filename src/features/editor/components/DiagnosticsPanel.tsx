import { AlertTriangle, Info, ShieldAlert, Sparkles } from 'lucide-react';
import { BottomTab } from '../hooks/useEditorState';

interface DiagnosticsPanelProps {
  warnings: string[];
  errors: string[];
  suggestions: string[];
  healedNotes: string[];
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
  onClose: () => void;
}

export default function DiagnosticsPanel({
  warnings,
  errors,
  suggestions,
  healedNotes,
  activeTab,
  onTabChange,
  onClose
}: DiagnosticsPanelProps) {
  return (
    <div className="flex flex-col h-full bg-[#0E0F1A] border-t border-border font-sans select-none">
      {/* Console Tab selectors */}
      <div className="flex items-center justify-between border-b border-border bg-[#12131F]/40 px-3 py-1.5 text-[11px] font-mono select-none">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onTabChange('problems')}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'problems'
                ? 'bg-destructive/15 border-destructive/25 text-destructive font-bold'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Problems ({errors.length + warnings.length})
          </button>

          <button
            onClick={() => onTabChange('suggestions')}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'suggestions'
                ? 'bg-warning/15 border-warning/25 text-warning font-bold'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Suggestions ({suggestions.length})
          </button>

          <button
            onClick={() => onTabChange('notes')}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-primary/15 border-primary/25 text-primary font-bold'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Refactoring Notes ({healedNotes.length})
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white text-xs font-bold font-mono px-2 py-0.5 rounded hover:bg-white/5 cursor-pointer"
        >
          ✕ Close
        </button>
      </div>

      {/* Pane Content area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar text-[11px] font-mono leading-relaxed bg-[#090A11]">
        {activeTab === 'problems' && (
          <div className="space-y-2">
            {errors.map((err, i) => (
              <div key={`err-${i}`} className="flex items-start gap-2.5 text-destructive">
                <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="font-bold shrink-0">[ERROR]</span>
                <span>{err}</span>
              </div>
            ))}
            {warnings.map((warn, i) => (
              <div key={`warn-${i}`} className="flex items-start gap-2.5 text-warning">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="font-bold shrink-0">[WARNING]</span>
                <span>{warn}</span>
              </div>
            ))}
            {errors.length === 0 && warnings.length === 0 && (
              <div className="text-gray-500 py-4 text-center">No problems detected in compiled outputs.</div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-2 text-warning">
            {suggestions.map((s, i) => (
              <div key={`sug-${i}`} className="flex items-start gap-2.5">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#A68CFF]" />
                <span className="font-bold shrink-0 text-[#A68CFF]">[MANUAL]</span>
                <span>{s}</span>
              </div>
            ))}
            {suggestions.length === 0 && (
              <div className="text-gray-500 py-4 text-center">No manual review items suggested.</div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-2 text-primary-foreground">
            {healedNotes.map((n, i) => (
              <div key={`note-${i}`} className="flex items-start gap-2.5 text-gray-300">
                <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-success" />
                <span className="font-bold shrink-0 text-success">[HEALED]</span>
                <span>{n}</span>
              </div>
            ))}
            {healedNotes.length === 0 && (
              <div className="text-gray-500 py-4 text-center">No refactoring auto-fixes executed.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
