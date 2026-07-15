import { useContext } from 'react';
import { Keyboard } from 'lucide-react';
import ShortcutContext from '../../shortcuts/shortcutContext';

export default function Topbar() {
  const shortcutCtx = useContext(ShortcutContext);
  const setIsHelpOpen = shortcutCtx?.setIsHelpOpen || (() => {});

  return (
    <header className="h-16 border-b border-[#1E1F35] bg-darkBg/30 backdrop-blur-md sticky top-0 z-40 px-8 flex justify-end items-center select-none">
      <div className="flex items-center gap-4">
        {/* Keyboard Shortcuts Trigger Button */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="p-2 hover:bg-[#1E1F35] text-gray-400 hover:text-white rounded-xl border border-transparent hover:border-[#2B2C4E] transition-all cursor-pointer flex items-center gap-1.5 font-mono text-[10px]"
          title="Open Keyboard Shortcuts Helper (F1)"
        >
          <Keyboard className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline font-semibold">Shortcuts</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 bg-[#12131F] border border-border rounded text-[8px] font-bold">F1</kbd>
        </button>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C6CFF] to-[#A68CFF] text-white flex items-center justify-center text-xs font-bold shadow-glow border border-[#7C6CFF]/30 cursor-pointer hover:scale-105 transition-all">
          L
        </div>
      </div>
    </header>
  );
}
