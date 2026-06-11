import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  ActivityIndicator,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';
import { fetchSubscriptionPlans } from '@/services/api';
import type { ApiPlan } from '@/services/api';

const BRAND = '#1B9DD9';
const RECOMMENDED_BORDER = '#7dd3f8';
const RECOMMENDED_BG = '#e8f7fd';
const RECOMMENDED_TEXT = BRAND;

interface Plan {
  id: string;
  tag: string;
  name: string;
  priceYear: string;
  priceMonth: string;
  description: string;
  features: string[];
  recommended?: boolean;
  ctaColor: string;
}

interface SubscriptionScreenProps {
  onBack?: () => void;
  onSubscribe?: (planId: string) => void;
  onLogin?: () => void;
}

const TAG_MAP: Record<string, string> = {
  premium:       'ABONNEMENT ANNUEL PREMIUM',
  print_digital: 'ÉDITION PAPIER + NUMÉRIQUE (ANNUEL)',
  digital:       'ÉDITION NUMÉRIQUE (ANNUEL)',
};

function mapApiPlan(a: ApiPlan): Plan {
  return {
    id:          a.id,
    tag:         TAG_MAP[a.id] ?? a.name.toUpperCase(),
    name:        a.name,
    priceYear:   a.price_year,
    priceMonth:  a.price_month,
    description: a.description,
    features:    a.features,
    recommended: a.recommended,
    ctaColor:    BRAND,
  };
}

const PLANS_FALLBACK: Plan[] = [
  {
    id: 'premium',
    tag: 'ABONNEMENT ANNUEL PREMIUM',
    name: 'Abonnement Premium Annuel',
    priceYear: '90 000 FCFA',
    priceMonth: '≈ 7500 FCFA / mois',
    description: 'Accès intégral à notre site + magazine version papier + livraison à votre adresse',
    features: ['6 numéros / an', 'Articles premium et dossiers thématiques', 'Lecture sur tous vos appareils'],
    recommended: true,
    ctaColor: BRAND,
  },
  {
    id: 'print_digital',
    tag: 'ÉDITION PAPIER + NUMÉRIQUE (ANNUEL)',
    name: 'Abonnement Papier + Numérique Annuel',
    priceYear: '60 000 FCFA',
    priceMonth: '≈ 5000 FCFA / mois',
    description: 'Magazine version papier + accès au site internet',
    features: ['6 numéros / an', 'Articles premium et dossiers thématiques', 'Lecture sur tous vos appareils'],
    ctaColor: BRAND,
  },
  {
    id: 'digital',
    tag: 'ÉDITION NUMÉRIQUE (ANNUEL)',
    name: 'Abonnement Numérique Annuel',
    priceYear: '15 000 FCFA',
    priceMonth: '≈ 1250 FCFA / mois',
    description: 'Édition numérique + archives',
    features: ['6 numéros / an', 'Articles premium et dossiers thématiques', 'Lecture sur tous vos appareils'],
    ctaColor: BRAND,
  },
];


