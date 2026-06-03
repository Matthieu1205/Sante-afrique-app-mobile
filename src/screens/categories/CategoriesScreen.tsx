import type { Category } from "@/components/common";
import { AppHeader } from "@/components/common";
import type { ThemeColors } from "@/contexts/ThemeContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  fetchArticles,
  fetchArticlesByRubrique,
  getImageUrl,
  resolveRubriqueSlug,
} from "@/services/api";
import { FontFamily, FontSize, Radius, Spacing } from "@/theme";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = Spacing["3"];
const CARD_SIZE = (SCREEN_WIDTH - Spacing["4"] * 2 - CARD_GAP) / 2;

interface CategoryItem {
  value: Category;
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  count: number;
  color: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    value: "actualites",
    label: "Actualités",
    icon: "file-text",
    count: 142,
    color: "##1B9DD9",
  },
  {
    value: "conseils_pratiques",
    label: "Conseils Pratiques",
    icon: "zap",
    count: 89,
    color: "#1B9DD9",
  },
  {
    value: "dossier",
    label: "Dossier",
    icon: "clipboard",
    count: 34,
    color: "#1B9DD9",
  },
  {
    value: "equite_acces",
    label: "Équité & Accès aux produits de santé",
    icon: "sliders",
    count: 27,
    color: "##1B9DD9",
  },
  {
    value: "les_odd",
    label: "Les ODD",
    icon: "globe",
    count: 45,
    color: "#1B9DD9",
  },
  {
    value: "business_sante",
    label: "Business Santé",
    icon: "briefcase",
    count: 63,
    color: "##1B9DD9",
  },
  {
    value: "sante_mentale",
    label: "Santé Mental",
    icon: "activity",
    count: 38,
    color: "#1B9DD9",
  },
  {
    value: "one_health",
    label: "One Health",
    icon: "feather",
    count: 52,
    color: "#1B9DD9",
  },
  {
    value: "nutrition_infantile",
    label: "Santé & Nutrition Infantile",
    icon: "droplet",
    count: 71,
    color: "",
  },
  {
    value: "sante_maternelle",
    label: "Santé Maternelle",
    icon: "heart",
    count: 96,
    color: "##1B9DD9",
  },
  {
    value: "vaccination",
    label: "Vaccination",
    icon: "thermometer",
    count: 58,
    color: "##1B9DD9",
  },
];

interface CategoriesScreenProps {
  onCategoryPress: (category: Category, title: string) => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onBack?: () => void;
  notificationCount?: number;
}

