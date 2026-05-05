import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';
import type { MagazineIssue } from './MagazineScreen';

interface MagazineIssueScreenProps {
  issue: MagazineIssue;
  onBack?: () => void;
  onSubscribe?: () => void;
  onLogin?: () => void;
}

const { width: W } = Dimensions.get('window');
const COVER_W = (W - Spacing['4'] * 2) * 0.44;
const COVER_H = COVER_W * 1.42;

const SOMMAIRE = [
  { page: 4,  title: 'Éditorial — Dr. Aminata Koné' },
  { page: 6,  title: 'Dossier : L\'offensive finale contre le paludisme' },
  { page: 18, title: 'Entretien : Pr. Jean-Marie Sawadogo, OMS Afrique' },
  { page: 24, title: 'Vaccin RTS,S : résultats à 3 ans au Ghana' },
  { page: 30, title: 'Moustiquaires imprégnées : un bilan mitigé' },
  { page: 36, title: 'One Health : quand l\'environnement fait la loi' },
  { page: 42, title: 'Business Santé : les start-ups anti-paludéen' },
  { page: 48, title: 'Tribune : Pour une recherche africaine souveraine' },
];

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['3'],
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: C.white,
    textAlign: 'center',
  },
  content: { paddingBottom: 48 },
  hero: { padding: Spacing['4'], gap: Spacing['4'] },
  heroInner: { flexDirection: 'row', gap: Spacing['4'], alignItems: 'flex-start' },
  cover: {
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadows.card,
  },
  coverNumBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2,
  },
  coverNumText: { fontFamily: FontFamily.bodyBold, fontSize: 9, color: C.white },
  coverLogoWrap: { position: 'absolute', bottom: 8 },
  coverLogo: { fontFamily: FontFamily.logo, fontSize: 10, color: 'rgba(255,255,255,0.75)' },
  meta: { flex: 1, gap: Spacing['2'], paddingTop: Spacing['1'] },
  metaTitle: { fontFamily: FontFamily.logo, fontSize: 28, color: C.white, letterSpacing: -0.5, lineHeight: 30 },
  metaLabel: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  metaTheme: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  readBtn: {
    backgroundColor: C.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing['3'],
    alignItems: 'center',
  },
  readBtnText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: C.white },
  buyBtn: {
    backgroundColor: C.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing['3'],
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  buyBtnText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: C.white },
  actions: {
    flexDirection: 'row',
    marginHorizontal: Spacing['4'],
    marginTop: Spacing['3'],
    gap: Spacing['3'],
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2'],
    paddingVertical: Spacing['3'],
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: C.primary,
    backgroundColor: C.backgroundCard,
  },
  actionBtnActive: { backgroundColor: C.primaryUltraLight },
  actionBtnIcon: { fontSize: 18, color: C.primary },
  actionBtnIconActive: { color: C.primaryDark },
  actionBtnLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: C.primary },
  actionBtnLabelActive: { color: C.primaryDark },
  loginBtn: {
    marginHorizontal: Spacing['4'],
    marginTop: Spacing['3'],
    paddingVertical: Spacing['3'],
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: C.primary,
    alignItems: 'center',
    backgroundColor: C.backgroundCard,
  },
  loginBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: C.primary },
  sommaire: {
    marginHorizontal: Spacing['4'],
    marginTop: Spacing['4'],
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.borderLight,
    overflow: 'hidden',
    ...Shadows.card,
  },
  sommaireTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: C.textPrimary,
    padding: Spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  sommaireRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing['3'],
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  sommairePageNum: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: C.primary, width: 28 },
  sommaireItemTitle: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textSecondary, lineHeight: 20 },
  extrait: {
    marginHorizontal: Spacing['4'],
    marginTop: Spacing['4'],
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing['4'],
    gap: Spacing['3'],
    borderWidth: 1,
    borderColor: C.borderLight,
    ...Shadows.card,
  },
  extraitTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: C.textPrimary },
  extraitText: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textSecondary, lineHeight: 26 },
  extraitCta: {
    backgroundColor: C.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing['3'],
    alignItems: 'center',
    marginTop: Spacing['2'],
  },
  extraitCtaText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: C.white },
});

