import { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { GraphEdgeData } from '../../types/graph';

// ── Animated Import Edge ──────────────────────────────────────────────────────
export const AnimatedImportEdge = memo(({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps<GraphEdgeData>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeDasharray: '5 4',
          animation: 'flowAnimation 1.5s linear infinite',
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 8,
              pointerEvents: 'all',
              fontFamily: 'monospace',
              background: '#0B0B12',
              border: '1px solid #1E1F35',
              borderRadius: 4,
              padding: '1px 5px',
              color: '#7C6CFF',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
AnimatedImportEdge.displayName = 'AnimatedImportEdge';

// ── Circular Dependency Edge ──────────────────────────────────────────────────
export const CircularDepEdge = memo(({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  markerEnd,
}: EdgeProps<GraphEdgeData>) => {
  const [edgePath] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <>
      {/* Glow background */}
      <path
        d={edgePath}
        fill="none"
        stroke="#FF5D73"
        strokeWidth={6}
        strokeOpacity={0.2}
        filter="blur(3px)"
      />
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: '#FF5D73',
          strokeWidth: 2,
          animation: 'circularpulse 1.2s ease-in-out infinite',
        }}
      />
    </>
  );
});
CircularDepEdge.displayName = 'CircularDepEdge';

// Inject keyframes once
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes flowAnimation {
    to { stroke-dashoffset: -18; }
  }
  @keyframes circularpulse {
    0%, 100% { stroke-opacity: 1; }
    50% { stroke-opacity: 0.4; }
  }
`;
if (!document.head.querySelector('[data-graph-edges]')) {
  styleSheet.setAttribute('data-graph-edges', '');
  document.head.appendChild(styleSheet);
}
