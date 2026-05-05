import type { Article } from "@/components/common";
import { ArticleCard, ArticleTypeBadge, CategoryBadge } from "@/components/common";
import { FontFamily, FontSize, Radius, Spacing } from "@/theme";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemeColors } from "@/contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_WIDTH * 0.58;

interface ArticleDetail extends Article {
  author: string;
  readingTime: number;
  content: string[];
  tags: string[];
}

const MOCK_DETAIL: ArticleDetail = {
  id: "h1",
  title: "Paludisme 2026 : les nouvelles stratégies de l'OMS pour réduire la mortalité infantile en Afrique",
  category: "actualites",
  articleType: "actualite",
  date: "25 avr. 2026",
  hasAudio: true,
  isPremium: false,
  author: "Dr Ibrahim Coulibaly",
  readingTime: 4,
  content: [
    "Le paludisme demeure l'une des maladies infectieuses les plus meurtrières en Afrique subsaharienne. Selon le dernier rapport de l'Organisation mondiale de la Santé (OMS), la région enregistre chaque année plus de 200 millions de cas, dont la grande majorité concerne des enfants de moins de cinq ans.",
    "En 2026, l'OMS a déployé un nouveau protocole de traitement basé sur la combinaison thérapeutique à base d'artémisinine (CTA) de deuxième génération, montrant une efficacité accrue contre les souches résistantes identifiées en Afrique de l'Ouest.",
    '"Nous observons une résistance croissante aux traitements conventionnels dans plusieurs zones du Burkina Faso et du Mali", a déclaré le Dr Ibrahim Coulibaly, épidémiologiste à l\'Institut National de Santé Publique d\'Abidjan. "Cette nouvelle combinaison offre un espoir réel pour les populations les plus vulnérables."',
    "Le programme inclut également un volet préventif majeur : distribution de moustiquaires imprégnées d'insecticide de longue durée (MIILD), pulvérisations intradomiciliaires à grande échelle, et sensibilisation communautaire en langues locales.",
    "Les résultats préliminaires dans les zones pilotes de Côte d'Ivoire et du Sénégal montrent une réduction de 34 % des hospitalisations pédiatriques liées au paludisme sur les six premiers mois d'application du protocole.",
    "Cette initiative s'inscrit dans le cadre du plan stratégique mondial de l'OMS contre le paludisme (2021-2030), qui vise une réduction d'au moins 90 % de l'incidence et de la mortalité d'ici la fin de la décennie. Un objectif ambitieux, mais selon les experts, atteignable à condition d'un financement pérenne et d'une volonté politique affirmée des gouvernements africains.",
  ],
  tags: ["#paludisme", "#OMS", "#AfriqueOuest", "#santé2026", "#pédiatrie"],
};

const RELATED_ARTICLES: Article[] = [
  { id: "r1", title: "Choléra au Sahel : les mesures d'urgence qui sauvent des vies", category: "actualites", articleType: "actualite", date: "23 avr.", hasAudio: false },
  { id: "r2", title: "Vaccination anti-paludique RTS,S : bilan après 2 ans de déploiement", category: "vaccination", articleType: "vaccination", date: "18 avr.", hasAudio: true },
  { id: "r3", title: "Moustiquaires MIILD : l'enjeu de la distribution au dernier kilomètre", category: "conseils_pratiques", articleType: "conseil_pratique", date: "14 avr.", hasAudio: false },
];

const makeAudioStyles = (C: ThemeColors) => StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.primaryUltraLight,
    borderRadius: Radius.md,
    padding: Spacing["3"],
    gap: Spacing["3"],
    marginHorizontal: Spacing["4"],
    marginBottom: Spacing["4"],
  },
  info: { flex: 1 },
  label: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: C.primaryDark },
  duration: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: C.primaryLight,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: C.primary },
});

