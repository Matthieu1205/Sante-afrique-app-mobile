import type { Article, Category } from "@/components/common";
import {
  AppHeader,
  ArticleCard,
  CategoryBadge,
  RatingWidget,
  shouldShowRatingWidget,
  SponsoredCard,
} from "@/components/common";
import type { ThemeColors } from "@/contexts/ThemeContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { ApiArticle, ApiBanner, ApiVideo } from "@/services/api";
import {
  clearCache,
  fetchArticles,
  fetchBanners,
  fetchVideos,
  formatDate,
  getImageUrl,
} from "@/services/api";
import { Colors, FontFamily, FontSize, Radius, Spacing } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubeIframe from "react-native-youtube-iframe";

const { width: W } = Dimensions.get("window");
const GRID_PAD = Spacing["4"];
const GRID_GAP = Spacing["3"];
const CARD_W = (W - GRID_GAP - GRID_PAD * 2) / 2;

// ─── Config visuels par catégorie ────────────────────────────────

const CAT_CONFIG: Record<
  string,
  {
    bg: [string, string];
    icon: React.ComponentProps<typeof Feather>["name"];
    label: string;
  }
> = {
  actualites: {
    bg: ["#1F2937", "#111827"],
    icon: "file-text",
    label: "Actualités",
  },
  sante_mentale: {
    bg: ["#1E1B4B", "#0F0A2E"],
    icon: "activity",
    label: "Santé Mental",
  },
  vaccination: {
    bg: ["#0C4A6E", "#082F49"],
    icon: "thermometer",
    label: "Vaccination",
  },
  conseils_pratiques: {
    bg: ["#BADFFB", "#1B9DD9"],
    icon: "zap",
    label: "Conseils Pratiques",
  },
  dossier: { bg: ["#2E1065", "#1E0A4B"], icon: "clipboard", label: "Dossier" },
  one_health: {
    bg: ["#064E3B", "#022C22"],
    icon: "feather",
    label: "One Health",
  },
  nutrition_infantile: {
    bg: ["#78350F", "#451A03"],
    icon: "droplet",
    label: "Santé & Nutrition Infantile",
  },
  business_sante: {
    bg: ["#0A2540", "#041524"],
    icon: "briefcase",
    label: "Business Santé",
  },
  sante_maternelle: {
    bg: ["#7F1D1D", "#450A0A"],
    icon: "heart",
    label: "Santé Maternelle",
  },
  les_odd: { bg: ["#082F49", "#041C2C"], icon: "globe", label: "Les ODD" },
  equite_acces: {
    bg: ["#312E81", "#1E1B4B"],
    icon: "sliders",
    label: "Équité & Accès aux produits de santé",
  },
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

// L'API retourne des slugs avec tirets (sante-maternelle) mais CAT_CONFIG utilise des underscores
function normSlug(s: string | null | undefined): string {
  return (s ?? "actualites").replace(/-/g, "_");
}

function mapArticle(a: ApiArticle): Article {
  return {
    id: String(a.id),
    title: a.title,
    excerpt: a.excerpt,
    category: normSlug(a.category?.slug ?? a.category_name?.toLowerCase().replace(/\s+/g, "_")),
    date: formatDate(a.published_at),
    imageUrl: getImageUrl(a) ?? undefined,
  };
}

function mapHero(a: ApiArticle): HeroData {
  return {
    id: String(a.id),
    title: a.title,
    category: normSlug(a.category?.slug),
    hasAudio: false,
    imageUrl: getImageUrl(a) ?? undefined,
  };
}

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
  imageUrl?: string;
}

type FeedItem =
  | { type: "hero"; data: HeroData }
  | { type: "article_pair"; left: Article; right?: Article }
  | { type: "most_read" }
  | { type: "video_section" }
  | { type: "sponsored" }
  | { type: "rating" }
  | { type: "category_filter" }
  | { type: "article"; data: Article }
  | { type: "promo_banner" }
  | { type: "small_banner" };

// ─── Données mock ─────────────────────────────────────────────────

