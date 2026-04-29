/**
 * SANTÉ AFRIQUE — Composant Button
 * Boutons principaux de l'app
 * Variantes : primary (bleu), cta (vert), outline, ghost, danger
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/theme';

type ButtonVariant = 'primary' | 'cta' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>
            {label}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: { marginRight: Spacing['2'] },
  iconRight: { marginLeft: Spacing['2'] },

  // ─── VARIANTES ───────────────────────────────────────
  // Bouton principal bleu (connexion, navigation)
  primary: {
    backgroundColor: Colors.primary,
  },
  // Bouton CTA (S'abonner, actions importantes)
  cta: {
    backgroundColor: Colors.primary,
  },
  // Bouton contour bleu
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  // Bouton transparent
  ghost: {
    backgroundColor: 'transparent',
  },
  // Bouton danger
  danger: {
    backgroundColor: Colors.error,
  },
  disabled: {
    opacity: 0.5,
  },

  // ─── TAILLES ─────────────────────────────────────────
  size_sm: {
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
    borderRadius: Radius.sm,
  },
  size_md: {
    paddingHorizontal: Spacing['5'],
    paddingVertical: Spacing['3'],
  },
  size_lg: {
    paddingHorizontal: Spacing['6'],
    paddingVertical: Spacing['4'],
    borderRadius: Radius.lg,
  },

  // ─── TEXTES ───────────────────────────────────────────
  label: {
    fontFamily: FontFamily.bodySemiBold,
    letterSpacing: 0.2,
  },
  label_primary: { color: Colors.white },
  label_cta: { color: Colors.white },
  label_outline: { color: Colors.primary },
  label_ghost: { color: Colors.primary },
  label_danger: { color: Colors.white },

  labelSize_sm: { fontSize: FontSize.sm },
  labelSize_md: { fontSize: FontSize.base },
  labelSize_lg: { fontSize: FontSize.md },
});
