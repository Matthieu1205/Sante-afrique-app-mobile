/**
 * SANTÉ AFRIQUE — ArticleCard
 * Carte article pour le feed "Tous les articles" et les listes de rubriques
 * Inspiré de la vue liste de l'app Jeune Afrique :
 * [Badge type] Titre | Vignette droite
 * Date · [🔊 Audio] [🔖 Bookmark]
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, FontFamily, FontSize, Radius, Spacing, Shadows } from '@/theme';
import { ArticleTypeBadge, ArticleType } from './ArticleTypeBadge';
import { CategoryBadge, Category } from './CategoryBadge';

export interface Article {
  id: string;
  title: string;
  excerpt?: string;
  category: Category | string;
  articleType?: ArticleType;
  date: string;
  imageUrl?: string;
  hasAudio?: boolean;
  isBookmarked?: boolean;
  isPremium?: boolean;
}

interface ArticleCardProps {
  article: Article;
  onPress?: () => void;
  onAudioPress?: () => void;
  onBookmarkPress?: () => void;
  variant?: 'list' | 'grid';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onPress,
  onAudioPress,
  onBookmarkPress,
  variant = 'list',
}) => {
  const [bookmarked, setBookmarked] = useState(article.isBookmarked ?? false);

  const handleBookmark = () => {
    setBookmarked((prev) => !prev);
    onBookmarkPress?.();
  };

  if (variant === 'grid') {
    return (
      <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.85}>
        {article.imageUrl ? (
          <Image source={{ uri: article.imageUrl }} style={styles.gridImage} />
        ) : (
          <View style={[styles.gridImage, styles.imagePlaceholder]} />
        )}
        {article.articleType && (
          <View style={styles.gridBadge}>
            <ArticleTypeBadge type={article.articleType} compact />
          </View>
        )}
        <View style={styles.gridContent}>
          <Text style={styles.gridTitle} numberOfLines={2}>
            {article.title}
          </Text>
          <Text style={styles.dateText}>{article.date}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Variante liste (par défaut)
  return (
    <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.listLeft}>
        {/* Badge type d'article (GRAND ENTRETIEN, LE DÉBAT…) */}
        {article.articleType && (
          <ArticleTypeBadge type={article.articleType} compact />
        )}

        {/* Titre */}
        <Text style={styles.listTitle} numberOfLines={3}>
          {article.title}
        </Text>

        {/* Bas de carte : date + actions */}
        <View style={styles.listMeta}>
          <CategoryBadge category={article.category} />
          <Text style={styles.dateText}>{article.date}</Text>
          <View style={styles.actions}>
            {/* Icône Audio */}
            {article.hasAudio && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={onAudioPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.actionIcon}>🔊</Text>
              </TouchableOpacity>
            )}
            {/* Icône Bookmark */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleBookmark}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.actionIcon}>{bookmarked ? '🔖' : '🔖'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Vignette droite */}
      <View style={styles.listImageWrapper}>
        {article.imageUrl ? (
          <Image source={{ uri: article.imageUrl }} style={styles.listImage} />
        ) : (
          <View style={[styles.listImage, styles.imagePlaceholder]} />
        )}
        {article.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>A</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ─── VARIANTE LISTE ───────────────────────────────────
  listCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing['3'],
  },
  listLeft: {
    flex: 1,
    gap: Spacing['1'],
  },
  listTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: FontSize.base * 1.4,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
    marginTop: Spacing['1'],
    flexWrap: 'wrap',
  },
  dateText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
    marginLeft: 'auto',
  },
  actionBtn: {
    padding: 2,
  },
  actionIcon: {
    fontSize: 16,
  },
  listImageWrapper: {
    position: 'relative',
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
  },
  premiumBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: Colors.primary,
    borderRadius: 3,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 9,
    color: Colors.white,
  },

  // ─── VARIANTE GRILLE ──────────────────────────────────
  gridCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadows.card,
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridBadge: {
    position: 'absolute',
    top: Spacing['2'],
    left: Spacing['2'],
  },
  gridContent: {
    padding: Spacing['3'],
    gap: Spacing['1'],
  },
  gridTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: FontSize.sm * 1.4,
  },

  // Commun
  imagePlaceholder: {
    backgroundColor: Colors.borderLight,
  },
});
