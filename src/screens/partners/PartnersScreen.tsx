import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Linking, ActivityIndicator,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Asset } from 'expo-asset';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';
import { fetchPartners } from '@/services/api';

const KIT_PDF = require('../../assets/MbJv5u8JpG6MGak14NHFYhKLsJW0OIveLzuBDLKr.pdf') as number;

const WHATSAPP_URL = 'https://wa.me/2250714565076?text=Bonjour%2C%20je%20souhaite%20discuter%20d%27un%20partenariat%20avec%20Sant%C3%A9%20Afrique.';
const WHATSAPP_GREEN = '#25D366';

const VALUE_CARDS = [
  {
    title: 'Audience ciblée santé',
    desc: 'Professionnels de santé, décideurs, et grand public qualifié.',
  },
  {
    title: 'Formats & brand content',
    desc: 'Print, digital, vidéo, native ads, dossiers spéciaux.',
  },
  {
    title: 'Accompagnement',
    desc: 'Conseil éditorial, production créative et mesure d\'impact.',
  },
];

const PARTNERS_FALLBACK = [
  'Ministère Santé CI', 'MEPS', 'AIRP', 'ONP-CI',
  'Ordre Med. CI', 'PNSM', 'CNPTIR', 'IMENA',
  'CNRAO', 'CNTS-CI', 'UNPPCI', 'Labo Montagnier',
  'CAMU', 'oumed', 'UFR SPB', 'ONCDCI',
  'ONE-CI', 'PSPCI', 'CNAM', 'INSP', 'Laboratoires A',
];

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },

  // Hero
  heroGradient: { paddingHorizontal: Spacing['5'], paddingBottom: Spacing['6'] },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing['4'],
  },
  heroTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 26,
    color: '#FFFFFF',
    lineHeight: 34,
    marginBottom: Spacing['2'],
  },
  heroSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 22,
    marginBottom: Spacing['5'],
  },
  whatsappBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
    backgroundColor: WHATSAPP_GREEN,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing['4'],
    paddingVertical: 11,
  },
  whatsappBtnText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: '#FFFFFF' },

  // Value cards
  valueSection: { paddingHorizontal: Spacing['4'], paddingTop: Spacing['5'], gap: Spacing['3'] },
  valueCard: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: Spacing['4'],
    ...Shadows.card,
  },
  valueTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.sm,
    color: C.textPrimary,
    marginBottom: 4,
  },
  valueDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    lineHeight: 20,
  },

  // Documents section
  docsSection: { paddingHorizontal: Spacing['4'], paddingTop: Spacing['5'] },
  sectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: C.textPrimary,
    marginBottom: Spacing['3'],
  },
  pdfCard: {
    width: 180,
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.borderLight,
    overflow: 'hidden',
    ...Shadows.card,
  },
  pdfPreview: {
    height: 120,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#374151',
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pdfBadgeText: { fontFamily: FontFamily.bodyBold, fontSize: 9, color: '#FFFFFF' },
  pdfLogoText: {
    fontFamily: FontFamily.headingBold,
    fontSize: 12,
    color: '#1B9DD9',
    textAlign: 'center',
  },
  pdfLogoSub: {
    fontFamily: FontFamily.body,
    fontSize: 9,
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
  },
  pdfTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: '#1B9DD9',
    padding: Spacing['2'],
  },

  // Partners section
  partnersSection: { paddingHorizontal: Spacing['4'], paddingTop: Spacing['5'] },
  partnersGrid: {
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
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing['2'],
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  partnerName: {
    fontFamily: FontFamily.body,
    fontSize: 9,
    color: C.textSecondary,
    textAlign: 'center',
  },

  // Bottom CTA bar
  ctaBar: {
    marginTop: Spacing['5'],
    marginHorizontal: Spacing['4'],
    marginBottom: Spacing['4'],
    backgroundColor: '#1C1C1E',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
  },
  ctaLeft: { flex: 1 },
  ctaLabel: {
    fontFamily: FontFamily.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  ctaText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: WHATSAPP_GREEN,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing['4'],
    paddingVertical: 12,
  },
  ctaBtnText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm, color: '#FFFFFF' },
});

