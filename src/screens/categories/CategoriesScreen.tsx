import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ListRenderItem,
} from 'react-native';
import { AppHeader } from '@/components/common';
import type { Category } from '@/components/common';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = Spacing['3'];
const CARD_SIZE = (SCREEN_WIDTH - Spacing['4'] * 2 - CARD_GAP) / 2;

interface CategoryItem {
  value: Category;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  count: number;
  color: string;
}

const CATEGORIES: CategoryItem[] = [
  { value: 'actualites',         label: 'Actualités',          icon: 'file-text',  count: 142, color: '#1E3A5F' },
  { value: 'conseils_pratiques', label: 'Conseils Pratiques',  icon: 'zap',        count: 89,  color: '#166534' },
  { value: 'dossier',            label: 'Dossiers',            icon: 'clipboard',  count: 34,  color: '#5B21B6' },
  { value: 'equite_acces',       label: 'Équité & Accès',      icon: 'sliders',    count: 27,  color: '#92400E' },
  { value: 'les_odd',            label: 'Les ODD',             icon: 'globe',      count: 45,  color: '#064E3B' },
  { value: 'business_sante',     label: 'Business Santé',      icon: 'briefcase',  count: 63,  color: '#1E40AF' },
  { value: 'sante_mentale',      label: 'Santé Mentale',       icon: 'activity',   count: 38,  color: '#6B21A8' },
  { value: 'one_health',         label: 'One Health',          icon: 'feather',    count: 52,  color: '#065F46' },
  { value: 'nutrition_infantile',label: 'Nutrition Infantile', icon: 'droplet',    count: 71,  color: '#9D174D' },
  { value: 'sante_maternelle',   label: 'Santé Maternelle',    icon: 'heart',      count: 96,  color: '#991B1B' },
  { value: 'vaccination',        label: 'Vaccination',         icon: 'thermometer',count: 58,  color: '#164E63' },
];

interface CategoriesScreenProps {
  onCategoryPress: (category: Category, title: string) => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onBack?: () => void;
}

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['4'],
    paddingBottom: Spacing['3'],
    gap: Spacing['2'],
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xl,
    color: C.textPrimary,
    flex: 1,
  },
  grid: { paddingHorizontal: Spacing['4'], paddingBottom: Spacing['6'] },
  row: { gap: CARD_GAP, marginBottom: CARD_GAP },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 0.9,
    borderRadius: Radius.lg,
    padding: Spacing['4'],
    justifyContent: 'flex-end',
    gap: Spacing['1'],
  },
  cardIcon: { marginBottom: Spacing['2'] },
  cardLabel: { fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: C.white, lineHeight: FontSize.base * 1.25 },
  cardCount: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: 'rgba(255,255,255,0.65)' },
});

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  onCategoryPress,
  onSearchPress,
  onNotificationPress,
  onBack,
}) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const renderCategory: ListRenderItem<CategoryItem> = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: item.color }]}
      onPress={() => onCategoryPress(item.value, item.label)}
      activeOpacity={0.8}
    >
      <Feather name={item.icon} size={30} color="rgba(255,255,255,0.85)" style={styles.cardIcon} />
      <Text style={styles.cardLabel} numberOfLines={2}>{item.label}</Text>
      <Text style={styles.cardCount}>{item.count} articles</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.backgroundCard} />
      <AppHeader onSearchPress={onSearchPress} onNotificationPress={onNotificationPress} notificationCount={3} />

      <View style={styles.topBar}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={styles.pageTitle}>Les 11 rubriques</Text>
      </View>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.value}
        renderItem={renderCategory}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
