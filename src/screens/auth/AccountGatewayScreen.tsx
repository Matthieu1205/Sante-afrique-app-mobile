import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { Button } from '@/components/common';

const BENEFITS: { icon: React.ComponentProps<typeof Feather>['name']; text: string }[] = [
  { icon: 'file-text', text: 'Accès illimité à tous les articles' },
  { icon: 'volume-2',  text: 'Écoute audio de chaque article' },
  { icon: 'download',  text: 'Lecture hors connexion (50 articles)' },
  { icon: 'book',      text: 'Magazine numérique N°23 + archives' },
  { icon: 'bell',      text: 'Alertes santé en temps réel' },
];

interface AccountGatewayScreenProps {
  onLogin: () => void;
  onSubscribe: () => void;
  onBack?: () => void;
}

export const AccountGatewayScreen: React.FC<AccountGatewayScreenProps> = ({
  onLogin,
  onSubscribe,
  onBack,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Bouton retour */}
      {onBack && (
        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + Spacing['2'] }]}
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 56 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.hero}>
          <View style={styles.logoBlock}>
            <Text style={styles.logoSante}>santé</Text>
            <Text style={styles.logoAfrique}>afrique</Text>
          </View>
          <Text style={styles.heroTagline}>La santé en Afrique, à votre portée</Text>
        </View>

        {/* Titre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon Espace</Text>
          <Text style={styles.sectionSub}>
            Connectez-vous ou abonnez-vous pour accéder à tout le contenu Santé Afrique.
          </Text>
        </View>

        {/* Avantages */}
        <View style={styles.benefitsCard}>
          {BENEFITS.map((item) => (
            <View key={item.text} style={styles.benefitRow}>
              <Feather name={item.icon} size={20} color={Colors.primary} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label="Je m'abonne"
            variant="cta"
            size="lg"
            fullWidth
            onPress={onSubscribe}
          />
          <Text style={styles.priceHint}>
            À partir de 1 250 FCFA / mois · Résiliation libre
          </Text>
          <Button
            label="J'ai déjà un compte"
            variant="outline"
            size="lg"
            fullWidth
            onPress={onLogin}
            style={styles.loginBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  backBtn: {
    position: 'absolute',
    left: Spacing['4'],
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: Colors.textPrimary,
    lineHeight: 36,
    marginTop: -2,
  },

  content: {
    paddingBottom: 48,
    gap: Spacing['6'],
  },

  hero: {
    alignItems: 'center',
    paddingHorizontal: Spacing['6'],
    gap: Spacing['3'],
  },
  logoBlock: { alignItems: 'center' },
  logoSante: {
    fontFamily: FontFamily.logo,
    fontSize: 40,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  logoAfrique: {
    fontFamily: FontFamily.logo,
    fontSize: 40,
    color: Colors.primary,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  heroTagline: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  section: {
    paddingHorizontal: Spacing['5'],
    gap: Spacing['2'],
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.base * 1.55,
  },

  benefitsCard: {
    marginHorizontal: Spacing['4'],
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing['4'],
    gap: Spacing['3'],
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3'],
  },
  benefitIcon: {
    width: 28,
    textAlign: 'center',
  },
  benefitText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    flex: 1,
  },

  actions: {
    paddingHorizontal: Spacing['4'],
    gap: Spacing['3'],
    alignItems: 'center',
  },
  priceHint: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  loginBtn: { marginTop: Spacing['1'] },
});
