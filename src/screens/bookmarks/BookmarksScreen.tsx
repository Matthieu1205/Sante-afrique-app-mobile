import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

interface BookmarksScreenProps {
  onBack?: () => void;
  onArticlePress?: (id: string) => void;
}

const MOCK_BOOKMARKS = [
  { id: '1', title: 'Paludisme : les nouvelles thérapies combinées montrent 94% d\'efficacité', category: 'Actualités', date: '24 Avr 2025', readTime: '5 min', type: 'Actualité' },
  { id: '2', title: 'Santé mentale en Afrique subsaharienne : lever le tabou pour mieux soigner', category: 'Santé Mentale', date: '22 Avr 2025', readTime: '8 min', type: 'Dossier' },
  { id: '3', title: 'Vaccination : l\'Afrique atteint 70% de couverture vaccinale enfants', category: 'Vaccination', date: '20 Avr 2025', readTime: '4 min', type: 'Actualité' },
  { id: '4', title: 'Nutrition infantile : cinq gestes simples pour prévenir la malnutrition', category: 'Nutrition Infantile', date: '18 Avr 2025', readTime: '6 min', type: 'Conseil' },
  { id: '5', title: 'Business Santé : les startups africaines lèvent 2,3 milliards USD en 2024', category: 'Business Santé', date: '15 Avr 2025', readTime: '7 min', type: 'Dossier' },
];

type Bookmark = typeof MOCK_BOOKMARKS[0];

const typeColors: Record<string, string> = {
  'Actualité': Colors.badgeActualite,
  'Dossier':   Colors.badgeDossier,
  'Conseil':   Colors.badgeConseilPratique,
  'Tribune':   Colors.badgeTribune,
};

const makeCardStyles = (C: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    marginHorizontal: Spacing['4'],
    marginBottom: Spacing['3'],
    overflow: 'hidden',
    ...Shadows.card,
  },
  imagePlaceholder: {
    width: 90,
    backgroundColor: C.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, padding: Spacing['3'], gap: Spacing['2'] },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] },
  badge: { borderRadius: Radius.xs, paddingHorizontal: 5, paddingVertical: 2 },
  badgeText: { fontFamily: FontFamily.bodyBold, fontSize: 9, color: C.white, letterSpacing: 0.5 },
  category: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted },
  title: { fontFamily: FontFamily.headingBold, fontSize: FontSize.sm, color: C.textPrimary, lineHeight: 20 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textDisabled },
});

const BookmarkItem: React.FC<{
  item: Bookmark;
  onPress: () => void;
  onRemove: () => void;
}> = ({ item, onPress, onRemove }) => {
  const { colors } = useTheme();
  const card = makeCardStyles(colors);
  return (
    <TouchableOpacity style={card.container} onPress={onPress} activeOpacity={0.8}>
      <View style={card.imagePlaceholder}>
        <Feather name="file-text" size={28} color={colors.textDisabled} />
      </View>
      <View style={card.content}>
        <View style={card.meta}>
          <View style={[card.badge, { backgroundColor: typeColors[item.type] ?? colors.primary }]}>
            <Text style={card.badgeText}>{item.type.toUpperCase()}</Text>
          </View>
          <Text style={card.category}>{item.category}</Text>
        </View>
        <Text style={card.title} numberOfLines={2}>{item.title}</Text>
        <View style={card.footer}>
          <Text style={card.date}>{item.date} · {item.readTime}</Text>
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="trash-2" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.backgroundCard,
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    ...Shadows.header,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: C.textPrimary,
    textAlign: 'center',
  },
  clearBtn: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.error, width: 80, textAlign: 'right' },
  list: { paddingTop: Spacing['4'], paddingBottom: 40 },
  count: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted, paddingHorizontal: Spacing['4'], marginBottom: Spacing['3'] },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing['8'], gap: Spacing['3'] },
  emptyTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: C.textPrimary, textAlign: 'center' },
  emptySub: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textMuted, textAlign: 'center', lineHeight: 22 },
});

export const BookmarksScreen: React.FC<BookmarksScreenProps> = ({
  onBack,
  onArticlePress,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const [items, setItems] = useState(MOCK_BOOKMARKS);

  const remove = (id: string) => setItems((prev) => prev.filter((b) => b.id !== id));

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.backgroundCard} />

      <View style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes favoris</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={() => setItems([])}>
            <Text style={styles.clearBtn}>Tout effacer</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="bookmark" size={48} color={colors.textDisabled} />
          <Text style={styles.emptyTitle}>Aucun article sauvegardé</Text>
          <Text style={styles.emptySub}>
            Appuyez sur l'icône favoris dans un article pour le retrouver ici.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookmarkItem
              item={item}
              onPress={() => onArticlePress?.(item.id)}
              onRemove={() => remove(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.count}>{items.length} article{items.length > 1 ? 's' : ''} sauvegardé{items.length > 1 ? 's' : ''}</Text>
          }
        />
      )}
    </View>
  );
};
