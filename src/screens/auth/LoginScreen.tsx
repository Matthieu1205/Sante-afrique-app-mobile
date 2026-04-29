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

interface LoginScreenProps {
  onLogin: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
  onBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onForgotPassword,
  onRegister,
  onBack,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value: string) => {
    if (!value.includes('@')) {
      setEmailError('Adresse email invalide');
    } else {
      setEmailError('');
    }
  };

  const handleLogin = () => {
    if (!email || !password) return;
    setLoading(true);
    // TODO: appeler l'endpoint JWT /wp-json/jwt-auth/v1/token
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1200);
  };

  const canSubmit = email.length > 0 && password.length > 0 && !emailError;

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
        {/* Header avec retour */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Logo compact */}
        <View style={styles.logoRow}>
          <Text style={styles.logoSante}>santé </Text>
          <Text style={styles.logoAfrique}>afrique</Text>
        </View>

        <Text style={styles.pageTitle}>Connexion</Text>
        <Text style={styles.pageSubtitle}>
          Accédez à tout le contenu Santé Afrique
        </Text>

        {/* Formulaire */}
        <View style={styles.form}>
          {/* Email */}
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
              placeholderTextColor={Colors.textDisabled}
              returnKeyType="next"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Mot de passe */}
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
                placeholderTextColor={Colors.textDisabled}
                returnKeyType="done"
                onSubmitEditing={canSubmit ? handleLogin : undefined}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bouton connexion */}
          <Button
            label="Se connecter"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!canSubmit}
            onPress={handleLogin}
            style={styles.loginBtn}
          />
        </View>

        {/* Séparateur */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou continuer avec</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
            <Feather name="globe" size={20} color={Colors.textSecondary} />
            <Text style={styles.socialLabel}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
            <Feather name="facebook" size={20} color={Colors.textSecondary} />
            <Text style={styles.socialLabel}>Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* Lien inscription */}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 48,
    paddingHorizontal: Spacing['5'],
    gap: Spacing['4'],
  },

  // Header
  header: {
    marginBottom: Spacing['2'],
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: Colors.textPrimary,
  },

  // Logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing['2'],
  },
  logoSante: {
    fontFamily: FontFamily.logo,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  logoAfrique: {
    fontFamily: FontFamily.logo,
    fontSize: FontSize['2xl'],
    color: Colors.primary,
    letterSpacing: -0.5,
  },

  // Titres page
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

  // Formulaire
  form: {
    gap: Spacing['4'],
    marginTop: Spacing['2'],
  },
  fieldWrapper: {
    gap: Spacing['1'],
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  forgotLink: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.primary,
    textDecorationLine: 'underline',
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
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.error,
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: Spacing['3'],
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },
  loginBtn: {
    marginTop: Spacing['2'],
  },

  // Séparateur
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    gap: Spacing['3'],
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2'],
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing['3'],
  },
  socialIcon: {
    fontSize: 18,
  },
  socialLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },

  // Inscription
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing['2'],
  },
  registerText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },
  registerLink: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
});
