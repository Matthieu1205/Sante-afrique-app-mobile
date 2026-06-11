import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';
import type { UserProfile, ApplicationItem, NewsletterItem } from '@/services/api';
import {
  updateUserProfile,
  changePassword,
  fetchMyApplications,
  fetchNewsletterPreferences,
  toggleNewsletter,
  formatDate,
} from '@/services/api';
import { SubmitCVModal } from '../jobs/SubmitCVModal';

interface ProfileScreenProps {
  userProfile: UserProfile;
  onBack?: () => void;
  onSubscribe?: () => void;
  onFavoritesPress?: () => void;
  onHistoryPress?: () => void;
  onFacturesPress?: () => void;
  onSettingsPress?: () => void;
  onLogout?: () => void;
  onProfileUpdated?: (name: string) => void;
}

const BLUE   = '#1B9DD9';
const NAVY   = '#0D2137';
const GREEN  = '#27AE60';
const ORANGE = '#E67E22';
const RED    = '#C0392B';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function daysRemaining(expiresAt: string | null | undefined): number {
  if (!expiresAt) return 0;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'En attente', accepted: 'Acceptée', rejected: 'Refusée',
    interview: 'Entretien', viewed: 'Vue', shortlisted: 'Présélectionnée',
  };
  return map[status.toLowerCase()] ?? status;
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    pending: ORANGE, accepted: GREEN, rejected: RED,
    interview: BLUE, viewed: '#6B7280', shortlisted: '#7C3AED',
  };
  return map[status.toLowerCase()] ?? '#6B7280';
}

