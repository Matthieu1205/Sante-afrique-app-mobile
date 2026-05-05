import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

interface SettingsScreenProps {
  onBack?: () => void;
  isDark?: boolean;
  onToggleDark?: () => void;
}

const COUNTRIES = [
  { code: 'ci', label: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'sn', label: 'Sénégal',       flag: '🇸🇳' },
  { code: 'cm', label: 'Cameroun',      flag: '🇨🇲' },
  { code: 'ml', label: 'Mali',          flag: '🇲🇱' },
  { code: 'bf', label: 'Burkina Faso',  flag: '🇧🇫' },
  { code: 'gn', label: 'Guinée',        flag: '🇬🇳' },
  { code: 'tg', label: 'Togo',          flag: '🇹🇬' },
  { code: 'bj', label: 'Bénin',         flag: '🇧🇯' },
  { code: 'ne', label: 'Niger',         flag: '🇳🇪' },
  { code: 'ma', label: 'Maroc',         flag: '🇲🇦' },
];

const TOPICS: { id: string; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { id: 'actualites',    label: 'Actualités',          icon: 'file-text'   },
  { id: 'dossiers',      label: 'Dossiers',            icon: 'clipboard'   },
  { id: 'conseils',      label: 'Conseils Pratiques',  icon: 'zap'         },
  { id: 'sante_mentale', label: 'Santé Mentale',       icon: 'activity'    },
  { id: 'vaccination',   label: 'Vaccination',         icon: 'thermometer' },
  { id: 'nutrition',     label: 'Nutrition Infantile', icon: 'droplet'     },
  { id: 'maternelle',    label: 'Santé Maternelle',    icon: 'heart'       },
  { id: 'business',      label: 'Business Santé',      icon: 'briefcase'   },
  { id: 'one_health',    label: 'One Health',          icon: 'feather'     },
];

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
  sectionHeader: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['5'],
    paddingBottom: Spacing['2'],
  },
  group: {
    backgroundColor: C.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    gap: Spacing['3'],
  },
  rowIcon: { fontSize: 22 },
  rowLabel: {
    flex: 1,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: C.textPrimary,
  },
  rowSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: C.textMuted,
    marginTop: 2,
  },
  picker: { borderTopWidth: 1, borderTopColor: C.borderLight },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    gap: Spacing['3'],
  },
  pickerRowActive: { backgroundColor: C.primaryUltraLight },
  pickerFlag: { fontSize: 20 },
  pickerLabel: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: C.textSecondary,
  },
  pickerLabelActive: { fontFamily: FontFamily.bodySemiBold, color: C.primary },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing['4'],
    gap: Spacing['2'],
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
    borderRadius: Radius.full,
    backgroundColor: C.backgroundCard,
    borderWidth: 1,
    borderColor: C.border,
  },
  topicChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  topicLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textSecondary,
  },
  topicLabelActive: { fontFamily: FontFamily.bodySemiBold, color: C.white },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    gap: Spacing['3'],
  },
  switchText: { flex: 1 },
  textSizeGroup: { flexDirection: 'row', gap: Spacing['2'] },
  textSizeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.background,
  },
  textSizeBtnActive: { borderColor: C.primary, backgroundColor: C.primaryUltraLight },
  textSizeLabel: { fontFamily: FontFamily.body, color: C.textMuted },
  textSizeLabelActive: { color: C.primary },
});

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  isDark = false,
  onToggleDark,
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [selectedCountry, setSelectedCountry] = useState('ci');
  const [selectedTopics, setSelectedTopics] = useState(
    new Set(['actualites', 'dossiers', 'vaccination'])
  );
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const toggleTopic = (id: string) =>
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const country = COUNTRIES.find((c) => c.code === selectedCountry)!;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.backgroundCard}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Préférences</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Pays */}
        <Text style={styles.sectionHeader}>Mon pays</Text>
        <View style={styles.group}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowCountryPicker(!showCountryPicker)}
            activeOpacity={0.7}
          >
            <Text style={styles.rowIcon}>{country.flag}</Text>
            <Text style={styles.rowLabel}>{country.label}</Text>
            <Feather
              name={showCountryPicker ? 'chevron-up' : 'chevron-right'}
              size={18}
              color={colors.textDisabled}
            />
          </TouchableOpacity>
          {showCountryPicker && (
            <View style={styles.picker}>
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.pickerRow, selectedCountry === c.code && styles.pickerRowActive]}
                  onPress={() => { setSelectedCountry(c.code); setShowCountryPicker(false); }}
                >
                  <Text style={styles.pickerFlag}>{c.flag}</Text>
                  <Text style={[styles.pickerLabel, selectedCountry === c.code && styles.pickerLabelActive]}>
                    {c.label}
                  </Text>
                  {selectedCountry === c.code && (
                    <Feather name="check" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Thèmes d'intérêt */}
        <Text style={styles.sectionHeader}>Mes thèmes d'intérêt</Text>
        <View style={styles.topicsGrid}>
          {TOPICS.map((t) => {
            const active = selectedTopics.has(t.id);
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.topicChip, active && styles.topicChipActive]}
                onPress={() => toggleTopic(t.id)}
                activeOpacity={0.75}
              >
                <Feather name={t.icon} size={14} color={active ? colors.white : colors.textMuted} />
                <Text style={[styles.topicLabel, active && styles.topicLabelActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notifications */}
        <Text style={styles.sectionHeader}>Notifications</Text>
        <View style={styles.group}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.rowLabel}>Activer les notifications</Text>
              <Text style={styles.rowSub}>Alertes santé et nouvelles publications</Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notifEnabled ? colors.primary : colors.white}
            />
          </View>
        </View>

        {/* Affichage */}
        <Text style={styles.sectionHeader}>Affichage</Text>
        <View style={styles.group}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.rowLabel}>Mode sombre</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={onToggleDark}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isDark ? colors.primary : colors.white}
            />
          </View>
          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View style={styles.switchText}>
              <Text style={styles.rowLabel}>Taille du texte</Text>
            </View>
            <View style={styles.textSizeGroup}>
              {(['small', 'medium', 'large'] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.textSizeBtn, textSize === size && styles.textSizeBtnActive]}
                  onPress={() => setTextSize(size)}
                >
                  <Text style={[styles.textSizeLabel, textSize === size && styles.textSizeLabelActive]}>
                    {size === 'small' ? 'A' : size === 'medium' ? 'A' : 'A'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Langue */}
        <Text style={styles.sectionHeader}>Langue</Text>
        <View style={styles.group}>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowIcon}>🇫🇷</Text>
            <Text style={styles.rowLabel}>Français</Text>
            <Feather name="check" size={16} color={colors.primary} />
          </View>
        </View>

      </ScrollView>
    </View>
  );
};
