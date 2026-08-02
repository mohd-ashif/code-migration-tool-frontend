/**
 * Centralized Design Token System - Spacing & Layout Grid
 */
export const spacing = {
  0: '0px',
  xxs: '2px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '64px',
} as const;

export type SpacingToken = typeof spacing;
