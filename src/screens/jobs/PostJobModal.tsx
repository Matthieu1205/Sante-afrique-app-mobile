import { postJob } from '@/services/api';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, ScrollView,
  TextInput, StyleSheet, StatusBar, KeyboardAvoidingView,
  Platform, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

// ─── Options ─────────────────────────────────────────────────────

const CONTRACT_TYPES = ['CDI', 'CDD', 'Stage', 'Freelance'];

const PROFESSION_OPTIONS = [
  'Médecin généraliste', 'Médecin spécialiste', 'Pharmacien(ne)',
  'Sage-femme', 'Infirmier(e)', 'Chirurgien(ne)-dentiste',
  'Biologiste médical', 'Kinésithérapeute', 'Nutritionniste',
  'Technicien de laboratoire', 'Agent de santé communautaire',
  'Journaliste santé', 'Manager / Administrateur santé',
  'Chargé(e) de communication santé', 'Autre',
];

const PAYS_OPTIONS = [
  "Côte d'Ivoire", 'Sénégal', 'Cameroun', 'Mali', 'Burkina Faso',
  'Ghana', 'Nigeria', 'Maroc', 'Tunisie', 'Bénin', 'Togo',
  'Niger', 'Guinée', 'RD Congo', 'Autre',
];

// ─── Styles ───────────────────────────────────────────────────────

const BLUE = '#1B9DD9';
const RED  = '#EF4444';

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.backgroundCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: C.borderLight,
    alignSelf: 'center',
    marginTop: Spacing['3'], marginBottom: Spacing['2'],
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing['4'], paddingBottom: Spacing['3'],
    borderBottomWidth: 1, borderBottomColor: C.borderLight,
  },
  headerTitle: {
    flex: 1, fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg, color: C.textPrimary,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: C.background,
    alignItems: 'center', justifyContent: 'center',
  },

  content: { padding: Spacing['4'], paddingBottom: Spacing['6'] },

  // Section
  sectionCard: {
    borderWidth: 1, borderColor: C.borderLight,
    borderRadius: Radius.lg,
    marginBottom: Spacing['4'],
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing['3'],
    paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'],
    borderBottomWidth: 1, borderBottomColor: C.borderLight,
    backgroundColor: C.background,
  },
  stepBadge: {
    width: 28, height: 28, borderRadius: 6,
    backgroundColor: BLUE,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: {
    fontFamily: FontFamily.headingBold, fontSize: FontSize.sm, color: '#fff',
  },
  sectionTitle: {
    fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: C.textPrimary,
  },
  sectionSub: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted,
  },
  sectionBody: { padding: Spacing['4'], gap: Spacing['3'] },

  // Champ
  field: { gap: Spacing['1'] },
  row2: { flexDirection: 'row', gap: Spacing['3'] },
  row3: { flexDirection: 'row', gap: Spacing['2'] },
  flex1: { flex: 1 },

  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10, color: C.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  required: { color: RED },

  input: {
    backgroundColor: C.background, borderWidth: 1,
    borderColor: C.borderLight, borderRadius: Radius.md,
    paddingHorizontal: Spacing['3'], paddingVertical: 11,
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: C.textPrimary,
  },
  inputFocused: { borderColor: BLUE },
  textarea: { height: 130, textAlignVertical: 'top' },
  hint: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs,
    color: BLUE, marginTop: 2,
  },
  inputEx: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs,
    color: C.textMuted, marginTop: 2,
  },

  // Chips type contrat
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'] },
  chip: {
    paddingHorizontal: Spacing['3'], paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1.5,
    borderColor: C.borderLight, backgroundColor: C.background,
  },
  chipActive: { backgroundColor: BLUE, borderColor: BLUE },
  chipText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: C.textSecondary },
  chipTextActive: { color: '#fff' },

  // Select picker
  selectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.background, borderWidth: 1,
    borderColor: C.borderLight, borderRadius: Radius.md,
    paddingHorizontal: Spacing['3'], paddingVertical: 11,
  },
  selectBtnActive: { borderColor: BLUE },
  selectBtnText: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: C.textDisabled, flex: 1,
  },
  selectBtnTextActive: { color: C.textPrimary },

  // Logo upload
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing['3'] },
  logoPreview: {
    width: 64, height: 64, borderRadius: Radius.md,
    backgroundColor: C.background,
    borderWidth: 1, borderColor: C.borderLight,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  logoBtn: {
    backgroundColor: BLUE, borderRadius: Radius.md,
    paddingHorizontal: Spacing['4'], paddingVertical: 10,
  },
  logoBtnText: {
    fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: '#fff',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  logoHint: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted,
    marginTop: 4,
  },

  // Picker sheet
  pickerOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: C.backgroundCard,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  pickerHead: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'],
    borderBottomWidth: 1, borderBottomColor: C.borderLight,
  },
  pickerTitle: {
    flex: 1, fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base, color: C.textPrimary,
  },
  pickerOpt: {
    paddingHorizontal: Spacing['4'], paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.borderLight,
  },
  pickerOptActive: { backgroundColor: C.primaryUltraLight },
  pickerOptText: {
    fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textPrimary,
  },
  pickerOptTextActive: { color: BLUE, fontFamily: FontFamily.bodySemiBold },

  // Footer
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Spacing['4'],
  },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: Spacing['2'] },
  cancelText: {
    fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm,
    color: C.textMuted,
  },
  submitBtn: {
    flex: 1, marginLeft: Spacing['4'],
    backgroundColor: '#0D2137',
    borderRadius: Radius.md, paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: '#fff',
    letterSpacing: 0.3,
  },
  subscribeBtn: {
    flex: 1, marginLeft: Spacing['4'],
    backgroundColor: '#059669',
    borderRadius: Radius.md, paddingVertical: 14,
    alignItems: 'center',
  },
  subscribeBtnText: {
    fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: '#fff',
  },

  // Erreur
  errorBox: {
    backgroundColor: '#FEF2F2', borderRadius: Radius.md,
    borderWidth: 1, borderColor: '#FECACA',
    padding: Spacing['3'], marginBottom: Spacing['3'],
  },
  errorText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: RED },

  // Succès
  successWrap: {
    alignItems: 'center', paddingVertical: 56, paddingHorizontal: Spacing['4'],
  },
  successIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#D1FAE5', alignItems: 'center',
    justifyContent: 'center', marginBottom: Spacing['4'],
  },
  successTitle: {
    fontFamily: FontFamily.headingBold, fontSize: FontSize.xl,
    color: C.textPrimary, textAlign: 'center', marginBottom: Spacing['2'],
  },
  successSub: {
    fontFamily: FontFamily.body, fontSize: FontSize.base,
    color: C.textMuted, textAlign: 'center', lineHeight: 24,
  },
  doneBtn: {
    backgroundColor: BLUE, borderRadius: Radius.md,
    paddingVertical: 14, paddingHorizontal: Spacing['8'],
    marginTop: Spacing['5'],
  },
  doneBtnText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: '#fff' },
});

