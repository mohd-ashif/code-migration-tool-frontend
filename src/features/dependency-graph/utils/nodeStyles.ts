import { NodeType } from '../types/graph';

export interface NodeStyle {
  background: string;
  border: string;
  color: string;
  glow?: string;
  icon: string;
}

export const NODE_STYLES: Record<NodeType, NodeStyle> = {
  component: {
    background: 'rgba(124, 108, 255, 0.08)',
    border: '#7C6CFF',
    color: '#A39BFF',
    glow: '0 0 16px rgba(124,108,255,0.3)',
    icon: '⚛',
  },
  hook: {
    background: 'rgba(166, 140, 255, 0.08)',
    border: '#A68CFF',
    color: '#C4ADFF',
    glow: '0 0 16px rgba(166,140,255,0.3)',
    icon: '🪝',
  },
  utility: {
    background: 'rgba(22, 199, 132, 0.08)',
    border: '#16C784',
    color: '#4DDFAB',
    glow: '0 0 16px rgba(22,199,132,0.2)',
    icon: '🔧',
  },
  service: {
    background: 'rgba(6, 182, 212, 0.08)',
    border: '#06B6D4',
    color: '#22D3EE',
    glow: '0 0 16px rgba(6,182,212,0.2)',
    icon: '⚡',
  },
  class: {
    background: 'rgba(245, 166, 35, 0.08)',
    border: '#F5A623',
    color: '#FBBF24',
    glow: undefined,
    icon: '🏛',
  },
  interface: {
    background: 'rgba(245, 166, 35, 0.06)',
    border: '#F5A623',
    color: '#FCD34D',
    glow: undefined,
    icon: '📐',
  },
  enum: {
    background: 'rgba(245, 166, 35, 0.05)',
    border: '#D97706',
    color: '#FDE68A',
    glow: undefined,
    icon: '📋',
  },
  context: {
    background: 'rgba(236, 72, 153, 0.08)',
    border: '#EC4899',
    color: '#F9A8D4',
    glow: '0 0 16px rgba(236,72,153,0.2)',
    icon: '🌐',
  },
  store: {
    background: 'rgba(217, 70, 239, 0.08)',
    border: '#D946EF',
    color: '#E879F9',
    glow: '0 0 16px rgba(217,70,239,0.2)',
    icon: '🗄',
  },
  function: {
    background: 'rgba(59, 130, 246, 0.08)',
    border: '#3B82F6',
    color: '#93C5FD',
    glow: undefined,
    icon: 'ƒ',
  },
  unknown: {
    background: 'rgba(113, 113, 122, 0.08)',
    border: '#3F3F46',
    color: '#71717A',
    glow: undefined,
    icon: '?',
  },
};

export const CIRCULAR_STYLE: NodeStyle = {
  background: 'rgba(255, 93, 115, 0.1)',
  border: '#FF5D73',
  color: '#FF5D73',
  glow: '0 0 20px rgba(255,93,115,0.4)',
  icon: '🔄',
};

export const UNUSED_STYLE: NodeStyle = {
  background: 'rgba(113, 113, 122, 0.05)',
  border: '#52525B',
  color: '#52525B',
  glow: undefined,
  icon: '⚠',
};

export function getNodeStyle(type: NodeType, isCircular: boolean, isUnused: boolean): NodeStyle {
  if (isCircular) return CIRCULAR_STYLE;
  if (isUnused) return UNUSED_STYLE;
  return NODE_STYLES[type] || NODE_STYLES.unknown;
}

export function detectNodeType(rawType: string): NodeType {
  const t = rawType?.toLowerCase() || '';
  if (t === 'component') return 'component';
  if (t === 'hook') return 'hook';
  if (t === 'utility' || t === 'util') return 'utility';
  if (t === 'service') return 'service';
  if (t === 'class') return 'class';
  if (t === 'interface') return 'interface';
  if (t === 'enum') return 'enum';
  if (t === 'context') return 'context';
  if (t === 'store') return 'store';
  if (t === 'function') return 'function';
  // Backend-specific symbol types
  if (t === 'import') return 'utility';   // treat import symbols as utility
  if (t === 'export') return 'function';  // treat export symbols as function
  return 'unknown';
}
