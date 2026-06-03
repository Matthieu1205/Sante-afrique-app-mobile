import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

const BLUE   = '#1B9DD9';
const RED    = '#C0392B';
const NAVY   = '#1A2E4A';
const GREEN  = '#27AE60';

// ─── Données ──────────────────────────────────────────────────────────────────

const OBJECTIVES = [
  'Contribuer à enrichir la communication en santé en Afrique, partager des informations fiables et sensibiliser le public tout en s\'imposant comme une référence incontournable.',
  'Favoriser l\'Échange et le Partage de Connaissances',
  'Sensibiliser aux Défis de Santé en Afrique',
  'Promouvoir les Initiatives Locales et Continentales',
  'Encourager l\'Innovation et la Recherche',
  'Valoriser les Carrières dans la Santé',
  'Accompagner le Développement des Politiques de Santé',
];

const CIBLES = [
  'Professionnels de Santé',
  'Institutions et Décideurs en Santé Publique',
  'Chercheurs et Universitaires',
  'Industrie de la Santé et Fournisseurs de Services Médicaux',
  'Associations et Réseaux Professionnels de Santé',
  'Patients et Public Sensible aux Questions de Santé',
  'Sponsors et Partenaires Financiers',
];

const CANAUX = [
  {
    icon: 'book-open' as const,
    title: 'Magazine Imprimé',
    desc: 'En version physique, imprimé avec des standards de haute qualité.',
  },
  {
    icon: 'smartphone' as const,
    title: 'Application Mobile Santé Afrique',
    desc: 'L\'application permet un accès direct au magazine ainsi qu\'à des articles de santé en temps réel (sous abonnement).',
  },
  {
    icon: 'globe' as const,
    title: 'Web et Blog Santé',
    desc: 'Site internet dédié avec un blog en ligne et une plateforme d\'information continue.',
  },
  {
    icon: 'share-2' as const,
    title: 'Réseaux Sociaux',
    desc: 'Pages actives sur Facebook, LinkedIn et YouTube.',
  },
];

const CHIFFRES = [
  {
    bg: NAVY,
    sub: 'Tirage moyen',
    num: '5.000',
    label: 'EXEMPLAIRES\nPAR NUMÉRO',
  },
  {
    bg: BLUE,
    sub: 'Lecteurs réguliers',
    num: '75%',
    label: 'DE NOTRE LECTORAT\nREVIENT CHAQUE\nÉDITION',
  },
  {
    bg: GREEN,
    sub: 'Audience numérique',
    num: '+de50.000',
    label: 'VISITES MENSUELLES\nSUR NOTRE SITE ET\nAPPLICATION',
  },
];

