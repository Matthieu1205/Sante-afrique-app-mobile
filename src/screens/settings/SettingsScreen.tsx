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
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';

interface SettingsScreenProps {
  onBack?: () => void;
}

const COUNTRIES = [
  { code: 'ci', label: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: 'sn', label: 'Sénégal',        flag: '🇸🇳' },
  { code: 'cm', label: 'Cameroun',        flag: '🇨🇲' },
  { code: 'ml', label: 'Mali',            flag: '🇲🇱' },
  { code: 'bf', label: 'Burkina Faso',    flag: '🇧🇫' },
  { code: 'gn', label: 'Guinée',          flag: '🇬🇳' },
  { code: 'tg', label: 'Togo',            flag: '🇹🇬' },
  { code: 'bj', label: 'Bénin',           flag: '🇧🇯' },
  { code: 'ne', label: 'Niger',            flag: '🇳🇪' },
  { code: 'ma', label: 'Maroc',           flag: '🇲🇦' },
];

const TOPICS: { id: string; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { id: 'actualites',    label: 'Actualités',          icon: 'file-text'  },
  { id: 'dossiers',      label: 'Dossiers',            icon: 'clipboard'  },
  { id: 'conseils',      label: 'Conseils Pratiques',  icon: 'zap'        },
  { id: 'sante_mentale', label: 'Santé Mentale',       icon: 'activity'   },
  { id: 'vaccination',   label: 'Vaccination',         icon: 'thermometer'},
  { id: 'nutrition',     label: 'Nutrition Infantile', icon: 'droplet'    },
  { id: 'maternelle',    label: 'Santé Maternelle',    icon: 'heart'      },
  { id: 'business',      label: 'Business Santé',      icon: 'briefcase'  },
  { id: 'one_health',    label: 'One Health',          icon: 'feather'    },
];

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={sh.text}>{title}</Text>
);
const sh = StyleSheet.create({
  text: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['5'],
    paddingBottom: Spacing['2'],
  },
});

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const [selectedCountry, setSelectedCountry] = useState('ci');
  const [selectedTopics, setSelectedTopics] = useState(new Set(['actualites', 'dossiers', 'vaccination']));
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundCard} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Préférences</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Pays */}
        <SectionHeader title="Mon pays" />
        <View style={styles.group}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowCountryPicker(!showCountryPicker)}
            activeOpacity={0.7}
          >
            <Text style={styles.rowIcon}>{country.flag}</Text>
            <Text style={styles.rowLabel}>{country.label}</Text>
            <Feather name={showCountryPicker ? 'chevron-up' : 'chevron-right'} size={18} color={Colors.textDisabled} />
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
                  {selectedCountry === c.code && <Feather name="check" size={16} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Thèmes d'intérêt */}
        <SectionHeader title="Mes thèmes d'intérêt" />
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
                <Feather name={t.icon} size={14} color={active ? Colors.white : Colors.textMuted} />
                <Text style={[styles.topicLabel, active && styles.topicLabelActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <View style={styles.group}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.rowLabel}>Activer les notifications</Text>
              <Text style={styles.rowSub}>Alertes santé et nouvelles publications</Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={notifEnabled ? Colors.primary : Colors.white}
            />
          </View>
        </View>

        {/* Affichage */}
        <SectionHeader title="Affichage" />
        <View style={styles.group}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.rowLabel}>Mode sombre</Text>
              <Text style={styles.rowSub}>Bientôt disponible</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              disabled
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={darkMode ? Colors.primary : Colors.white}
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
        <SectionHeader title="Langue" />
        <View style={styles.group}>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowIcon}>🇫🇷</Text>
            <Text style={styles.rowLabel}>Français</Text>
            <Feather name="check" size={16} color={Colors.primary} />
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Shadows.header,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 32, marginTop: -2 },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  group: {
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing['3'],
  },
  rowIcon: { fontSize: 22 },
  rowLabel: {
    flex: 1,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  rowSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  chevron: { fontSize: 20, color: Colors.textDisabled },
  checkmark: { fontSize: 18, color: Colors.primary, fontFamily: FontFamily.bodyBold },

  picker: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing['3'],
  },
  pickerRowActive: { backgroundColor: Colors.primaryUltraLight },
  pickerFlag: { fontSize: 20 },
  pickerLabel: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  pickerLabelActive: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.primary,
  },

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
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topicChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  topicEmoji: { fontSize: 14 },
  topicLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  topicLabelActive: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.white,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing['3'],
  },
  switchText: { flex: 1 },

  textSizeGroup: { flexDirection: 'row', gap: Spacing['2'] },
  textSizeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  textSizeBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryUltraLight,
  },
  textSizeLabel: {
    fontFamily: FontFamily.body,
    color: Colors.textMuted,
  },
  textSizeLabelActive: { color: Colors.primary },
});
