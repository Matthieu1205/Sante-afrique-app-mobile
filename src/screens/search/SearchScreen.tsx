import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ListRenderItem,
} from 'react-native';
import { ArticleCard, ListSkeleton } from '@/components/common';
import type { Article } from '@/components/common';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';
import { searchArticlesApi, fetchSearchSuggestions, formatDate, getImageUrl } from '@/services/api';
import type { ApiArticle } from '@/services/api';

function mapArticle(a: ApiArticle): Article {
  return {
    id: String(a.id),
    title: a.title,
    excerpt: a.excerpt,
    category: a.category?.slug ?? a.category_name?.toLowerCase().replace(/\s+/g, '_') ?? 'actualites',
    date: formatDate(a.published_at),
    imageUrl: getImageUrl(a) ?? undefined,
  };
}

const RECENT_SEARCHES_INITIAL = ['paludisme', 'santé maternelle', 'nutrition infantile'];
const SUGGESTIONS_FALLBACK = ['paludisme', 'vaccination', 'maternité', 'nutrition', 'OMS', 'diabète', 'cancer', 'mental'];

interface SearchScreenProps {
  onArticlePress: (articleId: string) => void;
  onBack: () => void;
}

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.backgroundCard,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: Spacing['3'],
    paddingHorizontal: Spacing['4'],
    gap: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing['3'],
    gap: Spacing['2'],
    height: 44,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: C.textPrimary,
    padding: 0,
  },
  resultsCount: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textMuted,
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['3'],
    paddingHorizontal: Spacing['8'],
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xl,
    color: C.textPrimary,
  },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: FontSize.base * 1.55,
  },
  section: {
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['5'],
    gap: Spacing['3'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: C.textPrimary,
  },
  clearAll: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.primary,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3'],
    paddingVertical: Spacing['2'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  recentText: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: C.textPrimary,
  },
  recentRemove: {
    fontSize: 12,
    color: C.textDisabled,
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing['2'],
  },
  suggestionChip: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
    borderWidth: 1,
    borderColor: C.border,
  },
  suggestionText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: C.textSecondary,
  },
});

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onArticlePress,
  onBack,
}) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(RECENT_SEARCHES_INITIAL);
  const [results, setResults] = useState<Article[]>([]);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(SUGGESTIONS_FALLBACK);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    fetchSearchSuggestions().then((data) => {
      if (data.length > 0) setSuggestions(data);
    });
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const raw = await searchArticlesApi(query);
      setResults(raw.map(mapArticle));
      setSearching(false);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleSubmit = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    setRecentSearches((prev) => [q, ...prev.filter((s) => s !== q)].slice(0, 6));
  }, [query]);

  const handleRecentPress = useCallback((term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  }, []);

  const removeRecent = useCallback((term: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== term));
  }, []);

  const renderResult: ListRenderItem<Article> = useCallback(
    ({ item }) => (
      <ArticleCard article={item} onPress={() => onArticlePress(item.id)} />
    ),
    [onArticlePress],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.backgroundCard} />

      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Feather name="search" size={16} color={colors.textDisabled} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un article, un thème, un auteur…"
            placeholderTextColor={colors.textDisabled}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={handleSubmit}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Résultats */}
      {query.length > 0 ? (
        searching ? (
          <ListSkeleton count={4} />
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderResult}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.resultsCount}>
                {results.length} résultat{results.length > 1 ? 's' : ''} pour « {query} »
              </Text>
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
            <Text style={styles.emptyText}>
              Aucun article trouvé pour « {query} ».{'\n'}Essayez avec d'autres mots-clés.
            </Text>
          </View>
        )
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          keyExtractor={() => ''}
          ListHeaderComponent={
            <View>
              {recentSearches.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recherches récentes</Text>
                    <TouchableOpacity onPress={() => setRecentSearches([])}>
                      <Text style={styles.clearAll}>Effacer</Text>
                    </TouchableOpacity>
                  </View>
                  {recentSearches.map((term) => (
                    <TouchableOpacity
                      key={term}
                      style={styles.recentRow}
                      onPress={() => handleRecentPress(term)}
                    >
                      <Text style={{ fontSize: 16 }}>🕐</Text>
                      <Text style={styles.recentText}>{term}</Text>
                      <TouchableOpacity
                        onPress={() => removeRecent(term)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.recentRemove}>✕</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thèmes populaires</Text>
                <View style={styles.suggestionsWrap}>
                  {suggestions.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={styles.suggestionChip}
                      onPress={() => setQuery(s)}
                    >
                      <Text style={styles.suggestionText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};
