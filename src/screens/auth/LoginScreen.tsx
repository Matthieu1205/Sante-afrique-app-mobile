import { loginUser } from "@/services/api";
import { FontFamily, FontSize, Spacing } from "@/theme";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLUE = "#1B9DD9";
const NAVY = "#0D2137"; // couleur bouton + case étape active
const WHITE = "#FFFFFF";

interface LoginScreenProps {
  onLogin: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
  onBack: () => void;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: WHITE },

  // Bouton retour
  backBtn: {
    position: "absolute",
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: { paddingBottom: 60 },

  // Zone titre
  titleZone: {
    paddingHorizontal: 28,
    paddingTop: Spacing["4"],
    paddingBottom: Spacing["5"],
    backgroundColor: WHITE,
  },
  badge: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 11,
    color: BLUE,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  mainTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 30,
    color: "#0D0D0D",
    lineHeight: 36,
    letterSpacing: -0.3,
  },

  // Stepper
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingBottom: Spacing["5"],
    gap: 0,
  },
  stepBox: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  stepBoxActive: { backgroundColor: BLUE, borderColor: BLUE, borderRadius: 50 },
  stepBoxInactive: {
    backgroundColor: WHITE,
    borderColor: "#BBBBBB",
    borderRadius: 50,
  },
  stepNum: { fontFamily: FontFamily.bodyBold, fontSize: 12 },
  stepNumActive: { color: WHITE },
  stepNumInactive: { color: "#BBBBBB" },
  stepLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginLeft: 7,
  },
  stepLabelActive: { color: NAVY },
  stepLabelInactive: { color: "#BBBBBB" },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDDDDD",
    marginHorizontal: 10,
  },

  // Formulaire
  form: { paddingHorizontal: 28, gap: 20 },

  fieldGroup: { gap: 6 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    color: "#888888",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  forgotLink: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: BLUE,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 50,
    paddingHorizontal: 14,
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: "#0D0D0D",
    backgroundColor: WHITE,
  },
  inputError: { borderColor: "#EF4444" },
  pwWrap: { position: "relative" },
  pwInput: { paddingRight: 80 },
  showBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  showBtnText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: "#888888",
    textTransform: "uppercase",
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: "#EF4444",
  },
  serverError: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: "#EF4444",
    textAlign: "center",
  },

  // Bouton connexion
  loginBtn: {
    height: 52,
    backgroundColor: BLUE,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
  },
  loginBtnOff: { opacity: 0.4 },
  loginBtnText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 13,
    color: WHITE,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },

  // Lien abonnement
  subRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginTop: Spacing["5"],
    paddingHorizontal: 28,
  },
  subText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: "#888888",
  },
  subLink: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.sm,
    color: BLUE,
  },
});

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onForgotPassword,
  onRegister,
  onBack,
}) => {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [serverErr, setServerErr] = useState("");

  const checkEmail = (v: string) =>
    setEmailErr(
      v.length > 0 && !v.includes("@") ? "Adresse email invalide" : "",
    );

  const handleLogin = async () => {
    if (!email || !password || loading) return;
    setLoading(true);
    setServerErr("");
    const result = await loginUser(email, password);
    setLoading(false);
    if (result.ok) {
      onLogin();
    } else {
      setServerErr(result.message);
    }
  };

  const canSubmit = email.length > 0 && password.length > 0 && !emailErr;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* Bouton retour */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 8, left: 16 }]}
        onPress={onBack}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="arrow-left" size={24} color="#0D0D0D" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 56 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Titre */}
        <View style={styles.titleZone}>
          <Text style={styles.badge}>Connexion</Text>
          <Text style={styles.mainTitle}>
            Accédez à votre{"\n"}espace Santé Afrique
          </Text>
        </View>

        {/* Stepper */}
        <View style={styles.stepper}>
          <View style={[styles.stepBox, styles.stepBoxActive]}>
            <Text style={[styles.stepNum, styles.stepNumActive]}>1</Text>
          </View>
          <Text style={[styles.stepLabel, styles.stepLabelActive]}>
            Identifiants
          </Text>

          <View style={styles.stepLine} />

          <View style={[styles.stepBox, styles.stepBoxInactive]}>
            <Text style={[styles.stepNum, styles.stepNumInactive]}>2</Text>
          </View>
          <Text style={[styles.stepLabel, styles.stepLabelInactive]}>
            Vérification
          </Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Adresse email</Text>
            <TextInput
              style={[styles.input, emailErr ? styles.inputError : null]}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                checkEmail(v);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="vous@exemple.com"
              placeholderTextColor="#BBBBBB"
              returnKeyType="next"
            />
            {emailErr ? <Text style={styles.errorText}>{emailErr}</Text> : null}
          </View>

          {/* Mot de passe */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Mot de passe</Text>
              <TouchableOpacity
                onPress={onForgotPassword}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.forgotLink}>Oublié ?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pwWrap}>
              <TextInput
                style={[styles.input, styles.pwInput]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                placeholder="••••••••"
                placeholderTextColor="#BBBBBB"
                returnKeyType="done"
                onSubmitEditing={canSubmit ? handleLogin : undefined}
              />
              <TouchableOpacity
                style={styles.showBtn}
                onPress={() => setShowPw((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.showBtnText}>
                  {showPw ? "Masquer" : "Afficher"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {serverErr ? (
            <Text style={styles.serverError}>{serverErr}</Text>
          ) : null}

          {/* Bouton SE CONNECTER */}
          <TouchableOpacity
            style={[
              styles.loginBtn,
              (!canSubmit || loading) && styles.loginBtnOff,
            ]}
            onPress={handleLogin}
            disabled={!canSubmit || loading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>
              {loading ? "Connexion…" : "Se connecter →"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lien abonnement */}
        <View style={styles.subRow}>
          <Text style={styles.subText}>Pas encore abonné(e) ?</Text>
          <TouchableOpacity
            onPress={onRegister}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.subLink}>Découvrir les offres</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