const makeStyles = (C: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing["4"],
      paddingTop: Spacing["4"],
      paddingBottom: Spacing["3"],
      gap: Spacing["2"],
    },
    backBtn: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    pageTitle: {
      fontFamily: FontFamily.headingBold,
      fontSize: FontSize.xl,
      color: C.textPrimary,
      flex: 1,
    },
    grid: { paddingHorizontal: Spacing["4"], paddingBottom: Spacing["6"] },
    row: { gap: CARD_GAP, marginBottom: CARD_GAP },
    card: {
      width: CARD_SIZE,
      height: CARD_SIZE * 0.9,
      borderRadius: Radius.lg,
      overflow: "hidden",
      justifyContent: "flex-end",
      gap: Spacing["1"],
      padding: Spacing["4"],
    },
    cardOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.30)",
    },
    cardOverlayLight: {
      backgroundColor: "rgba(0,0,0,0.10)",
    },
    cardIcon: { marginBottom: Spacing["2"] },
    cardLabel: {
      fontFamily: FontFamily.headingBold,
      fontSize: FontSize.base,
      color: C.white,
      lineHeight: FontSize.base * 1.25,
    },
    cardCount: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: "rgba(255,255,255,0.65)",
    },
    logoContainer: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
    },
    logoImage: { width: "55%", height: "55%", opacity: 0.18 },
  });

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  onCategoryPress,
  onSearchPress,
  onNotificationPress,
  onBack,
  notificationCount = 0,
}) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>(
    {},
  );
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    let mounted = true;
    const norm = (s: string) => s.toLowerCase().replace(/-/g, "_");

    async function load() {
      const images: Record<string, string> = {};
      const counts: Record<string, number> = {};

      // 1. Résout les vrais slugs API (synchrone, table hardcodée)
      const slugMap: Record<string, string> = {};
      for (const cat of CATEGORIES)
        slugMap[cat.value] = resolveRubriqueSlug(cat.value);

      // Rubriques sans slug API → on ne cherche pas d'image pour elles
      const NO_SLUG_CATS = new Set(
        CATEGORIES.filter((c) => !slugMap[c.value]).map((c) => c.value),
      );

      // 2. Articles généraux (en cache) pour images rapides (rubriques avec slug seulement)
      const [p1, p2] = await Promise.all([fetchArticles(1), fetchArticles(2)]);
      const general = [...(p1?.data ?? []), ...(p2?.data ?? [])];
      for (const cat of CATEGORIES) {
        if (NO_SLUG_CATS.has(cat.value)) continue;
        const target = norm(slugMap[cat.value] ?? cat.value);
        const match = general.find(
          (a) => norm(a.category?.slug ?? "") === target,
        );
        if (match) {
          const url = getImageUrl(match);
          if (url) images[cat.value] = url;
        }
      }

      // 3. Appel par rubrique → vrais compteurs + images manquantes (rubriques avec slug seulement)
      await Promise.all(
        CATEGORIES.filter((cat) => !NO_SLUG_CATS.has(cat.value)).map(
          async (cat) => {
            const slugForFetch = (slugMap[cat.value] ?? cat.value).replace(
              /-/g,
              "_",
            );
            const res = await fetchArticlesByRubrique(slugForFetch, 1);
            if (!res) return;
            // Filtre strict côté client (même logique que CategoryDetailScreen)
            const target = norm(slugMap[cat.value] ?? cat.value);
            const matched = (res.data ?? []).filter(
              (a) => norm(a.category?.slug ?? "") === target,
            );
            // Compte exact si 1 page, estimation si plusieurs pages
            const total =
              res.total ??
              (res.last_page === 1
                ? matched.length
                : (res.last_page ?? 1) * matched.length);
            if (total > 0) counts[cat.value] = total;
            if (!images[cat.value] && matched[0]) {
              const url = getImageUrl(matched[0]);
              if (url) images[cat.value] = url;
            }
          },
        ),
      );

      if (mounted) {
        setCategoryImages({ ...images });
        setCategoryCounts({ ...counts });
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const noSlugValues = new Set(
    CATEGORIES.filter((c) => !resolveRubriqueSlug(c.value)).map((c) => c.value),
  );

  const renderCategory: ListRenderItem<CategoryItem> = ({ item }) => {
    const imageUrl = categoryImages[item.value];
    const hasNoSlug = noSlugValues.has(item.value);
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: item.color }]}
        onPress={() => onCategoryPress(item.value, item.label)}
        activeOpacity={0.8}
      >
        {imageUrl && !hasNoSlug && (
          <Image
            source={{ uri: imageUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}
        <View
          style={[styles.cardOverlay, hasNoSlug && styles.cardOverlayLight]}
        />
        {hasNoSlug && (
          <View style={styles.logoContainer}>
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              source={require("@/assets/logo2.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        )}
        <Feather
          name={item.icon}
          size={30}
          color="rgba(255,255,255,0.85)"
          style={styles.cardIcon}
        />
        <Text style={styles.cardLabel} numberOfLines={2}>
          {item.label}
        </Text>
        <Text style={styles.cardCount}>
          {hasNoSlug
            ? 'Bientôt disponible'
            : `${categoryCounts[item.value] ?? '…'} articles`}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.backgroundCard}
      />
      <AppHeader
        onSearchPress={onSearchPress}
        onNotificationPress={onNotificationPress}
        notificationCount={notificationCount}
      />

      <View style={styles.topBar}>
        {onBack && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={styles.pageTitle}>Les 11 rubriques</Text>
      </View>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.value}
        renderItem={renderCategory}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
