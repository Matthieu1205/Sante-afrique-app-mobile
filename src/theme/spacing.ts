/**
 * SANTÉ AFRIQUE — Espacement & Layout
 * Système d'espacement cohérent basé sur une grille de 4px
 */

// ─── ESPACEMENT ──────────────────────────────────────────────────
export const Spacing = {
  '0': 0,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,
} as const;

// ─── BORDER RADIUS ───────────────────────────────────────────────
export const Radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// ─── DIMENSIONS LAYOUT ───────────────────────────────────────────
export const Layout = {
  // Marges horizontales de l'écran
  screenPaddingH: 16,
  screenPaddingV: 12,

  // Heights
  headerHeight: 56,
  bottomTabHeight: 60,
  bottomTabHeightWithInset: 80, // iPhone avec home indicator

  // Cards
  articleCardHeight: 240,
  heroCardHeight: 320,
  magazineCoverWidth: 120,
  magazineCoverHeight: 160,

  // Images
  articleThumbnailSize: 80,
  avatarSize: 40,
  avatarSizeSmall: 32,

  // Icônes
  iconSize: 24,
  iconSizeSmall: 18,
  iconSizeLarge: 28,

  // Bottom tabs icône
  tabIconSize: 22,
} as const;

// ─── BREAKPOINTS (pour tablette) ──────────────────────────────────
export const Breakpoints = {
  phone: 0,
  tablet: 768,
} as const;
