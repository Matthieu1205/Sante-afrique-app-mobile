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
import { Colors, FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { Button } from '@/components/common';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBack,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const emailValid = email.includes('@');

  const handleSubmit = () => {
    if (!emailValid) return;
    setLoading(true);
    // TODO: POST /wp-json/wc/v3/customers/password ou endpoint personnalisé
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      onSuccess?.();
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.container}>
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

        {sent ? (
          /* État succès */
          <View style={styles.successState}>
            <Text style={styles.successEmoji}>✉️</Text>
            <Text style={styles.successTitle}>Email envoyé !</Text>
            <Text style={styles.successText}>
              Un lien de réinitialisation a été envoyé à{' '}
              <Text style={styles.successEmail}>{email}</Text>.{'\n'}
              Vérifiez votre boîte de réception (et les spams).
            </Text>
            <Button
              label="Retour à la connexion"
              variant="primary"
              size="lg"
              fullWidth
              onPress={onBack}
              style={styles.backToLoginBtn}
            />
          </View>
        ) : (
          /* Formulaire */
          <View style={styles.form}>
            {/* Illustration */}
            <View style={styles.iconWrapper}>
              <Text style={styles.lockIcon}>🔑</Text>
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
                placeholderTextColor={Colors.textDisabled}
                returnKeyType="done"
                onSubmitEditing={emailValid ? handleSubmit : undefined}
                autoFocus
              />
              {email.length > 0 && !emailValid && (
                <Text style={styles.errorText}>Adresse email invalide</Text>
              )}
            </View>

            <Button
              label="Envoyer le lien"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={!emailValid}
              onPress={handleSubmit}
              style={styles.submitBtn}
            />

            <TouchableOpacity onPress={onBack} style={styles.cancelRow}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: Spacing['5'],
  },
  header: { marginBottom: Spacing['4'] },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: Colors.textPrimary },

  // Formulaire
  form: { gap: Spacing['4'] },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2'],
  },
  lockIcon: { fontSize: 32 },
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
    lineHeight: FontSize.base * 1.55,
    marginTop: -Spacing['2'],
  },
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
  submitBtn: { marginTop: Spacing['2'] },
  cancelRow: { alignItems: 'center', paddingTop: Spacing['2'] },
  cancelText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },

  // Succès
  successState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['4'],
    paddingBottom: 80,
  },
  successEmoji: { fontSize: 56 },
  successTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  successText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: FontSize.base * 1.55,
  },
  successEmail: {
    fontFamily: FontFamily.bodyBold,
    color: Colors.primary,
  },
  backToLoginBtn: { marginTop: Spacing['4'], width: '100%' },
});
