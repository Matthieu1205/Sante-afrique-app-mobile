import type { Article, Category } from "@/components/common";
import {
  AppHeader,
  ArticleCard,
  CategoryBadge,
  RatingWidget,
  shouldShowRatingWidget,
  SponsoredCard,
} from "@/components/common";
import { Colors, FontFamily, FontSize, Radius, Spacing } from "@/theme";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemeColors } from "@/contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ListRenderItem,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: W } = Dimensions.get("window");
const GRID_GAP = Spacing["2"];
const CARD_W = (W - GRID_GAP) / 2;

// ─── Config visuels par catégorie ────────────────────────────────

const CAT_CONFIG: Record<
  string,
  {
    bg: [string, string];
    icon: React.ComponentProps<typeof Feather>["name"];
    label: string;
  }
> = {
  actualites: { bg: ["#1F2937", "#111827"], icon: "file-text", label: "Actualités" },
  sante_mentale: { bg: ["#1E1B4B", "#0F0A2E"], icon: "activity", label: "Santé Mentale" },
  vaccination: { bg: ["#0C4A6E", "#082F49"], icon: "thermometer", label: "Vaccination" },
  conseils_pratiques: { bg: ["#14532D", "#052E16"], icon: "zap", label: "Conseils Pratiques" },
  dossier: { bg: ["#2E1065", "#1E0A4B"], icon: "clipboard", label: "Dossier" },
  one_health: { bg: ["#064E3B", "#022C22"], icon: "feather", label: "One Health" },
  nutrition_infantile: { bg: ["#78350F", "#451A03"], icon: "droplet", label: "Nutrition Infantile" },
  business_sante: { bg: ["#0A2540", "#041524"], icon: "briefcase", label: "Business Santé" },
  sante_maternelle: { bg: ["#7F1D1D", "#450A0A"], icon: "heart", label: "Santé Maternelle" },
  les_odd: { bg: ["#082F49", "#041C2C"], icon: "globe", label: "Les ODD" },
  equite_acces: { bg: ["#312E81", "#1E1B4B"], icon: "sliders", label: "Équité & Accès" },
};

const TYPE_BADGE: Record<string, { letter: string; color: string }> = {
  actualite: { letter: "A", color: "#374151" },
  grand_entretien: { letter: "E", color: "#1B9DD9" },
  dossier: { letter: "D", color: "#7C3AED" },
  dossier_special: { letter: "D", color: "#7C3AED" },
  tribune: { letter: "T", color: "#F59E0B" },
  debat: { letter: "D", color: "#EF4444" },
  conseil_pratique: { letter: "C", color: "#22B05B" },
  one_health: { letter: "O", color: "#059669" },
  vaccination: { letter: "V", color: "#0891B2" },
};

function getCat(cat: string) {
  return (
    CAT_CONFIG[cat] ?? {
      bg: ["#1F2937", "#111827"] as [string, string],
      icon: "file-text" as React.ComponentProps<typeof Feather>["name"],
      label: cat,
    }
  );
}
function getBadge(type?: string) {
  return TYPE_BADGE[type ?? ""] ?? { letter: "A", color: "#374151" };
}

// ─── Types de feed ────────────────────────────────────────────────

interface HeroData {
  id: string;
  title: string;
  category: string;
  articleType?: string;
  hasAudio?: boolean;
  isPremium?: boolean;
}

type FeedItem =
  | { type: "hero"; data: HeroData }
  | { type: "article_pair"; left: Article; right?: Article }
  | { type: "most_read" }
  | { type: "sponsored" }
  | { type: "rating" }
  | { type: "category_filter" }
  | { type: "article"; data: Article };

// ─── Données mock ─────────────────────────────────────────────────

