import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, LayoutDashboard, Network, ClipboardList, Key, Settings, Trash2, Moon, Sun, Keyboard } from 'lucide-react';
import { useAppDispatch } from '../../../store';
import { setActiveTab } from '../../../store/slices/uiSlice';
import { setSelectedJobId } from '../../../store/slices/workspaceSlice';
import { useTheme } from '../../../lib/ThemeContext';
import { defaultTransition } from '../../../animations/variants';
import { useGlobalShortcut } from '../../../shortcuts/hooks/useGlobalShortcut';
import ShortcutContext from '../../../shortcuts/shortcutContext';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const shortcutCtx = useContext(ShortcutContext);
  const setIsHelpOpen = shortcutCtx?.setIsHelpOpen || (() => {});

  useGlobalShortcut('toggle-command-palette', () => {
    setIsOpen((prev) => !prev);
  });

  useGlobalShortcut('cancel-action', () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  useEffect(() => {
    if (isOpen && shortcutCtx) {
      shortcutCtx.pushContext('dialog');
    } else if (shortcutCtx) {
      shortcutCtx.popContext('dialog');
    }
    return () => {
      shortcutCtx?.popContext('dialog');
    };
  }, [isOpen, shortcutCtx]);

  const commands = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => dispatch(setActiveTab('dashboard')) },
    { id: 'graph', label: 'Go to Dependency Graph', icon: Network, action: () => dispatch(setActiveTab('graph')) },
    { id: 'jobs', label: 'Go to Recent Jobs', icon: ClipboardList, action: () => dispatch(setActiveTab('jobs')) },
    { id: 'targets', label: 'Configure Target Frameworks', icon: Settings, action: () => dispatch(setActiveTab('targets')) },
    { id: 'apiKeys', label: 'Configure API Keys', icon: Key, action: () => dispatch(setActiveTab('apiKeys')) },
    { id: 'theme-toggle', label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, icon: theme === 'dark' ? Sun : Moon, action: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
    { id: 'clear-job', label: 'Clear Selected Job', icon: Trash2, action: () => dispatch(setSelectedJobId(null)) },
    { id: 'shortcuts-help', label: 'Show Keyboard Shortcuts Reference', icon: Keyboard, action: () => setIsHelpOpen(true) },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  const runCommand = (action: () => void) => {
    action();
    setIsOpen(false);
    setSearch('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#000000]/70 backdrop-blur-md"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={defaultTransition}
            className="bg-[#0B0B12] border border-border w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden flex flex-col font-sans select-none"
          >
            {/* Search Input block */}
            <div className="relative flex items-center border-b border-border p-4">
              <Search className="w-4 h-4 text-muted-foreground absolute left-4 pointer-events-none" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type a command to run..."
                className="w-full pl-9 pr-3 bg-transparent text-white placeholder-gray-500 outline-none text-xs font-mono font-medium"
              />
              <span className="text-[9px] bg-[#1E1F35] border border-border text-muted-foreground font-mono px-2 py-0.5 rounded-md shrink-0 select-none uppercase tracking-wider font-bold">
                ESC
              </span>
            </div>

            {/* Commands List */}
            <div className="max-h-[280px] overflow-y-auto p-2 scrollbar space-y-1">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((c) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      onClick={() => runCommand(c.action)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all text-left cursor-pointer group"
                    >
                      <Icon className="w-4 h-4 shrink-0 text-gray-500 group-hover:text-primary transition-colors" />
                      <span className="flex-1">{c.label}</span>
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-gray-500 font-mono">
                  No matching commands found.
                </div>
              )}
            </div>

            {/* Bottom info helper */}
            <div className="bg-[#07070C] border-t border-border px-4 py-2.5 flex justify-between items-center text-[9px] text-gray-500 font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" /> Command Palette
              </span>
              <span>Ctrl + K to toggle</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
