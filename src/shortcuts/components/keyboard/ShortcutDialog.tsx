import React, { useContext, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, RotateCcw, Keyboard } from 'lucide-react';
import { ShortcutContext } from '../../shortcutContext';
import { ShortcutCategory } from './ShortcutCategory';
import { defaultTransition } from '../../../animations/variants';
import { ShortcutCategory as CategoryType } from '../../types/shortcut';

export function ShortcutDialog() {
  const context = useContext(ShortcutContext);
  if (!context) return null;

  const { shortcuts, isHelpOpen, setIsHelpOpen, resetShortcuts, pushContext, popContext } = context;

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | CategoryType>('All');

  useEffect(() => {
    if (isHelpOpen) {
      pushContext('dialog');
    } else {
      popContext('dialog');
    }
    return () => {
      popContext('dialog');
    };
  }, [isHelpOpen, pushContext, popContext]);

  const categories: CategoryType[] = [
    'General',
    'Navigation',
    'Files',
    'Editor',
    'Migration',
    'Dependency Graph',
    'Settings',
  ];

  const filteredShortcuts = useMemo(() => {
    return shortcuts.filter((s) => {
      const matchesSearch =
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase()) ||
        s.keys.toLowerCase().includes(search.toLowerCase());

      const matchesTab = activeTab === 'All' || s.category === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [shortcuts, search, activeTab]);

  const grouped = useMemo(() => {
    const map = new Map<CategoryType, typeof shortcuts>();
    for (const shortcut of filteredShortcuts) {
      const list = map.get(shortcut.category) || [];
      list.push(shortcut);
      map.set(shortcut.category, list);
    }
    return map;
  }, [filteredShortcuts]);

  if (!isHelpOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsHelpOpen(false)}
          className="fixed inset-0 bg-[#000000]/70 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={defaultTransition}
          className="bg-[#0B0B12] border border-[#1E1F35] w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl relative overflow-hidden flex flex-col font-sans select-none"
        >
          <div className="flex items-center justify-between border-b border-[#1E1F35] bg-[#12131F]/40 px-6 py-4 shrink-0">
            <span className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-primary" /> Keymap Reference & Shortcuts Settings
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={resetShortcuts}
                className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-gray-500 hover:text-white px-2.5 py-1 rounded bg-[#1E1F35] hover:bg-[#2B2C4E] border border-border cursor-pointer transition-colors"
                title="Reset all custom shortcuts to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore Defaults
              </button>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative flex items-center border-b border-[#1E1F35] px-6 py-3.5 shrink-0 bg-[#090A11]">
            <Search className="w-4 h-4 text-gray-400 absolute left-6 pointer-events-none" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shortcuts by command description, key combos..."
              className="w-full pl-9 pr-4 py-2 bg-transparent text-white placeholder-gray-500 outline-none text-xs font-mono font-medium border-none"
            />
          </div>

          <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-[#1E1F35] bg-[#12131F]/20 shrink-0 overflow-x-auto scrollbar select-none">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                activeTab === 'All'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              ALL
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                  activeTab === cat
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar bg-[#090A11]">
            {grouped.size > 0 ? (
              Array.from(grouped.keys()).map((catName) => (
                <ShortcutCategory
                  key={catName}
                  category={catName}
                  shortcuts={grouped.get(catName) || []}
                />
              ))
            ) : (
              <div className="py-16 text-center text-xs text-gray-500 font-mono">
                No matching shortcut commands found. Try another search.
              </div>
            )}
          </div>

          <div className="bg-[#07070C] border-t border-[#1E1F35] px-6 py-3 flex justify-between items-center text-[10px] text-gray-500 font-mono shrink-0">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" /> Tip: Click the Edit icon on any shortcut to re-bind its hotkeys!
            </span>
            <span>ESC to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
export default ShortcutDialog;
