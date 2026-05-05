import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Colors } from '@/theme';

// ─── Palette claire (défaut) ───────────────────────────────────────

const { dark: _dark, ...lightBase } = Colors;

export type ThemeColors = typeof lightBase;

const lightColors: ThemeColors = lightBase;

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

// ─── Context ──────────────────────────────────────────────────────

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme: () => setIsDark((v) => !v),
        colors: isDark ? darkColors : lightColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
