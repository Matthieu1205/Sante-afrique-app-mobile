import { registerUser } from '@/services/api';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { Button } from '@/components/common';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

const COUNTRIES = [
  "Côte d'Ivoire", 'Cameroun', 'Sénégal', 'Burkina Faso',
  'Togo', 'Bénin', 'Mali', 'Guinée', 'Niger', 'Autre',
];

interface RegisterScreenProps {
  onRegister: () => void;
  onLogin: () => void;
  onBack: () => void;
}

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  container: { flex: 1 },
  content: {
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 48,
    paddingHorizontal: Spacing['5'],
    gap: Spacing['4'],
  },
  header: { marginBottom: Spacing['1'] },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize['3xl'], color: C.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textMuted, marginTop: -Spacing['2'] },
  form: { gap: Spacing['4'] },
  row: { flexDirection: 'row', gap: Spacing['3'] },
  fieldWrapper: { gap: Spacing['1'] },
  label: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: C.textPrimary },
  input: {
    backgroundColor: C.backgroundCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: C.textPrimary,
    height: 52,
  },
  inputError: { borderColor: C.error },
  errorText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.error },
  select: {
    backgroundColor: C.backgroundCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
  },
  selectValue: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: C.textPrimary },
  selectPlaceholder: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: C.textDisabled },
  selectArrow: { fontSize: 12, color: C.textMuted },
  dropdown: {
    backgroundColor: C.backgroundCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: Radius.md,
    marginTop: 4,
    maxHeight: 200,
    overflow: 'scroll',
  },
  dropdownItem: { paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'], borderBottomWidth: 1, borderBottomColor: C.borderLight },
  dropdownText: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textPrimary },
  dropdownTextActive: { color: C.primary, fontFamily: FontFamily.bodyBold },
  passwordWrapper: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: Spacing['3'], top: 0, bottom: 0, justifyContent: 'center' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing['3'], marginTop: Spacing['1'] },
  checkbox: { width: 22, height: 22, borderRadius: Radius.xs, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxActive: { backgroundColor: C.primary, borderColor: C.primary },
  checkmark: { fontFamily: FontFamily.bodyBold, fontSize: 13, color: C.white },
  termsText: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textSecondary, lineHeight: FontSize.sm * 1.5 },
  termsLink: { color: C.primary, textDecorationLine: 'underline' },
  submitBtn: { marginTop: Spacing['2'] },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing['2'] },
  loginText: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textMuted },
  loginLink: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: C.primary },
});

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegister,
  onLogin,
  onBack,
}) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const passwordMatch = confirmPassword === '' || password === confirmPassword;
  const emailValid = email === '' || email.includes('@');
  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    email.includes('@') &&
    password.length >= 6 &&
    password === confirmPassword &&
    acceptTerms;

  const handleRegister = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setServerError('');
    const result = await registerUser(firstName, lastName, email, password, country);
    setLoading(false);
    if (result.ok) {
      onRegister();
    } else {
      setServerError(result.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.pageTitle}>Créer un compte</Text>
        <Text style={styles.pageSubtitle}>Rejoignez la communauté Santé Afrique</Text>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.fieldWrapper, { flex: 1 }]}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Kofi" placeholderTextColor={colors.textDisabled} autoCapitalize="words" />
            </View>
            <View style={[styles.fieldWrapper, { flex: 1 }]}>
              <Text style={styles.label}>Nom</Text>
              <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Mensah" placeholderTextColor={colors.textDisabled} autoCapitalize="words" />
            </View>
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Adresse e-mail</Text>
            <TextInput
              style={[styles.input, !emailValid && styles.inputError]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="vous@exemple.com"
              placeholderTextColor={colors.textDisabled}
            />
            {!emailValid && <Text style={styles.errorText}>Adresse email invalide</Text>}
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Pays</Text>
            <TouchableOpacity style={styles.select} onPress={() => setShowCountryPicker(!showCountryPicker)}>
              <Text style={country ? styles.selectValue : styles.selectPlaceholder}>
                {country || 'Sélectionner votre pays'}
              </Text>
              <Text style={styles.selectArrow}>{showCountryPicker ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showCountryPicker && (
              <View style={styles.dropdown}>
                {COUNTRIES.map((c) => (
                  <TouchableOpacity key={c} style={styles.dropdownItem} onPress={() => { setCountry(c); setShowCountryPicker(false); }}>
                    <Text style={[styles.dropdownText, country === c && styles.dropdownTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Au moins 6 caractères"
                placeholderTextColor={colors.textDisabled}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            {password.length > 0 && password.length < 6 && <Text style={styles.errorText}>Minimum 6 caractères</Text>}
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={[styles.input, !passwordMatch && styles.inputError]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textDisabled}
            />
            {!passwordMatch && <Text style={styles.errorText}>Les mots de passe ne correspondent pas</Text>}
          </View>

          <TouchableOpacity style={styles.termsRow} onPress={() => setAcceptTerms((v) => !v)} activeOpacity={0.8}>
            <View style={[styles.checkbox, acceptTerms && styles.checkboxActive]}>
              {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              J'accepte les{' '}
              <Text style={styles.termsLink}>conditions d'utilisation</Text>
              {' '}et la{' '}
              <Text style={styles.termsLink}>politique de confidentialité</Text>
            </Text>
          </TouchableOpacity>

          {serverError ? <Text style={[styles.errorText, { textAlign: 'center' }]}>{serverError}</Text> : null}
          <Button label="Créer mon compte" variant="primary" size="lg" fullWidth loading={loading} disabled={!canSubmit} onPress={handleRegister} style={styles.submitBtn} />
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Déjà un compte ?</Text>
          <TouchableOpacity onPress={onLogin}>
            <Text style={styles.loginLink}> Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
