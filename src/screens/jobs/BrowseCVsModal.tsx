import { browseCVs, exportCVsUrl } from '@/services/api';
import type { ApplicantCV } from '@/services/api';
import { Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

// ─── Options (calquées sur le site) ──────────────────────────────

const PAYS_OPTIONS = [
  'Tous les pays',
  'Algérie', 'Bénin', 'Burkina Faso', 'Burundi', 'Cameroun',
  'Centrafrique', 'Comores', 'Congo', 'Côte d\'Ivoire', 'Djibouti',
  'Gabon', 'Ghana', 'Guinée', 'Guinée-Bissau', 'Guinée équatoriale',
  'Haïti', 'Madagascar', 'Mali', 'Maroc', 'Mauritanie',
  'Niger', 'Nigeria', 'RDC Congo', 'Rwanda', 'Sénégal',
  'Tchad', 'Togo', 'Tunisie', 'Autre',
];

const PROF_OPTIONS = [
  'Toutes professions',
  // Médecins
  'Médecin généraliste', 'Médecin spécialiste', 'Cardiologue',
  'Gynécologue-obstétricien(ne)', 'Pédiatre', 'Chirurgien(ne)',
  'Anesthésiste-réanimateur', 'Interniste', 'Dermatologue',
  'Ophtalmologue', 'ORL', 'Psychiatre', 'Neurologue',
  'Radiologue', 'Urgentiste', 'Chirurgien-dentiste',
  // Paramédicaux
  'Pharmacien(ne)', 'Sage-femme', 'Infirmier(e)',
  'Aide-soignant(e)', 'Kinésithérapeute',
  'Technicien de laboratoire', 'Technicien en imagerie médicale',
  'Nutritionniste / Diététicien(ne)', 'Psychologue clinicien(ne)',
  'Orthophoniste', 'Prothésiste dentaire',
  // Santé publique / Admin
  'Épidémiologiste', 'Santé publique',
  'Manager / Directeur d\'hôpital', 'Administrateur santé',
  'Gestionnaire de projets santé', 'Chargé(e) de programme santé',
  'Journaliste / Communicant santé', 'Chercheur médical',
  'Biostatisticien(ne)', 'Data analyst santé',
  'Logisticien santé', 'Agent de santé communautaire',
  'Assistant(e) social(e) en santé', 'Autre',
];

const DISPO_OPTIONS = ['Toutes', 'Immédiate', '1 mois', '2 mois', '3 mois', '> 3 mois'];

const TYPE_OPTIONS = ['Tous types', 'CDI', 'CDD', 'Stage', 'Bénévolat', 'Consultant', 'Temps partiel'];

const SORT_OPTIONS = [
  { label: 'Plus récents',       value: 'recent' },
  { label: 'Expérience (desc.)', value: 'experience_desc' },
  { label: 'Expérience (asc.)',  value: 'experience_asc' },
];

const PER_PAGE_OPT = [10, 25, 50, 100];

// ─── Avatar ───────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#1B9DD9', '#0D2137', '#10B981', '#DC2626', '#7C3AED',
  '#D97706', '#059669', '#B91C1C', '#1D4ED8', '#6B21A8',
];
function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// "Jean Dupont" → "Jean D."  |  "Marie-Claire Sow Diallo" → "Marie-Claire D."
function formatDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  const first = parts[0];
  const lastInitial = (parts[parts.length - 1][0] ?? '').toUpperCase();
  return lastInitial ? `${first} ${lastInitial}.` : first;
}

const BLUE = '#1B9DD9';
const DARK = '#0D2137';