const PARTNERS = [
  'Ministère Santé CI', 'MEPS', 'AIRP', 'ONP-CI',
  'Ordre Med. CI', 'ONCDCI', 'ONE-CI', 'PNSM',
  'CNPTIR', 'IMENA', 'CNRAO', 'PSPCI',
  'UNPPCI', 'Labo Montagnier', 'CAMU', 'oumed',
  'UFR SPB', 'CNAM', 'INSP', 'Laboratoires A',
];

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: C.textPrimary,
    textAlign: 'center',
  },

  // ── Cover (page 1) ──
  cover: {
    backgroundColor: '#EAF6FD',
    paddingHorizontal: Spacing['5'],
    paddingVertical: Spacing['5'],
    borderBottomWidth: 1,
    borderBottomColor: '#B3E0F7',
  },
  coverRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing['2'] },
  coverYear: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xl,
    color: RED,
    letterSpacing: -1,
  },
  coverSante: { fontFamily: FontFamily.headingBold, fontSize: FontSize.xl, color: '#1C1C1E' },
  coverAfrique: { fontFamily: FontFamily.headingBold, fontSize: FontSize.xl, color: BLUE },
  coverBadge: {
    alignSelf: 'flex-start',
    backgroundColor: RED,
    borderRadius: 3,
    paddingHorizontal: Spacing['3'],
    paddingVertical: 6,
    marginBottom: Spacing['3'],
  },
  coverBadgeText: { fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: '#FFFFFF' },
  coverTagline: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: BLUE,
    lineHeight: 20,
  },

  // ── Section wrapper ──
  section: { paddingHorizontal: Spacing['4'], paddingTop: Spacing['5'] },
  divider: { height: 1, backgroundColor: '#E0F0FA', marginHorizontal: Spacing['4'], marginTop: Spacing['5'] },

  // Titre de section : italique bleu
  sTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: BLUE,
    fontStyle: 'italic',
    marginBottom: Spacing['3'],
  },

  // Sous-titre gras bleu (page 2)
  sSubtitleBlue: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.sm,
    color: BLUE,
    lineHeight: 22,
    marginBottom: Spacing['2'],
  },

  sText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing['2'],
  },
  sBold: { fontFamily: FontFamily.bodyBold, color: C.textPrimary },

  // ── Objectives — grille 2 colonnes ──
  objGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'] },
  objItem: {
    width: '47%',
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: Spacing['3'],
  },
  objText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: BLUE,
    lineHeight: 18,
  },

  // ── Partners grid ──
  partnersBox: {
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: Radius.lg,
    padding: Spacing['3'],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing['2'],
    backgroundColor: C.backgroundCard,
  },
  partnerChip: {
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing['2'],
    paddingVertical: 5,
    backgroundColor: C.background,
  },
  partnerName: { fontFamily: FontFamily.body, fontSize: 9, color: C.textSecondary },

  // ── Cibles ──
  cibleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing['2'], marginBottom: Spacing['2'] },
  cibleNum: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: BLUE,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  cibleNumText: { fontFamily: FontFamily.bodyBold, fontSize: 10, color: BLUE },
  cibleText: { flex: 1, fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: C.textPrimary, lineHeight: 20 },

  // ── Audience stats ──
  audienceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['3'] },
  audienceStat: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing['3'],
    borderWidth: 1,
    borderColor: C.borderLight,
    gap: 3,
  },
  audienceStatLabel: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: BLUE },
  audienceStatValue: { fontFamily: FontFamily.headingBold, fontSize: FontSize.xl, color: C.textPrimary },
  audienceStatDesc: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted, lineHeight: 16 },

  // ── Canaux ──
  canalCard: {
    flexDirection: 'row',
    gap: Spacing['3'],
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing['3'],
    borderWidth: 1,
    borderColor: C.borderLight,
    marginBottom: Spacing['2'],
    alignItems: 'flex-start',
  },
  canalIcon: {
    width: 38, height: 38,
    borderRadius: Radius.sm,
    backgroundColor: '#EAF6FD',
    alignItems: 'center', justifyContent: 'center',
  },
  canalTextWrap: { flex: 1 },
  canalTitle: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: BLUE, marginBottom: 3 },
  canalDesc: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textSecondary, lineHeight: 16 },

  // ── Chiffres ──
  chiffresRow: { gap: Spacing['3'] },
  chiffreCard: { borderRadius: Radius.md, padding: Spacing['4'], ...Shadows.card },
  chiffreSub: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  chiffreNum: { fontFamily: FontFamily.headingBold, fontSize: 36, color: '#FFFFFF', lineHeight: 40, marginBottom: 4 },
  chiffreLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    lineHeight: 18,
  },

  // ── Pourquoi collaborer ──
  whyCard: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing['4'],
    borderWidth: 1,
    borderColor: C.borderLight,
    gap: Spacing['1'],
    ...Shadows.card,
  },

  // ── Footer bleu ──
  footerBox: {
    margin: Spacing['4'],
    backgroundColor: BLUE,
    borderRadius: Radius.lg,
    padding: Spacing['5'],
    alignItems: 'center',
    gap: Spacing['2'],
  },
  footerBrandRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3, marginBottom: Spacing['2'] },
  footerSante: { fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: '#FFFFFF' },
  footerAfrique: { fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: '#FFFFFF' },
  footerLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: Spacing['1'],
  },
  footerUrl: { fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: '#FFFFFF' },
  footerContact: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.9)' },
});

