/**
 * SANTÉ AFRIQUE — SponsoredCard
 * Bloc "Contenu Partenaire" inséré dans le feed
 * Inspiré du bloc sponsor de l'app Jeune Afrique ("Proposé par MSC")
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/theme';

interface SponsoredCardProps {
  title: string;
  sponsor: string;
  imageUrl?: string;
  onPress?: () => void;
}

export const SponsoredCard: React.FC<SponsoredCardProps> = ({
  title,
  sponsor,
  imageUrl,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      {/* Label "Contenu partenaire" */}
      <View style={styles.labelRow}>
        <Text style={styles.sponsoredLabel}>Contenu partenaire</Text>
        {/* Icône play/vidéo optionnelle */}
        <Text style={styles.playIcon}>▶</Text>
      </View>

      {/* Corps : titre + vignette */}
      <View style={styles.body}>
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={3}>
            {title}
          </Text>
          <Text style={styles.proposedBy}>Proposé par {sponsor}</Text>
        </View>
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    marginVertical: Spacing['1'],
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing['2'],
  },
  sponsoredLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playIcon: {
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  body: {
    flexDirection: 'row',
    gap: Spacing['3'],
    alignItems: 'flex-start',
  },
  textBlock: {
    flex: 1,
    gap: Spacing['2'],
  },
  title: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: FontSize.md * 1.35,
  },
  proposedBy: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
  },
});