const AVANTAGES = [
  'Tous les articles en illimité',
  'Accès aux numéros en avant-première',
  'Contenus et dossiers réservés aux abonnés',
  'Lecture confortable sur tous vos appareils',
  'Support client dédié abonnement',
];

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['3'],
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: '#fff',
    textAlign: 'center',
  },

  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing['4'],
    paddingHorizontal: Spacing['4'],
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3'],
  },
  avatarText: { fontFamily: FontFamily.headingBold, fontSize: 26, color: '#fff' },
  profileName: { fontFamily: FontFamily.headingBold, fontSize: FontSize.xl, color: '#fff', marginBottom: 4 },
  profileEmail: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)' },

  statsRow: {
    flexDirection: 'row',
    gap: Spacing['3'],
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['4'],
  },
  statCard: {
    flex: 1,
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: Spacing['3'],
    borderTopWidth: 3,
    ...Shadows.card,
  },
  statCardBorderBlue: { borderTopColor: BLUE },
  statCardBorderGreen: { borderTopColor: GREEN },
  statCardBorderOrange: { borderTopColor: ORANGE },
  statLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 9,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing['2'],
  },
  statValue: { fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: C.textPrimary },
  statValueActive: { color: GREEN },
  statValueInactive: { color: ORANGE },

  sectionWrap: {
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['5'],
    paddingBottom: Spacing['2'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionBar: { width: 3, height: 16, backgroundColor: BLUE, borderRadius: 2 },
  sectionTitle: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing['4'],
    gap: Spacing['3'],
  },
  quickItem: {
    width: '47.5%',
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.borderLight,
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['4'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...Shadows.card,
  },
  quickIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${BLUE}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.sm,
    color: NAVY,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  avantagesCard: {
    marginHorizontal: Spacing['4'],
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: Spacing['4'],
    gap: Spacing['3'],
    ...Shadows.card,
  },
  avantageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing['2'] },
  avantageText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textSecondary, flex: 1 },

  subCard: {
    marginHorizontal: Spacing['4'],
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: Spacing['4'],
    ...Shadows.card,
  },
  subCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing['3'] },
  subCardTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: C.textPrimary },
  subBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.sm, borderWidth: 1.5 },
  subBadgeActive: { borderColor: GREEN },
  subBadgeInactive: { borderColor: ORANGE },
  subBadgeText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs, letterSpacing: 0.5 },
  subBadgeTextActive: { color: GREEN },
  subBadgeTextInactive: { color: ORANGE },
  subFormule: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textSecondary, marginBottom: 4 },
  subFormuleBold: { fontFamily: FontFamily.bodySemiBold, color: C.textPrimary },
  subDates: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted, marginBottom: Spacing['4'] },
  subBtnRow: { flexDirection: 'row', gap: Spacing['3'] },
  subBtnPrimary: {
    flex: 1,
    backgroundColor: BLUE,
    borderRadius: Radius.sm,
    paddingVertical: 11,
    alignItems: 'center',
  },
  subBtnPrimaryText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  subBtnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: Radius.sm,
    paddingVertical: 11,
    alignItems: 'center',
  },
  subBtnOutlineText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: C.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  subCtaFull: {
    backgroundColor: BLUE,
    borderRadius: Radius.sm,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: Spacing['3'],
  },
  subCtaFullText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: '#fff', letterSpacing: 0.5 },

  group: {
    backgroundColor: C.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    gap: Spacing['3'],
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: C.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: C.textPrimary },
  rowLabelDanger: { color: RED },

  content: { paddingBottom: 48 },

  // ── Modaux communs ───────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.backgroundCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: C.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  modalTitle: {
    flex: 1,
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: C.textPrimary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: { padding: Spacing['4'] },

  // ── Formulaire édition profil ────────────────────────────────────
  fieldLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: Spacing['3'],
  },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing['3'],
    paddingVertical: 11,
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: C.textPrimary,
    backgroundColor: C.background,
  },
  fieldInputDisabled: {
    color: C.textMuted,
    backgroundColor: C.backgroundCard,
  },
  fieldHint: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: C.textDisabled,
    marginTop: 4,
  },
  formBtnRow: {
    flexDirection: 'row',
    gap: Spacing['3'],
    marginTop: Spacing['5'],
    paddingBottom: Spacing['2'],
  },
  formBtnPrimary: {
    flex: 1,
    backgroundColor: BLUE,
    borderRadius: Radius.sm,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  formBtnPrimaryText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: '#fff' },
  formBtnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: Radius.sm,
    paddingVertical: 13,
    alignItems: 'center',
  },
  formBtnOutlineText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: C.textPrimary },

  // ── Candidatures ─────────────────────────────────────────────────
  appCard: {
    backgroundColor: C.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: Spacing['3'],
    marginBottom: Spacing['3'],
    gap: 4,
  },
  appTitle: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: C.textPrimary },
  appCompany: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted },
  appMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  appDate: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textDisabled },
  appStatusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  appStatusText: { fontFamily: FontFamily.bodyBold, fontSize: 10, color: '#fff', letterSpacing: 0.4 },

  emptyWrap: { alignItems: 'center', paddingVertical: Spacing['8'], gap: Spacing['3'] },
  emptyIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.background,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.borderLight,
  },
  emptyTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: C.textPrimary },
  emptyText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted, textAlign: 'center' },

  // ── Newsletters ───────────────────────────────────────────────────
  nlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    gap: Spacing['3'],
  },
  nlInfo: { flex: 1 },
  nlName: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: C.textPrimary },
  nlDesc: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted },
});

const Row: React.FC<{
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  danger?: boolean;
  onPress?: () => void;
}> = ({ icon, label, danger = false, onPress }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowIcon}>
        <Feather name={icon} size={18} color={danger ? RED : colors.textSecondary} />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      {!danger && <Feather name="chevron-right" size={18} color={colors.textDisabled} />}
    </TouchableOpacity>
  );
};

