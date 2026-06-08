import { forgotPassword } from '@/services/api';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { Button } from '@/components/common';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: Spacing['5'] },
  header: { marginBottom: Spacing['4'] },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  form: { gap: Spacing['4'] },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2'],
  },
  pageTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize['3xl'], color: C.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textMuted, lineHeight: FontSize.base * 1.55, marginTop: -Spacing['2'] },
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
  submitBtn: { marginTop: Spacing['2'] },
  cancelRow: { alignItems: 'center', paddingTop: Spacing['2'] },
  cancelText: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textMuted, textDecorationLine: 'underline' },
  successState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing['4'], paddingBottom: 80 },
  successTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize['2xl'], color: C.textPrimary },
  successText: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textMuted, textAlign: 'center', lineHeight: FontSize.base * 1.55 },
  successEmail: { fontFamily: FontFamily.bodyBold, color: C.primary },
  backToLoginBtn: { marginTop: Spacing['4'], width: '100%' },
});

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBack,
  onSuccess,
}) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const emailValid = email.includes('@');

  const handleSubmit = async () => {
    if (!emailValid) return;
    setLoading(true);
    setServerError('');
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.ok) {
      setSent(true);
      onSuccess?.();
    } else {
      setServerError(result.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {sent ? (
          <View style={styles.successState}>
            <Text style={{ fontSize: 56 }}>✉️</Text>
            <Text style={styles.successTitle}>Email envoyé !</Text>
            <Text style={styles.successText}>
              Un lien de réinitialisation a été envoyé à{' '}
              <Text style={styles.successEmail}>{email}</Text>.{'\n'}
              Vérifiez votre boîte de réception (et les spams).
            </Text>
            <Button label="Retour à la connexion" variant="primary" size="lg" fullWidth onPress={onBack} style={styles.backToLoginBtn} />
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.iconWrapper}>
              <Text style={{ fontSize: 32 }}>🔑</Text>
            </View>

            <Text style={styles.pageTitle}>Mot de passe oublié</Text>
            <Text style={styles.pageSubtitle}>
              Entrez votre adresse e-mail. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </Text>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Adresse e-mail</Text>
              <TextInput
                style={[styles.input, email.length > 0 && !emailValid && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="vous@exemple.com"
                placeholderTextColor={colors.textDisabled}
                returnKeyType="done"
                onSubmitEditing={emailValid ? handleSubmit : undefined}
                autoFocus
              />
              {email.length > 0 && !emailValid && (
                <Text style={styles.errorText}>Adresse email invalide</Text>
              )}
            </View>

            {serverError ? <Text style={[styles.errorText, { textAlign: 'center' }]}>{serverError}</Text> : null}
            <Button label="Envoyer le lien" variant="primary" size="lg" fullWidth loading={loading} disabled={!emailValid} onPress={handleSubmit} style={styles.submitBtn} />

            <TouchableOpacity onPress={onBack} style={styles.cancelRow}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};