// ─── Styles ───────────────────────────────────────────────────────

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    height: '95%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'center',
    marginTop: Spacing['3'], marginBottom: Spacing['1'],
  },

  // Header
  heroWrap: {
    backgroundColor: DARK,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: Spacing['4'], paddingTop: Spacing['1'], paddingBottom: Spacing['4'],
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroLabel: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 10,
    color: BLUE, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: Spacing['2'],
  },
  heroTitle: { fontFamily: FontFamily.headingBold, fontSize: 22, color: '#fff', marginBottom: 4 },
  heroSub: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)', lineHeight: 18, marginBottom: Spacing['4'],
  },
  heroActionsRow: { flexDirection: 'row', gap: Spacing['2'] },
  heroOutlineBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fff', borderRadius: Radius.sm,
    paddingHorizontal: Spacing['3'], paddingVertical: 9, gap: 5,
  },
  heroOutlineBtnText: {
    fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs,
    color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase',
  },
  heroBlueBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: BLUE, borderRadius: Radius.sm,
    paddingHorizontal: Spacing['3'], paddingVertical: 9, gap: 5,
  },
  heroBlueBtnText: {
    fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs,
    color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase',
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginLeft: Spacing['2'],
  },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing['4'], paddingBottom: Spacing['8'] },

  // Paywall
  paywallWrap: { alignItems: 'center', paddingVertical: Spacing['6'] },
  paywallIconWrap: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#FEF3C7',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing['4'],
  },
  paywallTitle: {
    fontFamily: FontFamily.headingBold, fontSize: 20,
    color: C.textPrimary, textAlign: 'center', marginBottom: Spacing['2'],
  },
  paywallSub: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: C.textMuted, textAlign: 'center',
    lineHeight: 20, marginBottom: Spacing['5'], paddingHorizontal: Spacing['4'],
  },
  paywallCard: {
    width: '100%', backgroundColor: C.backgroundCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: C.borderLight,
    padding: Spacing['4'], marginBottom: Spacing['4'], gap: Spacing['2'],
  },
  paywallFeature: { flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] },
  paywallFeatureText: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textSecondary, flex: 1,
  },
  subscribeBtn: {
    width: '100%', backgroundColor: BLUE,
    borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', marginBottom: Spacing['3'],
  },
  subscribeBtnText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: '#fff', letterSpacing: 0.3 },
  paywallNote: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted, textAlign: 'center' },

  // Filtres
  filtersWrap: { marginBottom: Spacing['3'] },
  filterItemFull: { marginBottom: Spacing['2'] },
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'], marginBottom: Spacing['2'] },
  filterItem: { flex: 1, minWidth: '47%' },
  filterLabel: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 9,
    color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  filterInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.backgroundCard, borderWidth: 1,
    borderColor: C.borderLight, borderRadius: Radius.md,
    paddingHorizontal: Spacing['3'], height: 40, gap: Spacing['2'],
  },
  filterTextInput: {
    flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: C.textPrimary, height: 40,
  },
  filterSelect: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.backgroundCard, borderWidth: 1,
    borderColor: C.borderLight, borderRadius: Radius.md,
    paddingHorizontal: Spacing['3'], height: 40,
  },
  filterSelectText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textSecondary, flex: 1 },
  filterSelectTextActive: { color: C.textPrimary },
  filterNumInput: {
    backgroundColor: C.backgroundCard, borderWidth: 1, borderColor: C.borderLight,
    borderRadius: Radius.md, paddingHorizontal: Spacing['3'], height: 40,
    fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textPrimary,
  },
  filterBtns: { flexDirection: 'row', gap: Spacing['2'] },
  filtrerBtn: {
    flex: 1, backgroundColor: BLUE, borderRadius: Radius.sm,
    paddingVertical: 11, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 6,
  },
  filtrerBtnDisabled: { opacity: 0.6 },
  filtrerBtnText: {
    fontFamily: FontFamily.bodyBold, fontSize: FontSize.base,
    color: '#fff', textTransform: 'uppercase', letterSpacing: 0.4,
  },
  effacerBtn: {
    borderWidth: 1, borderColor: C.borderLight, borderRadius: Radius.sm,
    paddingVertical: 11, paddingHorizontal: Spacing['4'],
    backgroundColor: C.backgroundCard, alignItems: 'center', justifyContent: 'center',
  },
  effacerBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: C.textSecondary },

  // Loading state
  loadingWrap: { alignItems: 'center', paddingVertical: Spacing['8'], gap: Spacing['3'] },
  loadingText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted },

  // Résultats bar
  resultsBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: Spacing['3'], marginBottom: Spacing['3'],
  },
  resultsLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] },
  resultAccent: { width: 3, height: 16, backgroundColor: BLUE, borderRadius: 2 },
  resultsCountText: {
    fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm,
    color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  resultsControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] },
  sortLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted },
  miniSelect: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: C.borderLight, borderRadius: Radius.sm,
    paddingHorizontal: Spacing['2'], paddingVertical: 5,
    backgroundColor: C.backgroundCard, gap: 3,
  },
  miniSelectText: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textPrimary },

  // Pagination
  paginationRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: Spacing['3'],
    marginTop: Spacing['4'], marginBottom: Spacing['2'],
  },
  pageBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: C.borderLight, borderRadius: Radius.sm,
    paddingHorizontal: Spacing['3'], paddingVertical: 9, gap: 4,
  },
  pageBtnDisabled: { opacity: 0.3 },
  pageBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: C.textSecondary },
  pageInfo: {
    fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: C.textPrimary,
    minWidth: 60, textAlign: 'center',
  },

  // Carte CV
  cvCard: {
    backgroundColor: C.backgroundCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: C.borderLight,
    marginBottom: Spacing['3'], overflow: 'hidden',
  },
  cvCardTop: { flexDirection: 'row', alignItems: 'center', padding: Spacing['3'], gap: Spacing['3'] },
  avatar: { width: 46, height: 46, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: '#fff' },
  cvNameBlock: { flex: 1 },
  cvName: { fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: C.textPrimary, marginBottom: 2 },
  cvDate: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted },
  profBadge: {
    alignSelf: 'flex-start', backgroundColor: BLUE, borderRadius: 4,
    paddingHorizontal: Spacing['3'], paddingVertical: 5,
    marginHorizontal: Spacing['3'], marginBottom: Spacing['3'],
  },
  profBadgeText: {
    fontFamily: FontFamily.bodyBold, fontSize: 10,
    color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5,
  },
  cvBody: { paddingHorizontal: Spacing['3'], paddingBottom: Spacing['3'], gap: Spacing['2'] },
  cvRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] },
  cvRowLabel: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 10,
    color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, width: 44,
  },
  cvRowValue: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textPrimary, flex: 1 },
  expBadge: { backgroundColor: DARK, borderRadius: 4, paddingHorizontal: Spacing['2'], paddingVertical: 3 },
  expBadgeText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, color: '#fff' },
  dispoBadgeGreen: { backgroundColor: '#10B981', borderRadius: 4, paddingHorizontal: Spacing['2'], paddingVertical: 3 },
  dispoBadgeGray: { backgroundColor: C.borderLight, borderRadius: 4, paddingHorizontal: Spacing['2'], paddingVertical: 3 },
  dispoBadgeText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, color: '#fff' },
  dispoBadgeTextGray: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, color: C.textSecondary },
  cvSkills: { paddingHorizontal: Spacing['3'], paddingBottom: Spacing['3'] },
  cvSkillsText: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textSecondary, lineHeight: 16 },
  cvSkillsBold: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, color: C.textSecondary },
  viewProfileBtn: {
    backgroundColor: BLUE, paddingVertical: 13, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: 'rgba(27,157,217,0.2)',
  },
  viewProfileBtnText: {
    fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm,
    color: '#fff', textTransform: 'uppercase', letterSpacing: 0.8,
  },

  // Infobox (vide / no results)
  infoBox: {
    borderRadius: Radius.lg, borderWidth: 1, borderColor: C.borderLight,
    padding: Spacing['4'], backgroundColor: C.backgroundCard,
    alignItems: 'flex-start', marginTop: Spacing['4'],
  },
  infoIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing['3'],
  },
  infoTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: C.textPrimary, marginBottom: Spacing['2'] },
  infoText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted, lineHeight: 20 },

  // Picker bottom-sheet
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: C.backgroundCard,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '65%',
  },
  pickerHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'],
    borderBottomWidth: 1, borderBottomColor: C.borderLight,
  },
  pickerTitle: { flex: 1, fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: C.textPrimary },
  pickerOption: {
    paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'],
    borderBottomWidth: 1, borderBottomColor: C.borderLight,
  },
  pickerOptionActive: { backgroundColor: '#EBF7FD' },
  pickerOptionText: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textPrimary },
  pickerOptionTextActive: { color: BLUE, fontFamily: FontFamily.bodySemiBold },
});

