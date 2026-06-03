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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

const SUBSCRIPTION_BLUE = '#1B9DD9';

interface LoginScreenProps {
  onLogin: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
  onBack: () => void;
}

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['3'],
    backgroundColor: C.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  content: { paddingBottom: 48 },

  // Top section
  topSection: { paddingHorizontal: Spacing['5'], paddingTop: Spacing['5'], gap: Spacing['4'], alignItems: 'center' },
  pageTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize['2xl'],
    color: C.textPrimary,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: Spacing['2'],
    alignItems: 'center',
  },
  stepPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: Spacing['2'],
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  stepPillActive: { backgroundColor: SUBSCRIPTION_BLUE },
  stepPillInactive: { backgroundColor: C.borderLight },
  stepText: { fontFamily: FontFamily.bodySemiBold, fontSize: 11, flexShrink: 1, overflow: 'hidden' },
  stepTextActive: { color: '#FFFFFF' },
  stepTextInactive: { color: C.textMuted },
  stepDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.textMuted, flexShrink: 0 },

  // Form card
  formCard: {
    marginHorizontal: Spacing['4'],
    marginTop: Spacing['4'],
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing['5'],
    ...Shadows.card,
    gap: Spacing['4'],
  },
  fieldWrapper: { gap: Spacing['1'] },
  label: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: C.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: C.textPrimary,
    height: 50,
    backgroundColor: C.background,
  },
  inputError: { borderColor: C.error },
  errorText: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.error },
  passwordWrapper: { position: 'relative' },
  passwordInput: { paddingRight: 72 },
  showBtn: { position: 'absolute', right: Spacing['3'], top: 0, bottom: 0, justifyContent: 'center' },
  showBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: C.textMuted },
  forgotLink: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.primary },

  loginBtn: {
    backgroundColor: SUBSCRIPTION_BLUE,
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing['1'],
  },
  loginBtnDisabled: { opacity: 0.5 },
  loginBtnText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: '#FFFFFF' },

  // Subscription card
  subCard: {
    marginHorizontal: Spacing['4'],
    marginTop: Spacing['4'],
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing['5'],
    ...Shadows.card,
  },
  subBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2'],
    backgroundColor: SUBSCRIPTION_BLUE,
    borderRadius: Radius.full,
    paddingVertical: 15,
  },
  subBtnText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: '#FFFFFF' },
});

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onForgotPassword,
  onRegister,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value: string) => {
    setEmailError(value.length > 0 && !value.includes('@') ? 'Adresse email invalide' : '');
  };

  const handleLogin = () => {
    if (!email || !password || loading) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };

  const canSubmit = email.length > 0 && password.length > 0 && !emailError;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.backgroundCard} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Titre + stepper */}
        <View style={styles.topSection}>
          <Text style={styles.pageTitle}>Connexion</Text>
          <Text style={styles.pageSubtitle}>
            Accédez à votre compte Santé Afrique pour retrouver vos abonnements et contenus.
          </Text>

          <View style={styles.stepper}>
            <View style={[styles.stepPill, styles.stepPillActive]}>
              <Feather name="check" size={11} color="#FFFFFF" />
              <Text numberOfLines={1} style={[styles.stepText, styles.stepTextActive]}>Étape 1 — Email & mdp</Text>
            </View>
            <View style={[styles.stepPill, styles.stepPillInactive]}>
              <View style={styles.stepDot} />
              <Text numberOfLines={1} style={[styles.stepText, styles.stepTextInactive]}>Étape 2 — Vérification</Text>
            </View>
          </View>
        </View>

        {/* Formulaire */}
        <View style={styles.formCard}>
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Adresse email</Text>
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Mot de passe</Text>
              <TouchableOpacity onPress={onForgotPassword} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
              <TouchableOpacity
                style={styles.showBtn}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.showBtnText}>{showPassword ? 'Masquer' : 'Afficher'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, (!canSubmit || loading) && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={!canSubmit || loading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bloc abonnement */}
        <View style={styles.subCard}>
          <TouchableOpacity style={styles.subBtn} onPress={onRegister} activeOpacity={0.85}>
            <Feather name="star" size={16} color="#FFFFFF" />
            <Text style={styles.subBtnText}>Voir les offres d'abonnement</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};
