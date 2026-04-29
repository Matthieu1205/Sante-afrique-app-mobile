/**
 * SANTÉ AFRIQUE — Design System
 * Palette de couleurs officielle
 * ✅ Couleur primaire confirmée par le client : #1B9DD9
 */

export const Colors = {
  // ─── COULEURS PRIMAIRES ──────────────────────────────
  // Bleu signature Santé Afrique — CODE OFFICIEL #1B9DD9
  primary: '#1B9DD9',
  primaryDark: '#1480B5',
  primaryLight: '#48B8E8',
  primaryUltraLight: '#E6F4FB',

  // Vert CTA (bouton "S'abonner", actions positives)
  cta: '#22B05B',
  ctaDark: '#1A9049',
  ctaLight: '#4DC87A',
  ctaUltraLight: '#E8F7EE',

  // ─── NEUTRES ─────────────────────────────────────────
  black: '#000000',
  white: '#FFFFFF',

  // Fond de l'app
  background: '#F5F7FA',
  backgroundCard: '#FFFFFF',
  backgroundDark: '#0D1B2A',   // Fond mode sombre / header sombre
  backgroundNavy: '#0A2540',   // Gradient magazine slider

  // ─── TEXTES ───────────────────────────────────────────
  textPrimary: '#111827',      // Titres, textes principaux
  textSecondary: '#374151',    // Corps de texte
  textMuted: '#6B7280',        // Métadonnées, dates, labels
  textDisabled: '#9CA3AF',     // Champs désactivés
  textOnDark: '#FFFFFF',       // Texte sur fond sombre/bleu
  textOnPrimary: '#FFFFFF',    // Texte sur fond bleu primaire

  // ─── BORDURES & SÉPARATEURS ──────────────────────────
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderFocus: '#1B9DD9',      // Bordure focus = bleu primaire

  // ─── BADGES TYPES D'ARTICLES ─────────────────────────
  // Inspirés de l'app Jeune Afrique (badge "LE MATCH")
  badgeGrandEntretien: '#1B9DD9',   // Bleu primaire
  badgeDossier: '#7C3AED',          // Violet
  badgeTribune: '#F59E0B',          // Ambre
  badgeDebat: '#EF4444',            // Rouge
  badgeActualite: '#374151',        // Gris foncé
  badgeConseilPratique: '#22B05B',  // Vert CTA
  badgeOneHealth: '#059669',        // Vert émeraude
  badgeVaccination: '#0891B2',      // Cyan foncé

  // ─── ÉTATS ────────────────────────────────────────────
  success: '#22B05B',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#1B9DD9',
  infoLight: '#E8F6FD',

  // ─── OVERLAY & OMBRES ─────────────────────────────────
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  cardShadow: 'rgba(0, 0, 0, 0.08)',

  // ─── MODE SOMBRE (Dark Mode) ──────────────────────────
  dark: {
    background: '#0D1117',
    backgroundCard: '#161B27',
    backgroundElevated: '#1E2433',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#6B7280',
    border: '#252B3B',
    borderLight: '#1E2433',
  },
} as const;

// Type pour l'autocomplétion TypeScript
export type ColorKeys = keyof typeof Colors;
