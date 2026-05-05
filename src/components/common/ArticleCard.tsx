import {
  FontFamily,
  FontSize,
  Radius,
  Shadows,
  Spacing,
} from "@/theme";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemeColors } from "@/contexts/ThemeContext";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ArticleType, ArticleTypeBadge } from "./ArticleTypeBadge";
import { Category, CategoryBadge } from "./CategoryBadge";

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
  variant?: "list" | "grid";
}

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  listCard: {
    flexDirection: "row",
    backgroundColor: C.backgroundCard,
    paddingHorizontal: Spacing["6"],
    paddingVertical: Spacing["3"],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    gap: Spacing["4"],
  },
  listLeft: {
    flex: 1,
    gap: Spacing["2"],
  },
  listTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.base,
    color: C.textPrimary,
    lineHeight: FontSize.base * 1.4,
  },
  listMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["2"],
    marginTop: Spacing["1"],
    flexWrap: "wrap",
  },
  dateText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textMuted,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["2"],
    marginLeft: "auto",
  },
  actionBtn: { padding: 2 },
  actionIcon: { fontSize: 16 },
  listImageWrapper: { position: "relative" },
  listImage: { width: 80, height: 80, borderRadius: Radius.sm },
  premiumBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: C.primary,
    borderRadius: 3,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 9,
    color: C.white,
  },
  gridCard: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    overflow: "hidden",
    ...Shadows.card,
  },
  gridImage: { width: "100%", height: 120 },
  gridBadge: { position: "absolute", top: Spacing["2"], left: Spacing["2"] },
  gridContent: { padding: Spacing["3"], gap: Spacing["1"] },
  gridTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.sm,
    color: C.textPrimary,
    lineHeight: FontSize.sm * 1.4,
  },
  imagePlaceholder: { backgroundColor: C.borderLight },
});

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onPress,
  onAudioPress,
  onBookmarkPress,
  variant = "list",
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [bookmarked, setBookmarked] = useState(article.isBookmarked ?? false);

  const handleBookmark = () => {
    setBookmarked((prev) => !prev);
    onBookmarkPress?.();
  };

  if (variant === "grid") {
    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={onPress}
        activeOpacity={0.85}
      >
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

  return (
    <TouchableOpacity
      style={styles.listCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.listLeft}>
        {article.articleType && (
          <ArticleTypeBadge type={article.articleType} compact />
        )}
        <Text style={styles.listTitle} numberOfLines={3}>
          {article.title}
        </Text>
        <View style={styles.listMeta}>
          <CategoryBadge category={article.category} />
          <Text style={styles.dateText}>{article.date}</Text>
          <View style={styles.actions}>
            {article.hasAudio && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={onAudioPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.actionIcon}>🔊</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleBookmark}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.actionIcon}>{bookmarked ? "🔖" : "🔖"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
