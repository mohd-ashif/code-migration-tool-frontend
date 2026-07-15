import { useState } from 'react';
import { Copy, Check, Download, Maximize2, Minimize2, AlignLeft, Eye, Layout, Split } from 'lucide-react';
import { ViewMode, DiffMode } from '../hooks/useEditorState';

interface EditorToolbarProps {
  fileName: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  diffMode: DiffMode;
  onDiffModeChange: (mode: DiffMode) => void;
  wordWrap: boolean;
  onWordWrapToggle: () => void;
  minimap: boolean;
  onMinimapToggle: () => void;
  fullscreen: boolean;
  onFullscreenToggle: () => void;
  code: string;
  onDownload: () => void;
}

export default function EditorToolbar({
  fileName,
  viewMode,
  onViewModeChange,
  diffMode,
  onDiffModeChange,
  wordWrap,
  onWordWrapToggle,
  minimap,
  onMinimapToggle,
  fullscreen,
  onFullscreenToggle,
  code,
  onDownload
}: EditorToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-[#12131F] border-b border-border px-4 py-2 flex flex-col sm:flex-row justify-between items-center gap-3 select-none shrink-0 font-mono text-[11px]">
      {/* File name segment */}
      <div className="flex items-center gap-2 max-w-xs truncate">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-gray-300 font-bold truncate">{fileName.split('/').pop() || 'No File'}</span>
      </div>

      {/* Center workspace toggles */}
      <div className="flex items-center gap-1.5 bg-[#0B0B12] p-1 border border-border rounded-xl">
        <button
          onClick={() => onViewModeChange('original')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            viewMode === 'original'
              ? 'bg-primary/20 text-primary border border-primary/30 shadow-glow-sm'
              : 'text-gray-400 hover:text-white border border-transparent'
          }`}
        >
          Original
        </button>
        <button
          onClick={() => onViewModeChange('editor')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            viewMode === 'editor'
              ? 'bg-primary/20 text-primary border border-primary/30 shadow-glow-sm'
              : 'text-gray-400 hover:text-white border border-transparent'
          }`}
        >
          Migrated
        </button>
        <button
          onClick={() => onViewModeChange('diff')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            viewMode === 'diff'
              ? 'bg-primary/20 text-primary border border-primary/30 shadow-glow-sm'
              : 'text-gray-400 hover:text-white border border-transparent'
          }`}
        >
          Diff Viewer
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Toggle between Side-by-Side and Unified Diff */}
        {viewMode === 'diff' && (
          <div className="flex items-center gap-1 bg-[#0B0B12] p-0.5 border border-border rounded-lg mr-2">
            <button
              onClick={() => onDiffModeChange('side-by-side')}
              className={`p-1 rounded cursor-pointer ${
                diffMode === 'side-by-side' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-white'
              }`}
              title="Side-by-Side Diff"
            >
              <Split className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDiffModeChange('inline')}
              className={`p-1 rounded cursor-pointer ${
                diffMode === 'inline' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-white'
              }`}
              title="Unified / Inline Diff"
            >
              <Layout className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Wordwrap toggle */}
        <button
          onClick={onWordWrapToggle}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            wordWrap
              ? 'bg-primary/15 border-primary/30 text-primary shadow-glow-sm'
              : 'bg-[#1E1F35] border-border text-gray-400 hover:text-white hover:bg-[#2B2C4E]'
          }`}
          title="Toggle Word Wrap"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        {/* Minimap toggle */}
        <button
          onClick={onMinimapToggle}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            minimap
              ? 'bg-primary/15 border-primary/30 text-primary shadow-glow-sm'
              : 'bg-[#1E1F35] border-border text-gray-400 hover:text-white hover:bg-[#2B2C4E]'
          }`}
          title="Toggle Minimap"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="p-1.5 bg-[#1E1F35] hover:bg-[#2B2C4E] border border-border text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Copy Code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {/* Download Button */}
        <button
          onClick={onDownload}
          className="p-1.5 bg-[#1E1F35] hover:bg-[#2B2C4E] border border-border text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Download Code File"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={onFullscreenToggle}
          className="p-1.5 bg-[#1E1F35] hover:bg-[#2B2C4E] border border-border text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
