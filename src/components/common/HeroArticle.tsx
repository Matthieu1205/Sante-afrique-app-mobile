import { FontFamily, FontSize, Radius, Spacing } from "@/theme";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemeColors } from "@/contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ArticleType, ArticleTypeBadge } from "./ArticleTypeBadge";
import { Category, CategoryBadge } from "./CategoryBadge";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_WIDTH * 0.65;

interface HeroArticleProps {
  title: string;
  category: Category | string;
  articleType?: ArticleType;
  imageUrl?: string;
  hasAudio?: boolean;
  isBookmarked?: boolean;
  isPremium?: boolean;
  onPress?: () => void;
  onAudioPress?: () => void;
  onBookmarkPress?: () => void;
}

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    position: "relative",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    backgroundColor: C.backgroundNavy,
  },
  premiumBadge: {
    position: "absolute",
    top: Spacing["3"],
    left: Spacing["4"],
    backgroundColor: C.primary,
    borderRadius: Radius.xs,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  premiumText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: C.white,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing["4"],
    paddingBottom: Spacing["4"],
    paddingTop: Spacing["10"],
    gap: Spacing["2"],
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize["2xl"],
    color: C.white,
    lineHeight: FontSize["2xl"] * 1.2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing["1"],
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["3"],
  },
  actionBtn: { padding: 2 },
  actionIcon: { fontSize: 18, color: C.white },
});

export const HeroArticle: React.FC<HeroArticleProps> = ({
  title,
  category,
  articleType,
  imageUrl,
  hasAudio = false,
  isBookmarked = false,
  isPremium = false,
  onPress,
  onAudioPress,
  onBookmarkPress,
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleBookmark = () => {
    setBookmarked((p) => !p);
    onBookmarkPress?.();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      {isPremium && (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>A</Text>
        </View>
      )}

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.75)", "rgba(0,0,0,0.92)"]}
        style={styles.gradient}
      >
        {articleType && <ArticleTypeBadge type={articleType} />}

        <Text style={styles.title} numberOfLines={3}>
          {title}
        </Text>

        <View style={styles.footer}>
          <CategoryBadge category={category} />
          <View style={styles.actions}>
            {hasAudio && (
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
      </LinearGradient>
    </TouchableOpacity>
  );
};
