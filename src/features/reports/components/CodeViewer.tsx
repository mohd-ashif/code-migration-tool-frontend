import React, { useState } from 'react';
import { Copy, Check, Maximize2, Minimize2 } from 'lucide-react';

interface CodeViewerProps {
  fileName: string;
  code: string;
}

const CodeViewer = React.memo(function CodeViewer({ fileName, code }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy code:', e);
    }
  };

  const lines = code.split('\n');

  return (
    <div
      className={`border border-[#1E1F35] bg-[#0E0F1A] rounded-2xl overflow-hidden transition-all duration-300 w-full ${
        fullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-[#0B0B12] flex flex-col' : 'relative shadow-lg flex flex-col h-[380px]'
      }`}
    >
      {/* Editor top tabs */}
      <div className="bg-[#12131F] border-b border-[#1E1F35] px-4 py-2.5 flex justify-between items-center select-none shrink-0">
        <div className="flex items-center gap-2">
          {/* Mock editor tabs */}
          <div className="px-3.5 py-1.5 bg-[#0E0F1A] border-t-2 border-primary rounded-t-lg text-xs font-mono text-white flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {fileName.split('/').pop()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 bg-[#1E1F35] hover:bg-[#2B2C4E] border border-[#2B2C4E]/40 text-gray-400 hover:text-white rounded-lg transition-all"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          
          {/* Fullscreen Button */}
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-1.5 bg-[#1E1F35] hover:bg-[#2B2C4E] border border-[#2B2C4E]/40 text-gray-400 hover:text-white rounded-lg transition-all"
            title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div
        className="overflow-auto font-mono text-xs p-4 flex leading-relaxed select-text scrollbar flex-1"
      >
        {/* Line numbers column */}
        <div className="text-gray-600 select-none text-right pr-4 border-r border-[#1E1F35] min-w-[2.5rem]">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code column */}
        <pre className="pl-4 text-gray-300 flex-1 whitespace-pre-wrap break-all overflow-x-auto selection:bg-primary/20">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
});

export default CodeViewer;
