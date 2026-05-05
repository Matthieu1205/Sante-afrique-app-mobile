import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Colors } from '@/theme';

// ─── Palette claire (défaut) ───────────────────────────────────────

const { dark: _dark, ...lightBase } = Colors;

export type ThemeColors = { [K in keyof typeof lightBase]: string };

const lightColors: ThemeColors = lightBase as ThemeColors;

const darkColors: ThemeColors = {
  ...lightBase,
  // Fonds
  background:       '#0D1117',
  backgroundCard:   '#161B27',
  backgroundDark:   '#050B12',
  backgroundNavy:   '#070E1A',
  // Textes
  textPrimary:      '#F9FAFB',
  textSecondary:    '#D1D5DB',
  textMuted:        '#9CA3AF',
  textDisabled:     '#6B7280',
  // Bordures
  border:           '#252B3B',
  borderLight:      '#1E2433',
  // Primaire ultra-light (badges sur fond sombre)
  primaryUltraLight:'#0A2540',
  ctaUltraLight:    '#062013',
  // États légers
  errorLight:       '#2D0F0F',
  successLight:     '#062013',
  warningLight:     '#2D1F00',
  infoLight:        '#061527',
};

// ─── Taille du texte ──────────────────────────────────────────────

export type TextSize = 'small' | 'medium' | 'large';
const FONT_SCALES: Record<TextSize, number> = { small: 0.85, medium: 1.0, large: 1.18 };

// ─── Context ──────────────────────────────────────────────────────

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  fontScale: number;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
  textSize: 'medium',
  setTextSize: () => {},
  fontScale: 1.0,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>('medium');

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme: () => setIsDark((v) => !v),
        colors: isDark ? darkColors : lightColors,
        textSize,
        setTextSize,
        fontScale: FONT_SCALES[textSize],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
