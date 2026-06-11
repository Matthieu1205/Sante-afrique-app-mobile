import { submitCV } from '@/services/api';
import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, ScrollView,
  TextInput, StyleSheet, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

// ─── Options ─────────────────────────────────────────────────────

const PAYS_OPTIONS = [
  "Côte d'Ivoire", 'Sénégal', 'Cameroun', 'Mali', 'Burkina Faso',
  'Ghana', 'Nigeria', 'Kenya', 'Maroc', 'Tunisie', 'Algérie',
  'Guinée', 'Togo', 'Bénin', 'Niger', 'Congo', 'Gabon',
  'Madagascar', 'Rwanda', 'RD Congo', 'Autre',
];

const PROFESSIONS = [
  'Médecin généraliste', 'Médecin spécialiste', 'Pharmacien(ne)',
  'Sage-femme', 'Infirmier(e)', 'Aide-soignant(e)',
  'Chirurgien(ne)-dentiste', 'Biologiste médical', 'Kinésithérapeute',
  'Nutritionniste', 'Épidémiologiste', 'Technicien de laboratoire',
  'Journaliste santé', 'Agent de santé communautaire',
  'Manager / Administrateur santé', 'Chargé(e) de communication santé',
  'Chercheur médical', 'Autre',
];

const CONTRATS     = ['—', 'Stage', 'CDD', 'CDI', 'Freelance'];
const DISPONIBILITES = ['Immédiate', '1 mois', '3 mois', '6 mois'];

// ─── Styles ───────────────────────────────────────────────────────

