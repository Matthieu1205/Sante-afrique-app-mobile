import React, { useCallback, useMemo, useRef, useState } from 'react';
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
import { ArticleCard } from '@/components/common';
import type { Article } from '@/components/common';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '@/theme';

// ─── Données mock pour la recherche ──────────────────────────────

const ALL_ARTICLES: Article[] = [
  { id: '1',  title: "Paludisme en Afrique de l'Ouest : l'OMS déploie un nouveau protocole de traitement", category: 'actualites', articleType: 'actualite', date: '25 avr. 2026', hasAudio: true },
  { id: '2',  title: 'Dr Aminata Koné : "La santé maternelle reste notre priorité absolue en Afrique subsaharienne"', category: 'sante_maternelle', articleType: 'grand_entretien', date: '24 avr. 2026', hasAudio: true, isPremium: true },
  { id: '3',  title: 'Nutrition infantile : les aliments locaux africains surpassent souvent les compléments importés', category: 'nutrition_infantile', articleType: 'dossier', date: '23 avr. 2026' },
  { id: '4',  title: 'One Health : comment la santé des animaux impacte celle des humains au Sahel', category: 'one_health', articleType: 'one_health', date: '22 avr. 2026' },
  { id: '5',  title: "Vaccination HPV : un enjeu capital pour réduire le cancer du col en Côte d'Ivoire", category: 'vaccination', articleType: 'vaccination', date: '21 avr. 2026', hasAudio: true },
  { id: '6',  title: 'Santé mentale : briser le tabou dans les communautés africaines', category: 'sante_mentale', articleType: 'tribune', date: '20 avr. 2026', isPremium: true },
  { id: '7',  title: 'Business Santé : les startups healthtech africaines lèvent 120M$ au 1er trimestre 2026', category: 'business_sante', articleType: 'actualite', date: '19 avr. 2026' },
  { id: '8',  title: "Les ODD santé : bilan à mi-parcours pour l'Afrique de l'Ouest", category: 'les_odd', articleType: 'dossier_special', date: '18 avr. 2026' },
  { id: '9',  title: "Équité d'accès : les médicaments essentiels toujours hors de portée pour 40 % de la population", category: 'equite_acces', articleType: 'debat', date: '17 avr. 2026', hasAudio: true, isPremium: true },
  { id: '10', title: 'Hypertension artérielle : le mal silencieux qui touche 40 % des adultes africains', category: 'actualites', articleType: 'actualite', date: '16 avr. 2026', hasAudio: true },
  { id: '11', title: 'Diabète de type 2 : progression alarmante dans les villes africaines', category: 'dossier', articleType: 'dossier', date: '15 avr. 2026' },
  { id: '12', title: "Allaitement maternel : clé d'un bon démarrage pour l'enfant africain", category: 'sante_maternelle', articleType: 'conseil_pratique', date: '14 avr. 2026' },
  { id: '13', title: 'Burn-out des soignants africains : une crise silencieuse et préoccupante', category: 'sante_mentale', articleType: 'dossier', date: '12 avr. 2026' },
  { id: '14', title: "ROR : pourquoi la rougeole repart à la hausse en zones de conflit", category: 'vaccination', articleType: 'actualite', date: '10 avr. 2026' },
  { id: '15', title: 'Couverture santé universelle : où en est vraiment l\'Afrique en 2026 ?', category: 'les_odd', articleType: 'debat', date: '8 avr. 2026', isPremium: true },
];

const RECENT_SEARCHES_INITIAL = ['paludisme', 'santé maternelle', 'nutrition infantile'];

const SUGGESTIONS = ['paludisme', 'vaccination', 'maternité', 'nutrition', 'OMS', 'diabète', 'cancer', 'mental'];

function searchArticles(query: string, articles: Article[]): Article[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q),
  );
}

interface SearchScreenProps {
  onArticlePress: (articleId: string) => void;
  onBack: () => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onArticlePress,
  onBack,
}) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(RECENT_SEARCHES_INITIAL);
  const inputRef = useRef<TextInput>(null);

  const results = useMemo(() => searchArticles(query, ALL_ARTICLES), [query]);

  const handleSubmit = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    setRecentSearches((prev) =>
      [q, ...prev.filter((s) => s !== q)].slice(0, 6),
    );
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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundCard} />

      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Feather name="search" size={16} color={Colors.textDisabled} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un article, un thème, un auteur…"
            placeholderTextColor={Colors.textDisabled}
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
              <Feather name="x" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Résultats */}
      {query.length > 0 ? (
        results.length > 0 ? (
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
        /* Suggestions quand la barre est vide */
        <FlatList
          data={[]}
          renderItem={null}
          keyExtractor={() => ''}
          ListHeaderComponent={
            <View>
              {/* Recherches récentes */}
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
                      <Text style={styles.recentIcon}>🕐</Text>
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

              {/* Suggestions populaires */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thèmes populaires</Text>
                <View style={styles.suggestionsWrap}>
                  {SUGGESTIONS.map((s) => (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Barre de recherche
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: Spacing['3'],
    paddingHorizontal: Spacing['4'],
    gap: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backIcon: {
    fontSize: 22,
    color: Colors.textPrimary,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing['3'],
    gap: Spacing['2'],
    height: 44,
  },
  searchIcon: { fontSize: 16 },
  input: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    padding: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.textMuted,
  },

  // Compteur résultats
  resultsCount: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
  },

  // État vide
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
    color: Colors.textPrimary,
  },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: FontSize.base * 1.55,
  },

  // Sections suggestions
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
    color: Colors.textPrimary,
  },
  clearAll: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },

  // Recherches récentes
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3'],
    paddingVertical: Spacing['2'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  recentIcon: { fontSize: 16, color: Colors.textMuted },
  recentText: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  recentRemove: {
    fontSize: 12,
    color: Colors.textDisabled,
  },

  // Chips suggestions
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing['2'],
  },
  suggestionChip: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
