/**
 * SANTÉ AFRIQUE — CategoryBadge
 * Label de rubrique affiché sous/sur les articles
 * Correspond aux 11 rubriques réelles de santeafrique.net
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/theme';

export type Category =
  | 'actualites'
  | 'conseils_pratiques'
  | 'dossier'
  | 'equite_acces'
  | 'les_odd'
  | 'business_sante'
  | 'sante_mentale'
  | 'one_health'
  | 'nutrition_infantile'
  | 'sante_maternelle'
  | 'vaccination';

const CATEGORY_LABELS: Record<Category, string> = {
  actualites: 'Actualités',
  conseils_pratiques: 'Conseils Pratiques',
  dossier: 'Dossier',
  equite_acces: 'Équité & Accès aux produits de santé',
  les_odd: 'Les ODD',
  business_sante: 'Business Santé',
  sante_mentale: 'Santé Mental',
  one_health: 'One Health',
  nutrition_infantile: 'Santé & Nutrition Infantile',
  sante_maternelle: 'Santé Maternelle',
  vaccination: 'Vaccination',
};

interface CategoryBadgeProps {
  category: Category | string;
  onPress?: () => void;
  variant?: 'default' | 'filled';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  onPress,
  variant = 'default',
}) => {
  const label =
    CATEGORY_LABELS[category as Category] ?? category;

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      style={[
        styles.badge,
        variant === 'filled' && styles.filled,
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, variant === 'filled' && styles.labelFilled]}>
        {label.toUpperCase()}
      </Text>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  filled: {
    backgroundColor: Colors.primaryUltraLight,
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing['2'],
    paddingVertical: 2,
  },
  label: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  labelFilled: {
    color: Colors.primaryDark,
  },
});