const MOCK_HERO: HeroData[] = [
  {
    id: "h1",
    title:
      "Paludisme 2026 : les nouvelles stratégies de l'OMS pour réduire la mortalité infantile en Afrique de l'Ouest",
    category: "actualites",
    articleType: "actualite",
    hasAudio: true,
  },
  {
    id: "h2",
    title:
      '"La santé mentale est le défi invisible de l\'Afrique moderne" — Dr Aminata Koné',
    category: "sante_mentale",
    articleType: "grand_entretien",
    hasAudio: true,
    isPremium: true,
  },
  {
    id: "h3",
    title:
      "Dossier : comment l'Afrique peut atteindre la couverture santé universelle d'ici 2030",
    category: "les_odd",
    articleType: "dossier_special",
  },
  {
    id: "h4",
    title:
      "Vaccination HPV : une révolution silencieuse contre le cancer du col en Côte d'Ivoire",
    category: "vaccination",
    articleType: "vaccination",
    hasAudio: true,
  },
];

const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    title:
      "Paludisme en Afrique de l'Ouest : l'OMS déploie un nouveau protocole",
    category: "actualites",
    articleType: "actualite",
    date: "25 avr.",
    hasAudio: true,
  },
  {
    id: "2",
    title:
      'Dr Aminata Koné : "La santé maternelle reste notre priorité absolue"',
    category: "sante_maternelle",
    articleType: "grand_entretien",
    date: "24 avr.",
    isPremium: true,
  },
  {
    id: "3",
    title:
      "Nutrition infantile : les aliments locaux africains surpassent les compléments importés",
    category: "nutrition_infantile",
    articleType: "dossier",
    date: "23 avr.",
  },
  {
    id: "4",
    title:
      "One Health : comment la santé des animaux impacte celle des humains au Sahel",
    category: "one_health",
    articleType: "one_health",
    date: "22 avr.",
  },
  {
    id: "5",
    title: "Vaccination HPV : un enjeu capital pour réduire le cancer du col",
    category: "vaccination",
    articleType: "vaccination",
    date: "21 avr.",
    hasAudio: true,
  },
  {
    id: "6",
    title: "Santé mentale : briser le tabou dans les communautés africaines",
    category: "sante_mentale",
    articleType: "tribune",
    date: "20 avr.",
    isPremium: true,
  },
  {
    id: "7",
    title: "Business Santé : les startups healthtech africaines lèvent 120M$",
    category: "business_sante",
    articleType: "actualite",
    date: "19 avr.",
  },
  {
    id: "8",
    title: "Les ODD santé : bilan à mi-parcours pour l'Afrique de l'Ouest",
    category: "les_odd",
    articleType: "dossier_special",
    date: "18 avr.",
  },
  {
    id: "9",
    title:
      "Équité d'accès : les médicaments essentiels hors de portée pour 40 % de la population",
    category: "equite_acces",
    articleType: "debat",
    date: "17 avr.",
    hasAudio: true,
    isPremium: true,
  },
  {
    id: "10",
    title: "Comment prévenir le choléra en saison des pluies",
    category: "conseils_pratiques",
    articleType: "conseil_pratique",
    date: "16 avr.",
    hasAudio: true,
  },
  {
    id: "11",
    title:
      "Diabète de type 2 : progression alarmante dans les villes africaines",
    category: "dossier",
    articleType: "dossier",
    date: "15 avr.",
  },
  {
    id: "12",
    title: "Allaitement maternel : clé d'un bon démarrage pour l'enfant",
    category: "sante_maternelle",
    articleType: "conseil_pratique",
    date: "14 avr.",
  },
];