// ─── Modal : Édition profil ───────────────────────────────────────

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaved: (name: string, phone: string, country: string) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose, userProfile, onSaved }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [name, setName] = useState(userProfile.name);
  const [phone, setPhone] = useState(userProfile.phone ?? '');
  const [country, setCountry] = useState(userProfile.country ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(userProfile.name);
      setPhone(userProfile.phone ?? '');
      setCountry(userProfile.country ?? '');
    }
  }, [visible, userProfile]);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Erreur', 'Le nom est requis.'); return; }
    setSaving(true);
    const res = await updateUserProfile({ name: name.trim(), phone: phone.trim(), country: country.trim() });
    setSaving(false);
    if (res.ok) {
      onSaved(name.trim(), phone.trim(), country.trim());
      onClose();
    } else {
      Alert.alert('Erreur', res.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Modifier mon profil</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.fieldLabel}>Adresse email</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputDisabled]}
              value={userProfile.email}
              editable={false}
            />
            <Text style={styles.fieldHint}>L'adresse email ne peut pas être modifiée ici.</Text>

            <Text style={styles.fieldLabel}>Nom complet *</Text>
            <TextInput
              style={styles.fieldInput}
              value={name}
              onChangeText={setName}
              placeholder="Votre nom complet"
              placeholderTextColor={colors.textDisabled}
              autoCapitalize="words"
            />

            <Text style={styles.fieldLabel}>Téléphone</Text>
            <TextInput
              style={styles.fieldInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="+225 0700000000"
              placeholderTextColor={colors.textDisabled}
              keyboardType="phone-pad"
            />

            <Text style={styles.fieldLabel}>Pays de résidence</Text>
            <TextInput
              style={styles.fieldInput}
              value={country}
              onChangeText={setCountry}
              placeholder="Ex: Côte d'Ivoire"
              placeholderTextColor={colors.textDisabled}
              autoCapitalize="words"
            />

            <View style={styles.formBtnRow}>
              <TouchableOpacity style={styles.formBtnOutline} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.formBtnOutlineText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formBtnPrimary} onPress={handleSave} activeOpacity={0.85} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.formBtnPrimaryText}>Enregistrer</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Modal : Changer mot de passe ────────────────────────────────

const ChangePasswordModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!visible) { setCurrent(''); setNext(''); setConfirm(''); } }, [visible]);

  const handleSave = async () => {
    if (!current.trim() || !next.trim()) { Alert.alert('Erreur', 'Tous les champs sont requis.'); return; }
    if (next !== confirm) { Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas.'); return; }
    if (next.length < 8) { Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.'); return; }
    setSaving(true);
    const res = await changePassword({ current_password: current, new_password: next, new_password_confirmation: confirm });
    setSaving(false);
    if (res.ok) {
      Alert.alert('Succès', res.message);
      onClose();
    } else {
      Alert.alert('Erreur', res.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Changer le mot de passe</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.fieldLabel}>Mot de passe actuel *</Text>
            <TextInput
              style={styles.fieldInput}
              value={current}
              onChangeText={setCurrent}
              placeholder="••••••••"
              placeholderTextColor={colors.textDisabled}
              secureTextEntry
            />
            <Text style={styles.fieldLabel}>Nouveau mot de passe *</Text>
            <TextInput
              style={styles.fieldInput}
              value={next}
              onChangeText={setNext}
              placeholder="Min. 8 caractères"
              placeholderTextColor={colors.textDisabled}
              secureTextEntry
            />
            <Text style={styles.fieldLabel}>Confirmer le nouveau mot de passe *</Text>
            <TextInput
              style={styles.fieldInput}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="••••••••"
              placeholderTextColor={colors.textDisabled}
              secureTextEntry
            />
            <View style={styles.formBtnRow}>
              <TouchableOpacity style={styles.formBtnOutline} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.formBtnOutlineText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formBtnPrimary} onPress={handleSave} activeOpacity={0.85} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.formBtnPrimaryText}>Enregistrer</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Modal : Mes candidatures ─────────────────────────────────────

const CandidaturesModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ApplicationItem[]>([]);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    fetchMyApplications().then((data) => { setItems(data); setLoading(false); });
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalSheet, { maxHeight: '88%' }]}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mes candidatures</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.emptyWrap}>
                <ActivityIndicator color={BLUE} size="large" />
              </View>
            ) : items.length === 0 ? (
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Feather name="briefcase" size={24} color={colors.textDisabled} />
                </View>
                <Text style={styles.emptyTitle}>Aucune candidature</Text>
                <Text style={styles.emptyText}>Vous n'avez pas encore postulé à une offre d'emploi.</Text>
              </View>
            ) : (
              items.map((item) => (
                <View key={item.id} style={styles.appCard}>
                  <Text style={styles.appTitle}>{item.job_title}</Text>
                  <Text style={styles.appCompany}>{item.company}</Text>
                  <View style={styles.appMeta}>
                    <Text style={styles.appDate}>{item.created_at ? formatDate(item.created_at) : '—'}</Text>
                    <View style={[styles.appStatusBadge, { backgroundColor: statusColor(item.status) }]}>
                      <Text style={styles.appStatusText}>{statusLabel(item.status)}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Modal : Newsletters ──────────────────────────────────────────

const NewslettersModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NewsletterItem[]>([]);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    fetchNewsletterPreferences().then((data) => { setItems(data); setLoading(false); });
  }, [visible]);

  const handleToggle = async (id: number, newValue: boolean) => {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, subscribed: newValue } : n));
    const res = await toggleNewsletter(id, newValue);
    if (!res.ok) {
      setItems((prev) => prev.map((n) => n.id === id ? { ...n, subscribed: !newValue } : n));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalSheet, { maxHeight: '88%' }]}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Newsletters</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.emptyWrap}>
                <ActivityIndicator color={BLUE} size="large" />
              </View>
            ) : items.length === 0 ? (
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Feather name="mail" size={24} color={colors.textDisabled} />
                </View>
                <Text style={styles.emptyTitle}>Aucune newsletter</Text>
                <Text style={styles.emptyText}>Il n'y a pas de newsletter disponible pour le moment.</Text>
              </View>
            ) : (
              items.map((item) => (
                <View key={item.id} style={styles.nlRow}>
                  <View style={styles.nlInfo}>
                    <Text style={styles.nlName}>{item.name}</Text>
                    {!!item.description && <Text style={styles.nlDesc}>{item.description}</Text>}
                  </View>
                  <Switch
                    value={item.subscribed}
                    onValueChange={(v) => handleToggle(item.id, v)}
                    trackColor={{ false: colors.borderLight, true: `${BLUE}80` }}
                    thumbColor={item.subscribed ? BLUE : colors.textDisabled}
                  />
                </View>
              ))
            )}
            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Écran principal ──────────────────────────────────────────────

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  onBack,
  onSubscribe,
  onFavoritesPress,
  onHistoryPress,
  onFacturesPress,
  onSettingsPress,
  onLogout,
  onProfileUpdated,
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [localProfile, setLocalProfile] = useState(userProfile);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [cvthequeOpen, setCvthequeOpen] = useState(false);
  const [candidaturesOpen, setCandidaturesOpen] = useState(false);
  const [newslettersOpen, setNewslettersOpen] = useState(false);

  const sub = localProfile.subscription;
  const isActive = sub?.is_active ?? false;
  const days = isActive ? daysRemaining(sub?.expires_at) : 0;

  const handleLogout = () => {
    Alert.alert(
      'Se déconnecter',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: onLogout },
      ],
    );
  };

  const handleProfileSaved = (name: string, phone: string, country: string) => {
    setLocalProfile((p) => ({ ...p, name, phone, country }));
    onProfileUpdated?.(name);
  };

  const QUICK_ITEMS = [
    {
      label: 'Mon profil',
      icon: 'user' as const,
      onPress: () => setEditProfileOpen(true),
    },
    {
      label: 'Mes candidatures',
      icon: 'briefcase' as const,
      onPress: () => setCandidaturesOpen(true),
    },
    {
      label: 'Ma CVthèque',
      icon: 'file-text' as const,
      onPress: () => setCvthequeOpen(true),
    },
    {
      label: 'Newsletters',
      icon: 'mail' as const,
      onPress: () => setNewslettersOpen(true),
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={NAVY} />

      {/* Header + avatar gradient */}
      <LinearGradient colors={[BLUE, NAVY]} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon profil</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setEditProfileOpen(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="edit-2" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(localProfile.name)}</Text>
          </View>
          <Text style={styles.profileName}>{localProfile.name}</Text>
          <Text style={styles.profileEmail}>{localProfile.email}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardBorderBlue]}>
            <Text style={styles.statLabel}>Statut abonnement</Text>
            <Text style={[styles.statValue, isActive ? styles.statValueActive : styles.statValueInactive]}>
              {isActive ? 'Actif' : 'Inactif'}
            </Text>
          </View>
          <View style={[styles.statCard, isActive ? styles.statCardBorderGreen : styles.statCardBorderOrange]}>
            <Text style={styles.statLabel}>Jours restants</Text>
            <Text style={styles.statValue}>{isActive ? `${days} j` : '—'}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardBorderBlue]}>
            <Text style={styles.statLabel}>Candidatures</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setCandidaturesOpen(true)}>
              <Text style={[styles.statValue, { color: BLUE }]}>Voir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Accès rapide ───────────────────────────────────────── */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>Accès rapide</Text>
        </View>
        <View style={styles.quickGrid}>
          {QUICK_ITEMS.map((item) => (
            <TouchableOpacity key={item.label} style={styles.quickItem} onPress={item.onPress} activeOpacity={0.75}>
              <View style={styles.quickIcon}>
                <Feather name={item.icon} size={16} color={BLUE} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={14} color={NAVY} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Avantages (si abonné) ──────────────────────────────── */}
        {isActive && (
          <>
            <View style={styles.sectionWrap}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Vos avantages Santé Afrique</Text>
            </View>
            <View style={styles.avantagesCard}>
              {AVANTAGES.map((a) => (
                <View key={a} style={styles.avantageRow}>
                  <Feather name="check" size={15} color={GREEN} />
                  <Text style={styles.avantageText}>{a}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Mon abonnement ─────────────────────────────────────── */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>Mon abonnement</Text>
        </View>
        <View style={styles.subCard}>
          <View style={styles.subCardTop}>
            <Text style={styles.subCardTitle}>
              {isActive ? 'Abonnement en cours' : 'Aucun abonnement'}
            </Text>
            <View style={[styles.subBadge, isActive ? styles.subBadgeActive : styles.subBadgeInactive]}>
              <Text style={[styles.subBadgeText, isActive ? styles.subBadgeTextActive : styles.subBadgeTextInactive]}>
                {isActive ? 'ACTIF' : 'INACTIF'}
              </Text>
            </View>
          </View>

          {isActive && sub ? (
            <>
              <Text style={styles.subFormule}>
                {'Formule : '}
                <Text style={styles.subFormuleBold}>{sub.plan}</Text>
              </Text>
              <Text style={styles.subDates}>
                {sub.starts_at ? `Début : ${fmtDate(sub.starts_at)} · ` : ''}
                {`Expire le : ${fmtDate(sub.expires_at)}`}
              </Text>
              <View style={styles.subBtnRow}>
                <TouchableOpacity style={styles.subBtnPrimary} onPress={onSubscribe} activeOpacity={0.85}>
                  <Text style={styles.subBtnPrimaryText}>Modifier mon abonnement</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subBtnOutline} onPress={onFacturesPress} activeOpacity={0.85}>
                  <Text style={styles.subBtnOutlineText}>Mes factures</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.subFormule}>Accédez à tous les contenus Santé Afrique sans limitation.</Text>
              <TouchableOpacity style={styles.subCtaFull} onPress={onSubscribe} activeOpacity={0.85}>
                <Text style={styles.subCtaFullText}>S'abonner — À partir de 1 250 FCFA/mois</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Mon contenu ────────────────────────────────────────── */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>Mon contenu</Text>
        </View>
        <View style={styles.group}>
          <Row icon="bookmark" label="Mes favoris" onPress={onFavoritesPress} />
          <Row icon="clock" label="Historique de lecture" onPress={onHistoryPress} />
          <Row icon="lock" label="Changer le mot de passe" onPress={() => setChangePasswordOpen(true)} />
          <Row icon="settings" label="Paramètres" onPress={onSettingsPress} />
          <Row icon="log-out" label="Se déconnecter" danger onPress={handleLogout} />
        </View>

      </ScrollView>

      {/* ── Modaux accès rapide ─────────────────────────────────── */}
      <EditProfileModal
        visible={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        userProfile={localProfile}
        onSaved={handleProfileSaved}
      />

      <ChangePasswordModal
        visible={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />

      <CandidaturesModal
        visible={candidaturesOpen}
        onClose={() => setCandidaturesOpen(false)}
      />

      <SubmitCVModal
        visible={cvthequeOpen}
        onClose={() => setCvthequeOpen(false)}
      />

      <NewslettersModal
        visible={newslettersOpen}
        onClose={() => setNewslettersOpen(false)}
      />
    </View>
  );
};
