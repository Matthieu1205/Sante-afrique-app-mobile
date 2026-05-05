import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

interface Plan {
  id: string;
  name: string;
  subtitle: string;
  priceYear: string;
  priceMonth: string;
  badge?: string;
  color: string;
  features: string[];
  cta: string;
}

interface SubscriptionScreenProps {
  onBack?: () => void;
  onSubscribe?: (planId: string) => void;
  onLogin?: () => void;
}

const PLANS: Plan[] = [
  {
    id: 'digital',
    name: 'Numérique',
    subtitle: 'Accès complet en ligne',
    priceYear: '15 000 FCFA',
    priceMonth: '1 250 FCFA',
    badge: 'Le plus populaire',
    color: Colors.primary,
    features: [
      'Accès illimité à tous les articles',
      'Édition numérique du magazine (6 n°/an)',
      'Archives complètes en ligne',
      'Lecture hors connexion (50 articles)',
      'Alertes santé en temps réel',
      'Accès multi-appareils',
    ],
    cta: 'Choisir Numérique',
  },
  {
    id: 'print_digital',
    name: 'Papier + Numérique',
    subtitle: 'Le meilleur des deux formats',
    priceYear: '60 000 FCFA',
    priceMonth: '5 000 FCFA',
    color: '#1E3A5F',
    features: [
      'Tout le plan Numérique',
      'Magazine papier livré chez vous',
      '6 numéros par an',
      'Dossiers thématiques imprimés',
      'Facture envoyée par email',
    ],
    cta: 'Choisir Papier + Numérique',
  },
  {
    id: 'premium',
    name: 'Premium',
    subtitle: 'L\'expérience complète',
    priceYear: '90 000 FCFA',
    priceMonth: '7 500 FCFA',
    color: '#7C3AED',
    features: [
      'Tout le plan Papier + Numérique',
      'Livraison prioritaire incluse',
      'Accès aux événements partenaires',
      'Newsletter exclusive hebdomadaire',
      'Support client dédié',
      'Facture envoyée par email',
    ],
    cta: 'Choisir Premium',
  },
];

const PAYMENT_METHODS: { icon: React.ComponentProps<typeof Feather>['name']; label: string }[] = [
  { icon: 'smartphone', label: 'Mobile Money' },
  { icon: 'credit-card', label: 'Visa' },
  { icon: 'credit-card', label: 'Mastercard' },
];

const makeCardStyles = (C: ThemeColors) => StyleSheet.create({
  wrapper: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: C.borderLight,
    padding: Spacing['4'],
    gap: Spacing['3'],
    ...Shadows.card,
  },
  wrapperSelected: {
    borderColor: C.primary,
    backgroundColor: C.backgroundCard,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing['3'],
    paddingVertical: 4,
    marginBottom: Spacing['1'],
  },
  badgeText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs, color: C.white },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing['3'] },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  titleBlock: { flex: 1 },
  name: { fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: C.textPrimary },
  subtitle: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted, marginTop: 1 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' },
  priceYear: { fontFamily: FontFamily.headingBold, fontSize: FontSize['2xl'], color: C.textPrimary },
  priceSuffix: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textMuted },
  priceMonth: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted },
  features: { gap: Spacing['2'] },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing['2'] },
  featureText: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textSecondary, lineHeight: FontSize.sm * 1.5 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2'],
    borderRadius: Radius.sm,
    paddingVertical: Spacing['3'],
    marginTop: Spacing['1'],
  },
  ctaText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: C.white },
});

