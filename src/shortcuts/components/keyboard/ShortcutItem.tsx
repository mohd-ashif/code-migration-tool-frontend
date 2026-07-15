import { useState, useEffect, useContext } from 'react';
import { Shortcut } from '../../types/shortcut';
import { formatShortcut } from '../../utils/shortcutFormatter';
import { ShortcutBadge } from './ShortcutBadge';
import { ShortcutContext } from '../../shortcutContext';
import { Edit3, ToggleLeft, ToggleRight } from 'lucide-react';
import { parseEvent } from '../../utils/keyParser';

interface ShortcutItemProps {
  shortcut: Shortcut;
}

export function ShortcutItem({ shortcut }: ShortcutItemProps) {
  const context = useContext(ShortcutContext);
  if (!context) return null;

  const { customPreferences, disabledPreferences, updateShortcut, disableShortcut } = context;

  const [isRecording, setIsRecording] = useState(false);
  const isDisabled = !!disabledPreferences[shortcut.id];
  const activeKeys = customPreferences[shortcut.id] || shortcut.keys;

  const handleRecord = () => {
    setIsRecording(true);
  };

  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        setIsRecording(false);
        return;
      }

      const parsed = parseEvent(e);
      if (parsed) {
        updateShortcut(shortcut.id, parsed);
        setIsRecording(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isRecording, shortcut.id, updateShortcut]);

  return (
    <div className="flex items-center justify-between p-3.5 bg-[#0F101A] border border-[#1E1F35] rounded-xl font-sans text-xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{shortcut.description}</span>
          {shortcut.context && (
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[8.5px] font-bold uppercase tracking-wider font-mono">
              {shortcut.context}
            </span>
          )}
          {isDisabled && (
            <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-[8.5px] font-bold uppercase tracking-wider font-mono">
              Disabled
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-500 block font-mono">
          ID: {shortcut.id} • Category: {shortcut.category}
        </span>
      </div>

      <div className="flex items-center gap-3 select-none">
        {isRecording ? (
          <span className="px-3 py-1 bg-[#7C6CFF]/20 border border-[#7C6CFF] text-[#7C6CFF] rounded font-bold font-mono animate-pulse text-[9.5px]">
            Press keys... (ESC to cancel)
          </span>
        ) : (
          <div className="flex gap-1">
            {activeKeys.split('+').map((k, idx) => (
              <ShortcutBadge key={idx} keys={formatShortcut(k)} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 border-l border-border pl-3">
          <button
            onClick={handleRecord}
            disabled={isDisabled || isRecording}
            className="p-1.5 hover:bg-white/5 disabled:opacity-30 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Edit Shortcut Keys"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => disableShortcut(shortcut.id, !isDisabled)}
            className={`p-1.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer ${
              isDisabled ? 'text-red-400' : 'text-gray-400 hover:text-white'
            }`}
            title={isDisabled ? "Enable Shortcut" : "Disable Shortcut"}
          >
            {isDisabled ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ShortcutItem;
