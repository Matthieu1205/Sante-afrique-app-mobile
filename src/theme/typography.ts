/**
 * SANTÉ AFRIQUE — Typographie
 * Basée sur la typographie ultra-bold du wordmark "santé afrique"
 * Police principale : Nunito (Google Fonts) — correspondance proche du logo
 * Police secondaire : Inter — lisibilité sur mobile
 */

import { Platform } from 'react-native';

// ─── FAMILLES DE POLICES ─────────────────────────────────────────
// À installer avec : npx expo install @expo-google-fonts/nunito @expo-google-fonts/inter
export const FontFamily = {
  // Nunito — utilisée pour les titres, le logo, les boutons (style bold du wordmark)
  logo: 'Nunito_900Black',         // Pour reproduire le style du wordmark "santé afrique"
  headingBold: 'Nunito_800ExtraBold',
  headingSemiBold: 'Nunito_700Bold',
  heading: 'Nunito_600SemiBold',

  // Inter — utilisée pour le corps de texte, les labels, les métadonnées
  bodyBold: 'Inter_700Bold',
  bodySemiBold: 'Inter_600SemiBold',
  body: 'Inter_400Regular',
  bodyLight: 'Inter_300Light',

  // Fallback système (avant chargement des polices)
  system: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  systemBold: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
} as const;

// ─── TAILLES DE POLICE ───────────────────────────────────────────
// _fontScale est mis à jour par ThemeContext — tous les composants
// qui lisent FontSize.xxx reçoivent automatiquement la valeur scalée
// lors de leur prochain rendu (déclenché par le changement de contexte).
let _fontScale = 1;
export const setGlobalFontScale = (scale: number) => { _fontScale = scale; };

const BASE = { xs: 10, sm: 12, base: 14, md: 16, lg: 18, xl: 20, '2xl': 22, '3xl': 26, '4xl': 30, '5xl': 36 };

export const FontSize: typeof BASE = {
  get xs()    { return BASE.xs    * _fontScale; },
  get sm()    { return BASE.sm    * _fontScale; },
  get base()  { return BASE.base  * _fontScale; },
  get md()    { return BASE.md    * _fontScale; },
  get lg()    { return BASE.lg    * _fontScale; },
  get xl()    { return BASE.xl    * _fontScale; },
  get ['2xl']() { return BASE['2xl'] * _fontScale; },
  get ['3xl']() { return BASE['3xl'] * _fontScale; },
  get ['4xl']() { return BASE['4xl'] * _fontScale; },
  get ['5xl']() { return BASE['5xl'] * _fontScale; },
};

// ─── HAUTEURS DE LIGNE ───────────────────────────────────────────
export const LineHeight = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// ─── STYLES PRÉDÉFINIS ───────────────────────────────────────────
// Utilisables directement dans les composants StyleSheet
export const TextStyles = {
  // Logo / Header app
  logoText: {
    fontFamily: FontFamily.logo,
    fontSize: FontSize['2xl'],
    letterSpacing: -0.5,
  },

  // Titres articles
  articleHeroTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize['2xl'],
    lineHeight: FontSize['2xl'] * LineHeight.tight,
  },
  articleTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * LineHeight.snug,
  },
  articleTitleSmall: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * LineHeight.snug,
  },

  // Corps de texte
  articleBody: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * LineHeight.relaxed,
  },
  bodySmall: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * LineHeight.normal,
  },

  // Labels & Métadonnées
  categoryLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  dateLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
  },
  badgeText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },

  // Boutons
  buttonLarge: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    letterSpacing: 0.2,
  },
  buttonMedium: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    letterSpacing: 0.2,
  },
  buttonSmall: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    letterSpacing: 0.3,
  },

  // Navigation
  tabLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
  },
  sectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
  },
} as const;
