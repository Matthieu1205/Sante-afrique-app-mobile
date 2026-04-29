/**
 * SANTÉ AFRIQUE — RatingWidget
 * Widget de notation in-app inséré dans le feed après X articles lus
 * Inspiré du widget "Vous aimez l'appli Jeune Afrique ?" (5 étoiles)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/theme';
import { Button } from './Button';

interface RatingWidgetProps {
  onSubmit?: (rating: number) => void;
  onDismiss?: () => void;
}

export const RatingWidget: React.FC<RatingWidgetProps> = ({
  onSubmit,
  onDismiss,
}) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedRating === 0) return;
    setSubmitted(true);
    onSubmit?.(selectedRating);
    setTimeout(() => onDismiss?.(), 1500);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <Text style={styles.thankYou}>Merci pour votre note ! ⭐</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Séparateur rouge (comme Jeune Afrique) */}
      <View style={styles.topDivider} />

      <Text style={styles.question}>Vous aimez l'appli Santé Afrique ?</Text>
      <Text style={styles.subtitle}>Dites-nous à quel point.</Text>

      {/* Étoiles */}
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setSelectedRating(star)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text style={[styles.star, star <= selectedRating && styles.starFilled]}>
              {star <= selectedRating ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bouton envoyer */}
      <Button
        label="Envoyer ma note"
        variant="outline"
        size="md"
        fullWidth
        onPress={handleSubmit}
        disabled={selectedRating === 0}
        style={styles.submitBtn}
      />
    </View>
  );
};

// Logique d'affichage : montrer après 10 articles lus
export const shouldShowRatingWidget = (articlesReadCount: number): boolean => {
  // Montrer la 1ère fois après 10 articles, puis tous les 50
  return articlesReadCount === 10 || (articlesReadCount > 10 && articlesReadCount % 50 === 0);
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing['5'],
    paddingVertical: Spacing['5'],
    alignItems: 'center',
    gap: Spacing['2'],
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
  },
  topDivider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
  },
  question: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing['2'],
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: Spacing['3'],
    marginVertical: Spacing['2'],
  },
  star: {
    fontSize: 32,
    color: Colors.border,
  },
  starFilled: {
    color: '#F59E0B', // Jaune/ambre pour les étoiles remplies
  },
  submitBtn: {
    marginTop: Spacing['1'],
  },
  thankYou: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.primary,
    textAlign: 'center',
    paddingVertical: Spacing['4'],
  },
});
