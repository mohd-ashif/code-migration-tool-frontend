import { useEffect, useRef } from 'react';
import { ContextMenuState } from '../types/graph';
import { useReactFlow } from 'reactflow';
import { clearNodeDetails, setSelectedNode } from '../../../store/slices/graphSlice';
import { useAppDispatch } from '../../../store';

interface ContextMenuProps {
  menu: ContextMenuState;
  onClose: () => void;
  onHighlightDeps: (nodeId: string) => void;
  onHideNode: (nodeId: string) => void;
}

export default function ContextMenu({ menu, onClose, onHighlightDeps, onHideNode }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  if (!menu.visible || !menu.nodeId || !menu.nodeData) return null;

  const actions = [
    {
      icon: '🔍',
      label: 'Center Node',
      action: () => {
        fitView({ nodes: [{ id: menu.nodeId! }], duration: 400 });
        onClose();
      },
    },
    {
      icon: '🔗',
      label: 'Highlight Dependencies',
      action: () => {
        if (menu.nodeId) {
          dispatch(setSelectedNode(menu.nodeData));
          onHighlightDeps(menu.nodeId);
        }
        onClose();
      },
    },
    {
      icon: '📋',
      label: 'Copy File Path',
      action: () => {
        if (menu.nodeData?.file) navigator.clipboard.writeText(menu.nodeData.file);
        onClose();
      },
    },
    {
      icon: '👁',
      label: 'Select Node',
      action: () => {
        dispatch(setSelectedNode(menu.nodeData));
        onClose();
      },
    },
    { type: 'divider' as const },
    {
      icon: '🚫',
      label: 'Hide Node',
      danger: true,
      action: () => {
        if (menu.nodeId) onHideNode(menu.nodeId);
        onClose();
      },
    },
    {
      icon: '❌',
      label: 'Clear Selection',
      action: () => {
        dispatch(clearNodeDetails());
        onClose();
      },
    },
  ];

  return (
    <div
      ref={ref}
      className="fixed z-[99999] w-52 bg-[#0B0B12] border border-[#1E1F35] rounded-2xl shadow-2xl overflow-hidden select-none"
      style={{ left: menu.x, top: menu.y }}
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#1E1F35] bg-[#12131F]">
        <div className="text-[10px] font-bold text-white font-mono truncate">{menu.nodeData.label}</div>
        <div className="text-[8px] text-gray-500 font-mono uppercase">{menu.nodeData.type}</div>
      </div>

      {/* Actions */}
      <div className="p-1.5">
        {actions.map((item, idx) =>
          item.type === 'divider' ? (
            <div key={idx} className="h-px bg-[#1E1F35] my-1" />
          ) : (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                item.danger
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-[#1E1F35]'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}
