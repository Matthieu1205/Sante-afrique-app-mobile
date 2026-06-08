import React, { useEffect, useState } from 'react';
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
import { fetchMagazineIssueDetail } from '@/services/api';
import type { ApiMagazineSommaireItem } from '@/services/api';

interface MagazineIssueScreenProps {
  issue: MagazineIssue;
  onBack?: () => void;
  onSubscribe?: () => void;
  onLogin?: () => void;
}

const { width: W } = Dimensions.get('window');
const COVER_W = (W - Spacing['4'] * 2) * 0.42;
const COVER_H = COVER_W * 1.42;
const JOURS_FR = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
const MOIS_FR  = ['JANVIER','FÉVRIER','MARS','AVRIL','MAI','JUIN','JUILLET','AOÛT','SEPTEMBRE','OCTOBRE','NOVEMBRE','DÉCEMBRE'];

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${JOURS_FR[d.getDay()]} ${d.getDate()} ${MOIS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

const SOMMAIRE_FALLBACK: ApiMagazineSommaireItem[] = [
  { page: 4,  title: 'Éditorial' },
  { page: 6,  title: 'Dossier principal' },
  { page: 18, title: 'Grand entretien' },
  { page: 30, title: 'Actualités santé' },
  { page: 42, title: 'Business Santé' },
  { page: 48, title: 'Tribune' },
];

const HERO_BG: [string, string] = ['#0D1B2A', '#0D1B2A'];

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },

  // ── Barre de navigation ──────────────────────────────────────────
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

  // ── Hero ─────────────────────────────────────────────────────────
  hero: { padding: Spacing['4'], paddingBottom: Spacing['5'] },
  heroInner: { flexDirection: 'row', gap: Spacing['4'], alignItems: 'flex-start' },

  cover: {
    borderRadius: Radius.sm,
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

  // méta (droite de la couverture)
  meta: { flex: 1, gap: 6, paddingTop: 4 },
  metaBadge: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  metaTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 30,
    color: C.white,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  metaNum: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.3,
  },
  metaDate: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  metaTheme: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 17,
    marginTop: 4,
  },

  // ── 3 boutons en ligne ───────────────────────────────────────────
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing['4'],
  },
  // SOMMAIRE — outline blanc sur fond sombre
  btnSommaire: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  btnSommaireText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    color: C.white,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  // LIRE (ABONNÉS) — bleu plein
  btnLire: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
  },
  btnLireText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    color: C.white,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  // SE CONNECTER — rouge plein
  btnConnect: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C0392B',
  },
  btnConnectText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    color: C.white,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  // ── Extrait ──────────────────────────────────────────────────────
  extrait: {
    marginHorizontal: Spacing['4'],
    marginTop: Spacing['4'],
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing['4'],
    borderWidth: 1,
    borderColor: C.borderLight,
    ...Shadows.card,
  },
  extraitText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: C.textSecondary,
    lineHeight: 26,
  },

  // ── Sommaire ─────────────────────────────────────────────────────
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
  sommaireHeader: {
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  sommaireTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: C.textPrimary,
  },
  sommaireRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing['3'],
    paddingHorizontal: Spacing['4'],
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  sommaireBullet: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.sm,
    color: C.primary,
    lineHeight: 20,
    width: 24,
    textAlign: 'center',
  },
  sommaireItemTitle: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    lineHeight: 20,
  },
  sommaireMore: {
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
  },
  sommaireMoreText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: C.primary,
  },
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
  const [sommaire, setSommaire] = useState<ApiMagazineSommaireItem[]>(SOMMAIRE_FALLBACK);
  const [extrait, setExtrait] = useState<string | null>(null);
  const [detailDate, setDetailDate] = useState<string | undefined>(issue.publishedAt);

  useEffect(() => {
    fetchMagazineIssueDetail(Number(issue.id)).then((detail) => {
      if (detail?.sommaire?.length) setSommaire(detail.sommaire);
      if (detail?.extrait) setExtrait(detail.extrait);
      if (detail?.date) setDetailDate(detail.date);
    });
  }, [issue.id]);

  const visibleItems = sommaire;
  const hiddenCount  = 0;
  const dateFormatted = formatDate(detailDate);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Barre de navigation */}
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

        {/* ── Hero foncé ─────────────────────────────────────────── */}
        <LinearGradient colors={HERO_BG} style={styles.hero}>

          <View style={styles.heroInner}>
            {/* Couverture */}
            {issue.coverImage ? (
              <View style={[styles.cover, { width: COVER_W, height: COVER_H }]}>
                <Image source={issue.coverImage} style={{ width: COVER_W, height: COVER_H }} resizeMode="cover" />
              </View>
            ) : (
              <LinearGradient
                colors={issue.color}
                style={[styles.cover, { width: COVER_W, height: COVER_H, alignItems: 'center', justifyContent: 'center' }]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
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

            {/* Méta */}
            <View style={styles.meta}>
              <Text style={styles.metaBadge}>Numéro en cours</Text>
              <Text style={styles.metaTitle}>Santé Afrique</Text>
              <Text style={styles.metaNum}>{issue.label}</Text>
              {dateFormatted ? (
                <Text style={styles.metaDate}>{dateFormatted}</Text>
              ) : null}
              {issue.theme ? (
                <Text style={styles.metaTheme}>{issue.theme}</Text>
              ) : null}
            </View>
          </View>

          {/* 3 boutons : SOMMAIRE | LIRE (ABONNÉS) | SE CONNECTER */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btnSommaire} activeOpacity={0.8}>
              <Text style={styles.btnSommaireText}>Sommaire</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnLire} onPress={onSubscribe} activeOpacity={0.85}>
              <Text style={styles.btnLireText}>{'Lire\n(Abonnés)'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnConnect} onPress={onLogin} activeOpacity={0.85}>
              <Text style={styles.btnConnectText}>Se connecter</Text>
            </TouchableOpacity>
          </View>

        </LinearGradient>

        {/* Extrait si disponible */}
        {extrait ? (
          <View style={styles.extrait}>
            <Text style={styles.extraitText}>{extrait}</Text>
          </View>
        ) : null}

        {/* Sommaire */}
        <View style={styles.sommaire}>
          <View style={styles.sommaireHeader}>
            <Text style={styles.sommaireTitle}>— Au sommaire</Text>
          </View>

          {visibleItems.map((item, idx) => (
            <View key={`${idx}-${item.page}`} style={styles.sommaireRow}>
              <Text style={styles.sommaireBullet}>{idx + 1}</Text>
              <Text style={styles.sommaireItemTitle}>{item.title}</Text>
            </View>
          ))}

          {hiddenCount > 0 && (
            <TouchableOpacity style={styles.sommaireMore} onPress={onSubscribe} activeOpacity={0.7}>
              <Text style={styles.sommaireMoreText}>+ {hiddenCount} autres articles</Text>
              <Feather name="chevron-right" size={14} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  );
};