// ─── Composant ────────────────────────────────────────────────────────────────

interface Props { onBack?: () => void; }

export const KitMediaScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, isDark } = useTheme();
  const S = makeStyles(colors);
  const insets = useSafeAreaInsets();

  return (
    <View style={S.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.backgroundCard} />

      {/* Header */}
      <View style={[S.header, { paddingTop: insets.top + Spacing['2'] }]}>
        <TouchableOpacity style={S.backBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Kit Média 2025</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>

        {/* ══ PAGE 1 — Cover ══ */}
        <View style={S.cover}>
          <View style={S.coverRow}>
            <Text style={S.coverYear}>2025</Text>
            <Text style={S.coverSante}>santé </Text>
            <Text style={S.coverAfrique}>afrique</Text>
          </View>
          <View style={S.coverBadge}>
            <Text style={S.coverBadgeText}>Kit Media</Text>
          </View>
          <Text style={S.coverTagline}>
            Le magazine de santé de référence en Afrique.{'\n'}L'essentiel de la santé pour l'Afrique, par l'Afrique.
          </Text>
        </View>

        {/* ══ PAGE 2 — Présentation ══ */}
        <View style={S.section}>
          <Text style={S.sTitle}>Présentation de Santé Afrique</Text>
          <Text style={S.sSubtitleBlue}>
            Santé Afrique est le magazine de santé de référence en Afrique. L'essentiel de la santé pour l'Afrique, par l'Afrique.
          </Text>
          <Text style={S.sText}>
            <Text style={S.sBold}>Santé Afrique</Text> est un magazine dédié à informer, éduquer et sensibiliser le grand public sur les grands enjeux de la santé en Afrique, avec des articles rigoureux, accessibles et adaptés aux réalités locales. Nous abordons des sujets variés, allant de la santé infantile et maternelle à la vaccination et aux Objectifs de Développement Durable, tout en mettant en lumière les défis spécifiques du continent, comme les maladies infectieuses et l'accès aux soins.
          </Text>
          <Text style={S.sText}>
            En créant un espace de dialogue pour les professionnels de santé, chercheurs et décideurs, <Text style={S.sBold}>Santé Afrique</Text> valorise les initiatives locales et continentales, encourage l'innovation en santé, et soutient le développement de politiques de santé.
          </Text>
          <Text style={S.sText}>
            Notre mission est de devenir une source fiable et incontournable pour ceux qui souhaitent adopter des pratiques de vie saines et améliorer la qualité de vie en Afrique.
          </Text>
        </View>

        <View style={S.divider} />

        {/* Nos objectifs */}
        <View style={S.section}>
          <Text style={S.sTitle}>Nos objectifs</Text>
          <View style={S.objGrid}>
            {OBJECTIVES.map((obj, i) => (
              <View key={i} style={S.objItem}>
                <Text style={S.objText}>{obj}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={S.divider} />

        {/* Ils nous font confiance */}
        <View style={S.section}>
          <Text style={S.sTitle}>Ils nous font confiance</Text>
          <View style={S.partnersBox}>
            {PARTNERS.map((name) => (
              <View key={name} style={S.partnerChip}>
                <Text style={S.partnerName}>{name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={S.divider} />

        {/* ══ PAGE 3 — Nos Cibles ══ */}
        <View style={S.section}>
          <Text style={S.sTitle}>Nos Cibles</Text>
          {CIBLES.map((c, i) => (
            <View key={i} style={S.cibleRow}>
              <View style={S.cibleNum}>
                <Text style={S.cibleNumText}>{i + 1}</Text>
              </View>
              <Text style={S.cibleText}>{c}</Text>
            </View>
          ))}
        </View>

        <View style={S.divider} />

        {/* Notre Audience & Diffusion */}
        <View style={S.section}>
          <Text style={S.sTitle}>Notre Audience & Diffusion</Text>
          <Text style={[S.sText, { fontFamily: FontFamily.bodyBold, color: colors.textPrimary, marginBottom: Spacing['3'] }]}>
            Santé Afrique est un magazine bimestriel diffusé en version numérique et imprimée :
          </Text>
          <View style={S.audienceGrid}>
            <View style={S.audienceStat}>
              <Text style={S.audienceStatLabel}>Audience</Text>
              <Text style={S.audienceStatValue}>~25 000</Text>
              <Text style={S.audienceStatDesc}>lecteurs par numéro</Text>
            </View>
            <View style={S.audienceStat}>
              <Text style={S.audienceStatLabel}>Taux de prise en main</Text>
              <Text style={S.audienceStatValue}>×5</Text>
              <Text style={S.audienceStatDesc}>distribution nationale et internationale (Côte d'Ivoire et Afrique)</Text>
            </View>
            <View style={[S.audienceStat, { minWidth: '100%' }]}>
              <Text style={S.audienceStatLabel}>Supports de diffusion</Text>
              <Text style={S.audienceStatDesc}>
                Application mobile, site web et plusieurs points de distribution (kiosques à journaux)
              </Text>
            </View>
          </View>
        </View>

        <View style={S.divider} />

        {/* Nos Outils & Canaux */}
        <View style={S.section}>
          <Text style={S.sTitle}>Nos Outils & Canaux de Diffusion</Text>
          {CANAUX.map((c) => (
            <View key={c.title} style={S.canalCard}>
              <View style={S.canalIcon}>
                <Feather name={c.icon} size={18} color={BLUE} />
              </View>
              <View style={S.canalTextWrap}>
                <Text style={S.canalTitle}>• {c.title}</Text>
                <Text style={S.canalDesc}>{c.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={S.divider} />

        {/* ══ PAGE 4 — Nos Chiffres ══ */}
        <View style={S.section}>
          <Text style={S.sTitle}>Nos Chiffres</Text>
          <View style={S.chiffresRow}>
            {CHIFFRES.map((c) => (
              <View key={c.num} style={[S.chiffreCard, { backgroundColor: c.bg }]}>
                <Text style={S.chiffreSub}>{c.sub}</Text>
                <Text style={S.chiffreNum}>{c.num}</Text>
                <Text style={S.chiffreLabel}>{c.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={S.divider} />

        {/* Pourquoi Collaborer */}
        <View style={S.section}>
          <Text style={S.sTitle}>Pourquoi Collaborer avec Santé Afrique ?</Text>
          <View style={S.whyCard}>
            <Text style={S.sText}>
              <Text style={S.sBold}>Santé Afrique</Text> se positionne comme un acteur clé de l'information en santé pour l'Afrique.
            </Text>
            <Text style={S.sText}>
              Nos partenaires bénéficient d'une visibilité accrue auprès d'un public engagé et concerné par les sujets de santé. Les annonceurs peuvent cibler une audience active et réceptive dans un cadre de confiance et de crédibilité.
            </Text>
          </View>
        </View>

        {/* ── Footer bleu ── */}
        <View style={S.footerBox}>
          <View style={S.footerBrandRow}>
            <Text style={S.footerSante}>santé </Text>
            <Text style={S.footerAfrique}>afrique</Text>
          </View>
          <Text style={S.footerLabel}>Pour toute information sur la publicité et les partenariats :</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://santeafrique.net')}>
            <Text style={S.footerUrl}>www.santeafrique.net</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:infos@santeafrique.net')}>
            <Text style={S.footerContact}>infos@santeafrique.net</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('tel:+2250714565080')}>
            <Text style={S.footerContact}>+225 07 14 56 50 80</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};
