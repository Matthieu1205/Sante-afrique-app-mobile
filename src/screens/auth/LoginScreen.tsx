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

interface LoginScreenProps {
  onLogin: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
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
  header: { marginBottom: Spacing['2'] },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: Spacing['2'] },
  logoSante: { fontFamily: FontFamily.logo, fontSize: FontSize['2xl'], color: C.textPrimary, letterSpacing: -0.5 },
  logoAfrique: { fontFamily: FontFamily.logo, fontSize: FontSize['2xl'], color: C.primary, letterSpacing: -0.5 },
  pageTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize['3xl'], color: C.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textMuted, marginTop: -Spacing['2'] },
  form: { gap: Spacing['4'], marginTop: Spacing['2'] },
  fieldWrapper: { gap: Spacing['1'] },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: C.textPrimary },
  forgotLink: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.primary, textDecorationLine: 'underline' },
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
  passwordWrapper: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: Spacing['3'], top: 0, bottom: 0, justifyContent: 'center' },
  loginBtn: { marginTop: Spacing['2'] },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing['3'] },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted },
  socialRow: { flexDirection: 'row', gap: Spacing['3'] },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2'],
    backgroundColor: C.backgroundCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing['3'],
  },
  socialLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: C.textPrimary },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing['2'] },
  registerText: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textMuted },
  registerLink: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: C.primary },
});

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onForgotPassword,
  onRegister,
  onBack,
}) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value: string) => {
    setEmailError(!value.includes('@') ? 'Adresse email invalide' : '');
  };

  const handleLogin = () => {
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };

  const canSubmit = email.length > 0 && password.length > 0 && !emailError;

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

        <View style={styles.logoRow}>
          <Text style={styles.logoSante}>santé </Text>
          <Text style={styles.logoAfrique}>afrique</Text>
        </View>

        <Text style={styles.pageTitle}>Connexion</Text>
        <Text style={styles.pageSubtitle}>Accédez à tout le contenu Santé Afrique</Text>

        <View style={styles.form}>
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Adresse e-mail</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              value={email}
              onChangeText={(v) => { setEmail(v); validateEmail(v); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="vous@exemple.com"
              placeholderTextColor={colors.textDisabled}
              returnKeyType="next"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Mot de passe</Text>
              <TouchableOpacity onPress={onForgotPassword}>
                <Text style={styles.forgotLink}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textDisabled}
                returnKeyType="done"
                onSubmitEditing={canSubmit ? handleLogin : undefined}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <Button label="Se connecter" variant="primary" size="lg" fullWidth loading={loading} disabled={!canSubmit} onPress={handleLogin} style={styles.loginBtn} />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou continuer avec</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
            <Feather name="globe" size={20} color={colors.textSecondary} />
            <Text style={styles.socialLabel}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
            <Feather name="facebook" size={20} color={colors.textSecondary} />
            <Text style={styles.socialLabel}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Pas encore de compte ?</Text>
          <TouchableOpacity onPress={onRegister}>
            <Text style={styles.registerLink}> S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
