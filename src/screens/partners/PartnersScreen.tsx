import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

const WHATSAPP_NUMBER = '+2250714565076';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`;
const KIT_MEDIA_URL = 'https://santeafrique.net/partenaires';

const VALUE_PROPS = [
  {
    icon: 'target' as const,
    title: 'Audience ciblée santé',
    desc: 'Professionnels de santé, décideurs et grand public qualifié à travers l\'Afrique.',
  },
  {
    icon: 'layers' as const,
    title: 'Formats & brand content',
    desc: 'Print, digital, vidéo, native ads, dossiers spéciaux et publi-reportages.',
  },
  {
    icon: 'trending-up' as const,
    title: 'Accompagnement',
    desc: 'Conseil éditorial, production créative et mesure d\'impact de vos campagnes.',
  },
];

const SOLUTIONS = [
  { icon: 'monitor' as const,       label: 'Display & bannières',        desc: 'Formats web & mobile haute visibilité' },
  { icon: 'file-text' as const,     label: 'Native & brand content',     desc: 'Articles sponsorisés et dossiers spéciaux' },
  { icon: 'book-open' as const,     label: 'Magazine print & digital',   desc: 'Encarts, couvertures et publi-rédactionnels' },
  { icon: 'video' as const,         label: 'Vidéo & podcasts',           desc: 'Contenu audiovisuel sur nos plateformes' },
  { icon: 'mail' as const,          label: 'Newsletter sponsorisée',     desc: 'Insertion dans notre newsletter santé' },
  { icon: 'briefcase' as const,     label: 'Offres d\'emploi premium',   desc: 'Diffusion sur l\'espace emploi santé' },
];

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  hero: { paddingHorizontal: Spacing['4'], paddingBottom: Spacing['6'] },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing['4'],
  },
  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing['3'],
    paddingVertical: 4,
    marginBottom: Spacing['3'],
  },
  heroTagText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, color: '#fff' },
  heroTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 24, color: '#fff',
    lineHeight: 32, marginBottom: Spacing['2'],
  },
  heroSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22, marginBottom: Spacing['5'],
  },
  heroActions: { flexDirection: 'row', gap: Spacing['3'], flexWrap: 'wrap' },
  whatsappBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing['2'],
    backgroundColor: '#25D366',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'],
  },
  whatsappBtnText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: '#fff' },
  kitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing['2'],
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'],
  },
  kitBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: '#fff' },

  section: { paddingHorizontal: Spacing['4'], paddingTop: Spacing['5'] },
  sectionTitle: {
    fontFamily: FontFamily.headingBold, fontSize: FontSize.lg,
    color: C.textPrimary, marginBottom: Spacing['1'],
  },
  sectionSub: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: C.textMuted, marginBottom: Spacing['4'],
  },

  valueCard: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing['4'],
    marginBottom: Spacing['3'],
    borderWidth: 1, borderColor: C.borderLight,
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing['3'],
  },
  valueIcon: {
    width: 44, height: 44, borderRadius: Radius.md,
    backgroundColor: C.primaryUltraLight,
    alignItems: 'center', justifyContent: 'center',
  },
  valueText: { flex: 1 },
  valueTitle: {
    fontFamily: FontFamily.headingBold, fontSize: FontSize.base,
    color: C.textPrimary, marginBottom: 4,
  },
  valueDesc: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: C.textSecondary, lineHeight: 20,
  },

  solutionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['3'] },
  solutionCard: {
    width: '47%',
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing['3'],
    borderWidth: 1, borderColor: C.borderLight,
  },
  solutionIcon: {
    width: 38, height: 38, borderRadius: Radius.sm,
    backgroundColor: C.primaryUltraLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing['2'],
  },
  solutionLabel: {
    fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm,
    color: C.textPrimary, marginBottom: 2,
  },
  solutionDesc: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs,
    color: C.textMuted, lineHeight: 16,
  },

  ctaBanner: {
    marginHorizontal: Spacing['4'],
    marginTop: Spacing['5'],
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  ctaGrad: { padding: Spacing['5'], alignItems: 'center' },
  ctaTitle: {
    fontFamily: FontFamily.headingBold, fontSize: FontSize.lg,
    color: '#fff', textAlign: 'center', marginBottom: Spacing['2'],
  },
  ctaSub: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)', textAlign: 'center',
    lineHeight: 20, marginBottom: Spacing['4'],
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing['2'],
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing['5'], paddingVertical: Spacing['3'],
  },
  ctaBtnText: {
    fontFamily: FontFamily.bodyBold, fontSize: FontSize.base,
    color: '#1B9DD9',
  },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing['4'],
    marginTop: Spacing['5'],
    gap: Spacing['3'],
  },
  statCard: {
    flex: 1, backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg, padding: Spacing['4'],
    alignItems: 'center', borderWidth: 1, borderColor: C.borderLight,
  },
  statNum: {
    fontFamily: FontFamily.headingBold, fontSize: 22,
    color: C.primary, marginBottom: 2,
  },
  statLabel: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs,
    color: C.textMuted, textAlign: 'center',
  },

  footer: { paddingVertical: Spacing['6'] },
});

interface Props { onBack?: () => void; onJobsPress?: () => void; }

export const PartnersScreen: React.FC<Props> = ({ onBack, onJobsPress }) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B9DD9" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <LinearGradient
          colors={['#1B9DD9', '#0D6B9A']}
          style={[styles.hero, { paddingTop: insets.top + Spacing['4'] }]}
        >
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Feather name="arrow-left" size={18} color="#fff" />
          </TouchableOpacity>

          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>B2B · Partenariats médias</Text>
          </View>

          <Text style={styles.heroTitle}>Espace{'\n'}Partenaires</Text>
          <Text style={styles.heroSub}>
            Des audiences qualifiées, des formats premium, un média de confiance.
          </Text>

          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={() => Linking.openURL(WHATSAPP_URL)}
              activeOpacity={0.85}
            >
              <Feather name="message-circle" size={18} color="#fff" />
              <Text style={styles.whatsappBtnText}>Discuter sur WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.kitBtn}
              onPress={() => Linking.openURL(KIT_MEDIA_URL)}
              activeOpacity={0.85}
            >
              <Feather name="download" size={16} color="#fff" />
              <Text style={styles.kitBtnText}>Kit Média 2025–2026</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {[
            { num: '50K+', label: 'Lecteurs actifs' },
            { num: '12', label: 'Pays africains' },
            { num: '8 ans', label: "d'expertise santé" },
          ].map((s) => (
            <View key={s.num} style={styles.statCard}>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Pourquoi nous ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pourquoi Santé Afrique ?</Text>
          <Text style={styles.sectionSub}>
            Le média de référence des professionnels de santé en Afrique francophone.
          </Text>
          {VALUE_PROPS.map((v) => (
            <View key={v.title} style={styles.valueCard}>
              <View style={styles.valueIcon}>
                <Feather name={v.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.valueText}>
                <Text style={styles.valueTitle}>{v.title}</Text>
                <Text style={styles.valueDesc}>{v.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Nos solutions ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nos solutions</Text>
          <Text style={styles.sectionSub}>
            Des formats adaptés à chaque objectif de communication.
          </Text>
          <View style={styles.solutionsGrid}>
            {SOLUTIONS.map((s) => (
              <View key={s.label} style={styles.solutionCard}>
                <View style={styles.solutionIcon}>
                  <Feather name={s.icon} size={18} color={colors.primary} />
                </View>
                <Text style={styles.solutionLabel}>{s.label}</Text>
                <Text style={styles.solutionDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── CTA ── */}
        <View style={styles.ctaBanner}>
          <LinearGradient colors={['#0D6B9A', '#1B9DD9']} style={styles.ctaGrad}>
            <Text style={styles.ctaTitle}>Prêt à toucher les acteurs{'\n'}de la santé en Afrique ?</Text>
            <Text style={styles.ctaSub}>
              Contactez notre équipe commerciale pour un devis personnalisé.
            </Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => Linking.openURL(WHATSAPP_URL)}
              activeOpacity={0.85}
            >
              <Feather name="message-circle" size={18} color="#1B9DD9" />
              <Text style={styles.ctaBtnText}>Parler sur WhatsApp</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* ── Emplois ── */}
        <View style={[styles.section, { marginBottom: Spacing['2'] }]}>
          <TouchableOpacity
            style={[styles.valueCard, { backgroundColor: colors.primaryUltraLight, borderColor: colors.primaryLight }]}
            onPress={onJobsPress}
            activeOpacity={0.8}
          >
            <View style={[styles.valueIcon, { backgroundColor: colors.primary }]}>
              <Feather name="briefcase" size={20} color="#fff" />
            </View>
            <View style={styles.valueText}>
              <Text style={[styles.valueTitle, { color: colors.primaryDark }]}>Poster une offre d'emploi</Text>
              <Text style={styles.valueDesc}>Diffusez vos recrutements auprès des professionnels de santé.</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
};
