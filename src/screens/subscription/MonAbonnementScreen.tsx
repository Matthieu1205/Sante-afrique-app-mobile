import React from 'react';
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
import { FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';
import type { UserProfile } from '@/services/api';

interface MonAbonnementScreenProps {
  userProfile: UserProfile;
  onBack?: () => void;
  onModifier?: () => void;
  onFactures?: () => void;
}

const BLUE  = '#1B9DD9';
const NAVY  = '#0D2137';
const GREEN = '#27AE60';
const ORANGE = '#E67E22';

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function daysRemaining(expiresAt: string | null | undefined): number {
  if (!expiresAt) return 0;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

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
    color: '#fff',
    textAlign: 'center',
  },

  content: { padding: Spacing['4'], paddingBottom: 48 },

  // ── Carte abonnement ─────────────────────────────────────────────
  card: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: Spacing['4'],
    ...Shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing['3'],
  },
  cardTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: C.textPrimary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
  },
  badgeActive:   { borderColor: GREEN },
  badgeInactive: { borderColor: ORANGE },
  badgeText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs, letterSpacing: 0.5 },
  badgeTextActive:   { color: GREEN },
  badgeTextInactive: { color: ORANGE },

  formule: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    marginBottom: 4,
  },
  formuleBold: { fontFamily: FontFamily.bodySemiBold, color: C.textPrimary },
  dates: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textMuted,
    marginBottom: Spacing['4'],
  },

  btnRow: { flexDirection: 'row', gap: Spacing['3'] },
  btnPrimary: {
    flex: 1,
    backgroundColor: BLUE,
    borderRadius: Radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  btnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: Radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnOutlineText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: C.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ── Jours restants ───────────────────────────────────────────────
  daysCard: {
    marginTop: Spacing['4'],
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: Spacing['4'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['4'],
    ...Shadows.card,
  },
  daysIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysNumber: {
    fontFamily: FontFamily.headingBold,
    fontSize: 28,
    color: BLUE,
  },
  daysLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textMuted,
  },

  // ── CTA s'abonner (non abonné) ───────────────────────────────────
  ctaCard: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: Spacing['5'],
    alignItems: 'center',
    gap: Spacing['3'],
    ...Shadows.card,
  },
  ctaTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: C.textPrimary,
    textAlign: 'center',
  },
  ctaSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaBtn: {
    backgroundColor: BLUE,
    borderRadius: Radius.sm,
    paddingVertical: 13,
    paddingHorizontal: Spacing['6'],
    alignItems: 'center',
    width: '100%',
  },
  ctaBtnText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.base,
    color: '#fff',
    letterSpacing: 0.5,
  },
});

export const MonAbonnementScreen: React.FC<MonAbonnementScreenProps> = ({
  userProfile,
  onBack,
  onModifier,
  onFactures,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const sub = userProfile.subscription;
  const isActive = sub?.is_active ?? false;
  const days = isActive ? daysRemaining(sub?.expires_at) : 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

      <LinearGradient
        colors={[BLUE, NAVY]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}
      >
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon abonnement</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {isActive && sub ? (
          <>
            {/* Carte abonnement actif */}
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>Abonnement en cours</Text>
                <View style={[styles.badge, styles.badgeActive]}>
                  <Text style={[styles.badgeText, styles.badgeTextActive]}>ACTIF</Text>
                </View>
              </View>

              <Text style={styles.formule}>
                {'Formule : '}
                <Text style={styles.formuleBold}>{sub.plan}</Text>
              </Text>
              <Text style={styles.dates}>
                {sub.starts_at ? `Début : ${fmtDate(sub.starts_at)} · ` : ''}
                {`Expire le : ${fmtDate(sub.expires_at)}`}
              </Text>

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.btnPrimary} onPress={onModifier} activeOpacity={0.85}>
                  <Text style={styles.btnPrimaryText}>Modifier mon{'\n'}abonnement</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnOutline} onPress={onFactures} activeOpacity={0.85}>
                  <Text style={styles.btnOutlineText}>Mes factures</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Jours restants */}
            <View style={styles.daysCard}>
              <View style={styles.daysIconWrap}>
                <Feather name="calendar" size={22} color={BLUE} />
              </View>
              <View>
                <Text style={styles.daysNumber}>{days} <Text style={{ fontSize: FontSize.sm, color: colors.textMuted, fontFamily: FontFamily.body }}>jours restants</Text></Text>
                <Text style={styles.daysLabel}>Valide jusqu'au {fmtDate(sub.expires_at)}</Text>
              </View>
            </View>
          </>
        ) : (
          /* Pas d'abonnement actif */
          <View style={styles.ctaCard}>
            <Feather name="star" size={40} color={BLUE} />
            <Text style={styles.ctaTitle}>Aucun abonnement actif</Text>
            <Text style={styles.ctaSub}>
              Accédez à tous les contenus Santé Afrique sans limitation, sur tous vos appareils.
            </Text>
            <TouchableOpacity style={styles.ctaBtn} onPress={onModifier} activeOpacity={0.85}>
              <Text style={styles.ctaBtnText}>S'abonner — À partir de 1 250 FCFA/mois</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
};