const MOCK_PLUS_LUS: Article[] = [
  {
    id: "pl1",
    title: "Paludisme : 5 signes d'alerte à ne jamais ignorer",
    category: "actualites",
    date: "25 avr.",
    articleType: "conseil_pratique",
  },
  {
    id: "pl2",
    title: "HPV : tout ce que les mères doivent savoir sur le vaccin",
    category: "vaccination",
    date: "23 avr.",
    articleType: "vaccination",
  },
  {
    id: "pl3",
    title: "Dépression post-partum en Afrique : la face cachée de la maternité",
    category: "sante_mentale",
    date: "20 avr.",
    articleType: "dossier",
  },
  {
    id: "pl4",
    title:
      "Diabète et alimentation locale : conseils d'un nutritionniste de Dakar",
    category: "conseils_pratiques",
    date: "18 avr.",
    articleType: "conseil_pratique",
  },
  {
    id: "pl5",
    title: "L'hypertension artérielle, mal silencieux de l'Afrique moderne",
    category: "actualites",
    date: "15 avr.",
    articleType: "actualite",
  },
  {
    id: "pl6",
    title:
      "Mortalité maternelle : les progrès insuffisants de l'Afrique subsaharienne",
    category: "sante_maternelle",
    date: "12 avr.",
    articleType: "debat",
  },
  {
    id: "pl7",
    title: "Eau potable et santé infantile : comprendre le lien",
    category: "one_health",
    date: "10 avr.",
    articleType: "one_health",
  },
  {
    id: "pl8",
    title: "Tabagisme en Afrique : une épidémie qui progresse silencieusement",
    category: "actualites",
    date: "8 avr.",
    articleType: "actualite",
  },
  {
    id: "pl9",
    title: "Médicaments génériques : pourquoi ils restent sous-utilisés",
    category: "equite_acces",
    date: "5 avr.",
    articleType: "debat",
  },
];

// ─── Carte Hero (style JA) — dark visual design, theme-invariant ──

const JaHeroCard: React.FC<{ item: HeroData; onPress: () => void }> = ({
  item,
  onPress,
}) => {
  const cat = getCat(item.category);
  const badge = getBadge(item.articleType);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={heroS.wrapper}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={heroS.image}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={cat.bg}
          style={heroS.image}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name={cat.icon} size={64} color="rgba(255,255,255,0.35)" />
        </LinearGradient>
      )}

      <LinearGradient
        colors={["transparent", "#1B9DD9"]}
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
  image: {
    width: W,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
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
  badge: {
    alignSelf: "flex-start",
    width: 22,
    height: 22,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLetter: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 12,
    color: Colors.white,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xl,
    color: Colors.white,
    lineHeight: 28,
  },
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
  catLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: "rgba(255,255,255,0.75)",
  },
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
      {/* Image ou placeholder dégradé pleine hauteur */}
      {article.imageUrl ? (
        <Image
          source={{ uri: article.imageUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
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
      )}

      {/* Dégradé sombre en bas — titre par-dessus */}
      <LinearGradient
        colors={["transparent", "rgba(27,157,217,0.82)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={gridS.overlay}
      >
        <View style={[gridS.badge, { backgroundColor: badge.color }]}>
          <Text style={gridS.badgeLetter}>{badge.letter}</Text>
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
              <Feather
                name="volume-2"
                size={13}
                color="rgba(255,255,255,0.6)"
              />
            )}
            <Feather name="bookmark" size={13} color="rgba(255,255,255,0.6)" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const gridS = StyleSheet.create({
  card: { height: 240, overflow: "hidden", backgroundColor: "#111827" },
  emojiWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: Spacing["8"],
    paddingHorizontal: Spacing["2"],
    paddingBottom: Spacing["2"],
    gap: Spacing["1"],
  },
  badge: {
    alignSelf: "flex-start",
    width: 20,
    height: 20,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["1"],
  },
  badgeLetter: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 11,
    color: Colors.white,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: Colors.white,
    lineHeight: FontSize.base * 1.3,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing["1"],
  },
  catLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: "rgba(255,255,255,0.6)",
    flex: 1,
  },
  footerIcons: { flexDirection: "row", gap: Spacing["2"] },
});

// ─── Les plus lus ─────────────────────────────────────────────────

