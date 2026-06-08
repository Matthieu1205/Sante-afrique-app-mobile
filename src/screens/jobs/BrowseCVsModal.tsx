import { browseCVs } from '@/services/api';
import type { ApplicantCV } from '@/services/api';
import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, TextInput, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

// ─── Options filtres ──────────────────────────────────────────────────────────

const PAYS_OPTIONS   = ['Pays', "Côte d'Ivoire", 'Sénégal', 'Cameroun', 'Mali', 'Burkina Faso', 'Ghana', 'Nigeria', 'Maroc', 'Autre'];
const PROF_OPTIONS   = ['Profession', 'Médecin généraliste', 'Pharmacien(ne)', 'Sage-femme', 'Infirmier(e)', 'Journaliste santé', 'Nutritionniste', 'Autre'];
const TYPE_OPTIONS   = ['Type', 'Stage', 'CDD', 'CDI', 'Freelance'];
const DISPO_OPTIONS  = ['Disponibilité', 'Immédiate', '1 mois', '3 mois', '6 mois'];
const SORT_OPTIONS   = ['Plus récents', 'Plus anciens', 'A–Z'];
const PER_PAGE_OPTIONS = ['10', '25', '50'];

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '95%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: C.borderLight,
    alignSelf: 'center',
    marginTop: Spacing['3'], marginBottom: Spacing['1'],
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'],
    backgroundColor: C.backgroundCard,
    borderBottomWidth: 1, borderBottomColor: C.borderLight,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  topBarTitle: {
    flex: 1, fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg, color: C.textPrimary,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: C.background,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { padding: Spacing['4'] },

  // Header section
  headerRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: Spacing['4'],
  },
  headerLeft: { flex: 1, marginRight: Spacing['3'] },
  pageTitle: {
    fontFamily: FontFamily.headingBold, fontSize: 20,
    color: C.textPrimary, marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: C.textMuted, lineHeight: 18,
  },
  headerActions: { gap: Spacing['2'] },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing['3'], paddingVertical: Spacing['2'],
    borderRadius: Radius.sm, borderWidth: 1,
    borderColor: C.borderLight, gap: 4,
  },
  actionBtnPrimary: { borderColor: C.primary },
  actionBtnDark: { backgroundColor: '#1F2937', borderColor: '#1F2937' },
  actionBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs, color: C.textSecondary,
  },
  actionBtnTextPrimary: { color: C.primary },
  actionBtnTextDark: { color: '#FFFFFF' },

  // Filters card
  filtersCard: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg, padding: Spacing['4'],
    borderWidth: 1, borderColor: C.borderLight,
    marginBottom: Spacing['4'],
  },
  sortRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing['3'],
  },
  sortLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], flex: 1 },
  sortLabel: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: C.textSecondary,
  },
  selectBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: C.borderLight,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing['2'], paddingVertical: 6,
    backgroundColor: C.background, gap: 4,
  },
  selectBtnText: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: C.textPrimary,
  },
  fieldLabel: {
    fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs,
    color: C.textSecondary, marginBottom: Spacing['1'],
  },
  searchWrap: {
    borderWidth: 1, borderColor: C.borderLight,
    borderRadius: Radius.md, marginBottom: 4,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing['3'],
    backgroundColor: C.background, height: 42,
    gap: Spacing['2'],
  },
  searchInput: {
    flex: 1, fontFamily: FontFamily.body,
    fontSize: FontSize.base, color: C.textPrimary,
  },
  searchNote: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs,
    color: C.textMuted, marginBottom: Spacing['3'],
  },
  filtersGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: Spacing['2'], marginBottom: Spacing['3'],
  },
  filterItem: { flex: 1, minWidth: '45%' },
  filterSelect: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1, borderColor: C.borderLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing['2'], height: 38,
    backgroundColor: C.background,
  },
  filterSelectText: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: C.textSecondary, flex: 1,
  },
  filterSelectTextActive: { color: C.textPrimary },
  filterInput: {
    borderWidth: 1, borderColor: C.borderLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing['2'], height: 38,
    backgroundColor: C.background,
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: C.textPrimary,
  },
  dispoWrap: { marginBottom: Spacing['3'] },
  filterBtnsRow: { flexDirection: 'row', gap: Spacing['2'] },
  filtreBtn: {
    backgroundColor: C.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing['2'], paddingHorizontal: Spacing['4'],
  },
  filtreBtnText: {
    fontFamily: FontFamily.bodyBold, fontSize: FontSize.base,
    color: '#FFFFFF',
  },
  effacerBtn: {
    borderWidth: 1, borderColor: C.borderLight,
    borderRadius: Radius.sm,
    paddingVertical: Spacing['2'], paddingHorizontal: Spacing['4'],
    backgroundColor: C.backgroundCard,
  },
  effacerBtnText: {
    fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base,
    color: C.textSecondary,
  },

  // Access reserved box
  accessBox: {
    borderWidth: 1, borderColor: C.borderLight,
    borderRadius: Radius.lg, padding: Spacing['4'],
    backgroundColor: C.backgroundCard,
    marginBottom: Spacing['6'],
  },
  accessText: {
    fontFamily: FontFamily.body, fontSize: FontSize.base,
    color: '#EF4444', lineHeight: 22, marginBottom: Spacing['3'],
  },
  subscribeBtn: {
    backgroundColor: '#1F2937', borderRadius: Radius.sm,
    paddingVertical: Spacing['3'], paddingHorizontal: Spacing['4'],
    alignSelf: 'flex-start',
  },
  subscribeBtnText: {
    fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base,
    color: '#FFFFFF',
  },

  // Mini picker modal
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: C.backgroundCard,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '55%',
  },
  pickerHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'],
    borderBottomWidth: 1, borderBottomColor: C.borderLight,
  },
  pickerTitle: {
    flex: 1, fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base, color: C.textPrimary,
  },
  pickerOption: {
    paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'],
    borderBottomWidth: 1, borderBottomColor: C.borderLight,
  },
  pickerOptionActive: { backgroundColor: C.primaryUltraLight },
  pickerOptionText: {
    fontFamily: FontFamily.body, fontSize: FontSize.base,
    color: C.textPrimary,
  },
  pickerOptionTextActive: { color: C.primary, fontFamily: FontFamily.bodySemiBold },
});

