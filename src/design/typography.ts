/**
 * Centralized Design Token System - Typography
 */
export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSize: {
    displayXl: { size: '2.5rem', lineHeight: '3rem', fontWeight: '800' },     // 40px
    displayLg: { size: '2rem', lineHeight: '2.5rem', fontWeight: '700' },       // 32px
    h1: { size: '1.75rem', lineHeight: '2.25rem', fontWeight: '700' },          // 28px
    h2: { size: '1.5rem', lineHeight: '2rem', fontWeight: '600' },             // 24px
    h3: { size: '1.25rem', lineHeight: '1.75rem', fontWeight: '600' },          // 20px
    h4: { size: '1.125rem', lineHeight: '1.625rem', fontWeight: '600' },        // 18px
    title: { size: '1rem', lineHeight: '1.5rem', fontWeight: '600' },           // 16px
    subtitle: { size: '0.875rem', lineHeight: '1.25rem', fontWeight: '500' },   // 14px
    bodyLg: { size: '1rem', lineHeight: '1.5rem', fontWeight: '400' },          // 16px
    bodyMd: { size: '0.875rem', lineHeight: '1.25rem', fontWeight: '400' },      // 14px
    bodySm: { size: '0.75rem', lineHeight: '1rem', fontWeight: '400' },         // 12px
    caption: { size: '0.75rem', lineHeight: '1rem', fontWeight: '500' },        // 12px
    label: { size: '0.875rem', lineHeight: '1.25rem', fontWeight: '600' },        // 14px
    helper: { size: '0.75rem', lineHeight: '1rem', fontWeight: '400' },         // 12px
    error: { size: '0.75rem', lineHeight: '1rem', fontWeight: '500' },          // 12px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

export type TypographyToken = typeof typography;
