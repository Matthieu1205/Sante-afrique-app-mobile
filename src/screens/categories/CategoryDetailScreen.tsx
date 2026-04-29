import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ListRenderItem,
} from 'react-native';
import { ArticleCard, SponsoredCard } from '@/components/common';
import type { Article, ArticleType, Category } from '@/components/common';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing } from '@/theme';

// Articles mock étoffés par rubrique
const ARTICLES_BY_CATEGORY: Record<string, Article[]> = {
  actualites: [
    { id: 'a1', title: "Paludisme en Afrique de l'Ouest : l'OMS déploie un nouveau protocole de traitement pour 2026", category: 'actualites', articleType: 'actualite', date: '25 avr. 2026', hasAudio: true },
    { id: 'a2', title: "Choléra au Sahel : bilan de l'épidémie et mesures d'urgence déployées par les gouvernements", category: 'actualites', articleType: 'actualite', date: '23 avr. 2026', hasAudio: false },
    { id: 'a3', title: "L'OMS alerte sur la progression du mpox en Afrique centrale", category: 'actualites', articleType: 'actualite', date: '20 avr. 2026', hasAudio: true },
    { id: 'a4', title: "Cancer du sein en Côte d'Ivoire : dépistage gratuit pour 10 000 femmes en 2026", category: 'actualites', articleType: 'actualite', date: '18 avr. 2026', hasAudio: false, isPremium: true },
    { id: 'a5', title: 'Hypertension artérielle : le mal silencieux qui touche 40% des adultes africains', category: 'actualites', articleType: 'debat', date: '15 avr. 2026', hasAudio: true },
  ],
  sante_maternelle: [
    { id: 'sm1', title: 'Dr Aminata Koné : "La mortalité maternelle reste notre priorité absolue en Afrique"', category: 'sante_maternelle', articleType: 'grand_entretien', date: '24 avr. 2026', hasAudio: true, isPremium: true },
    { id: 'sm2', title: "Accouchement sans risque : les sages-femmes communautaires changent la donne au Mali", category: 'sante_maternelle', articleType: 'dossier', date: '22 avr. 2026', hasAudio: false },
    { id: 'sm3', title: 'Allaitement maternel exclusif : pourquoi les taux restent faibles en Afrique urbaine', category: 'sante_maternelle', articleType: 'conseil_pratique', date: '19 avr. 2026', hasAudio: false },
    { id: 'sm4', title: 'Dépression post-partum : la face cachée de la maternité en Afrique subsaharienne', category: 'sante_maternelle', articleType: 'tribune', date: '16 avr. 2026', hasAudio: true },
    { id: 'sm5', title: "Fistule obstétricale : l'opération qui redonne une vie à 500 femmes par an au Cameroun", category: 'sante_maternelle', articleType: 'actualite', date: '12 avr. 2026', hasAudio: false, isPremium: true },
  ],
  vaccination: [
    { id: 'v1', title: "Vaccination HPV : révolution silencieuse contre le cancer du col en Côte d'Ivoire", category: 'vaccination', articleType: 'vaccination', date: '21 avr. 2026', hasAudio: true },
    { id: 'v2', title: 'ROR : pourquoi la rougeole repart à la hausse dans les zones de conflit africaines', category: 'vaccination', articleType: 'actualite', date: '18 avr. 2026', hasAudio: false },
    { id: 'v3', title: 'Calendrier vaccinal 2026 : ce que chaque parent africain doit savoir', category: 'vaccination', articleType: 'conseil_pratique', date: '15 avr. 2026', hasAudio: true },
    { id: 'v4', title: "Hésitation vaccinale en Afrique : comprendre pour mieux y répondre", category: 'vaccination', articleType: 'debat', date: '10 avr. 2026', hasAudio: false, isPremium: true },
  ],
  sante_mentale: [
    { id: 'men1', title: '"La santé mentale est le défi invisible de l\'Afrique moderne" — Dr Aminata Koné', category: 'sante_mentale', articleType: 'grand_entretien', date: '20 avr. 2026', hasAudio: true, isPremium: true },
    { id: 'men2', title: 'Burn-out des soignants en Afrique : une crise silencieuse et préoccupante', category: 'sante_mentale', articleType: 'dossier', date: '17 avr. 2026', hasAudio: false },
    { id: 'men3', title: 'Dépression et culpabilité culturelle : briser les tabous en famille africaine', category: 'sante_mentale', articleType: 'tribune', date: '14 avr. 2026', hasAudio: false },
    { id: 'men4', title: 'Accès aux soins psychiatriques en Afrique : 1 psychiatre pour 500 000 habitants', category: 'sante_mentale', articleType: 'debat', date: '10 avr. 2026', hasAudio: true, isPremium: true },
  ],
};

