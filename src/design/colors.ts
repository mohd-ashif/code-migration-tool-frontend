/**
 * Centralized Design Token System - Colors
 */
export const colors = {
  // Brand Colors
  primary: {
    DEFAULT: '#7C6CFF',
    hover: '#6B59FF',
    active: '#5A46FF',
    light: '#A68CFF',
    dark: '#4B36D9',
    subtle: 'rgba(124, 108, 255, 0.12)',
    glow: 'rgba(124, 108, 255, 0.25)',
  },
  secondary: {
    DEFAULT: '#A68CFF',
    hover: '#9575FF',
    active: '#835EFF',
    subtle: 'rgba(166, 140, 255, 0.12)',
  },

  // State Colors
  success: {
    DEFAULT: '#16C784',
    hover: '#13B175',
    active: '#109B66',
    subtle: 'rgba(22, 199, 132, 0.12)',
    glow: 'rgba(22, 199, 132, 0.25)',
    text: '#20E096',
  },
  warning: {
    DEFAULT: '#F5A623',
    hover: '#E0951C',
    active: '#CB8415',
    subtle: 'rgba(245, 166, 35, 0.12)',
    glow: 'rgba(245, 166, 35, 0.25)',
    text: '#FFB83E',
  },
  danger: {
    DEFAULT: '#FF5D73',
    hover: '#E84A60',
    active: '#D1384D',
    subtle: 'rgba(255, 93, 115, 0.12)',
    glow: 'rgba(255, 93, 115, 0.25)',
    text: '#FF7588',
  },
  info: {
    DEFAULT: '#38BDF8',
    hover: '#0EA5E9',
    active: '#0284C7',
    subtle: 'rgba(56, 189, 248, 0.12)',
    glow: 'rgba(56, 189, 248, 0.25)',
    text: '#7DD3FC',
  },

  // Surfaces & Backgrounds
  bg: {
    app: '#0B0B12',
    card: '#12131F',
    sidebar: '#10101B',
    modal: '#141525',
    popover: '#18192C',
    input: '#0F101A',
    hover: '#1B1C2E',
    active: '#22243A',
  },

  // Borders & Dividers
  border: {
    DEFAULT: '#1E1F35',
    subtle: '#171829',
    focus: '#7C6CFF',
    hover: '#2D2E4D',
  },

  // Typography Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    muted: '#71717A',
    disabled: '#52525B',
    inverse: '#0B0B12',
    link: '#7C6CFF',
    linkHover: '#A68CFF',
  },
} as const;

export type ColorToken = typeof colors;