const MOCK_HERO: HeroData[] = [
  { id: "h1", title: "Paludisme 2026 : les nouvelles stratégies de l'OMS pour réduire la mortalité infantile en Afrique de l'Ouest", category: "actualites", articleType: "actualite", hasAudio: true },
  { id: "h2", title: '"La santé mentale est le défi invisible de l\'Afrique moderne" — Dr Aminata Koné', category: "sante_mentale", articleType: "grand_entretien", hasAudio: true, isPremium: true },
  { id: "h3", title: "Dossier : comment l'Afrique peut atteindre la couverture santé universelle d'ici 2030", category: "les_odd", articleType: "dossier_special" },
  { id: "h4", title: "Vaccination HPV : une révolution silencieuse contre le cancer du col en Côte d'Ivoire", category: "vaccination", articleType: "vaccination", hasAudio: true },
];

const MOCK_ARTICLES: Article[] = [
  { id: "1",  title: "Paludisme en Afrique de l'Ouest : l'OMS déploie un nouveau protocole", category: "actualites", articleType: "actualite", date: "25 avr.", hasAudio: true },
  { id: "2",  title: 'Dr Aminata Koné : "La santé maternelle reste notre priorité absolue"', category: "sante_maternelle", articleType: "grand_entretien", date: "24 avr.", isPremium: true },
  { id: "3",  title: "Nutrition infantile : les aliments locaux africains surpassent les compléments importés", category: "nutrition_infantile", articleType: "dossier", date: "23 avr." },
  { id: "4",  title: "One Health : comment la santé des animaux impacte celle des humains au Sahel", category: "one_health", articleType: "one_health", date: "22 avr." },
  { id: "5",  title: "Vaccination HPV : un enjeu capital pour réduire le cancer du col", category: "vaccination", articleType: "vaccination", date: "21 avr.", hasAudio: true },
  { id: "6",  title: "Santé mentale : briser le tabou dans les communautés africaines", category: "sante_mentale", articleType: "tribune", date: "20 avr.", isPremium: true },
  { id: "7",  title: "Business Santé : les startups healthtech africaines lèvent 120M$", category: "business_sante", articleType: "actualite", date: "19 avr." },
  { id: "8",  title: "Les ODD santé : bilan à mi-parcours pour l'Afrique de l'Ouest", category: "les_odd", articleType: "dossier_special", date: "18 avr." },
  { id: "9",  title: "Équité d'accès : les médicaments essentiels hors de portée pour 40 % de la population", category: "equite_acces", articleType: "debat", date: "17 avr.", hasAudio: true, isPremium: true },
  { id: "10", title: "Comment prévenir le choléra en saison des pluies", category: "conseils_pratiques", articleType: "conseil_pratique", date: "16 avr.", hasAudio: true },
  { id: "11", title: "Diabète de type 2 : progression alarmante dans les villes africaines", category: "dossier", articleType: "dossier", date: "15 avr." },
  { id: "12", title: "Allaitement maternel : clé d'un bon démarrage pour l'enfant", category: "sante_maternelle", articleType: "conseil_pratique", date: "14 avr." },
];

