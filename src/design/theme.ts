/**
 * Consolidated Design System Theme Token Export
 */
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { transitions, animationVariants } from './animations';
import { iconSizes, iconStrokeWidth } from './icons';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
  animationVariants,
  iconSizes,
  iconStrokeWidth,
} as const;

export type Theme = typeof theme;
