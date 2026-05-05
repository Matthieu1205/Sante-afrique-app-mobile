import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, ScrollView,
  TextInput, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

const CONTRACT_TYPES = ['Stage', 'CDD', 'CDI', 'Freelance'];
const EXPERIENCE_OPTIONS = ['0+', '1+', '2+', '3+', '5+', '7+', '10+'];
const PAYS_OPTIONS = ["Côte d'Ivoire", 'Sénégal', 'Cameroun', 'Mali', 'Burkina Faso', 'Ghana', 'Maroc', 'Tunisie', 'Autre'];

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.backgroundCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: C.borderLight,
    alignSelf: 'center',
    marginTop: Spacing['3'],
    marginBottom: Spacing['2'],
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['3'],
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
  content: { padding: Spacing['4'] },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm, color: C.textSecondary,
    marginBottom: Spacing['1'], marginTop: Spacing['3'],
  },
  required: { color: '#EF4444' },
  input: {
    backgroundColor: C.background, borderWidth: 1,
    borderColor: C.borderLight, borderRadius: Radius.md,
    paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'],
    fontFamily: FontFamily.body, fontSize: FontSize.base,
    color: C.textPrimary,
  },
  inputFocused: { borderColor: '#1B9DD9' },
  textarea: { height: 100, textAlignVertical: 'top' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'], marginTop: Spacing['1'] },
  chip: {
    paddingHorizontal: Spacing['3'], paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1,
    borderColor: C.borderLight, backgroundColor: C.background,
  },
  chipActive: { backgroundColor: '#1B9DD9', borderColor: '#1B9DD9' },
  chipText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: C.textSecondary },
  chipTextActive: { color: '#FFFFFF' },
  submitBtn: {
    backgroundColor: '#1B9DD9', borderRadius: Radius.md,
    paddingVertical: Spacing['4'], alignItems: 'center',
    marginTop: Spacing['5'], marginBottom: Spacing['4'],
  },
  submitBtnText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: '#FFFFFF' },
  successWrap: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: Spacing['4'] },
  successIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#D1FAE5', alignItems: 'center',
    justifyContent: 'center', marginBottom: Spacing['4'],
  },
  successTitle: {
    fontFamily: FontFamily.headingBold, fontSize: FontSize.lg,
    color: C.textPrimary, textAlign: 'center', marginBottom: Spacing['2'],
  },
  successSub: {
    fontFamily: FontFamily.body, fontSize: FontSize.base,
    color: C.textMuted, textAlign: 'center', lineHeight: 22,
  },
  doneBtn: {
    backgroundColor: '#1B9DD9', borderRadius: Radius.md,
    paddingVertical: Spacing['4'], paddingHorizontal: Spacing['8'],
    marginTop: Spacing['5'],
  },
  doneBtnText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: '#FFFFFF' },
});

interface Props { visible: boolean; onClose: () => void; }