interface Props { onBack?: () => void; onJobsPress?: () => void; onKitMediaPress?: () => void; }

export const PartnersScreen: React.FC<Props> = ({ onBack }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [partners, setPartners] = useState<string[]>(PARTNERS_FALLBACK);

  useEffect(() => {
    fetchPartners().then((data) => { if (data.length > 0) setPartners(data); });
  }, []);

  const openKitMedia = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      const asset = Asset.fromModule(KIT_PDF);
      await asset.downloadAsync();
      const uri = asset.localUri!;

      if (Platform.OS === 'android') {
        try {
          // expo-file-system v19 stubs legacy methods in the main export;
          // the legacy subpath still has the real getContentUriAsync backed by native.
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const legacyFS = require('expo-file-system/src/legacy') as {
            getContentUriAsync: (u: string) => Promise<string>;
          };
          const contentUri = await legacyFS.getContentUriAsync(uri);
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1,
            type: 'application/pdf',
          });
          return;
        } catch (intentErr) {
          console.warn('Intent launcher failed, fallback to sharing', intentErr);
        }
      }

      // iOS — or Android fallback
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf',
          dialogTitle: 'Ouvrir le Kit Média',
        });
      }
    } catch (e) {
      console.warn('PDF open error', e);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C1C1E" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom }}>

        {/* ── Hero ── */}
        <LinearGradient
          colors={['#2C3E50', '#1C1C1E']}
          style={[styles.heroGradient, { paddingTop: insets.top + Spacing['4'] }]}
        >
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Feather name="arrow-left" size={18} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.heroTitle}>Espace partenaires</Text>
          <Text style={styles.heroSub}>
            Des audiences qualifiées, des formats premium, un média de confiance.
          </Text>

          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() => Linking.openURL(WHATSAPP_URL)}
            activeOpacity={0.85}
          >
            <Feather name="message-circle" size={16} color="#fff" />
            <Text style={styles.whatsappBtnText}>Discuter sur WhatsApp</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── 3 value cards ── */}
        <View style={styles.valueSection}>
          {VALUE_CARDS.map((card) => (
            <View key={card.title} style={styles.valueCard}>
              <Text style={styles.valueTitle}>{card.title}</Text>
              <Text style={styles.valueDesc}>{card.desc}</Text>
            </View>
          ))}
        </View>

        {/* ── Documents à télécharger ── */}
        <View style={styles.docsSection}>
          <Text style={styles.sectionTitle}>Documents à télécharger</Text>
          <TouchableOpacity
            style={styles.pdfCard}
            onPress={openKitMedia}
            activeOpacity={0.85}
            disabled={pdfLoading}
          >
            <View style={styles.pdfPreview}>
              <View style={styles.pdfBadge}>
                <Text style={styles.pdfBadgeText}>PDF</Text>
              </View>
              <Text style={styles.pdfLogoText}>santé afrique</Text>
              <Text style={styles.pdfLogoSub}>Kit Media{'\n'}2024-2025</Text>
            </View>
            {pdfLoading
              ? <ActivityIndicator size="small" color="#1B9DD9" style={{ padding: Spacing['2'] }} />
              : <Text style={styles.pdfTitle}>KIT MEDIA 2025_2026</Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── Ils nous font confiance ── */}
        <View style={styles.partnersSection}>
          <Text style={styles.sectionTitle}>Ils nous font confiance</Text>
          <View style={styles.partnersGrid}>
            {partners.map((name) => (
              <View key={name} style={styles.partnerChip}>
                <Text style={styles.partnerName}>{name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Bottom CTA bar ── */}
        <View style={styles.ctaBar}>
          <View style={styles.ctaLeft}>
            <Text style={styles.ctaLabel}>Prêt à nous rejoindre ?</Text>
            <Text style={styles.ctaText}>Nous co-construisons un plan média rentable et mesurable.</Text>
          </View>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => Linking.openURL(WHATSAPP_URL)}
            activeOpacity={0.85}
          >
            <Feather name="message-circle" size={14} color="#fff" />
            <Text style={styles.ctaBtnText}>Parler sur WhatsApp</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};