export const MagazineIssueScreen: React.FC<MagazineIssueScreenProps> = ({
  issue,
  onBack,
  onSubscribe,
  onLogin,
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [tab, setTab] = useState<'info' | 'sommaire' | 'extrait'>('info');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}
      >
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Santé Afrique n°{issue.number}
        </Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <LinearGradient
          colors={['#1A2A3A', '#0D1B2A']}
          style={styles.hero}
        >
          <View style={styles.heroInner}>
            {issue.coverImage ? (
              <View style={[styles.cover, { width: COVER_W, height: COVER_H }]}>
                <Image source={issue.coverImage} style={{ width: COVER_W, height: COVER_H }} resizeMode="cover" />
              </View>
            ) : (
              <LinearGradient
                colors={issue.color}
                style={[styles.cover, { width: COVER_W, height: COVER_H }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.coverNumBadge}>
                  <Text style={styles.coverNumText}>N°{issue.number}</Text>
                </View>
                <Feather name={issue.icon} size={38} color="rgba(255,255,255,0.85)" />
                <View style={styles.coverLogoWrap}>
                  <Text style={styles.coverLogo}>santé <Text style={{ color: colors.white }}>afrique</Text></Text>
                </View>
              </LinearGradient>
            )}

            <View style={styles.meta}>
              <Text style={styles.metaTitle}>Santé{'\n'}Afrique</Text>
              <Text style={styles.metaLabel}>{issue.label}</Text>
              <Text style={styles.metaTheme}>{issue.theme}</Text>
            </View>
          </View>

          {issue.free ? (
            <TouchableOpacity style={styles.readBtn} activeOpacity={0.85}>
              <Text style={styles.readBtnText}>Lire gratuitement</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.buyBtn} onPress={onSubscribe} activeOpacity={0.85}>
              <Text style={styles.buyBtnText}>Acheter – {issue.price}</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, tab === 'sommaire' && styles.actionBtnActive]}
            onPress={() => setTab(tab === 'sommaire' ? 'info' : 'sommaire')}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionBtnIcon, tab === 'sommaire' && styles.actionBtnIconActive]}>≡</Text>
            <Text style={[styles.actionBtnLabel, tab === 'sommaire' && styles.actionBtnLabelActive]}>Sommaire</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, tab === 'extrait' && styles.actionBtnActive]}
            onPress={() => setTab(tab === 'extrait' ? 'info' : 'extrait')}
            activeOpacity={0.8}
          >
            <Feather name="eye" size={18} color={tab === 'extrait' ? colors.primaryDark : colors.primary} />
            <Text style={[styles.actionBtnLabel, tab === 'extrait' && styles.actionBtnLabelActive]}>Extrait</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={onLogin} activeOpacity={0.8}>
          <Text style={styles.loginBtnText}>Déjà abonné ? Se connecter</Text>
        </TouchableOpacity>

        {tab === 'sommaire' && (
          <View style={styles.sommaire}>
            <Text style={styles.sommaireTitle}>Au sommaire</Text>
            {SOMMAIRE.map((item) => (
              <View key={item.page} style={styles.sommaireRow}>
                <Text style={styles.sommairePageNum}>{item.page}</Text>
                <Text style={styles.sommaireItemTitle}>{item.title}</Text>
              </View>
            ))}
          </View>
        )}

        {tab === 'extrait' && (
          <View style={styles.extrait}>
            <Text style={styles.extraitTitle}>Extrait — Éditorial</Text>
            <Text style={styles.extraitText}>
              {`Le paludisme tue encore. Chaque année, plus de 600 000 personnes perdent la vie à cause de cette maladie — dont 94 % en Afrique subsaharienne. Pourtant, des signaux encourageants émergent.\n\nDepuis 2023, le vaccin RTS,S est déployé dans plusieurs pays d'Afrique de l'Ouest. Les thérapies combinées à base d'artémisinine montrent des taux d'efficacité supérieurs à 94 %. Et pour la première fois, des financements publics africains commencent à se substituer aux aides étrangères dans la lutte contre le vecteur.\n\nCe numéro 12 dresse un état des lieux complet : où en sommes-nous vraiment ? Quelles sont les nouvelles armes disponibles ? Et surtout — comment l'Afrique peut-elle enfin prendre la main sur sa propre santé ?\n\n— Dr. Aminata Koné, Rédactrice en chef`}
            </Text>
            {!issue.free && (
              <TouchableOpacity style={styles.extraitCta} onPress={onSubscribe} activeOpacity={0.85}>
                <Text style={styles.extraitCtaText}>Lire la suite · S'abonner</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
};