const PlanCard: React.FC<{
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
  onSubscribe: () => void;
}> = ({ plan, selected, onSelect, onSubscribe }) => {
  const { colors } = useTheme();
  const cardS = makeCardStyles(colors);
  return (
    <TouchableOpacity
      style={[cardS.wrapper, selected && cardS.wrapperSelected]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      {plan.badge && (
        <View style={[cardS.badge, { backgroundColor: plan.color }]}>
          <Feather name="star" size={11} color={colors.white} />
          <Text style={cardS.badgeText}>{plan.badge}</Text>
        </View>
      )}

      <View style={cardS.header}>
        <View style={[cardS.colorDot, { backgroundColor: plan.color }]} />
        <View style={cardS.titleBlock}>
          <Text style={cardS.name}>{plan.name}</Text>
          <Text style={cardS.subtitle}>{plan.subtitle}</Text>
        </View>
        <View style={[cardS.radio, selected && { borderColor: plan.color }]}>
          {selected && <View style={[cardS.radioDot, { backgroundColor: plan.color }]} />}
        </View>
      </View>

      <View style={cardS.priceRow}>
        <Text style={cardS.priceYear}>{plan.priceYear}</Text>
        <Text style={cardS.priceSuffix}> / an</Text>
        <Text style={cardS.priceMonth}>  soit {plan.priceMonth}/mois</Text>
      </View>

      <View style={cardS.features}>
        {plan.features.map((f) => (
          <View key={f} style={cardS.featureRow}>
            <Feather name="check" size={14} color={plan.color} />
            <Text style={cardS.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {selected && (
        <TouchableOpacity
          style={[cardS.ctaBtn, { backgroundColor: plan.color }]}
          onPress={onSubscribe}
          activeOpacity={0.85}
        >
          <Text style={cardS.ctaText}>{plan.cta}</Text>
          <Feather name="arrow-right" size={16} color={colors.white} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['4'],
    gap: Spacing['3'],
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerLogo: { fontFamily: FontFamily.logo, fontSize: FontSize.xl, color: 'rgba(255,255,255,0.85)', letterSpacing: -0.3 },
  headerLogoW: { color: C.white },
  headerTagline: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)' },
  content: { paddingHorizontal: Spacing['4'], paddingTop: Spacing['4'], gap: Spacing['4'] },
  intro: { alignItems: 'center', gap: Spacing['1'] },
  introTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.xl, color: C.textPrimary, textAlign: 'center' },
  introSub: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted, textAlign: 'center' },
  plans: { gap: Spacing['3'] },
  paymentBlock: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: Spacing['4'],
    gap: Spacing['3'],
  },
  paymentTitle: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  paymentRow: { flexDirection: 'row', gap: Spacing['2'], flexWrap: 'wrap' },
  paymentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
    backgroundColor: C.background,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
  },
  paymentLabel: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textSecondary },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textMuted },
  loginLink: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: C.primary },
  legal: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textDisabled, textAlign: 'center', lineHeight: FontSize.xs * 1.6 },
});

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  onBack,
  onSubscribe,
  onLogin,
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [selectedPlan, setSelectedPlan] = useState('digital');

  const handleSubscribe = (planId: string) => {
    onSubscribe?.(planId);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}
      >
        {onBack && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerLogo}>
            santé <Text style={styles.headerLogoW}>afrique</Text>
          </Text>
          <Text style={styles.headerTagline}>Choisissez votre formule</Text>
        </View>
        <View style={{ width: onBack ? 36 : 0 }} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      >
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Accès illimité à Santé Afrique</Text>
          <Text style={styles.introSub}>
            Paiement sécurisé · Résiliation libre · Facture par email
          </Text>
        </View>

        <View style={styles.plans}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
              onSubscribe={() => handleSubscribe(plan.id)}
            />
          ))}
        </View>

        <View style={styles.paymentBlock}>
          <Text style={styles.paymentTitle}>Paiement accepté</Text>
          <View style={styles.paymentRow}>
            {PAYMENT_METHODS.map((m, i) => (
              <View key={i} style={styles.paymentChip}>
                <Feather name={m.icon} size={16} color={colors.textSecondary} />
                <Text style={styles.paymentLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Déjà abonné ?</Text>
          <TouchableOpacity onPress={onLogin}>
            <Text style={styles.loginLink}> Se connecter</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.legal}>
          En vous abonnant, vous acceptez nos conditions générales d'utilisation.
          Abonnement annuel reconduit automatiquement. Résiliation possible à tout moment.
        </Text>
      </ScrollView>
    </View>
  );
};
