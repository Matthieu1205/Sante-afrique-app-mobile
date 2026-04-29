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
import { Colors, FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { Button } from '@/components/common';

const COUNTRIES = [
  "Côte d'Ivoire", 'Cameroun', 'Sénégal', 'Burkina Faso',
  'Togo', 'Bénin', 'Mali', 'Guinée', 'Niger', 'Autre',
];

interface RegisterScreenProps {
  onRegister: () => void;
  onLogin: () => void;
  onBack: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegister,
  onLogin,
  onBack,
}) => {
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

  const passwordMatch = confirmPassword === '' || password === confirmPassword;
  const emailValid = email === '' || email.includes('@');
  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    email.includes('@') &&
    password.length >= 6 &&
    password === confirmPassword &&
    acceptTerms;

  const handleRegister = () => {
    if (!canSubmit) return;
    setLoading(true);
    // TODO: POST /wp-json/wp/v2/users ou endpoint personnalisé
    setTimeout(() => {
      setLoading(false);
      onRegister();
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.pageTitle}>Créer un compte</Text>
        <Text style={styles.pageSubtitle}>
          Rejoignez la communauté Santé Afrique
        </Text>

        <View style={styles.form}>
          {/* Prénom + Nom */}
          <View style={styles.row}>
            <View style={[styles.fieldWrapper, { flex: 1 }]}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Kofi"
                placeholderTextColor={Colors.textDisabled}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.fieldWrapper, { flex: 1 }]}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Mensah"
                placeholderTextColor={Colors.textDisabled}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
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
              placeholderTextColor={Colors.textDisabled}
            />
            {!emailValid && (
              <Text style={styles.errorText}>Adresse email invalide</Text>
            )}
          </View>

          {/* Pays */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Pays</Text>
            <TouchableOpacity
              style={styles.select}
              onPress={() => setShowCountryPicker(!showCountryPicker)}
            >
              <Text style={country ? styles.selectValue : styles.selectPlaceholder}>
                {country || 'Sélectionner votre pays'}
              </Text>
              <Text style={styles.selectArrow}>
                {showCountryPicker ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {showCountryPicker && (
              <View style={styles.dropdown}>
                {COUNTRIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={styles.dropdownItem}
                    onPress={() => { setCountry(c); setShowCountryPicker(false); }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        country === c && styles.dropdownTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Mot de passe */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Au moins 6 caractères"
                placeholderTextColor={Colors.textDisabled}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            {password.length > 0 && password.length < 6 && (
              <Text style={styles.errorText}>Minimum 6 caractères</Text>
            )}
          </View>

          {/* Confirmer mot de passe */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={[styles.input, !passwordMatch && styles.inputError]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.textDisabled}
            />
            {!passwordMatch && (
              <Text style={styles.errorText}>Les mots de passe ne correspondent pas</Text>
            )}
          </View>

          {/* CGU */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAcceptTerms((v) => !v)}
            activeOpacity={0.8}
          >
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

          <Button
            label="Créer mon compte"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!canSubmit}
            onPress={handleRegister}
            style={styles.submitBtn}
          />
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  content: {
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 48,
    paddingHorizontal: Spacing['5'],
    gap: Spacing['4'],
  },
  header: { marginBottom: Spacing['1'] },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  pageTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    marginTop: -Spacing['2'],
  },
  form: { gap: Spacing['4'] },
  row: { flexDirection: 'row', gap: Spacing['3'] },
  fieldWrapper: { gap: Spacing['1'] },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    height: 52,
  },
  inputError: { borderColor: Colors.error },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.error,
  },

  // Sélecteur pays
  select: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
  },
  selectValue: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.textPrimary },
  selectPlaceholder: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.textDisabled },
  selectArrow: { fontSize: 12, color: Colors.textMuted },
  dropdown: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    marginTop: 4,
    maxHeight: 200,
    overflow: 'scroll',
  },
  dropdownItem: {
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownText: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.textPrimary },
  dropdownTextActive: { color: Colors.primary, fontFamily: FontFamily.bodyBold },

  // Password
  passwordWrapper: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: {
    position: 'absolute',
    right: Spacing['3'],
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: { fontSize: 18 },

  // CGU
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing['3'],
    marginTop: Spacing['1'],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.xs,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 13,
    color: Colors.white,
  },
  termsText: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.5,
  },
  termsLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  submitBtn: { marginTop: Spacing['2'] },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing['2'],
  },
  loginText: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.textMuted },
  loginLink: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: Colors.primary },
});
