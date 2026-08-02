/**
 * Centralized Icon Configuration & Sizes
 */
export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
  '2xl': 32,
} as const;

export const iconStrokeWidth = {
  light: 1.5,
  default: 2,
  bold: 2.5,
} as const;

export type IconSize = keyof typeof iconSizes;