// ─── Composant Select ─────────────────────────────────────────────────────────

interface SelectProps {
  label?: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  styles: ReturnType<typeof makeStyles>;
  colors: ThemeColors;
  insets: { bottom: number };
}

const SelectField: React.FC<SelectProps> = ({ label, value, options, onSelect, styles, colors, insets }) => {
  const [open, setOpen] = useState(false);
  const isPlaceholder = value === options[0];

  return (
    <>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      <TouchableOpacity style={styles.filterSelect} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={[styles.filterSelectText, !isPlaceholder && styles.filterSelectTextActive]} numberOfLines={1}>
          {value}
        </Text>
        <Feather name="chevron-down" size={14} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{label || 'Sélectionner'}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.pickerOption, value === opt && styles.pickerOptionActive]}
                  onPress={() => { onSelect(opt); setOpen(false); }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pickerOptionText, value === opt && styles.pickerOptionTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

// ─── Modal principal ──────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
  onPostJob?: () => void;
}

export const BrowseCVsModal: React.FC<Props> = ({ visible, onClose, onPostJob }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [pays, setPays] = useState('Pays');
  const [profession, setProfession] = useState('Profession');
  const [expMin, setExpMin] = useState('');
  const [typeSouhaite, setTypeSouhaite] = useState('Type');
  const [dispo, setDispo] = useState('Disponibilité');
  const [sortBy, setSortBy] = useState('Plus récents');
  const [perPage, setPerPage] = useState('10');

  const [results, setResults] = useState<ApplicantCV[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleEffacer = () => {
    setQuery('');
    setPays('Pays');
    setProfession('Profession');
    setExpMin('');
    setTypeSouhaite('Type');
    setDispo('Disponibilité');
    setResults([]);
    setSearched(false);
  };

  const handleFilter = async () => {
    setLoading(true);
    setSearched(true);
    const data = await browseCVs({
      profession: profession !== 'Profession' ? profession : undefined,
      country:    pays !== 'Pays' ? pays : undefined,
      experience: expMin || undefined,
      contract:   typeSouhaite !== 'Type' ? typeSouhaite : undefined,
    });
    setResults(data);
    setLoading(false);
  };

  const selectProps = { styles, colors, insets };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={onClose}>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(0,0,0,0.55)" />
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>
          <View style={styles.handle} />

          {/* Barre titre */}
          <View style={styles.topBar}>
            <Text style={styles.topBarTitle}>Parcourir les CV</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Feather name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Text style={styles.pageTitle}>Candidats disponibles</Text>
                <Text style={styles.pageSubtitle}>
                  Accès réservé aux recruteurs abonnés. Filtrez par pays, profession et type recherché.
                </Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnPrimary]}
                  onPress={() => { onClose(); setTimeout(() => onPostJob?.(), 300); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnTextPrimary}>Poster une offre</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleEffacer}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnText}>Réinitialiser</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnDark]}
                  onPress={() => Linking.openURL('https://santeafrique.net/offres-emploi')}
                  activeOpacity={0.8}
                >
                  <Feather name="download" size={12} color="#FFFFFF" />
                  <Text style={styles.actionBtnTextDark}>Exporter CSV</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Filtres */}
            <View style={styles.filtersCard}>

              {/* Trier par / Résultats par page */}
              <View style={styles.sortRow}>
                <View style={styles.sortLeft}>
                  <Text style={styles.sortLabel}>Trier par</Text>
                  <SelectField
                    value={sortBy} options={SORT_OPTIONS}
                    onSelect={setSortBy} {...selectProps}
                  />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
                  <Text style={styles.sortLabel}>Résultats / page</Text>
                  <SelectField
                    value={perPage} options={PER_PAGE_OPTIONS}
                    onSelect={setPerPage} {...selectProps}
                  />
                </View>
              </View>

              {/* Recherche */}
              <Text style={styles.fieldLabel}>Recherche (auto)</Text>
              <View style={styles.searchWrap}>
                <Feather name="search" size={15} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Nom, email, mots clés..."
                  placeholderTextColor={colors.textDisabled}
                  value={query}
                  onChangeText={setQuery}
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery('')}>
                    <Feather name="x" size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.searchNote}>
                Tapez → filtre automatique (pas besoin de cliquer "Filtrer").
              </Text>

              {/* Grille filtres */}
              <View style={styles.filtersGrid}>
                <View style={styles.filterItem}>
                  <SelectField
                    label="Pays" value={pays} options={PAYS_OPTIONS}
                    onSelect={setPays} {...selectProps}
                  />
                </View>
                <View style={styles.filterItem}>
                  <SelectField
                    label="Profession" value={profession} options={PROF_OPTIONS}
                    onSelect={setProfession} {...selectProps}
                  />
                </View>
                <View style={styles.filterItem}>
                  <Text style={styles.fieldLabel}>Exp. min (ans)</Text>
                  <TextInput
                    style={styles.filterInput}
                    placeholder=""
                    placeholderTextColor={colors.textDisabled}
                    value={expMin}
                    onChangeText={setExpMin}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.filterItem}>
                  <SelectField
                    label="Type souhaité" value={typeSouhaite} options={TYPE_OPTIONS}
                    onSelect={setTypeSouhaite} {...selectProps}
                  />
                </View>
              </View>

              {/* Disponibilité */}
              <View style={styles.dispoWrap}>
                <SelectField
                  label="Disponibilité" value={dispo} options={DISPO_OPTIONS}
                  onSelect={setDispo} {...selectProps}
                />
              </View>

              {/* Boutons */}
              <View style={styles.filterBtnsRow}>
                <TouchableOpacity
                  style={[styles.filtreBtn, loading && { opacity: 0.6 }]}
                  onPress={handleFilter}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.filtreBtnText}>{loading ? 'Recherche…' : 'Filtrer'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.effacerBtn} onPress={handleEffacer} activeOpacity={0.8}>
                  <Text style={styles.effacerBtnText}>Effacer</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Résultats ou accès réservé */}
            {searched && results.length > 0 ? (
              <View style={{ paddingHorizontal: Spacing['4'], paddingBottom: Spacing['4'] }}>
                <Text style={{ fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: colors.textMuted, marginBottom: Spacing['2'] }}>
                  {results.length} candidat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                </Text>
                {results.map((cv) => (
                  <View key={cv.id} style={{ backgroundColor: colors.backgroundCard, borderRadius: 8, padding: Spacing['3'], marginBottom: Spacing['2'], gap: 4 }}>
                    <Text style={{ fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: colors.textPrimary }}>{cv.name}</Text>
                    <Text style={{ fontFamily: FontFamily.body, fontSize: FontSize.sm, color: colors.textMuted }}>{cv.profession} · {cv.experience} · {cv.country}</Text>
                    {cv.cv_url && (
                      <TouchableOpacity onPress={() => Linking.openURL(cv.cv_url!)} activeOpacity={0.8}>
                        <Text style={{ fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: colors.primary }}>Voir le CV →</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            ) : searched && !loading ? (
              <View style={styles.accessBox}>
                <Text style={styles.accessText}>Aucun candidat ne correspond à vos critères.</Text>
              </View>
            ) : !searched ? (
              <View style={styles.accessBox}>
                <Text style={styles.accessText}>
                  Accès réservé aux recruteurs abonnés. Appliquez des filtres et cliquez sur "Filtrer".
                </Text>
                <TouchableOpacity
                  style={styles.subscribeBtn}
                  onPress={() => Linking.openURL('https://santeafrique.net/offres-emploi')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.subscribeBtnText}>Activer mon abonnement pour recruter</Text>
                </TouchableOpacity>
              </View>
            ) : null}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
