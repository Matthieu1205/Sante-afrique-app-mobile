import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ListRenderItem,
  ActivityIndicator,
} from 'react-native';
import { ArticleCard, SponsoredCard } from '@/components/common';
import type { Article, Category } from '@/components/common';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';
import { fetchArticlesByRubrique, formatDate, getImageUrl, resolveRubriqueSlug } from '@/services/api';
import type { ApiArticle } from '@/services/api';

const norm = (s: string) => s.toLowerCase().replace(/-/g, '_');

function mapArticle(a: ApiArticle): Article {
  return {
    id: String(a.id),
    title: a.title,
    excerpt: a.excerpt,
    category: norm(a.category?.slug ?? a.category_name?.toLowerCase().replace(/\s+/g, '_') ?? 'actualites'),
    date: formatDate(a.published_at),
    imageUrl: getImageUrl(a) ?? undefined,
  };
}

type FeedItem = { type: 'article'; data: Article } | { type: 'sponsored' };

interface CategoryDetailScreenProps {
  category: Category;
  categoryTitle: string;
  onArticlePress: (articleId: string) => void;
  onBack: () => void;
}

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  container:       { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.backgroundCard,
    paddingTop: 52,
    paddingBottom: Spacing['3'],
    paddingHorizontal: Spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  backBtn:          { width: 36, alignItems: 'center' },
  headerTitle:      { flex: 1, fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: C.textPrimary, textAlign: 'center' },
  feed:             { flex: 1 },
  emptyState:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing['3'], paddingHorizontal: Spacing['8'] },
  emptyEmoji:       { fontSize: 48 },
  emptyTitle:       { fontFamily: FontFamily.headingBold, fontSize: FontSize.xl, color: C.textPrimary },
  emptyText:        { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textMuted, textAlign: 'center', lineHeight: FontSize.base * 1.5 },
  footer:           { paddingVertical: Spacing['4'], alignItems: 'center' },
});

export const CategoryDetailScreen: React.FC<CategoryDetailScreenProps> = ({
  category,
  categoryTitle,
  onArticlePress,
  onBack,
}) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [rawArticles, setRawArticles]   = useState<Article[]>([]);
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [hasMore, setHasMore]           = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);

  // Vrai slug API résolu une fois par rubrique
  const realSlugRef = useRef('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setRawArticles([]);
    setCurrentPage(1);
    setHasMore(false);

    async function fetchFirst() {
      const slug = resolveRubriqueSlug(category);
      realSlugRef.current = slug;
      // Rubrique pas encore disponible dans l'API
      if (!slug) { setLoading(false); return; }
      const res = await fetchArticlesByRubrique(slug.replace(/-/g, '_'), 1);
      if (!mounted) return;
      if (res?.data?.length) {
        const target = norm(slug);
        // Filtre strict : on n'affiche QUE les articles de cette rubrique
        const matched = res.data.filter(a => norm(a.category?.slug ?? '') === target);
        setRawArticles(matched.map(mapArticle));
        setHasMore((res.current_page ?? 1) < (res.last_page ?? 1));
        setCurrentPage(1);
      }
      setLoading(false);
    }

    fetchFirst();
    return () => { mounted = false; };
  }, [category, categoryTitle]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !realSlugRef.current) return;
    setLoadingMore(true);
    const next = currentPage + 1;
    const res = await fetchArticlesByRubrique(realSlugRef.current.replace(/-/g, '_'), next);
    if (res?.data?.length) {
      const target = norm(realSlugRef.current);
      const matched = res.data.filter(a => norm(a.category?.slug ?? '') === target);
      setRawArticles(prev => [...prev, ...matched.map(mapArticle)]);
      setHasMore(next < (res.last_page ?? 1));
      setCurrentPage(next);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  }, [loadingMore, hasMore, currentPage]);

  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];
    rawArticles.forEach((article, i) => {
      if (i > 0 && i % 5 === 0) items.push({ type: 'sponsored' });
      items.push({ type: 'article', data: article });
    });
    return items;
  }, [rawArticles]);

  const renderItem: ListRenderItem<FeedItem> = ({ item }) => {
    if (item.type === 'sponsored') {
      return <SponsoredCard title="Les solutions de santé digitale au service des populations africaines" sponsor="OMS Afrique" />;
    }
    return <ArticleCard article={item.data} onPress={() => onArticlePress(item.data.id)} />;
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.backgroundCard} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{categoryTitle}</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : rawArticles.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔧</Text>
          <Text style={styles.emptyTitle}>Bientôt disponible</Text>
          <Text style={styles.emptyText}>
            {!realSlugRef.current
              ? 'Cette rubrique sera disponible prochainement sur l\'application.'
              : 'Aucun article ne correspond à ce filtre pour l\'instant.'}
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
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};