// ─── Picker générique ─────────────────────────────────────────────

const SheetPicker: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  styles: ReturnType<typeof makeStyles>;
  colors: ThemeColors;
}> = ({ label, options, value, onChange, placeholder = 'Sélectionner...', styles, colors }) => {
  const [open, setOpen] = useState(false);
  const hasValue = !!value;
  return (
    <>
      <TouchableOpacity
        style={[styles.selectBtn, hasValue && styles.selectBtnActive]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.selectBtnText, hasValue && styles.selectBtnTextActive]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={14} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHead}>
              <Text style={styles.pickerTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Feather name="x" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.pickerOpt, value === opt && styles.pickerOptActive]}
                  onPress={() => { onChange(opt); setOpen(false); }}
                >
                  <Text style={[styles.pickerOptText, value === opt && styles.pickerOptTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// ─── Modal principal ──────────────────────────────────────────────

interface Props { visible: boolean; onClose: () => void; onSubscribe?: () => void; }

export const PostJobModal: React.FC<Props> = ({ visible, onClose, onSubscribe }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();

  const [submitted, setSubmitted]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState('');
  const [needsSub, setNeedsSub]       = useState(false);
  const [focused, setFocused]         = useState('');

  // Section 1 — Votre entreprise
  const [company, setCompany]   = useState('');
  const [address, setAddress]   = useState('');
  const [logoUri, setLogoUri]   = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string | null>(null);

  // Section 2 — Détails du poste
  const [title, setTitle]           = useState('');
  const [contrat, setContrat]       = useState('');
  const [profession, setProfession] = useState('');
  const [ville, setVille]           = useState('');
  const [pays, setPays]             = useState('');
  const [expMin, setExpMin]         = useState('');

  // Section 3 — Description
  const [description, setDescription] = useState('');
  const [profile, setProfile]         = useState('');

  const reset = () => {
    setSubmitted(false); setNeedsSub(false); setServerError('');
    setCompany(''); setAddress(''); setLogoUri(null); setLogoName(null);
    setTitle(''); setContrat(''); setProfession(''); setVille('');
    setPays(''); setExpMin(''); setDescription(''); setProfile('');
  };

  const handleClose = () => { reset(); onClose(); };

  const pickLogo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/png', 'image/jpeg'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        setLogoUri(result.assets[0].uri);
        setLogoName(result.assets[0].name);
      }
    } catch {}
  };

  const handleSubmit = async () => {
    if (!company.trim()) { setServerError('Le nom / raison sociale est obligatoire.'); return; }
    if (!title.trim())   { setServerError('Le titre du poste est obligatoire.'); return; }
    if (!contrat)        { setServerError('Le type de contrat est obligatoire.'); return; }
    if (!pays)           { setServerError('Le pays est obligatoire.'); return; }
    if (!description.trim()) { setServerError('La description du poste est obligatoire.'); return; }

    setLoading(true); setServerError('');
    const result = await postJob({
      company: company.trim(),
      address: address.trim() || undefined,
      title: title.trim(),
      type: contrat,
      profession: profession || undefined,
      location: ville.trim() || undefined,
      country: pays,
      experience_min: expMin ? parseInt(expMin, 10) : undefined,
      description: description.trim(),
      profile: profile.trim() || undefined,
      logo_uri: logoUri,
      logo_name: logoName,
    });
    setLoading(false);

    if (result.ok) {
      setSubmitted(true);
    } else if (result.needsSubscription) {
      setNeedsSub(true);
      setServerError(result.message);
    } else {
      setServerError(result.message);
    }
  };

  const f = (name: string) => ({ onFocus: () => setFocused(name), onBlur: () => setFocused('') });
  const inp = (name: string) => [styles.input, focused === name && styles.inputFocused];

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={handleClose}>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(0,0,0,0.5)" />
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 0 }}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing['2'] }]}>
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Publier une offre d'emploi</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Feather name="x" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {submitted ? (
              /* ── Succès ── */
              <View style={styles.successWrap}>
                <View style={styles.successIcon}>
                  <Feather name="check" size={36} color="#059669" />
                </View>
                <Text style={styles.successTitle}>Offre soumise !</Text>
                <Text style={styles.successSub}>
                  Votre offre a été transmise à l'équipe Santé Afrique.{'\n'}
                  Elle sera publiée après validation sous 48h.
                </Text>
                <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                  <Text style={styles.doneBtnText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.content}>

                  {/* ── Section 1 : Votre entreprise ── */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.stepBadge}><Text style={styles.stepNum}>1</Text></View>
                      <View>
                        <Text style={styles.sectionTitle}>Votre entreprise</Text>
                        <Text style={styles.sectionSub}>Ces informations seront affichées sur l'annonce.</Text>
                      </View>
                    </View>
                    <View style={styles.sectionBody}>

                      <View style={styles.row2}>
                        <View style={[styles.field, styles.flex1]}>
                          <Text style={styles.label}>NOM / RAISON SOCIALE <Text style={styles.required}>*</Text></Text>
                          <TextInput
                            style={inp('company')} placeholder="Ex : PESAN, CHU de Treichville..."
                            placeholderTextColor={colors.textDisabled}
                            value={company} onChangeText={setCompany} {...f('company')}
                          />
                        </View>
                        <View style={[styles.field, styles.flex1]}>
                          <Text style={styles.label}>ADRESSE DU SIÈGE SOCIAL</Text>
                          <TextInput
                            style={inp('address')} placeholder="Cocody, Riviera 2..."
                            placeholderTextColor={colors.textDisabled}
                            value={address} onChangeText={setAddress} {...f('address')}
                          />
                        </View>
                      </View>

                      <View style={styles.field}>
                        <Text style={styles.label}>LOGO DE L'ENTREPRISE</Text>
                        <View style={styles.logoRow}>
                          <View style={styles.logoPreview}>
                            {logoUri ? (
                              <Image source={{ uri: logoUri }} style={{ width: 64, height: 64 }} resizeMode="contain" />
                            ) : (
                              <Feather name="image" size={22} color={colors.textDisabled} />
                            )}
                          </View>
                          <View>
                            <TouchableOpacity style={styles.logoBtn} onPress={pickLogo} activeOpacity={0.8}>
                              <Text style={styles.logoBtnText}>Choisir un fichier</Text>
                            </TouchableOpacity>
                            <Text style={styles.logoHint}>PNG ou JPG · max 2 Mo · optionnel</Text>
                          </View>
                        </View>
                      </View>

                    </View>
                  </View>

                  {/* ── Section 2 : Détails du poste ── */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.stepBadge}><Text style={styles.stepNum}>2</Text></View>
                      <View>
                        <Text style={styles.sectionTitle}>Détails du poste</Text>
                        <Text style={styles.sectionSub}>Informations clés affichées en tête d'annonce.</Text>
                      </View>
                    </View>
                    <View style={styles.sectionBody}>

                      <View style={styles.field}>
                        <Text style={styles.label}>TITRE DU POSTE <Text style={styles.required}>*</Text></Text>
                        <TextInput
                          style={inp('title')} placeholder="Titre clair et précis"
                          placeholderTextColor={colors.textDisabled}
                          value={title} onChangeText={setTitle} {...f('title')}
                        />
                        <Text style={styles.inputEx}>Ex : Animatrice Parapharmacie &amp; Social Media</Text>
                      </View>

                      <View style={styles.row2}>
                        <View style={[styles.field, styles.flex1]}>
                          <Text style={styles.label}>TYPE DE CONTRAT <Text style={styles.required}>*</Text></Text>
                          <SheetPicker
                            label="Type de contrat"
                            options={CONTRACT_TYPES}
                            value={contrat} onChange={setContrat}
                            styles={styles} colors={colors}
                          />
                        </View>
                        <View style={[styles.field, styles.flex1]}>
                          <Text style={styles.label}>PROFESSION CIBLÉE</Text>
                          <SheetPicker
                            label="Profession ciblée"
                            options={PROFESSION_OPTIONS}
                            value={profession} onChange={setProfession}
                            styles={styles} colors={colors}
                          />
                        </View>
                      </View>

                      <View style={styles.row3}>
                        <View style={[styles.field, { flex: 2 }]}>
                          <Text style={styles.label}>VILLE / LOCALISATION</Text>
                          <TextInput
                            style={inp('ville')} placeholder="Abidjan, Dakar..."
                            placeholderTextColor={colors.textDisabled}
                            value={ville} onChangeText={setVille} {...f('ville')}
                          />
                        </View>
                        <View style={[styles.field, { flex: 2 }]}>
                          <Text style={styles.label}>PAYS <Text style={styles.required}>*</Text></Text>
                          <SheetPicker
                            label="Pays"
                            options={PAYS_OPTIONS}
                            value={pays} onChange={setPays}
                            styles={styles} colors={colors}
                          />
                        </View>
                        <View style={[styles.field, { flex: 1 }]}>
                          <Text style={styles.label}>EXP. MIN.</Text>
                          <TextInput
                            style={inp('exp')} placeholder="0"
                            placeholderTextColor={colors.textDisabled}
                            value={expMin} onChangeText={(v) => setExpMin(v.replace(/\D/g, ''))}
                            keyboardType="numeric" {...f('exp')}
                          />
                        </View>
                      </View>

                    </View>
                  </View>

                  {/* ── Section 3 : Description ── */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.stepBadge}><Text style={styles.stepNum}>3</Text></View>
                      <View>
                        <Text style={styles.sectionTitle}>Description de l'offre</Text>
                        <Text style={styles.sectionSub}>Une description précise attire des candidats mieux qualifiés.</Text>
                      </View>
                    </View>
                    <View style={styles.sectionBody}>

                      <View style={styles.field}>
                        <Text style={styles.label}>DESCRIPTION DU POSTE <Text style={styles.required}>*</Text></Text>
                        <TextInput
                          style={[...inp('desc'), styles.textarea]}
                          placeholder="Décrivez la mission, les tâches quotidiennes, le contexte de travail..."
                          placeholderTextColor={colors.textDisabled}
                          value={description} onChangeText={setDescription}
                          multiline numberOfLines={5} {...f('desc')}
                        />
                        <Text style={styles.hint}>Mission, contexte, responsabilités, conditions...</Text>
                      </View>

                      <View style={styles.field}>
                        <Text style={styles.label}>PROFIL RECHERCHÉ</Text>
                        <TextInput
                          style={[...inp('profile'), styles.textarea]}
                          placeholder="Formation requise, compétences techniques, soft skills..."
                          placeholderTextColor={colors.textDisabled}
                          value={profile} onChangeText={setProfile}
                          multiline numberOfLines={5} {...f('profile')}
                        />
                        <Text style={styles.hint}>Diplôme, compétences clés, qualités attendues...</Text>
                      </View>

                    </View>
                  </View>

                  {/* ── Erreur ── */}
                  {serverError ? (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>{serverError}</Text>
                    </View>
                  ) : null}

                  {/* ── Footer : Annuler | Soumettre ── */}
                  <View style={styles.footer}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.7}>
                      <Text style={styles.cancelText}>← Annuler</Text>
                    </TouchableOpacity>
                    {needsSub ? (
                      <TouchableOpacity style={styles.subscribeBtn} onPress={() => { handleClose(); onSubscribe?.(); }} activeOpacity={0.85}>
                        <Text style={styles.subscribeBtnText}>S'abonner pour publier</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                        onPress={handleSubmit} disabled={loading} activeOpacity={0.85}
                      >
                        <Text style={styles.submitBtnText}>
                          {loading ? 'Envoi en cours…' : 'Soumettre l\'offre →'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