const makeMrStyles = (C: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: C.backgroundCard,
      borderTopWidth: 1,
      borderTopColor: C.borderLight,
      paddingVertical: Spacing["3"],
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing["4"],
      marginBottom: Spacing["3"],
      gap: Spacing["2"],
    },
    title: {
      fontFamily: FontFamily.headingBold,
      fontSize: FontSize.lg,
      color: C.textPrimary,
    },
    list: { paddingHorizontal: Spacing["4"], gap: Spacing["3"] },
    card: {
      width: 160,
      backgroundColor: C.background,
      borderRadius: Radius.md,
      overflow: "hidden",
    },
    cardImage: { width: 160, height: 90, backgroundColor: C.borderLight },
    cardBody: { padding: Spacing["3"], gap: Spacing["2"] },
    rank: {
      fontFamily: FontFamily.headingBold,
      fontSize: FontSize["2xl"],
      color: C.primaryUltraLight,
      letterSpacing: -1,
      lineHeight: FontSize["2xl"],
    },
    cardContent: { gap: Spacing["1"] },
    cardTitle: {
      fontFamily: FontFamily.headingSemiBold,
      fontSize: FontSize.sm,
      color: C.textPrimary,
      lineHeight: FontSize.sm * 1.4,
    },
    cardDate: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: C.textMuted,
    },
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
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={mrS.cardImage}
                resizeMode="cover"
              />
            ) : (
              <View style={mrS.cardImage} />
            )}
            <View style={mrS.cardBody}>
              <Text style={mrS.rank}>{index + 1}</Text>
              <View style={mrS.cardContent}>
                <CategoryBadge category={item.category} />
                <Text style={mrS.cardTitle} numberOfLines={3}>
                  {item.title}
                </Text>
                <Text style={mrS.cardDate}>{item.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// ─── Filtre catégories ────────────────────────────────────────────

const makeFilterStyles = (C: ThemeColors) =>
  StyleSheet.create({
    row: {
      backgroundColor: C.backgroundCard,
      borderBottomWidth: 1,
      borderBottomColor: C.borderLight,
    },
    content: {
      paddingHorizontal: Spacing["4"],
      paddingVertical: Spacing["3"],
      gap: Spacing["2"],
    },
    chip: {
      paddingHorizontal: Spacing["3"],
      paddingVertical: Spacing["2"],
      borderRadius: Radius.full,
      backgroundColor: C.background,
      borderWidth: 1,
      borderColor: C.border,
    },
    chipActive: { backgroundColor: C.primary, borderColor: C.primary },
    chipText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: C.textSecondary,
    },
    chipTextActive: { color: C.white },
  });

interface BannerSlide {
  id: string;
  tag: string;
  title: string;
  titleHighlight?: string;
  lines?: { prefix: string; highlight: string; highlightColor: string }[];
  button: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  colors: [string, string];
  darkText: boolean;
}

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: "magazine",
    tag: "Le magazine santé de référence en Afrique",
    title: "santé afrique",
    button: "Lire",
    icon: "book-open",
    colors: ["#0EA5E9", "#1B9DD9"],
    darkText: false,
  },
  {
    id: "n21",
    tag: "Édition spéciale · Oct 2025",
    title: "N°21\nDISPONIBLE",
    button: "Découvrir",
    icon: "book",
    colors: ["#1E3A5F", "#2D6A9F"],
    darkText: false,
  },
  {
    id: "bonneinfo",
    tag: "",
    title: "la ",
    titleHighlight: "bonne",
    lines: [
      { prefix: "les ", highlight: "bons", highlightColor: "#1B9DD9" },
      { prefix: "les ", highlight: "bons", highlightColor: "#1B9DD9" },
      { prefix: "les ", highlight: "bonnes", highlightColor: "#1B9DD9" },
      { prefix: "les ", highlight: "bons", highlightColor: "#F59E0B" },
    ],
    button: "Lire",
    icon: "info",
    colors: ["#F8FAFC", "#E2EEF7"],
    darkText: true,
  },
  {
    id: "cv",
    tag: "",
    title: "Votre ",
    titleHighlight: "CV",
    button: "Lire",
    icon: "file-text",
    colors: ["#F0F9FF", "#DBEAFE"],
    darkText: true,
  },
];

const BANNER_W = W - Spacing["4"] * 2;

function mapApiBanner(b: ApiBanner): BannerSlide {
  return {
    id:             String(b.id),
    tag:            b.tag ?? "",
    title:          b.title,
    titleHighlight: b.title_highlight ?? undefined,
    lines:          undefined,
    button:         b.button_text ?? b.cta_text ?? "Lire",
    icon:           "file-text",
    colors:         [b.color_start ?? "#1B9DD9", b.color_end ?? "#0C7EBA"] as [string, string],
    darkText:       b.dark_text ?? false,
  };
}

