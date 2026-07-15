import React, { useState } from 'react';
import { Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultTransition, fadeIn } from '../../../animations/variants';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface CodeViewerProps {
  fileName: string;
  code: string;
}

const CodeViewer = React.memo(function CodeViewer({ fileName, code }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const isReduced = useReducedMotion();

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
    <motion.div
      layout={isReduced ? "position" : true}
      transition={defaultTransition}
      className={`border border-border bg-[#0E0F1A] rounded-2xl overflow-hidden w-full flex flex-col ${
        fullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-[#0B0B12]' : 'relative shadow-lg h-[380px]'
      }`}
    >
      {/* Editor top tabs */}
      <div className="bg-[#12131F] border-b border-border px-4 py-2.5 flex justify-between items-center select-none shrink-0">
        <div className="flex items-center gap-2">
          {/* Mock editor tabs */}
          <motion.div 
            layoutId="codeViewerTab"
            className="px-3.5 py-1.5 bg-[#0E0F1A] border-t-2 border-primary rounded-t-lg text-xs font-mono text-white flex items-center gap-1.5 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {fileName.split('/').pop()}
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 bg-[#1E1F35] hover:bg-[#2B2C4E] border border-border text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          
          {/* Fullscreen Button */}
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-1.5 bg-[#1E1F35] hover:bg-[#2B2C4E] border border-border text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div
        className="overflow-auto font-mono text-xs p-4 flex leading-relaxed select-text scrollbar flex-1 bg-[#090A11]"
      >
        {/* Line numbers column */}
        <div className="text-gray-600 select-none text-right pr-4 border-r border-border min-w-[2.5rem]">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code column */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.pre
            key={fileName}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="pl-4 text-gray-300 flex-1 whitespace-pre-wrap break-all overflow-x-auto selection:bg-primary/20"
          >
            <code>{code}</code>
          </motion.pre>
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export default CodeViewer;