const MOCK_PLUS_LUS: Article[] = [
  { id: "pl1", title: "Paludisme : 5 signes d'alerte à ne jamais ignorer", category: "actualites", date: "25 avr.", articleType: "conseil_pratique" },
  { id: "pl2", title: "HPV : tout ce que les mères doivent savoir sur le vaccin", category: "vaccination", date: "23 avr.", articleType: "vaccination" },
  { id: "pl3", title: "Dépression post-partum en Afrique : la face cachée de la maternité", category: "sante_mentale", date: "20 avr.", articleType: "dossier" },
  { id: "pl4", title: "Diabète et alimentation locale : conseils d'un nutritionniste de Dakar", category: "conseils_pratiques", date: "18 avr.", articleType: "conseil_pratique" },
  { id: "pl5", title: "L'hypertension artérielle, mal silencieux de l'Afrique moderne", category: "actualites", date: "15 avr.", articleType: "actualite" },
  { id: "pl6", title: "Mortalité maternelle : les progrès insuffisants de l'Afrique subsaharienne", category: "sante_maternelle", date: "12 avr.", articleType: "debat" },
  { id: "pl7", title: "Eau potable et santé infantile : comprendre le lien", category: "one_health", date: "10 avr.", articleType: "one_health" },
  { id: "pl8", title: "Tabagisme en Afrique : une épidémie qui progresse silencieusement", category: "actualites", date: "8 avr.", articleType: "actualite" },
  { id: "pl9", title: "Médicaments génériques : pourquoi ils restent sous-utilisés", category: "equite_acces", date: "5 avr.", articleType: "debat" },
];

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "actualites", label: "Actualités" },
  { value: "conseils_pratiques", label: "Conseils" },
  { value: "dossier", label: "Dossiers" },
  { value: "sante_maternelle", label: "Santé Maternelle" },
  { value: "vaccination", label: "Vaccination" },
  { value: "sante_mentale", label: "Santé Mentale" },
  { value: "one_health", label: "One Health" },
  { value: "nutrition_infantile", label: "Nutrition" },
  { value: "business_sante", label: "Business" },
  { value: "les_odd", label: "Les ODD" },
  { value: "equite_acces", label: "Équité" },
];

// ─── Carte Hero (style JA) — dark visual design, theme-invariant ──

const JaHeroCard: React.FC<{ item: HeroData; onPress: () => void }> = ({
  item,
  onPress,
}) => {
  const cat = getCat(item.category);
  const badge = getBadge(item.articleType);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={heroS.wrapper}>
      <LinearGradient
        colors={cat.bg}
        style={heroS.image}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Feather name={cat.icon} size={64} color="rgba(255,255,255,0.35)" />
      </LinearGradient>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.92)"]}
        style={heroS.overlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={[heroS.badge, { backgroundColor: badge.color }]}>
          <Text style={heroS.badgeLetter}>{badge.letter}</Text>
        </View>
        <Text style={heroS.title} numberOfLines={3}>
          {item.title}
        </Text>
      </LinearGradient>

      <View style={heroS.footer}>
        <Text style={heroS.catLabel}>{cat.label}</Text>
        <View style={heroS.footerIcons}>
          {item.hasAudio && (
            <Feather name="volume-2" size={18} color="rgba(255,255,255,0.75)" />
          )}
          <Feather name="bookmark" size={18} color="rgba(255,255,255,0.75)" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const heroS = StyleSheet.create({
  wrapper: { backgroundColor: Colors.backgroundDark },
  image: { width: W, height: 240, alignItems: "center", justifyContent: "center" },
  overlay: {
    position: "absolute",
    bottom: 44,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: "flex-end",
    paddingHorizontal: Spacing["4"],
    paddingBottom: Spacing["2"],
    gap: Spacing["2"],
  },
  badge: { alignSelf: "flex-start", width: 22, height: 22, borderRadius: 3, alignItems: "center", justifyContent: "center" },
  badgeLetter: { fontFamily: FontFamily.bodyBold, fontSize: 12, color: Colors.white },
  title: { fontFamily: FontFamily.headingBold, fontSize: FontSize.xl, color: Colors.white, lineHeight: 28 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing["4"],
    paddingVertical: Spacing["3"],
    backgroundColor: Colors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  catLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: "rgba(255,255,255,0.75)" },
  footerIcons: { flexDirection: "row", gap: Spacing["3"] },
});

// ─── Carte grille 2 colonnes (style JA) — dark visual, theme-invariant

const JaGridCard: React.FC<{ article: Article; onPress: () => void }> = ({
  article,
  onPress,
}) => {
  const cat = getCat(article.category as string);
  const badge = getBadge(article.articleType);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[gridS.card, { width: CARD_W }]}
    >
      <View style={gridS.imageWrapper}>
        <LinearGradient
          colors={cat.bg}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={gridS.emojiWrap}>
            <Feather name={cat.icon} size={38} color="rgba(255,255,255,0.28)" />
          </View>
        </LinearGradient>
        <View style={[gridS.badge, { backgroundColor: badge.color }]}>
          <Text style={gridS.badgeLetter}>{badge.letter}</Text>
        </View>
      </View>

      <Text style={gridS.title} numberOfLines={3}>
        {article.title}
      </Text>

      <View style={gridS.footer}>
        <Text style={gridS.catLabel} numberOfLines={1}>
          {cat.label}
        </Text>
        <View style={gridS.footerIcons}>
          {article.hasAudio && (
            <Feather name="volume-2" size={14} color="rgba(255,255,255,0.55)" />
          )}
          <Feather name="bookmark" size={14} color="rgba(255,255,255,0.55)" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const gridS = StyleSheet.create({
  card: { height: 260, backgroundColor: "#1e1e1e", overflow: "hidden" },
  imageWrapper: { height: 150, overflow: "hidden" },
  emojiWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", bottom: 6, left: 6, width: 20, height: 20, borderRadius: 3, alignItems: "center", justifyContent: "center" },
  badgeLetter: { fontFamily: FontFamily.bodyBold, fontSize: 11, color: Colors.white },
  title: { fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: Colors.white, lineHeight: FontSize.base * 1.35, padding: Spacing["2"], flex: 1 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing["2"],
    paddingBottom: Spacing["2"],
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: Spacing["2"],
  },
  catLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: "rgba(255,255,255,0.5)", flex: 1 },
  footerIcons: { flexDirection: "row", gap: Spacing["2"] },
});