const PromoBannerCard: React.FC = () => {
  const listRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const indexRef = useRef(0);
  const [slides, setSlides] = useState<BannerSlide[]>(BANNER_SLIDES);

  useEffect(() => {
    fetchBanners().then((data) => {
      if (data && data.length > 0) setSlides(data.map(mapApiBanner));
    });
  }, []);

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, slides.length - 1));
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    indexRef.current = clamped;
    setActiveIndex(clamped);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((indexRef.current + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View
      style={{ marginVertical: Spacing["3"], paddingHorizontal: Spacing["4"] }}
    >
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_W);
          indexRef.current = idx;
          setActiveIndex(idx);
        }}
        renderItem={({ item: slide }) => (
          <LinearGradient
            colors={slide.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: BANNER_W,
              borderRadius: Radius.lg,
              overflow: "hidden",
              flexDirection: "row",
              alignItems: "center",
              minHeight: 140,
              paddingVertical: Spacing["4"],
              paddingLeft: Spacing["5"],
              paddingRight: Spacing["3"],
            }}
          >
            <View style={{ flex: 1 }}>
              {/* Tag */}
              {!!slide.tag && (
                <Text
                  style={{
                    fontFamily: FontFamily.body,
                    fontSize: FontSize.xs,
                    color: slide.darkText
                      ? "#64748B"
                      : "rgba(255,255,255,0.75)",
                    marginBottom: 6,
                  }}
                >
                  {slide.tag}
                </Text>
              )}

              {/* Titre principal avec highlight optionnel */}
              <Text
                style={{
                  fontFamily: FontFamily.headingBold,
                  fontSize: slide.id === "n21" ? FontSize["2xl"] : FontSize.xl,
                  color: slide.darkText ? "#0F172A" : "white",
                  lineHeight:
                    (slide.id === "n21" ? FontSize["2xl"] : FontSize.xl) * 1.2,
                }}
              >
                {slide.title}
                {slide.titleHighlight && (
                  <Text
                    style={{
                      color: slide.id === "cv" ? "#1B9DD9" : "#1B9DD9",
                      backgroundColor:
                        slide.id === "cv" ? "white" : "transparent",
                    }}
                  >
                    {slide.titleHighlight}
                  </Text>
                )}
                {slide.id === "bonneinfo" && (
                  <Text style={{ color: slide.darkText ? "#0F172A" : "white" }}>
                    {" "}
                    info
                  </Text>
                )}
                {slide.id === "cv" && (
                  <Text style={{ color: "#0F172A" }}>
                    {" "}
                    à jours{"\n"}pour les recruteurs
                  </Text>
                )}
              </Text>

              {/* Lignes "les bons…" pour slide 3 */}
              {slide.lines && (
                <View style={{ marginTop: 6, gap: 2 }}>
                  {[
                    { suffix: "conseils" },
                    { suffix: "réflexes" },
                    { suffix: "habitudes" },
                    { suffix: "gestes" },
                  ].map((l, i) => (
                    <Text
                      key={i}
                      style={{
                        fontFamily: FontFamily.bodySemiBold,
                        fontSize: FontSize.sm,
                        color: "#334155",
                      }}
                    >
                      {"les "}
                      <Text
                        style={{
                          color: slide.lines![i].highlightColor,
                          fontFamily: FontFamily.headingBold,
                        }}
                      >
                        {slide.lines![i].highlight}
                      </Text>
                      {" " + l.suffix}
                    </Text>
                  ))}
                </View>
              )}

              {/* Bouton */}
              <TouchableOpacity
                style={{
                  marginTop: Spacing["3"],
                  backgroundColor: slide.darkText
                    ? "#1B9DD9"
                    : "rgba(255,255,255,0.22)",
                  borderRadius: Radius.sm,
                  paddingHorizontal: Spacing["4"],
                  paddingVertical: Spacing["2"],
                  alignSelf: "flex-start",
                  borderWidth: slide.darkText ? 0 : 1,
                  borderColor: "rgba(255,255,255,0.45)",
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontFamily: FontFamily.headingBold,
                    fontSize: FontSize.sm,
                    color: "white",
                  }}
                >
                  {slide.button}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Icône droite */}
            <View
              style={{
                width: 85,
                height: 95,
                backgroundColor: slide.darkText
                  ? "rgba(27,157,217,0.12)"
                  : "rgba(255,255,255,0.15)",
                borderRadius: Radius.md,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: Spacing["2"],
              }}
            >
              <Feather
                name={slide.icon}
                size={30}
                color={slide.darkText ? "#1B9DD9" : "white"}
                style={{ opacity: 0.9 }}
              />
              {[60, 48, 54].map((w, i) => (
                <View
                  key={i}
                  style={{
                    width: w,
                    height: 3,
                    backgroundColor: slide.darkText
                      ? `rgba(27,157,217,${i === 0 ? 0.5 : 0.25})`
                      : `rgba(255,255,255,${i === 0 ? 0.6 : 0.35})`,
                    borderRadius: 2,
                    marginTop: i === 0 ? 10 : 5,
                  }}
                />
              ))}
            </View>
          </LinearGradient>
        )}
      />

      {/* Flèche gauche */}
      {activeIndex > 0 && (
        <TouchableOpacity
          onPress={() => goTo(activeIndex - 1)}
          style={{
            position: "absolute",
            left: Spacing["4"] + Spacing["2"],
            top: "50%",
            marginTop: -18,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(0,0,0,0.35)",
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.8}
        >
          <Feather name="chevron-left" size={18} color="white" />
        </TouchableOpacity>
      )}

      {/* Flèche droite */}
      {activeIndex < slides.length - 1 && (
        <TouchableOpacity
          onPress={() => goTo(activeIndex + 1)}
          style={{
            position: "absolute",
            right: Spacing["4"] + Spacing["2"],
            top: "50%",
            marginTop: -18,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(0,0,0,0.35)",
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.8}
        >
          <Feather name="chevron-right" size={18} color="white" />
        </TouchableOpacity>
      )}

      {/* Points indicateurs */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 6,
          marginTop: Spacing["2"],
        }}
      >
        {slides.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(i)}>
            <View
              style={{
                width: i === activeIndex ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  i === activeIndex ? Colors.primary : Colors.primaryLight,
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ─── Petit banner publicitaire ────────────────────────────────────

const SmallAdBanner: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View
      style={{ marginHorizontal: Spacing["4"], marginVertical: Spacing["3"] }}
    >
      <Text
        style={{
          fontFamily: FontFamily.body,
          fontSize: 9,
          color: colors.textDisabled,
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        Publicité
      </Text>
      <LinearGradient
        colors={["#1B9DD9", "#0C7EBA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: Radius.md,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: Spacing["4"],
          paddingVertical: Spacing["3"],
          gap: Spacing["3"],
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: Radius.sm,
            backgroundColor: "rgba(255,255,255,0.18)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="activity" size={22} color="white" />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              fontFamily: FontFamily.headingBold,
              fontSize: FontSize.base,
              color: "white",
            }}
          >
            PharmaConsults
          </Text>
          <Text
            style={{
              fontFamily: FontFamily.body,
              fontSize: FontSize.sm,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            Consultez un professionnel de santé
          </Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: Radius.sm,
            paddingHorizontal: Spacing["3"],
            paddingVertical: Spacing["2"],
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.4)",
          }}
          activeOpacity={0.8}
        >
          <Text
            style={{
              fontFamily: FontFamily.headingBold,
              fontSize: FontSize.xs,
              color: "white",
            }}
          >
            Voir
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

// ─── Section vidéos YouTube ───────────────────────────────────────

const VIDEO_CARD_W = 200;
const VIDEO_CARD_H = 112;
const PLAYER_H = (W - Spacing["4"] * 2) * (9 / 16);

const VideoSection: React.FC<{ videos: ApiVideo[] }> = ({ videos }) => {
  const { colors } = useTheme();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState("");

  if (videos.length === 0) return null;

  return (
    <View style={{ marginTop: Spacing["4"] }}>
      {/* ── Lecteur modal ── */}
      <Modal
        visible={activeId !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setActiveId(null)}
      >
        <StatusBar
          backgroundColor="rgba(0,0,0,0.92)"
          barStyle="light-content"
        />
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.92)",
            justifyContent: "center",
          }}
          onPress={() => setActiveId(null)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Titre + bouton fermer */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: Spacing["4"],
                paddingBottom: Spacing["3"],
              }}
            >
              <Text
                numberOfLines={2}
                style={{
                  flex: 1,
                  fontFamily: FontFamily.bodySemiBold,
                  fontSize: FontSize.sm,
                  color: "#fff",
                  marginRight: Spacing["3"],
                }}
              >
                {activeTitle}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveId(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="x" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Lecteur YouTube */}
            <View
              style={{
                marginHorizontal: Spacing["4"],
                borderRadius: Radius.md,
                overflow: "hidden",
                height: PLAYER_H,
                backgroundColor: "#000",
              }}
            >
              {activeId !== null && (
                <YoutubeIframe
                  videoId={activeId}
                  height={PLAYER_H}
                  width={W - Spacing["4"] * 2}
                  play
                  webViewProps={{
                    allowsInlineMediaPlayback: true,
                    mediaPlaybackRequiresUserAction: false,
                  }}
                />
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Titre section ── */}
      <Text
        style={{
          fontFamily: FontFamily.headingBold,
          fontSize: FontSize.base,
          color: colors.textPrimary,
          marginHorizontal: Spacing["4"],
          marginBottom: Spacing["3"],
        }}
      >
        Nos vidéos
      </Text>

      {/* ── Cartes horizontales ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Spacing["4"],
          gap: Spacing["3"],
        }}
      >
        {videos.map((v) => {
          const thumb = `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`;
          return (
            <TouchableOpacity
              key={v.id}
              activeOpacity={0.85}
              onPress={() => {
                setActiveId(v.youtube_id);
                setActiveTitle(v.title);
              }}
              style={{ width: VIDEO_CARD_W }}
            >
              <View
                style={{
                  width: VIDEO_CARD_W,
                  height: VIDEO_CARD_H,
                  borderRadius: Radius.md,
                  overflow: "hidden",
                  backgroundColor: "#1C1C1E",
                }}
              >
                <Image
                  source={{ uri: thumb }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.25)",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "rgba(255,255,255,0.92)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Feather
                      name="play"
                      size={18}
                      color="#1C1C1E"
                      style={{ marginLeft: 3 }}
                    />
                  </View>
                </View>
              </View>
              <Text
                numberOfLines={2}
                style={{
                  fontFamily: FontFamily.bodySemiBold,
                  fontSize: FontSize.xs,
                  color: colors.textPrimary,
                  marginTop: 6,
                  lineHeight: 16,
                }}
              >
                {v.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const CategoryFilter: React.FC<{
  options: { slug: string; name: string }[];
  selected: string | null;
  onSelect: (cat: string | null) => void;
}> = ({ options, selected, onSelect }) => {
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
      {options.map(({ slug, name }) => (
        <TouchableOpacity
          key={slug}
          style={[filterS.chip, selected === slug && filterS.chipActive]}
          onPress={() => onSelect(slug)}
        >
          <Text
            style={[
              filterS.chipText,
              selected === slug && filterS.chipTextActive,
            ]}
          >
            {name}
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
  notificationCount?: number;
}

const makeStyles = (C: ThemeColors) =>
  StyleSheet.create({
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
    pill: {
      flex: 1,
      alignItems: "center",
      paddingVertical: Spacing["2"],
      borderRadius: Radius.full,
    },
    pillActive: { backgroundColor: C.primary },
    pillText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: C.textMuted,
    },
    pillTextActive: { color: C.white },
    tabStrip: { flex: 1, overflow: "hidden" },
    tabContent: { flexDirection: "row", width: W * 2, flex: 1 },
    pair: {
      flexDirection: "row",
      gap: GRID_GAP,
      backgroundColor: "transparent",
      paddingHorizontal: GRID_PAD,
      marginBottom: Spacing["2"],
    },
  });

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onArticlePress,
  onSearchPress,
  onNotificationPress,
  notificationCount = 0,
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [activeTab, setActiveTab] = useState<"une" | "articles">("une");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<
    { slug: string; name: string }[]
  >([]);
  const [articlesRead, setArticlesRead] = useState(0);
  const [ratingDismissed, setRatingDismissed] = useState(false);
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [heroArticles, setHeroArticles] = useState<HeroData[]>(MOCK_HERO);
  const [mostReadArticles, setMostReadArticles] =
    useState<Article[]>(MOCK_PLUS_LUS);
  const [videos, setVideos] = useState<ApiVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Vide le cache au 1er montage pour forcer le chargement des données fraîches
  useEffect(() => {
    clearCache();
  }, []);

  useEffect(() => {
    fetchVideos().then((data) => setVideos(data));
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchArticles(1).then((res) => {
      if (!mounted || !res?.data?.length) {
        setLoading(false);
        return;
      }
      const all = res.data;
      const featured = all.filter((a) => a.featured);
      const heroSrc = (featured.length > 0 ? featured : all).slice(0, 5);
      const mapped = all.map(mapArticle);
      const mostRead = [...all]
        .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
        .slice(0, 9)
        .map(mapArticle);

      // Catégories uniques extraites des vrais articles (slug + nom affiché)
      const seen = new Set<string>();
      const cats: { slug: string; name: string }[] = [];
      for (const a of all) {
        const slug = a.category?.slug;
        const name = a.category?.name ?? a.category_name;
        if (slug && name && !seen.has(slug)) {
          seen.add(slug);
          cats.push({ slug, name });
        }
      }

      setHeroArticles(heroSrc.map(mapHero));
      setArticles(mapped);
      setMostReadArticles(mostRead);
      setCategoryOptions(cats);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const tabIndexRef = useRef(0);
  const tabTx = useRef(new Animated.Value(0)).current;

  const goToTab = useCallback(
    (idx: number) => {
      tabIndexRef.current = idx;
      setActiveTab(idx === 0 ? "une" : "articles");
      Animated.spring(tabTx, {
        toValue: -idx * W,
        useNativeDriver: false,
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
        ? articles.filter((a) => a.category === selectedCategory)
        : articles,
    [selectedCategory, articles],
  );

  const showRating = !ratingDismissed && shouldShowRatingWidget(articlesRead);

  const uneFeed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [
      { type: "promo_banner" },
      { type: "small_banner" },
    ];

    const heroIds = new Set(heroArticles.map((h) => h.id));

    const heroGridArticles = heroArticles.map(
      (h) =>
        ({
          id: h.id,
          title: h.title,
          category: h.category as Category,
          articleType: h.articleType,
          date: "",
          hasAudio: h.hasAudio,
          isPremium: h.isPremium,
          imageUrl: h.imageUrl,
        }) as Article,
    );

    const gridArticles = [
      ...heroGridArticles,
      ...articles.filter((a) => !heroIds.has(a.id)),
    ];

    let pairCount = 0;
    for (let i = 0; i < gridArticles.length; i += 2) {
      if (pairCount === 2) {
        items.push({ type: "most_read" });
        items.push({ type: "video_section" });
      } else if (pairCount > 0 && pairCount % 2 === 0)
        items.push({ type: "small_banner" });
      if (pairCount === 3 && showRating) items.push({ type: "rating" });
      items.push({
        type: "article_pair",
        left: gridArticles[i],
        right: gridArticles[i + 1],
      });
      pairCount++;
    }
    return items;
  }, [showRating, heroArticles, articles]);

  const articlesFeed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [{ type: "category_filter" }];
    filteredArticles.forEach((article, i) => {
      if (i > 0 && i % 4 === 0) items.push({ type: "small_banner" });
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
              articles={mostReadArticles}
              onPress={handleArticlePress}
            />
          );

        case "video_section":
          return <VideoSection videos={videos} />;

        case "sponsored":
          return (
            <SponsoredCard
              title="Les solutions de santé digitale au service des populations africaines"
              sponsor="OMS Afrique"
            />
          );

        case "small_banner":
          return <SmallAdBanner />;

        case "promo_banner":
          return <PromoBannerCard />;

        case "rating":
          return <RatingWidget onDismiss={() => setRatingDismissed(true)} />;

        case "category_filter":
          return (
            <CategoryFilter
              options={categoryOptions}
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
    [
      handleArticlePress,
      selectedCategory,
      styles.pair,
      mostReadArticles,
      videos,
    ],
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        onSearchPress={onSearchPress}
        onNotificationPress={onNotificationPress}
        notificationCount={notificationCount}
      />

      <View style={styles.tabsBar}>
        <View style={styles.tabsPills}>
          <TouchableOpacity
            style={[styles.pill, activeTab === "une" && styles.pillActive]}
            onPress={() => goToTab(0)}
          >
            <Text
              style={[
                styles.pillText,
                activeTab === "une" && styles.pillTextActive,
              ]}
            >
              À la une
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, activeTab === "articles" && styles.pillActive]}
            onPress={() => goToTab(1)}
          >
            <Text
              style={[
                styles.pillText,
                activeTab === "articles" && styles.pillTextActive,
              ]}
            >
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
              if (item.type === "article_pair")
                return `pair-${index}-${item.left.id}`;
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
