import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';
import { fetchInvoices } from '@/services/api';
import type { ApiInvoice } from '@/services/api';

interface FacturesScreenProps {
  onBack?: () => void;
}

const BRAND = '#1B9DD9';
const GREEN = '#27AE60';
const ORANGE = '#E67E22';
const RED    = '#C0392B';

const MOCK_INVOICES: ApiInvoice[] = [
  {
    id: '1',
    number: 'SA-3-3-20251128094148-Ibs7XZ',
    date: '2025-11-28',
    period_start: '2025-11-28',
    period_end: '2026-11-28',
    amount: '200',
    currency: 'XOF',
    status: 'paid',
    pdf_url: null,
  },
];

function fmtDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
}

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },

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
    fontSize: FontSize.lg,
    color: C.textPrimary,
    textAlign: 'center',
  },

  content: { padding: Spacing['4'], paddingBottom: 48 },

  sectionHead: {
    borderLeftWidth: 3,
    borderLeftColor: BRAND,
    paddingLeft: Spacing['3'],
    marginBottom: Spacing['4'],
  },
  sectionTag: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    color: BRAND,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  sectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xl,
    color: C.textPrimary,
  },

  // ── Carte facture ────────────────────────────────────────────────
  card: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: Spacing['4'],
    marginBottom: Spacing['3'],
    ...Shadows.card,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing['3'],
  },
  invoiceNumber: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: C.textPrimary,
    flex: 1,
    marginRight: Spacing['2'],
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  badgePaid:    { borderColor: GREEN },
  badgePending: { borderColor: ORANGE },
  badgeFailed:  { borderColor: RED },
  badgeText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badgeTextPaid:    { color: GREEN },
  badgeTextPending: { color: ORANGE },
  badgeTextFailed:  { color: RED },

  divider: {
    height: 1,
    backgroundColor: C.borderLight,
    marginBottom: Spacing['3'],
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing['2'],
  },
  infoLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textSecondary,
  },
  amountValue: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: C.textPrimary,
  },
  amountCurrency: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: C.textMuted,
  },

  cardBottom: {
    marginTop: Spacing['3'],
    alignItems: 'flex-end',
  },
  btnPdf: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BRAND,
    borderRadius: Radius.sm,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  btnPdfDisabled: {
    backgroundColor: C.borderLight,
  },
  btnPdfText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: '#fff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  btnPdfTextDisabled: { color: C.textMuted },

  empty: { alignItems: 'center', paddingVertical: 48, gap: Spacing['3'] },
  emptyText: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textSecondary },
});

export const FacturesScreen: React.FC<FacturesScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices().then((data) => {
      setInvoices(data.length > 0 ? data : MOCK_INVOICES);
      setLoading(false);
    });
  }, []);

  const statusProps = (s: ApiInvoice['status']) => ({
    badge: s === 'paid' ? styles.badgePaid : s === 'pending' ? styles.badgePending : styles.badgeFailed,
    text:  s === 'paid' ? styles.badgeTextPaid : s === 'pending' ? styles.badgeTextPending : styles.badgeTextFailed,
    label: s === 'paid' ? 'PAYÉ' : s === 'pending' ? 'EN ATTENTE' : 'ÉCHOUÉ',
  });

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.backgroundCard}
      />

      <View style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes factures</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTag}>Compte</Text>
          <Text style={styles.sectionTitle}>Factures</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={BRAND} style={{ marginTop: 40 }} />
        ) : invoices.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="file-text" size={40} color={colors.textDisabled} />
            <Text style={styles.emptyText}>Aucune facture disponible</Text>
          </View>
        ) : (
          invoices.map((inv) => {
            const st = statusProps(inv.status);
            return (
              <View key={inv.id} style={styles.card}>

                {/* Numéro + badge statut */}
                <View style={styles.cardTop}>
                  <Text style={styles.invoiceNumber} numberOfLines={1} ellipsizeMode="middle">
                    {inv.number}
                  </Text>
                  <View style={[styles.badge, st.badge]}>
                    <Text style={[styles.badgeText, st.text]}>{st.label}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Infos */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{fmtDate(inv.date)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Période</Text>
                  <Text style={styles.infoValue}>{inv.period_start} → {inv.period_end}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Montant</Text>
                  <Text>
                    <Text style={styles.amountValue}>{inv.amount} </Text>
                    <Text style={styles.amountCurrency}>{inv.currency}</Text>
                  </Text>
                </View>

                {/* Bouton PDF */}
                <View style={styles.cardBottom}>
                  <TouchableOpacity
                    style={[styles.btnPdf, !inv.pdf_url && styles.btnPdfDisabled]}
                    onPress={() => inv.pdf_url && Linking.openURL(inv.pdf_url)}
                    disabled={!inv.pdf_url}
                    activeOpacity={0.8}
                  >
                    <Feather name="download" size={13} color={inv.pdf_url ? '#fff' : colors.textMuted} />
                    <Text style={[styles.btnPdfText, !inv.pdf_url && styles.btnPdfTextDisabled]}>
                      Télécharger PDF
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>
            );
          })
        )}

      </ScrollView>
    </View>
  );
};
