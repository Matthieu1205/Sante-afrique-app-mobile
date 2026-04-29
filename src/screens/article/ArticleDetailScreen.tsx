import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { ArticleCard, CategoryBadge, ArticleTypeBadge } from '@/components/common';
import type { Article } from '@/components/common';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_WIDTH * 0.58;

// ─── Article mock complet ─────────────────────────────────────────
interface ArticleDetail extends Article {
  author: string;
  readingTime: number; // minutes
  content: string[];  // paragraphes
  tags: string[];
}

const MOCK_DETAIL: ArticleDetail = {
  id: 'h1',
  title: "Paludisme 2026 : les nouvelles stratégies de l'OMS pour réduire la mortalité infantile en Afrique",
  category: 'actualites',
  articleType: 'actualite',
  date: '25 avr. 2026',
  hasAudio: true,
  isPremium: false,
  author: 'Dr Ibrahim Coulibaly',
  readingTime: 4,
  content: [
    "Le paludisme demeure l'une des maladies infectieuses les plus meurtrières en Afrique subsaharienne. Selon le dernier rapport de l'Organisation mondiale de la Santé (OMS), la région enregistre chaque année plus de 200 millions de cas, dont la grande majorité concerne des enfants de moins de cinq ans.",
    "En 2026, l'OMS a déployé un nouveau protocole de traitement basé sur la combinaison thérapeutique à base d'artémisinine (CTA) de deuxième génération, montrant une efficacité accrue contre les souches résistantes identifiées en Afrique de l'Ouest.",
    "\"Nous observons une résistance croissante aux traitements conventionnels dans plusieurs zones du Burkina Faso et du Mali\", a déclaré le Dr Ibrahim Coulibaly, épidémiologiste à l'Institut National de Santé Publique d'Abidjan. \"Cette nouvelle combinaison offre un espoir réel pour les populations les plus vulnérables.\"",
    "Le programme inclut également un volet préventif majeur : distribution de moustiquaires imprégnées d'insecticide de longue durée (MIILD), pulvérisations intradomiciliaires à grande échelle, et sensibilisation communautaire en langues locales.",
    "Les résultats préliminaires dans les zones pilotes de Côte d'Ivoire et du Sénégal montrent une réduction de 34 % des hospitalisations pédiatriques liées au paludisme sur les six premiers mois d'application du protocole.",
    "Cette initiative s'inscrit dans le cadre du plan stratégique mondial de l'OMS contre le paludisme (2021-2030), qui vise une réduction d'au moins 90 % de l'incidence et de la mortalité d'ici la fin de la décennie. Un objectif ambitieux, mais selon les experts, atteignable à condition d'un financement pérenne et d'une volonté politique affirmée des gouvernements africains.",
  ],
  tags: ['#paludisme', '#OMS', '#AfriqueOuest', '#santé2026', '#pédiatrie'],
};

const RELATED_ARTICLES: Article[] = [
  { id: 'r1', title: 'Choléra au Sahel : les mesures d\'urgence qui sauvent des vies', category: 'actualites', articleType: 'actualite', date: '23 avr.', hasAudio: false },
  { id: 'r2', title: 'Vaccination anti-paludique RTS,S : bilan après 2 ans de déploiement', category: 'vaccination', articleType: 'vaccination', date: '18 avr.', hasAudio: true },
  { id: 'r3', title: "Moustiquaires MIILD : l'enjeu de la distribution au dernier kilomètre", category: 'conseils_pratiques', articleType: 'conseil_pratique', date: '14 avr.', hasAudio: false },
];

// ─── Sous-composant : barre audio ────────────────────────────────

const AudioBar: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  return (
    <TouchableOpacity
      style={audioStyles.bar}
      onPress={() => setPlaying((p) => !p)}
      activeOpacity={0.85}
    >
      <Feather name={playing ? 'pause' : 'play'} size={22} color={Colors.primaryDark} />
      <View style={audioStyles.info}>
        <Text style={audioStyles.label}>Écouter l'article</Text>
        <Text style={audioStyles.duration}>4 min 32</Text>
      </View>
      <View style={audioStyles.progressTrack}>
        <View style={[audioStyles.progressFill, { width: playing ? '30%' : '0%' }]} />
      </View>
    </TouchableOpacity>
  );
};

const audioStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryUltraLight,
    borderRadius: Radius.md,
    padding: Spacing['3'],
    gap: Spacing['3'],
    marginHorizontal: Spacing['4'],
    marginBottom: Spacing['4'],
  },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.primaryDark,
  },
  duration: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primaryLight,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
});

// ─── Écran principal ──────────────────────────────────────────────

interface ArticleDetailScreenProps {
  article?: ArticleDetail;
  onBack: () => void;
  onShare?: () => void;
  onArticlePress?: (articleId: string) => void;
}

export const ArticleDetailScreen: React.FC<ArticleDetailScreenProps> = ({
  article = MOCK_DETAIL,
  onBack,
  onShare,
  onArticlePress,
}) => {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* NavBar fixe au-dessus du scroll */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.navRight}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={onShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="share-2" size={22} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setBookmarked((b) => !b)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="bookmark" size={22} color={bookmarked ? Colors.primary : Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image héro */}
        <View style={styles.heroPlaceholder}>
          <Text style={styles.heroPlaceholderText}>📸</Text>
        </View>

        {/* Contenu de l'article */}
        <View style={styles.articleBody}>
          {/* Badge type */}
          {article.articleType && (
            <ArticleTypeBadge type={article.articleType} />
          )}

          {/* Titre */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Méta */}
          <View style={styles.meta}>
            <CategoryBadge category={article.category} />
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.metaText}>{article.date}</Text>
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.metaText}>{article.readingTime} min de lecture</Text>
          </View>

          {/* Auteur */}
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>
                {article.author.charAt(0)}
              </Text>
            </View>
            <Text style={styles.authorName}>Par {article.author}</Text>
          </View>

          <View style={styles.separator} />

          {/* Audio player */}
          {article.hasAudio && <AudioBar />}

          {/* Corps de l'article */}
          {article.content.map((paragraph, i) => (
            <Text key={i} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}

          <View style={styles.separator} />

          {/* Tags */}
          <View style={styles.tags}>
            {article.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Articles similaires */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Articles similaires</Text>
          {RELATED_ARTICLES.map((rel) => (
            <ArticleCard
              key={rel.id}
              article={rel}
              onPress={() => onArticlePress?.(rel.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
  },

  // NavBar
  navBar: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    zIndex: 10,
  },
  navRight: {
    flexDirection: 'row',
    gap: Spacing['2'],
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 16,
    color: Colors.white,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  // Hero image
  heroPlaceholder: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    backgroundColor: Colors.backgroundNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderText: {
    fontSize: 48,
    opacity: 0.3,
  },

  // Corps
  articleBody: {
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['4'],
    gap: Spacing['3'],
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    lineHeight: FontSize['2xl'] * 1.25,
    letterSpacing: -0.3,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  metaSep: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textDisabled,
  },
  metaText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
  authorName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing['2'],
  },
  paragraph: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: FontSize.md * 1.7,
  },

  // Tags
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing['2'],
    paddingBottom: Spacing['2'],
  },
  tag: {
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing['2'],
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },

  // Articles similaires
  relatedSection: {
    marginTop: Spacing['4'],
    borderTopWidth: 4,
    borderTopColor: Colors.background,
  },
  relatedTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
  },
});
