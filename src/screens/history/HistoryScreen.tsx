import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';
import { getHistory, clearHistory, type HistoryEntry } from '@/services/history';

interface HistoryScreenProps {
  onBack?: () => void;
  onArticlePress?: (id: string) => void;
}

function relativeDate(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "Il y a moins d'1h";
    if (h < 24) return `Il y a ${h}h`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'Hier';
    if (d < 7) return `Il y a ${d} jours`;
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch { return ''; }
}

const CATEGORY_LABELS: Record<string, string> = {
  actualites: 'Actualité', vaccination: 'Vaccination', dossier: 'Dossier',
  'business-sante': 'Business Santé', 'sante-mentale': 'Santé mentale',
  'sante-maternelle': 'Santé maternelle', 'conseils-pratiques': 'Conseils pratiques',
  'one-health': 'One Health', 'nutrition-infantile': 'Nutrition', 'les-odd': 'ODD',
};

function catLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? slug;
}

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
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: C.textPrimary },
  clearBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  list: { paddingTop: Spacing['3'], paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    marginHorizontal: Spacing['4'],
    marginBottom: Spacing['3'],
    overflow: 'hidden',
    ...Shadows.card,
  },
  thumb: { width: 80, height: 80, backgroundColor: C.background },
  thumbPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: C.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, padding: Spacing['3'], justifyContent: 'space-between' },
  title: { fontFamily: FontFamily.headingBold, fontSize: FontSize.sm, color: C.textPrimary, lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], marginTop: Spacing['2'] },
  category: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.primary },
  sep: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textDisabled },
  time: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textDisabled },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing['3'], paddingTop: 80 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: C.background,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: C.textMuted },
  emptySubtitle: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textDisabled, textAlign: 'center', paddingHorizontal: Spacing['8'] },
});

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack, onArticlePress }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const [items, setItems] = useState<HistoryEntry[]>([]);

  const load = useCallback(async () => {
    const history = await getHistory();
    setItems(history);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleClear = () => {
    Alert.alert(
      'Effacer l\'historique',
      'Supprimer tous les articles lus ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer', style: 'destructive',
          onPress: async () => { await clearHistory(); setItems([]); },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.backgroundCard} />
      <View style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique de lecture</Text>
        {items.length > 0 ? (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.clearBtn}>
            <Feather name="trash-2" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <View style={styles.clearBtn} />
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Feather name="clock" size={28} color={colors.textDisabled} />
          </View>
          <Text style={styles.emptyTitle}>Aucun article lu</Text>
          <Text style={styles.emptySubtitle}>Les articles que vous lisez apparaîtront ici.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => onArticlePress?.(item.id)} activeOpacity={0.8}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <Feather name="file-text" size={22} color={colors.textDisabled} />
                </View>
              )}
              <View style={styles.content}>
                <Text style={styles.title} numberOfLines={3}>{item.title}</Text>
                <View style={styles.meta}>
                  <Text style={styles.category}>{catLabel(item.category)}</Text>
                  <Text style={styles.sep}>·</Text>
                  <Text style={styles.time}>{relativeDate(item.readAt)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};