const BLUE = '#1B9DD9';
const RED  = '#EF4444';

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.backgroundCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
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
  stepNum: { fontFamily: FontFamily.headingBold, fontSize: FontSize.sm, color: '#fff' },
  sectionTitle: {
    fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: C.textPrimary,
  },
  sectionSub: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted,
  },
  sectionBody: { padding: Spacing['4'], gap: Spacing['3'] },

  // Champs
  field: { gap: Spacing['1'] },
  row2: { flexDirection: 'row', gap: Spacing['3'] },
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

  // Select
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

  // Zone dépôt CV
  uploadZone: {
    borderWidth: 1.5, borderColor: C.borderLight,
    borderStyle: 'dashed', borderRadius: Radius.md,
    paddingVertical: Spacing['6'], paddingHorizontal: Spacing['4'],
    alignItems: 'center', gap: Spacing['2'],
    backgroundColor: C.background,
  },
  uploadZoneActive: { borderColor: BLUE, backgroundColor: C.primaryUltraLight },
  uploadIconWrap: {
    width: 48, height: 48, borderRadius: Radius.md,
    borderWidth: 1, borderColor: C.borderLight,
    backgroundColor: C.backgroundCard,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing['1'],
  },
  uploadTitle: {
    fontFamily: FontFamily.headingBold, fontSize: FontSize.base,
    color: C.textPrimary, textAlign: 'center',
  },
  uploadLink: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: BLUE, textDecorationLine: 'underline',
  },
  uploadFormats: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs,
    color: C.textMuted, textAlign: 'center',
  },
  uploadNote: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs,
    color: C.textMuted, marginTop: Spacing['2'],
  },
  uploadFileName: {
    fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm,
    color: BLUE, textAlign: 'center',
  },

  // Erreur
  errorBox: {
    backgroundColor: '#FEF2F2', borderRadius: Radius.md,
    borderWidth: 1, borderColor: '#FECACA',
    padding: Spacing['3'], marginBottom: Spacing['3'],
  },
  errorText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: RED },

  // Footer
  footer: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingTop: Spacing['4'],
  },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: Spacing['2'] },
  cancelText: {
    fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: C.textMuted,
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

  // Succès
  successWrap: {
    alignItems: 'center', paddingVertical: 56, paddingHorizontal: Spacing['4'],
  },
  successIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#D1FAE5',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing['4'],
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
  const hasValue = !!value && value !== '—';
  return (
    <>
      <TouchableOpacity
        style={[styles.selectBtn, hasValue && styles.selectBtnActive]}
        onPress={() => setOpen(true)} activeOpacity={0.8}
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

interface Props { visible: boolean; onClose: () => void; }

export const SubmitCVModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();

  const [submitted, setSubmitted]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState('');
  const [focused, setFocused]         = useState('');

  // Section 1
  const [prenom, setPrenom]         = useState('');
  const [nom, setNom]               = useState('');
  const [email, setEmail]           = useState('');
  const [telephone, setTelephone]   = useState('');
  const [pays, setPays]             = useState('');
  const [ville, setVille]           = useState('');

  // Section 2
  const [profession, setProfession]     = useState('');
  const [experience, setExperience]     = useState('');
  const [competences, setCompetences]   = useState('');
  const [contrat, setContrat]           = useState('—');
  const [disponibilite, setDisponibilite] = useState('Immédiate');

  // Section 3
  const [cvFile, setCvFile] = useState<{ uri: string; name: string } | null>(null);

  const reset = () => {
    setSubmitted(false); setServerError('');
    setPrenom(''); setNom(''); setEmail(''); setTelephone('');
    setPays(''); setVille('');
    setProfession(''); setExperience(''); setCompetences('');
    setContrat('—'); setDisponibilite('Immédiate');
    setCvFile(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handlePickCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setCvFile({ uri: asset.uri, name: asset.name });
      }
    } catch {}
  };

  const handleSubmit = async () => {
    if (!prenom.trim()) { setServerError('Le prénom est obligatoire.'); return; }
    if (!nom.trim())    { setServerError('Le nom est obligatoire.'); return; }
    if (!email.trim())  { setServerError('L\'adresse email est obligatoire.'); return; }
    if (!pays)          { setServerError('Le pays de résidence est obligatoire.'); return; }
    if (!profession)    { setServerError('La profession est obligatoire.'); return; }

    setLoading(true); setServerError('');
    const result = await submitCV({
      first_name: prenom.trim(), last_name: nom.trim(),
      email: email.trim(), phone: telephone || undefined,
      country: pays, city: ville || undefined,
      profession,
      experience: experience || undefined,
      skills: competences || undefined,
      contract: contrat !== '—' ? contrat : undefined,
      availability: disponibilite,
      cv_uri: cvFile?.uri ?? null,
      cv_name: cvFile?.name ?? null,
    });
    setLoading(false);
    if (result.ok) { setSubmitted(true); } else { setServerError(result.message); }
  };

  const f = (name: string) => ({ onFocus: () => setFocused(name), onBlur: () => setFocused('') });
  const inp = (name: string) => [styles.input, focused === name && styles.inputFocused];

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={handleClose}>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(0,0,0,0.55)" />
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 0 }}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing['2'] }]}>
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Rejoindre la CVthèque</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Feather name="x" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {submitted ? (
              <View style={styles.successWrap}>
                <View style={styles.successIcon}>
                  <Feather name="check" size={36} color="#059669" />
                </View>
                <Text style={styles.successTitle}>Profil enregistré !</Text>
                <Text style={styles.successSub}>
                  Votre CV a été déposé sur Santé Afrique.{'\n'}
                  Les recruteurs abonnés pourront consulter votre profil.
                </Text>
                <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                  <Text style={styles.doneBtnText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.content}>

                  {/* ── Section 1 : Informations personnelles ── */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.stepBadge}><Text style={styles.stepNum}>1</Text></View>
                      <View>
                        <Text style={styles.sectionTitle}>Informations personnelles</Text>
                        <Text style={styles.sectionSub}>Les champs marqués * sont obligatoires.</Text>
                      </View>
                    </View>
                    <View style={styles.sectionBody}>

                      <View style={styles.row2}>
                        <View style={[styles.field, styles.flex1]}>
                          <Text style={styles.label}>PRÉNOM <Text style={styles.required}>*</Text></Text>
                          <TextInput style={inp('prenom')} placeholder="Votre prénom"
                            placeholderTextColor={colors.textDisabled}
                            value={prenom} onChangeText={setPrenom} {...f('prenom')} />
                        </View>
                        <View style={[styles.field, styles.flex1]}>
                          <Text style={styles.label}>NOM <Text style={styles.required}>*</Text></Text>
                          <TextInput style={inp('nom')} placeholder="Votre nom"
                            placeholderTextColor={colors.textDisabled}
                            value={nom} onChangeText={setNom} {...f('nom')} />
                        </View>
                      </View>

                      <View style={styles.row2}>
                        <View style={[styles.field, styles.flex1]}>
                          <Text style={styles.label}>ADRESSE EMAIL <Text style={styles.required}>*</Text></Text>
                          <TextInput style={inp('email')} placeholder="vous@exemple.com"
                            placeholderTextColor={colors.textDisabled}
                            value={email} onChangeText={setEmail}
                            keyboardType="email-address" autoCapitalize="none" {...f('email')} />
                        </View>
                        <View style={[styles.field, styles.flex1]}>
                          <Text style={styles.label}>TÉLÉPHONE</Text>
                          <TextInput style={inp('tel')} placeholder="+225 07 00 00 00 00"
                            placeholderTextColor={colors.textDisabled}
                            value={telephone} onChangeText={setTelephone}
                            keyboardType="phone-pad" {...f('tel')} />
                        </View>
                      </View>

                      <View style={styles.row2}>
                        <View style={[styles.field, styles.flex1]}>
                          <Text style={styles.label}>PAYS DE RÉSIDENCE <Text style={styles.required}>*</Text></Text>
                          <SheetPicker
                            label="Pays de résidence"
                            options={PAYS_OPTIONS} value={pays} onChange={setPays}
                            placeholder="Sélectionnez votre pays"
                            styles={styles} colors={colors}
                          />
                        </View>
                        <View style={[styles.field, styles.flex1]}>
                          <Text style={styles.label}>VILLE</Text>
                          <TextInput style={inp('ville')} placeholder="Abidjan, Dakar, Cotonou..."
                            placeholderTextColor={colors.textDisabled}
                            value={ville} onChangeText={setVille} {...f('ville')} />
                        </View>
                      </View>

                    </View>
                  </View>

                  {/* ── Section 2 : Profil professionnel ── */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.stepBadge}><Text style={styles.stepNum}>2</Text></View>
                      <View>
                        <Text style={styles.sectionTitle}>Profil professionnel</Text>
                        <Text style={styles.sectionSub}>Aide les recruteurs à vous trouver lors de leurs recherches.</Text>
                      </View>
                    </View>
                    <View style={styles.sectionBody}>

                      <View style={styles.row2}>
                        <View style={[styles.field, styles.flex1]}>
                          <Text style={styles.label}>PROFESSION <Text style={styles.required}>*</Text></Text>
                          <SheetPicker
                            label="Profession"
                            options={PROFESSIONS} value={profession} onChange={setProfession}
                            placeholder="Sélectionnez votre profession"
                            styles={styles} colors={colors}
                          />
                        </View>
                        <View style={[styles.field, styles.flex1]}>
                          <Text style={styles.label}>ANNÉES D'EXPÉRIENCE</Text>
                          <TextInput style={inp('exp')} placeholder="Ex. : 5"
                            placeholderTextColor={colors.textDisabled}
                            value={experience} onChangeText={(v) => setExperience(v.replace(/\D/g, ''))}
                            keyboardType="numeric" {...f('exp')} />
                        </View>
                      </View>

                      <View style={styles.field}>
                        <Text style={styles.label}>COMPÉTENCES CLÉS</Text>
                        <TextInput style={inp('comp')} placeholder="dispensation, Excel, gestion de projet..."
                          placeholderTextColor={colors.textDisabled}
                          value={competences} onChangeText={setCompetences} {...f('comp')} />
                      </View>

                      <View style={styles.row2}>
                        <View style={[styles.field, styles.flex1]}>
                          <Text style={styles.label}>TYPE DE CONTRAT SOUHAITÉ</Text>
                          <SheetPicker
                            label="Type de contrat souhaité"
                            options={CONTRATS} value={contrat} onChange={setContrat}
                            placeholder="—"
                            styles={styles} colors={colors}
                          />
                        </View>
                        <View style={[styles.field, styles.flex1]}>
                          <Text style={styles.label}>DISPONIBILITÉ</Text>
                          <SheetPicker
                            label="Disponibilité"
                            options={DISPONIBILITES} value={disponibilite} onChange={setDisponibilite}
                            styles={styles} colors={colors}
                          />
                        </View>
                      </View>

                    </View>
                  </View>

                  {/* ── Section 3 : Votre CV ── */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.stepBadge}><Text style={styles.stepNum}>3</Text></View>
                      <View>
                        <Text style={styles.sectionTitle}>Votre CV</Text>
                        <Text style={styles.sectionSub}>PDF, DOC ou DOCX — 8 Mo maximum.</Text>
                      </View>
                    </View>
                    <View style={styles.sectionBody}>

                      <TouchableOpacity
                        style={[styles.uploadZone, cvFile && styles.uploadZoneActive]}
                        onPress={handlePickCV} activeOpacity={0.8}
                      >
                        <View style={styles.uploadIconWrap}>
                          <Feather name="upload" size={22} color={cvFile ? BLUE : colors.textMuted} />
                        </View>
                        {cvFile ? (
                          <Text style={styles.uploadFileName} numberOfLines={1}>{cvFile.name}</Text>
                        ) : (
                          <>
                            <Text style={styles.uploadTitle}>Glissez votre CV ici</Text>
                            <Text style={styles.uploadLink}>ou parcourir vos fichiers</Text>
                          </>
                        )}
                        <Text style={styles.uploadFormats}>PDF · DOC · DOCX · max 8 Mo</Text>
                      </TouchableOpacity>

                      <Text style={styles.uploadNote}>
                        Votre CV ne sera visible que par des recruteurs abonnés à la plateforme.
                      </Text>

                    </View>
                  </View>

                  {/* ── Erreur ── */}
                  {serverError ? (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>{serverError}</Text>
                    </View>
                  ) : null}

                  {/* ── Footer ── */}
                  <View style={styles.footer}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.7}>
                      <Text style={styles.cancelText}>← Retour</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                      onPress={handleSubmit} disabled={loading} activeOpacity={0.85}
                    >
                      <Text style={styles.submitBtnText}>
                        {loading ? 'Envoi en cours…' : 'Enregistrer mon profil →'}
                      </Text>
                    </TouchableOpacity>
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