export const PostJobModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();

  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState('');

  const [titre, setTitre] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [contrat, setContrat] = useState('');
  const [pays, setPays] = useState('');
  const [ville, setVille] = useState('');
  const [profession, setProfession] = useState('');
  const [experience, setExperience] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (!titre || !entreprise || !contrat || !email) {
      Alert.alert('Champs requis', 'Veuillez remplir au minimum le titre, l\'entreprise, le type de contrat et l\'email.');
      return;
    }
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setTitre(''); setEntreprise(''); setContrat(''); setPays('');
    setVille(''); setProfession(''); setExperience('');
    setDescription(''); setEmail('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={handleClose}>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(0,0,0,0.5)" />
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 0 }}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing['2'] }]}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Poster une offre</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Feather name="x" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {submitted ? (
              <View style={styles.successWrap}>
                <View style={styles.successIcon}>
                  <Feather name="check" size={36} color="#059669" />
                </View>
                <Text style={styles.successTitle}>Offre soumise !</Text>
                <Text style={styles.successSub}>
                  Votre offre d'emploi a été transmise à l'équipe Santé Afrique.{'\n'}
                  Elle sera publiée après validation sous 48h.
                </Text>
                <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                  <Text style={styles.doneBtnText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.content}>

                  <Text style={styles.label}>Titre du poste <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[styles.input, focused === 'titre' && styles.inputFocused]}
                    placeholder="Ex : Médecin généraliste"
                    placeholderTextColor={colors.textDisabled}
                    value={titre} onChangeText={setTitre}
                    onFocus={() => setFocused('titre')} onBlur={() => setFocused('')}
                  />

                  <Text style={styles.label}>Entreprise / Organisation <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[styles.input, focused === 'entreprise' && styles.inputFocused]}
                    placeholder="Nom de votre structure"
                    placeholderTextColor={colors.textDisabled}
                    value={entreprise} onChangeText={setEntreprise}
                    onFocus={() => setFocused('entreprise')} onBlur={() => setFocused('')}
                  />

                  <Text style={styles.label}>Type de contrat <Text style={styles.required}>*</Text></Text>
                  <View style={styles.chipsRow}>
                    {CONTRACT_TYPES.map((ct) => (
                      <TouchableOpacity
                        key={ct}
                        style={[styles.chip, contrat === ct && styles.chipActive]}
                        onPress={() => setContrat(ct)}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.chipText, contrat === ct && styles.chipTextActive]}>{ct}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Pays</Text>
                  <View style={styles.chipsRow}>
                    {PAYS_OPTIONS.map((p) => (
                      <TouchableOpacity
                        key={p}
                        style={[styles.chip, pays === p && styles.chipActive]}
                        onPress={() => setPays(p)}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.chipText, pays === p && styles.chipTextActive]}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Ville</Text>
                  <TextInput
                    style={[styles.input, focused === 'ville' && styles.inputFocused]}
                    placeholder="Ex : Abidjan"
                    placeholderTextColor={colors.textDisabled}
                    value={ville} onChangeText={setVille}
                    onFocus={() => setFocused('ville')} onBlur={() => setFocused('')}
                  />

                  <Text style={styles.label}>Profession / Secteur</Text>
                  <TextInput
                    style={[styles.input, focused === 'profession' && styles.inputFocused]}
                    placeholder="Ex : Médecine, Pharmacie, Journalisme santé..."
                    placeholderTextColor={colors.textDisabled}
                    value={profession} onChangeText={setProfession}
                    onFocus={() => setFocused('profession')} onBlur={() => setFocused('')}
                  />

                  <Text style={styles.label}>Expérience requise</Text>
                  <View style={styles.chipsRow}>
                    {EXPERIENCE_OPTIONS.map((e) => (
                      <TouchableOpacity
                        key={e}
                        style={[styles.chip, experience === e && styles.chipActive]}
                        onPress={() => setExperience(e)}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.chipText, experience === e && styles.chipTextActive]}>{e} an{e !== '1+' ? 's' : ''}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Description du poste</Text>
                  <TextInput
                    style={[styles.input, styles.textarea, focused === 'desc' && styles.inputFocused]}
                    placeholder="Décrivez le poste, les missions, le profil recherché..."
                    placeholderTextColor={colors.textDisabled}
                    value={description} onChangeText={setDescription}
                    multiline numberOfLines={4}
                    onFocus={() => setFocused('desc')} onBlur={() => setFocused('')}
                  />

                  <Text style={styles.label}>Email de contact <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[styles.input, focused === 'email' && styles.inputFocused]}
                    placeholder="recrutement@votreentreprise.com"
                    placeholderTextColor={colors.textDisabled}
                    value={email} onChangeText={setEmail}
                    keyboardType="email-address" autoCapitalize="none"
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  />

                  <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
                    <Text style={styles.submitBtnText}>Soumettre l'offre</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