const AudioBar: React.FC = () => {
  const { colors } = useTheme();
  const audioStyles = makeAudioStyles(colors);
  const [playing, setPlaying] = useState(false);
  return (
    <TouchableOpacity style={audioStyles.bar} onPress={() => setPlaying((p) => !p)} activeOpacity={0.85}>
      <Feather name={playing ? "pause" : "play"} size={22} color={colors.primaryDark} />
      <View style={audioStyles.info}>
        <Text style={audioStyles.label}>Écouter l'article</Text>
        <Text style={audioStyles.duration}>4 min 32</Text>
      </View>
      <View style={audioStyles.progressTrack}>
        <View style={[audioStyles.progressFill, { width: playing ? "30%" : "0%" }]} />
      </View>
    </TouchableOpacity>
  );
};

interface ArticleDetailScreenProps {
  article?: ArticleDetail;
  onBack: () => void;
  onShare?: () => void;
  onArticlePress?: (articleId: string) => void;
}

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.backgroundCard },
  navBar: {
    position: "absolute",
    top: 44,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing["4"],
    zIndex: 10,
  },
  navRight: { flexDirection: "row", gap: Spacing["2"] },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  heroPlaceholder: { width: SCREEN_WIDTH, height: HERO_HEIGHT, backgroundColor: C.backgroundNavy, alignItems: "center", justifyContent: "center" },
  heroPlaceholderText: { fontSize: 48, opacity: 0.3 },
  articleBody: { paddingHorizontal: Spacing["4"], paddingTop: Spacing["4"], gap: Spacing["3"] },
  title: { fontFamily: FontFamily.headingBold, fontSize: FontSize["2xl"], color: C.textPrimary, lineHeight: FontSize["2xl"] * 1.25, letterSpacing: -0.3 },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 },
  metaSep: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textDisabled },
  metaText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted },
  authorRow: { flexDirection: "row", alignItems: "center", gap: Spacing["2"] },
  authorAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.primaryUltraLight, alignItems: "center", justifyContent: "center" },
  authorAvatarText: { fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: C.primary },
  authorName: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: C.textSecondary },
  separator: { height: 1, backgroundColor: C.borderLight, marginVertical: Spacing["2"] },
  paragraph: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: C.textSecondary, lineHeight: FontSize.md * 1.7 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: Spacing["2"], paddingBottom: Spacing["2"] },
  tag: { backgroundColor: C.background, borderRadius: Radius.sm, paddingHorizontal: Spacing["2"], paddingVertical: 4, borderWidth: 1, borderColor: C.border },
  tagText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted },
  relatedSection: { marginTop: Spacing["4"], borderTopWidth: 4, borderTopColor: C.background },
  relatedTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: C.textPrimary, paddingHorizontal: Spacing["4"], paddingVertical: Spacing["3"] },
});

export const ArticleDetailScreen: React.FC<ArticleDetailScreenProps> = ({
  article = MOCK_DETAIL,
  onBack,
  onShare,
  onArticlePress,
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.navBtn} onPress={onShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="share-2" size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => setBookmarked((b) => !b)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="bookmark" size={22} color={bookmarked ? colors.primary : colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroPlaceholder}>
          <Text style={styles.heroPlaceholderText}></Text>
        </View>

        <View style={styles.articleBody}>
          {article.articleType && <ArticleTypeBadge type={article.articleType} />}
          <Text style={styles.title}>{article.title}</Text>

          <View style={styles.meta}>
            <CategoryBadge category={article.category} />
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.metaText}>{article.date}</Text>
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.metaText}>{article.readingTime} min de lecture</Text>
          </View>

          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>{article.author.charAt(0)}</Text>
            </View>
            <Text style={styles.authorName}>Par {article.author}</Text>
          </View>

          <View style={styles.separator} />

          {article.hasAudio && <AudioBar />}

          {article.content.map((paragraph, i) => (
            <Text key={i} style={styles.paragraph}>{paragraph}</Text>
          ))}

          <View style={styles.separator} />

          <View style={styles.tags}>
            {article.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Articles similaires</Text>
          {RELATED_ARTICLES.map((rel) => (
            <ArticleCard key={rel.id} article={rel} onPress={() => onArticlePress?.(rel.id)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