// ─── Dropdown ────────────────────────────────────────────────────

const DropPicker: React.FC<{
  value: string; options: string[];
  onSelect: (v: string) => void;
  styles: ReturnType<typeof makeStyles>; colors: ThemeColors;
  insets: { bottom: number }; title: string;
}> = ({ value, options, onSelect, styles, colors, insets, title }) => {
  const [open, setOpen] = useState(false);
  const isPlaceholder = value === options[0];
  return (
    <>
      <TouchableOpacity style={styles.filterSelect} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={[styles.filterSelectText, !isPlaceholder && styles.filterSelectTextActive]} numberOfLines={1}>
          {value}
        </Text>
        <Feather name="chevron-down" size={13} color={colors.textMuted} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.pickerOption, value === opt && styles.pickerOptionActive]}
                  onPress={() => { onSelect(opt); setOpen(false); }}
                >
                  <Text style={[styles.pickerOptionText, value === opt && styles.pickerOptionTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

// ─── Carte candidat ───────────────────────────────────────────────

const CvCard: React.FC<{
  cv: ApplicantCV;
  onView: () => void;
  styles: ReturnType<typeof makeStyles>;
  colors: ThemeColors;
}> = ({ cv, onView, styles }) => {
  const displayName = formatDisplayName(cv.name);
  const initials    = cv.name.split(' ').map((w) => w[0] ?? '').slice(0, 2).join('').toUpperCase();
  const bgColor     = avatarColor(cv.name);
  const location = [cv.city, cv.country].filter(Boolean).join(', ');
  const isImmediate = cv.availability === 'Immédiate';

  return (
    <View style={styles.cvCard}>
      <View style={styles.cvCardTop}>
        <View style={[styles.avatar, { backgroundColor: bgColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.cvNameBlock}>
          <Text style={styles.cvName}>{displayName}</Text>
          {cv.registered_at ? (
            <Text style={styles.cvDate}>Inscrit le {cv.registered_at}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.profBadge}>
        <Text style={styles.profBadgeText}>{cv.profession}</Text>
      </View>

      <View style={styles.cvBody}>
        {location ? (
          <View style={styles.cvRow}>
            <Text style={styles.cvRowLabel}>PAYS</Text>
            <Text style={styles.cvRowValue}>{location}</Text>
          </View>
        ) : null}
        {cv.experience != null ? (
          <View style={styles.cvRow}>
            <Text style={styles.cvRowLabel}>EXP.</Text>
            <View style={styles.expBadge}>
              <Text style={styles.expBadgeText}>{cv.experience} an(s)</Text>
            </View>
          </View>
        ) : null}
        {cv.availability ? (
          <View style={styles.cvRow}>
            <Text style={styles.cvRowLabel}>DISPO</Text>
            <View style={isImmediate ? styles.dispoBadgeGreen : styles.dispoBadgeGray}>
              <Text style={isImmediate ? styles.dispoBadgeText : styles.dispoBadgeTextGray}>
                {cv.availability}
              </Text>
            </View>
          </View>
        ) : null}
        {cv.contract ? (
          <View style={styles.cvRow}>
            <Text style={styles.cvRowLabel}>TYPE</Text>
            <Text style={styles.cvRowValue}>{cv.contract}</Text>
          </View>
        ) : null}
      </View>

      {cv.skills ? (
        <View style={styles.cvSkills}>
          <Text style={styles.cvSkillsText} numberOfLines={2}>
            <Text style={styles.cvSkillsBold}>Compétences : </Text>
            {cv.skills}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.viewProfileBtn} onPress={onView} activeOpacity={0.85}>
        <Text style={styles.viewProfileBtnText}>Voir le profil</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Paywall ──────────────────────────────────────────────────────

const Paywall: React.FC<{
  onSubscribe: () => void;
  styles: ReturnType<typeof makeStyles>;
  colors: ThemeColors;
}> = ({ onSubscribe, styles }) => (
  <View style={styles.paywallWrap}>
    <View style={styles.paywallIconWrap}>
      <Feather name="lock" size={32} color="#D97706" />
    </View>
    <Text style={styles.paywallTitle}>CVthèque réservée{'\n'}aux abonnés</Text>
    <Text style={styles.paywallSub}>
      Accédez à tous les profils de candidats du secteur santé en Afrique.
      Disponible avec tout abonnement actif sur Santé Afrique.
    </Text>
    <View style={styles.paywallCard}>
      {[
        { icon: 'users' as const,    text: 'Parcourez les profils de candidats qualifiés' },
        { icon: 'filter' as const,   text: 'Filtrez par pays, profession et disponibilité' },
        { icon: 'eye' as const,      text: 'Consultez les CV complets et coordonnées' },
        { icon: 'download' as const, text: 'Exportez les données en CSV' },
      ].map(({ icon, text }) => (
        <View key={text} style={styles.paywallFeature}>
          <Feather name={icon} size={15} color={BLUE} />
          <Text style={styles.paywallFeatureText}>{text}</Text>
        </View>
      ))}
    </View>
    <TouchableOpacity style={styles.subscribeBtn} onPress={onSubscribe} activeOpacity={0.85}>
      <Text style={styles.subscribeBtnText}>S'abonner pour accéder à la CVthèque</Text>
    </TouchableOpacity>
    <Text style={styles.paywallNote}>Déjà abonné ? Connectez-vous pour accéder à la CVthèque.</Text>
  </View>
);

// ─── Modal principal ──────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
  onPostJob?: () => void;
  onViewCV?: (url: string, title: string) => void;
  onSubscribe?: () => void;
  isSubscribed?: boolean;
}

export const BrowseCVsModal: React.FC<Props> = ({
  visible, onClose, onPostJob, onViewCV, onSubscribe, isSubscribed = false,
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();

  const [query, setQuery]           = useState('');
  const [pays, setPays]             = useState('Tous les pays');
  const [profession, setProfession] = useState('Toutes professions');
  const [expMin, setExpMin]         = useState('');
  const [dispo, setDispo]           = useState('Toutes');
  const [type, setType]             = useState('Tous types');
  const [sort, setSort]             = useState(SORT_OPTIONS[0]);
  const [perPage, setPerPage]       = useState(10);
  const [page, setPage]             = useState(1);

  const [results, setResults]   = useState<ApplicantCV[]>([]);
  const [total, setTotal]       = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ── Auto-chargement à l'ouverture (comme sur le site) ────────────
  useEffect(() => {
    if (visible && isSubscribed) {
      doFetch(1, perPage);
    }
    if (!visible) {
      // Reset à la fermeture
      setQuery(''); setPays('Tous les pays'); setProfession('Toutes professions');
      setExpMin(''); setDispo('Toutes'); setType('Tous types');
      setSort(SORT_OPTIONS[0]);
      setResults([]); setSearched(false);
      setTotal(0); setLastPage(1); setPage(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, isSubscribed]);

  const doFetch = async (p: number, pp: number = perPage) => {
    setLoading(true); setSearched(true);
    const res = await browseCVs({
      profession:   profession !== 'Toutes professions' ? profession : undefined,
      country:      pays !== 'Tous les pays' ? pays : undefined,
      availability: dispo !== 'Toutes' ? dispo : undefined,
      contract:     type !== 'Tous types' ? type : undefined,
      experience:   expMin || undefined,
      q:            query || undefined,
      sort:         sort.value,
      page:         p,
      per_page:     pp,
    });
    setResults(res.data);
    setTotal(res.total);
    const computed = res.total > 0 ? Math.ceil(res.total / pp) : res.lastPage;
    setLastPage(Math.max(res.lastPage, computed));
    setPage(p);
    setLoading(false);
  };

  const handleFilter  = () => doFetch(1);
  const handlePage    = (p: number) => doFetch(p);

  const handlePerPage = (next: number) => {
    setPerPage(next);
    if (searched) doFetch(1, next);
  };

  const resetFilters = () => {
    setQuery(''); setPays('Tous les pays'); setProfession('Toutes professions');
    setExpMin(''); setDispo('Toutes'); setType('Tous types');
    setSort(SORT_OPTIONS[0]);
    doFetch(1, perPage);
  };

  const goSubscribe = () => { onClose(); setTimeout(() => onSubscribe?.(), 300); };

  const handleExport = async () => {
    setExporting(true);
    const url = await exportCVsUrl({
      profession:   profession !== 'Toutes professions' ? profession : undefined,
      country:      pays !== 'Tous les pays' ? pays : undefined,
      availability: dispo !== 'Toutes' ? dispo : undefined,
      contract:     type !== 'Tous types' ? type : undefined,
      experience:   expMin || undefined,
      q:            query || undefined,
      sort:         sort.value,
    });
    setExporting(false);
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('Erreur', 'Impossible d\'ouvrir le lien d\'export.'));
    } else {
      Alert.alert('Erreur', 'Vous devez être connecté pour exporter.');
    }
  };

  const sp = { styles, colors, insets };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.6)" />
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>

          {/* ── Header dark navy ── */}
          <View style={styles.heroWrap}>
            <View style={styles.handle} />
            <View style={styles.heroTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroLabel}>CVthèque</Text>
                <Text style={styles.heroTitle}>CVthèque</Text>
                <Text style={styles.heroSub}>
                  Trouvez le profil idéal parmi nos candidats du secteur santé en Afrique francophone.
                </Text>
                <View style={styles.heroActionsRow}>
                  <TouchableOpacity
                    style={styles.heroOutlineBtn}
                    onPress={() => { onClose(); setTimeout(() => onPostJob?.(), 300); }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.heroOutlineBtnText}>Poster une offre</Text>
                  </TouchableOpacity>
                  {isSubscribed && (
                    <TouchableOpacity style={styles.heroBlueBtn} activeOpacity={0.8} onPress={handleExport} disabled={exporting}>
                      {exporting
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Feather name="download" size={12} color="#fff" />}
                      <Text style={styles.heroBlueBtnText}>Exporter CSV</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Feather name="x" size={18} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Paywall si non-abonné ── */}
            {!isSubscribed ? (
              <Paywall onSubscribe={goSubscribe} styles={styles} colors={colors} />
            ) : (
              <>
                {/* ── Filtres ── */}
                <View style={styles.filtersWrap}>
                  {/* Recherche pleine largeur */}
                  <View style={styles.filterItemFull}>
                    <Text style={styles.filterLabel}>Recherche</Text>
                    <View style={styles.filterInputWrap}>
                      <Feather name="search" size={14} color={colors.textMuted} />
                      <TextInput
                        style={styles.filterTextInput}
                        placeholder="Nom, email, mots clés..."
                        placeholderTextColor={colors.textDisabled}
                        value={query}
                        onChangeText={setQuery}
                        returnKeyType="search"
                        onSubmitEditing={handleFilter}
                      />
                      {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                          <Feather name="x" size={13} color={colors.textMuted} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Grille 2×2 */}
                  <View style={styles.filterGrid}>
                    <View style={styles.filterItem}>
                      <Text style={styles.filterLabel}>Pays</Text>
                      <DropPicker title="Pays" value={pays} options={PAYS_OPTIONS} onSelect={setPays} {...sp} />
                    </View>
                    <View style={styles.filterItem}>
                      <Text style={styles.filterLabel}>Profession</Text>
                      <DropPicker title="Profession" value={profession} options={PROF_OPTIONS} onSelect={setProfession} {...sp} />
                    </View>
                    <View style={styles.filterItem}>
                      <Text style={styles.filterLabel}>Disponibilité</Text>
                      <DropPicker title="Disponibilité" value={dispo} options={DISPO_OPTIONS} onSelect={setDispo} {...sp} />
                    </View>
                    <View style={styles.filterItem}>
                      <Text style={styles.filterLabel}>Type de contrat</Text>
                      <DropPicker title="Type de contrat" value={type} options={TYPE_OPTIONS} onSelect={setType} {...sp} />
                    </View>
                    <View style={styles.filterItem}>
                      <Text style={styles.filterLabel}>Exp. min (ans)</Text>
                      <TextInput
                        style={styles.filterNumInput}
                        placeholder="0"
                        placeholderTextColor={colors.textDisabled}
                        value={expMin}
                        onChangeText={(v) => setExpMin(v.replace(/\D/g, ''))}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.filterItem}>
                      <Text style={styles.filterLabel}>Trier par</Text>
                      <DropPicker
                        title="Trier par"
                        value={sort.label}
                        options={SORT_OPTIONS.map((s) => s.label)}
                        onSelect={(label) => {
                          const found = SORT_OPTIONS.find((s) => s.label === label);
                          if (found) setSort(found);
                        }}
                        {...sp}
                      />
                    </View>
                  </View>

                  {/* Boutons */}
                  <View style={styles.filterBtns}>
                    <TouchableOpacity
                      style={[styles.filtrerBtn, loading && styles.filtrerBtnDisabled]}
                      onPress={handleFilter} disabled={loading} activeOpacity={0.85}
                    >
                      {loading
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Feather name="search" size={14} color="#fff" />}
                      <Text style={styles.filtrerBtnText}>{loading ? 'Recherche…' : 'Filtrer'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.effacerBtn} onPress={resetFilters} activeOpacity={0.8}>
                      <Text style={styles.effacerBtnText}>Effacer</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ── État de chargement initial ── */}
                {loading && results.length === 0 ? (
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator color={BLUE} size="large" />
                    <Text style={styles.loadingText}>Chargement des candidats…</Text>
                  </View>

                ) : searched && !loading && results.length === 0 ? (
                  <View style={styles.infoBox}>
                    <View style={[styles.infoIconWrap, { backgroundColor: '#EBF7FD' }]}>
                      <Feather name="search" size={18} color={BLUE} />
                    </View>
                    <Text style={styles.infoTitle}>Aucun candidat trouvé</Text>
                    <Text style={styles.infoText}>Essayez d'élargir vos critères de recherche.</Text>
                  </View>

                ) : results.length > 0 ? (
                  <>
                    {/* En-tête résultats */}
                    <View style={styles.resultsBar}>
                      <View style={styles.resultsLeft}>
                        <View style={styles.resultAccent} />
                        <Text style={styles.resultsCountText}>
                          {total} candidat{total > 1 ? 's' : ''} — page {page}/{lastPage}
                        </Text>
                      </View>
                      <View style={styles.resultsControls}>
                        <Text style={styles.sortLabel}>Par page</Text>
                        <TouchableOpacity
                          style={styles.miniSelect}
                          onPress={() => {
                            const idx = PER_PAGE_OPT.indexOf(perPage);
                            handlePerPage(PER_PAGE_OPT[(idx + 1) % PER_PAGE_OPT.length]);
                          }}
                        >
                          <Text style={styles.miniSelectText}>{perPage}</Text>
                          <Feather name="chevron-down" size={11} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Cartes candidats */}
                    {results.map((cv) => {
                      const url = cv.profile_url ?? cv.cv_url ?? `https://santeafrique.net/cvtheque/${cv.id}`;
                      return (
                        <CvCard
                          key={cv.id}
                          cv={cv}
                          styles={styles}
                          colors={colors}
                          onView={() => onViewCV?.(url, cv.name)}
                        />
                      );
                    })}

                    {/* Pagination */}
                    <View style={styles.paginationRow}>
                      <TouchableOpacity
                        style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                        onPress={() => { if (page > 1) handlePage(page - 1); }}
                        disabled={page <= 1} activeOpacity={0.8}
                      >
                        <Feather name="chevron-left" size={14} color={colors.textSecondary} />
                        <Text style={styles.pageBtnText}>Préc.</Text>
                      </TouchableOpacity>

                      <Text style={styles.pageInfo}>{page} / {lastPage}</Text>

                      <TouchableOpacity
                        style={[styles.pageBtn, page >= lastPage && styles.pageBtnDisabled]}
                        onPress={() => { if (page < lastPage) handlePage(page + 1); }}
                        disabled={page >= lastPage} activeOpacity={0.8}
                      >
                        <Text style={styles.pageBtnText}>Suiv.</Text>
                        <Feather name="chevron-right" size={14} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </>

                ) : null}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
