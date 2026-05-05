/**
 * SANTÉ AFRIQUE — Theme Index
 * Point d'entrée unique du design system
 * Usage: import { Colors, FontSize, Spacing, ... } from '@/theme'
 */

export { Colors } from './colors';
export type { ColorKeys } from './colors';
export { FontFamily, FontSize, LineHeight, TextStyles, setGlobalFontScale } from './typography';
export { Spacing, Radius, Layout, Breakpoints } from './spacing';
export { Shadows } from './shadows';

// ─── THÈME GLOBAL ─────────────────────────────────────────────────
import { Colors } from './colors';
import { FontFamily, FontSize } from './typography';
import { Spacing, Radius } from './spacing';
import { Shadows } from './shadows';

export const Theme = {
  colors: Colors,
  fonts: FontFamily,
  fontSize: FontSize,
  spacing: Spacing,
  radius: Radius,
  shadows: Shadows,
} as const;

export default Theme;
