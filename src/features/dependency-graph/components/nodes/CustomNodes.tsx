import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GraphNodeData } from '../../types/graph';
import { NODE_STYLES, CIRCULAR_STYLE, UNUSED_STYLE } from '../../utils/nodeStyles';

interface BaseNodeProps extends NodeProps<GraphNodeData> {
  icon: string;
  typeLabel: string;
  accentColor: string;
}

const opacityMap: Record<string, string> = {
  selected: '1',
  incoming: '0.9',
  outgoing: '0.9',
  faded: '0.2',
  none: '1',
};

export const BaseNode = memo(({ data, selected, icon, typeLabel, accentColor }: BaseNodeProps) => {
  const highlighted = data.highlighted || 'none';
  const opacity = opacityMap[highlighted] || '1';
  const style = data.isCircular ? CIRCULAR_STYLE : data.isUnused ? UNUSED_STYLE : null;
  const borderColor = style?.border || accentColor;
  const textColor = style?.color || accentColor;
  const isSelected = selected || highlighted === 'selected';

  return (
    <div
      style={{
        opacity,
        transition: 'opacity 0.25s ease, box-shadow 0.2s ease, transform 0.15s ease',
        transform: isSelected ? 'scale(1.04)' : 'scale(1)',
        boxShadow: isSelected
          ? `0 0 0 2px ${borderColor}, ${style?.glow || `0 0 24px ${borderColor}55`}`
          : style?.glow || 'none',
      }}
      className="min-w-[160px] max-w-[220px] rounded-[14px] overflow-hidden select-none"
    >
      <Handle type="target" position={Position.Left} style={{ background: borderColor, width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: borderColor, width: 8, height: 8 }} />

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: `${borderColor}18`, borderBottom: `1px solid ${borderColor}33` }}
      >
        <span className="text-base leading-none" style={{ color: textColor }}>{icon}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest font-mono" style={{ color: textColor }}>
          {data.isCircular ? 'CIRCULAR' : data.isUnused ? 'UNUSED' : typeLabel}
        </span>
        {data.warnings ? (
          <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-mono font-bold">
            ⚠ {data.warnings}
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="px-3 py-2.5" style={{ background: '#0B0B12' }}>
        <div
          className="text-[11px] font-bold leading-tight font-mono truncate"
          style={{ color: '#E4E4F0' }}
          title={data.label}
        >
          {data.label}
        </div>
        {data.file && (
          <div
            className="text-[9px] mt-1 truncate font-mono"
            style={{ color: '#52525B' }}
            title={data.file}
          >
            {data.file.split('/').slice(-2).join('/')}
          </div>
        )}

        {/* Stats row */}
        <div className="flex gap-2 mt-2">
          {data.imports !== undefined && (
            <span className="text-[8px] font-mono text-gray-500">
              <span style={{ color: textColor }}>↓{data.imports.length ?? 0}</span> imports
            </span>
          )}
          {data.usedBy !== undefined && (
            <span className="text-[8px] font-mono text-gray-500">
              <span style={{ color: textColor }}>↑{data.usedBy}</span> used
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

BaseNode.displayName = 'BaseNode';

// ── Concrete Node Types ──────────────────────────────────────────────────────

export const ComponentNode = memo((props: NodeProps<GraphNodeData>) => (
  <BaseNode {...props} icon="⚛" typeLabel="COMPONENT" accentColor={NODE_STYLES.component.border} />
));
ComponentNode.displayName = 'ComponentNode';

export const HookNode = memo((props: NodeProps<GraphNodeData>) => (
  <BaseNode {...props} icon="🪝" typeLabel="HOOK" accentColor={NODE_STYLES.hook.border} />
));
HookNode.displayName = 'HookNode';

export const UtilityNode = memo((props: NodeProps<GraphNodeData>) => (
  <BaseNode {...props} icon="🔧" typeLabel="UTILITY" accentColor={NODE_STYLES.utility.border} />
));
UtilityNode.displayName = 'UtilityNode';

export const ServiceNode = memo((props: NodeProps<GraphNodeData>) => (
  <BaseNode {...props} icon="⚡" typeLabel="SERVICE" accentColor={NODE_STYLES.service.border} />
));
ServiceNode.displayName = 'ServiceNode';

export const DefaultGraphNode = memo((props: NodeProps<GraphNodeData>) => (
  <BaseNode {...props} icon="?" typeLabel="MODULE" accentColor={NODE_STYLES.unknown.border} />
));
DefaultGraphNode.displayName = 'DefaultGraphNode';
