import { useState, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import {
  ZoomIn, ZoomOut, Maximize2, RefreshCw, Download, AlignHorizontalJustifyCenter,
} from 'lucide-react';
import { LayoutMode } from '../types/graph';
import { useGraphExport } from '../hooks/useGraphExport';
import { Node, Edge } from 'reactflow';

const LAYOUTS: { mode: LayoutMode; label: string }[] = [
  { mode: 'LR', label: 'Left → Right' },
  { mode: 'TB', label: 'Top → Bottom' },
  { mode: 'RL', label: 'Right → Left' },
  { mode: 'BT', label: 'Bottom → Top' },
  { mode: 'radial', label: 'Radial' },
];

interface GraphControlsProps {
  layoutMode: LayoutMode;
  onChangeLayout: (mode: LayoutMode) => void;
  onExportJSON: () => void;
  nodes: Node[];
  edges: Edge[];
}

export default function GraphControls({ layoutMode, onChangeLayout, onExportJSON }: GraphControlsProps) {
  const { zoomIn, zoomOut, fitView, zoomTo } = useReactFlow();
  const { exportAsPNG, exportAsSVG } = useGraphExport();
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleFit = useCallback(() => fitView({ duration: 400, padding: 0.12 }), [fitView]);
  const handleReset = useCallback(() => { zoomTo(1); fitView({ duration: 400 }); }, [zoomTo, fitView]);

  return (
    <div className="absolute bottom-4 left-1/2 z-30 flex items-center gap-2 select-none" style={{ transform: 'translateX(-50%)' }}>
      {/* Zoom controls */}
      <div className="flex items-center gap-1 bg-[#12131F] border border-[#1E1F35] rounded-xl px-2 py-1.5 shadow-2xl">
        <button
          onClick={() => zoomIn({ duration: 200 })}
          className="p-1.5 rounded-lg hover:bg-[#1E1F35] text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => zoomOut({ duration: 200 })}
          className="p-1.5 rounded-lg hover:bg-[#1E1F35] text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-[#1E1F35]" />
        <button
          onClick={handleFit}
          className="p-1.5 rounded-lg hover:bg-[#1E1F35] text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Fit View (F)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg hover:bg-[#1E1F35] text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Reset Zoom (0)"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Layout selector */}
      <div className="relative">
        <button
          onClick={() => { setShowLayoutMenu(v => !v); setShowExportMenu(false); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#12131F] border border-[#1E1F35] rounded-xl text-[10px] font-mono font-bold text-gray-300 hover:text-white hover:bg-[#1E1F35] transition-colors shadow-2xl cursor-pointer"
          title="Change Layout"
        >
          <AlignHorizontalJustifyCenter className="w-4 h-4 text-primary" />
          {LAYOUTS.find(l => l.mode === layoutMode)?.label || layoutMode}
        </button>
        {showLayoutMenu && (
          <div className="absolute bottom-12 left-0 w-44 bg-[#12131F] border border-[#1E1F35] rounded-xl overflow-hidden shadow-2xl">
            {LAYOUTS.map(l => (
              <button
                key={l.mode}
                onClick={() => { onChangeLayout(l.mode); setShowLayoutMenu(false); }}
                className={`w-full text-left px-4 py-2.5 text-[10px] font-mono font-bold hover:bg-[#1E1F35] transition-colors cursor-pointer ${layoutMode === l.mode ? 'text-primary bg-primary/10' : 'text-gray-400'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Export */}
      <div className="relative">
        <button
          onClick={() => { setShowExportMenu(v => !v); setShowLayoutMenu(false); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#12131F] border border-[#1E1F35] rounded-xl text-[10px] font-mono font-bold text-gray-300 hover:text-white hover:bg-[#1E1F35] transition-colors shadow-2xl cursor-pointer"
          title="Export Graph"
        >
          <Download className="w-4 h-4 text-primary" />
          Export
        </button>
        {showExportMenu && (
          <div className="absolute bottom-12 right-0 w-36 bg-[#12131F] border border-[#1E1F35] rounded-xl overflow-hidden shadow-2xl">
            {[
              { label: '📷 PNG Image', action: exportAsPNG },
              { label: '📐 SVG Vector', action: exportAsSVG },
              { label: '📦 JSON Data', action: onExportJSON },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => { item.action(); setShowExportMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-[10px] font-mono font-bold text-gray-400 hover:text-white hover:bg-[#1E1F35] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