const makeStyles = (C: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },

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

  // Hero
  hero: {
    paddingHorizontal: Spacing['5'],
    paddingTop: Spacing['6'],
    paddingBottom: Spacing['6'],
  },
  heroTag: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 11,
    color: BRAND,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing['3'],
  },
  heroTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 38,
    marginBottom: Spacing['3'],
  },
  heroSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 24,
    marginBottom: Spacing['5'],
  },
  heroChecks: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'], marginBottom: Spacing['6'] },
  heroCheck: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: BRAND },
  heroCheckText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)' },
  heroBtnRow: { flexDirection: 'row', gap: Spacing['3'] },
  heroBtnPrimary: {
    flex: 1,
    backgroundColor: BRAND,
    borderRadius: Radius.sm,
    paddingVertical: 13,
    alignItems: 'center',
  },
  heroBtnPrimaryText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.sm,
    color: '#fff',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroBtnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: Radius.sm,
    paddingVertical: 13,
    alignItems: 'center',
  },
  heroBtnOutlineText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.sm,
    color: '#fff',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Plans
  plansSection: { paddingHorizontal: Spacing['4'], paddingTop: Spacing['6'] },
  plansSectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: C.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing['4'],
  },
  planCard: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: C.borderLight,
    padding: Spacing['4'],
    marginBottom: Spacing['3'],
    ...Shadows.card,
  },
  planCardRecommended: { borderColor: RECOMMENDED_BORDER },
  recommendedWrap: { alignItems: 'center', marginBottom: Spacing['3'] },
  recommendedBadge: {
    backgroundColor: RECOMMENDED_BG,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: RECOMMENDED_BORDER,
    paddingHorizontal: Spacing['3'],
    paddingVertical: 3,
  },
  recommendedText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, color: RECOMMENDED_TEXT },
  planTag: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: C.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing['1'],
  },
  planName: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: C.textPrimary,
    lineHeight: 24,
    marginBottom: Spacing['2'],
  },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3, marginBottom: 2 },
  planPrice: { fontFamily: FontFamily.headingBold, fontSize: 26, color: BRAND },
  planPriceSuffix: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textMuted },
  planPriceMonth: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: C.textMuted,
    marginBottom: Spacing['3'],
  },
  planDescription: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing['3'],
  },
  planFeatures: { gap: Spacing['2'], marginBottom: Spacing['4'] },
  planFeatureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing['2'] },
  planFeatureText: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textSecondary, lineHeight: 20 },
  planCta: {
    borderRadius: Radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCtaText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: '#FFFFFF' },

  // Payment bar
  paymentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing['4'],
    marginTop: Spacing['1'],
    paddingVertical: Spacing['3'],
    paddingHorizontal: Spacing['4'],
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: Radius.md,
    backgroundColor: C.backgroundCard,
    gap: Spacing['2'],
  },
  paymentBarText: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textSecondary },
  paymentChips: { flexDirection: 'row', gap: Spacing['1'] },
  paymentChip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  paymentChipText: { fontFamily: FontFamily.bodyBold, fontSize: 9, color: C.textMuted },

  // Why section
  whySection: {
    marginTop: Spacing['5'],
    paddingVertical: Spacing['5'],
    paddingHorizontal: Spacing['4'],
    backgroundColor: C.borderLight,
    gap: Spacing['4'],
  },
  whySectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: C.textPrimary,
    textAlign: 'center',
  },
  whyGrid: { gap: Spacing['3'] },
  whyCard: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing['4'],
    ...Shadows.card,
  },
  whyCardTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.sm,
    color: C.textPrimary,
    marginBottom: 4,
  },
  whyCardDesc: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textSecondary, lineHeight: 20 },

  // Unique content
  uniqueSection: {
    marginTop: Spacing['5'],
    paddingVertical: Spacing['5'],
    paddingHorizontal: Spacing['4'],
    backgroundColor: '#D0D0D0',
    alignItems: 'center',
  },
  uniqueCard: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing['5'],
    alignItems: 'center',
    maxWidth: '90%',
    ...Shadows.card,
  },
  uniqueTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: C.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing['2'],
  },
  uniqueDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Help section
  helpSection: {
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['5'],
    paddingBottom: Spacing['4'],
    gap: Spacing['3'],
  },
  helpTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: C.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing['1'],
  },
  helpRow: { flexDirection: 'row', gap: Spacing['3'] },
  helpFaqCard: {
    flex: 1,
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing['3'],
    borderWidth: 1,
    borderColor: C.borderLight,
    gap: Spacing['2'],
  },
  helpFaqTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.sm, color: C.textPrimary },
  helpFaqItem: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textSecondary, lineHeight: 18 },
  helpInfoCard: {
    flex: 1,
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing['3'],
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  helpInfoTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.sm, color: C.textPrimary, marginBottom: Spacing['2'] },
  helpInfoText: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textSecondary, lineHeight: 18 },

  // Service client
  serviceCard: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing['5'],
    borderWidth: 1,
    borderColor: C.borderLight,
    alignItems: 'center',
    gap: Spacing['2'],
  },
  serviceTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.sm, color: C.textPrimary },
  serviceSchedule: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted },
  serviceContacts: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  serviceLink: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: '#1B9DD9' },
  serviceSeparator: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted },
  servicePayments: { flexDirection: 'row', gap: Spacing['2'], marginTop: 4 },
  servicePaymentChip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  servicePaymentText: { fontFamily: FontFamily.bodyBold, fontSize: 10, color: C.textMuted },

  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
  loginText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted },
  loginLink: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: '#1B9DD9' },
});

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  onBack,
  onSubscribe,
  onLogin,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const scrollRef = useRef<ScrollView>(null);
  const plansOffsetY = useRef<number>(0);

  const [plans, setPlans] = useState<Plan[]>(PLANS_FALLBACK);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const scrollToPlans = () => scrollRef.current?.scrollTo({ y: plansOffsetY.current, animated: true });

  useEffect(() => {
    fetchSubscriptionPlans().then((data) => {
      if (data.length > 0) setPlans(data.map(mapApiPlan));
      setLoadingPlans(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.backgroundCard}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}>
        {onBack && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {onBack && <View style={{ width: 36 }} />}
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>

        {/* Hero navy sombre */}
        <LinearGradient colors={['#0D1B2A', '#0D2137']} style={styles.hero}>
          <Text style={styles.heroTag}>Abonnement</Text>
          <Text style={styles.heroTitle}>Le magazine santé{'\n'}de référence en Afrique</Text>
          <Text style={styles.heroSub}>
            Dossiers exclusifs, interviews d'experts, retours du terrain — accédez à tout le contenu Santé Afrique, où que vous soyez.
          </Text>
          <View style={styles.heroChecks}>
            {['6 numéros / an', 'Archives complètes', 'Multi-appareils', 'Sans engagement'].map((item) => (
              <View key={item} style={styles.heroCheck}>
                <View style={styles.heroDot} />
                <Text style={styles.heroCheckText}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={styles.heroBtnRow}>
            <TouchableOpacity style={styles.heroBtnPrimary} onPress={scrollToPlans} activeOpacity={0.85}>
              <Text style={styles.heroBtnPrimaryText}>Voir les offres</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroBtnOutline} onPress={onLogin} activeOpacity={0.85}>
              <Text style={styles.heroBtnOutlineText}>J'ai déjà un compte</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Plans */}
        <View
          style={styles.plansSection}
          onLayout={(e: LayoutChangeEvent) => { plansOffsetY.current = e.nativeEvent.layout.y; }}
        >
          <Text style={styles.plansSectionTitle}>Choisissez la formule qui vous convient</Text>

          {loadingPlans ? (
            <ActivityIndicator size="large" color={BRAND} style={{ marginVertical: 32 }} />
          ) : null}
          {plans.map((plan) => (
            <View key={plan.id} style={[styles.planCard, plan.recommended && styles.planCardRecommended]}>

              {plan.recommended && (
                <View style={styles.recommendedWrap}>
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommandé</Text>
                  </View>
                </View>
              )}

              <Text style={styles.planTag}>{plan.tag}</Text>
              <Text style={styles.planName}>{plan.name}</Text>

              <View style={styles.planPriceRow}>
                <Text style={styles.planPrice}>{plan.priceYear}</Text>
                <Text style={styles.planPriceSuffix}> / an</Text>
              </View>
              <Text style={styles.planPriceMonth}>soit {plan.priceMonth}</Text>

              <Text style={styles.planDescription}>{plan.description}</Text>

              <View style={styles.planFeatures}>
                {plan.features.map((f) => (
                  <View key={f} style={styles.planFeatureRow}>
                    <Feather name="check" size={14} color={BRAND} />
                    <Text style={styles.planFeatureText}>{f}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.planCta, { backgroundColor: plan.ctaColor }]}
                onPress={() => Linking.openURL('https://santeafrique.net/abonnement')}
                activeOpacity={0.85}
              >
                <Text style={styles.planCtaText}>S'abonner sur le site</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Barre paiement */}
        <View style={styles.paymentBar}>
          <Feather name="check" size={14} color={BRAND} />
          <Text style={styles.paymentBarText}>Paiement sécurisé • Facture envoyée par email</Text>
          <View style={styles.paymentChips}>
            {['Wave', 'VISA', 'MC'].map((m) => (
              <View key={m} style={styles.paymentChip}>
                <Text style={styles.paymentChipText}>{m}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Service client */}
        <View style={styles.helpSection}>
          {/* Service client */}
          <View style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>Service client</Text>
            <Text style={styles.serviceSchedule}>Lundi – Vendredi, 9h00 – 18h00 (GMT)</Text>
            <View style={styles.serviceContacts}>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:infos@santeafrique.net')}>
                <Text style={styles.serviceLink}>infos@santeafrique.net</Text>
              </TouchableOpacity>
              <Text style={styles.serviceSeparator}>•</Text>
              <TouchableOpacity onPress={() => Linking.openURL('tel:+2250714565076')}>
                <Text style={styles.serviceLink}>+225 07 14 56 50 76</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.servicePayments}>
              {['Wave', 'VISA', 'MasterCard'].map((m) => (
                <View key={m} style={styles.servicePaymentChip}>
                  <Text style={styles.servicePaymentText}>{m}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Déjà abonné */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Déjà abonné ?</Text>
            <TouchableOpacity onPress={onLogin}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};