// ─── Les plus lus ─────────────────────────────────────────────────

const makeMrStyles = (C: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: C.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
    paddingVertical: Spacing["3"],
  },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing["4"], marginBottom: Spacing["3"], gap: Spacing["2"] },
  title: { fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: C.textPrimary },
  list: { paddingHorizontal: Spacing["4"], gap: Spacing["3"] },
  card: { width: 160, backgroundColor: C.background, borderRadius: Radius.md, padding: Spacing["3"], gap: Spacing["2"] },
  rank: { fontFamily: FontFamily.headingBold, fontSize: FontSize["2xl"], color: C.primaryUltraLight, letterSpacing: -1, lineHeight: FontSize["2xl"] },
  cardContent: { gap: Spacing["1"] },
  cardTitle: { fontFamily: FontFamily.headingSemiBold, fontSize: FontSize.sm, color: C.textPrimary, lineHeight: FontSize.sm * 1.4 },
  cardDate: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted },
});

const MostReadSection: React.FC<{
  articles: Article[];
  onPress: (id: string) => void;
}> = ({ articles, onPress }) => {
  const { colors } = useTheme();
  const mrS = makeMrStyles(colors);
  return (
    <View style={mrS.container}>
      <View style={mrS.header}>
        <Text style={mrS.title}>Les plus lus</Text>
      </View>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={mrS.list}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={mrS.card}
            onPress={() => onPress(item.id)}
            activeOpacity={0.8}
          >
            <Text style={mrS.rank}>{index + 1}</Text>
            <View style={mrS.cardContent}>
              <CategoryBadge category={item.category} />
              <Text style={mrS.cardTitle} numberOfLines={3}>
                {item.title}
              </Text>
              <Text style={mrS.cardDate}>{item.date}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// ─── Filtre catégories ────────────────────────────────────────────

const makeFilterStyles = (C: ThemeColors) => StyleSheet.create({
  row: {
    backgroundColor: C.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  content: { paddingHorizontal: Spacing["4"], paddingVertical: Spacing["3"], gap: Spacing["2"] },
  chip: {
    paddingHorizontal: Spacing["3"],
    paddingVertical: Spacing["2"],
    borderRadius: Radius.full,
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: C.textSecondary },
  chipTextActive: { color: C.white },
});

const CategoryFilter: React.FC<{
  selected: Category | null;
  onSelect: (cat: Category | null) => void;
}> = ({ selected, onSelect }) => {
  const { colors } = useTheme();
  const filterS = makeFilterStyles(colors);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={filterS.row}
      contentContainerStyle={filterS.content}
    >
      <TouchableOpacity
        style={[filterS.chip, !selected && filterS.chipActive]}
        onPress={() => onSelect(null)}
      >
        <Text style={[filterS.chipText, !selected && filterS.chipTextActive]}>
          Tous
        </Text>
      </TouchableOpacity>
      {CATEGORY_OPTIONS.map(({ value, label }) => (
        <TouchableOpacity
          key={value}
          style={[filterS.chip, selected === value && filterS.chipActive]}
          onPress={() => onSelect(value)}
        >
          <Text style={[filterS.chipText, selected === value && filterS.chipTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// ─── Écran principal ───────────────────────────────────────────────

interface HomeScreenProps {
  onArticlePress?: (articleId: string) => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
}

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  tabsBar: {
    backgroundColor: C.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    paddingVertical: Spacing["2"],
    paddingHorizontal: Spacing["6"],
  },
  tabsPills: {
    flexDirection: "row",
    backgroundColor: C.background,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: 3,
    gap: 2,
  },
  pill: { flex: 1, alignItems: "center", paddingVertical: Spacing["2"], borderRadius: Radius.full },
  pillActive: { backgroundColor: C.primary },
  pillText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: C.textMuted },
  pillTextActive: { color: C.white },
  tabStrip: { flex: 1, overflow: "hidden" },
  tabContent: { flexDirection: "row", width: W * 2, flex: 1 },
  pair: {
    flexDirection: "row",
    gap: GRID_GAP,
    backgroundColor: C.background,
    marginBottom: Spacing["2"],
  },
});

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onArticlePress,
  onSearchPress,
  onNotificationPress,
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [activeTab, setActiveTab] = useState<"une" | "articles">("une");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [articlesRead, setArticlesRead] = useState(0);
  const [ratingDismissed, setRatingDismissed] = useState(false);

  const tabIndexRef = useRef(0);
  const tabTx = useRef(new Animated.Value(0)).current;

  const goToTab = useCallback(
    (idx: number) => {
      tabIndexRef.current = idx;
      setActiveTab(idx === 0 ? "une" : "articles");
      Animated.spring(tabTx, {
        toValue: -idx * W,
        useNativeDriver: true,
        tension: 80,
        friction: 14,
      }).start();
    },
    [tabTx],
  );

  const swipe = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 5 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: (_, gs) => {
        const base = -tabIndexRef.current * W;
        tabTx.setValue(Math.max(-W, Math.min(0, base + gs.dx)));
      },
      onPanResponderRelease: (_, gs) => {
        const cur = tabIndexRef.current;
        if (gs.vx < -0.2 || gs.dx < -W / 4) goToTab(Math.min(cur + 1, 1));
        else if (gs.vx > 0.2 || gs.dx > W / 4) goToTab(Math.max(cur - 1, 0));
        else goToTab(cur);
      },
    }),
  ).current;

  const handleArticlePress = useCallback(
    (id: string) => {
      setArticlesRead((n) => n + 1);
      onArticlePress?.(id);
    },
    [onArticlePress],
  );

  const filteredArticles = useMemo(
    () =>
      selectedCategory
        ? MOCK_ARTICLES.filter((a) => a.category === selectedCategory)
        : MOCK_ARTICLES,
    [selectedCategory],
  );

  const showRating = !ratingDismissed && shouldShowRatingWidget(articlesRead);

  const uneFeed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [{ type: "hero", data: MOCK_HERO[0] }];
    const gridArticles = [
      ...MOCK_HERO.slice(1).map(
        (h) =>
          ({
            id: h.id,
            title: h.title,
            category: h.category as Category,
            articleType: h.articleType,
            date: "",
            hasAudio: h.hasAudio,
            isPremium: h.isPremium,
          }) as Article,
      ),
      ...MOCK_ARTICLES,
    ];

    let pairCount = 0;
    for (let i = 0; i < gridArticles.length; i += 2) {
      if (pairCount === 2) items.push({ type: "most_read" });
      if (pairCount > 0 && pairCount % 4 === 0) items.push({ type: "sponsored" });
      if (pairCount === 3 && showRating) items.push({ type: "rating" });
      items.push({ type: "article_pair", left: gridArticles[i], right: gridArticles[i + 1] });
      pairCount++;
    }
    return items;
  }, [showRating]);

  const articlesFeed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [{ type: "category_filter" }];
    filteredArticles.forEach((article, i) => {
      if (i > 0 && i % 5 === 0) items.push({ type: "sponsored" });
      items.push({ type: "article", data: article });
    });
    return items;
  }, [filteredArticles]);

  const renderItem: ListRenderItem<FeedItem> = useCallback(
    ({ item }) => {
      switch (item.type) {
        case "hero":
          return (
            <JaHeroCard
              item={item.data}
              onPress={() => handleArticlePress(item.data.id)}
            />
          );

        case "article_pair":
          return (
            <View style={styles.pair}>
              <JaGridCard
                article={item.left}
                onPress={() => handleArticlePress(item.left.id)}
              />
              {item.right ? (
                <JaGridCard
                  article={item.right}
                  onPress={() => handleArticlePress(item.right!.id)}
                />
              ) : (
                <View style={{ width: CARD_W }} />
              )}
            </View>
          );

        case "most_read":
          return (
            <MostReadSection
              articles={MOCK_PLUS_LUS}
              onPress={handleArticlePress}
            />
          );

        case "sponsored":
          return (
            <SponsoredCard
              title="Les solutions de santé digitale au service des populations africaines"
              sponsor="OMS Afrique"
            />
          );

        case "rating":
          return <RatingWidget onDismiss={() => setRatingDismissed(true)} />;

        case "category_filter":
          return (
            <CategoryFilter
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          );

        case "article":
          return (
            <ArticleCard
              article={item.data}
              onPress={() => handleArticlePress(item.data.id)}
            />
          );

        default:
          return null;
      }
    },
    [handleArticlePress, selectedCategory, styles.pair],
  );

  return (
    <View style={styles.container}>
      <AppHeader
        onSearchPress={onSearchPress}
        onNotificationPress={onNotificationPress}
        notificationCount={3}
      />

      <View style={styles.tabsBar}>
        <View style={styles.tabsPills}>
          <TouchableOpacity
            style={[styles.pill, activeTab === "une" && styles.pillActive]}
            onPress={() => goToTab(0)}
          >
            <Text style={[styles.pillText, activeTab === "une" && styles.pillTextActive]}>
              À la une
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, activeTab === "articles" && styles.pillActive]}
            onPress={() => goToTab(1)}
          >
            <Text style={[styles.pillText, activeTab === "articles" && styles.pillTextActive]}>
              Tous les articles
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabStrip} {...swipe.panHandlers}>
        <Animated.View
          style={[styles.tabContent, { transform: [{ translateX: tabTx }] }]}
        >
          <FlatList
            style={{ width: W }}
            data={uneFeed}
            renderItem={renderItem}
            keyExtractor={(item, index) => {
              if (item.type === "article_pair") return `pair-${item.left.id}`;
              if (item.type === "hero") return `hero-${item.data.id}`;
              return `${item.type}-${index}`;
            }}
            showsVerticalScrollIndicator={false}
          />
          <FlatList
            style={{ width: W }}
            data={articlesFeed}
            renderItem={renderItem}
            keyExtractor={(item, index) => {
              if (item.type === "article") return `art-${item.data.id}`;
              if (item.type === "category_filter") return "cat-filter";
              return `${item.type}-${index}`;
            }}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      </View>
    </View>
  );
};
