/**
 * Centralized Design Token System - Shadows & Elevation
 */
export const shadows = {
  none: 'none',
  level1: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.24)',
  level2: '0 4px 12px rgba(0, 0, 0, 0.35)',
  level3: '0 10px 25px rgba(0, 0, 0, 0.45)',
  level4: '0 20px 40px rgba(0, 0, 0, 0.6)',
  
  // Custom interactive glow tokens
  glow: '0 0 20px rgba(124, 108, 255, 0.2)',
  glowLg: '0 0 35px rgba(124, 108, 255, 0.35)',
  glowSuccess: '0 0 20px rgba(22, 199, 132, 0.2)',
  glowDanger: '0 0 20px rgba(255, 93, 115, 0.2)',
  glowWarning: '0 0 20px rgba(245, 166, 35, 0.2)',

  // Special component shadows
  dialog: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
  dropdown: '0 12px 28px rgba(0, 0, 0, 0.5)',
  hover: '0 8px 30px rgba(124, 108, 255, 0.15)',
} as const;

export type ShadowToken = typeof shadows;
