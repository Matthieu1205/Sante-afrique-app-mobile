/**
 * SANTÉ AFRIQUE — Ombres
 * Système d'ombres pour iOS et Android
 */

import { Platform } from 'react-native';

const shadow = (elevation: number, opacity = 0.08) => {
  if (Platform.OS === 'android') {
    return { elevation };
  }
  return {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: elevation * 0.5 },
    shadowOpacity: opacity,
    shadowRadius: elevation * 0.8,
  };
};

export const Shadows = {
  none: {},
  xs: shadow(1, 0.05),
  sm: shadow(2, 0.07),
  md: shadow(4, 0.08),
  lg: shadow(8, 0.1),
  xl: shadow(16, 0.12),

  // Ombre card article
  card: Platform.OS === 'android'
    ? { elevation: 3 }
    : {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },

  // Ombre bottom tab bar
  tabBar: Platform.OS === 'android'
    ? { elevation: 10 }
    : {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },

  // Ombre header
  header: Platform.OS === 'android'
    ? { elevation: 4 }
    : {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
} as const;