const FALLBACK_ARTICLES: Article[] = [
  { id: 'f1', title: "Santé en Afrique : les enjeux majeurs de 2026", category: 'actualites', articleType: 'actualite', date: '25 avr. 2026', hasAudio: true },
  { id: 'f2', title: "Couverture santé universelle : où en est l'Afrique ?", category: 'les_odd', articleType: 'dossier', date: '22 avr. 2026', hasAudio: false },
  { id: 'f3', title: "Les défis sanitaires des pays sahéliens en 2026", category: 'actualites', articleType: 'actualite', date: '18 avr. 2026', hasAudio: false },
  { id: 'f4', title: 'Innovation en santé : les startups africaines à suivre', category: 'business_sante', articleType: 'actualite', date: '14 avr. 2026', hasAudio: false, isPremium: true },
];

type FeedItem =
  | { type: 'article'; data: Article }
  | { type: 'sponsored' };

const ARTICLE_TYPE_FILTERS: { value: ArticleType | 'all'; label: string }[] = [
  { value: 'all', label: 'Tout' },
  { value: 'actualite', label: 'Actualités' },
  { value: 'grand_entretien', label: 'Entretien' },
  { value: 'dossier', label: 'Dossier' },
  { value: 'tribune', label: 'Tribune' },
  { value: 'conseil_pratique', label: 'Conseils' },
];

interface CategoryDetailScreenProps {
  category: Category;
  categoryTitle: string;
  onArticlePress: (articleId: string) => void;
  onBack: () => void;
}

export const CategoryDetailScreen: React.FC<CategoryDetailScreenProps> = ({
  category,
  categoryTitle,
  onArticlePress,
  onBack,
}) => {
  const [activeFilter, setActiveFilter] = useState<ArticleType | 'all'>('all');

  const rawArticles = ARTICLES_BY_CATEGORY[category] ?? FALLBACK_ARTICLES;

  const articles = useMemo(
    () =>
      activeFilter === 'all'
        ? rawArticles
        : rawArticles.filter((a) => a.articleType === activeFilter),
    [rawArticles, activeFilter],
  );

  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];
    articles.forEach((article, i) => {
      if (i > 0 && i % 5 === 0) items.push({ type: 'sponsored' });
      items.push({ type: 'article', data: article });
    });
    return items;
  }, [articles]);

  const renderItem: ListRenderItem<FeedItem> = ({ item }) => {
    if (item.type === 'sponsored') {
      return (
        <SponsoredCard
          title="Les solutions de santé digitale au service des populations africaines"
          sponsor="OMS Afrique"
        />
      );
    }
    return (
      <ArticleCard
        article={item.data}
        onPress={() => onArticlePress(item.data.id)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundCard} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {categoryTitle}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {/* Filtre type article */}
      <View style={styles.filterRow}>
        <FlatList
          data={ARTICLE_TYPE_FILTERS}
          keyExtractor={(item) => item.value}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item: filter }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === filter.value && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.value && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Feed */}
      {articles.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>Aucun article</Text>
          <Text style={styles.emptyText}>
            Aucun article ne correspond à ce filtre pour l'instant.
          </Text>
        </View>
      ) : (
        <FlatList
          data={feedItems}
          keyExtractor={(item, index) =>
            item.type === 'article' ? `art-${item.data.id}` : `sp-${index}`
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          style={styles.feed}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingTop: 52,
    paddingBottom: Spacing['3'],
    paddingHorizontal: Spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 36,
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: Colors.textPrimary,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  // Filtres
  filterRow: {
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterContent: {
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    gap: Spacing['2'],
  },
  filterChip: {
    paddingHorizontal: Spacing['3'],
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },

  feed: {
    flex: 1,
  },

  // État vide
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['3'],
    paddingHorizontal: Spacing['8'],
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: FontSize.base * 1.5,
  },
});
