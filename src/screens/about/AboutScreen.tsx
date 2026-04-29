import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';

interface AboutScreenProps {
  onBack?: () => void;
}

const TEAM: { role: string; name: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { role: 'Rédactrice en chef',  name: 'Dr. Aminata Koné',    icon: 'user'    },
  { role: 'Directeur editorial', name: 'Jean-Claude Diabaté', icon: 'user'    },
  { role: 'Développement',       name: 'Équipe Tech Abidjan', icon: 'monitor' },
];

const LINKS: { label: string; icon: React.ComponentProps<typeof Feather>['name']; url: string }[] = [
  { label: 'Mentions légales',             icon: 'file-text', url: 'https://santeafrique.net/mentions-legales' },
  { label: 'Politique de confidentialité', icon: 'lock',      url: 'https://santeafrique.net/confidentialite' },
  { label: "Conditions d'utilisation",     icon: 'clipboard', url: 'https://santeafrique.net/conditions' },
  { label: 'Charte éditoriale',            icon: 'edit-3',    url: 'https://santeafrique.net/charte' },
];

const SOCIALS: { label: string; icon: React.ComponentProps<typeof Feather>['name']; url: string }[] = [
  { label: 'Facebook',  icon: 'facebook', url: 'https://facebook.com/santeafrique' },
  { label: 'Twitter/X', icon: 'twitter',  url: 'https://twitter.com/santeafrique' },
  { label: 'LinkedIn',  icon: 'linkedin', url: 'https://linkedin.com/company/santeafrique' },
  { label: 'YouTube',   icon: 'youtube',  url: 'https://youtube.com/@santeafrique' },
];

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();

  const openUrl = (url: string) => Linking.openURL(url).catch(() => null);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundCard} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>À propos</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Hero logo */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroLogo}>
            santé <Text style={styles.heroLogoWhite}>afrique</Text>
          </Text>
          <Text style={styles.heroTagline}>L'information santé de référence{'\n'}en Afrique subsaharienne</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Version 1.0.0</Text>
          </View>
        </LinearGradient>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notre mission</Text>
          <Text style={styles.body}>
            Santé Afrique est le premier média numérique dédié à la santé en Afrique de l'Ouest et
            du Centre. Notre mission : rendre l'information médicale fiable, accessible et utile
            aux professionnels de santé, décideurs et citoyens africains.
          </Text>
          <Text style={[styles.body, { marginTop: Spacing['3'] }]}>
            Fondé à Abidjan en 2022, nous couvrons l'actualité santé dans 9 pays : Côte d'Ivoire,
            Sénégal, Cameroun, Mali, Burkina Faso, Guinée, Togo, Bénin et Niger.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { value: '9', label: 'Pays couverts' },
            { value: '50K+', label: 'Lecteurs / mois' },
            { value: '1 200+', label: 'Articles publiés' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Équipe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>L'équipe</Text>
          {TEAM.map((m) => (
            <View key={m.name} style={styles.teamRow}>
              <View style={styles.teamIconWrap}>
                <Feather name={m.icon} size={20} color={Colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.teamName}>{m.name}</Text>
                <Text style={styles.teamRole}>{m.role}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Réseaux sociaux */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suivez-nous</Text>
          <View style={styles.socialsRow}>
            {SOCIALS.map((s) => (
              <TouchableOpacity
                key={s.label}
                style={styles.socialBtn}
                onPress={() => openUrl(s.url)}
                activeOpacity={0.75}
              >
                <Feather name={s.icon} size={18} color={Colors.textSecondary} />
                <Text style={styles.socialLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.contactBlock}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <TouchableOpacity style={styles.contactRow} onPress={() => openUrl('mailto:infos@santeafrique.net')}>
            <Feather name="mail" size={16} color={Colors.primary} />
            <Text style={styles.contactLink}>infos@santeafrique.net</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactRow} onPress={() => openUrl('tel:+2250714565076')}>
            <Feather name="phone" size={16} color={Colors.primary} />
            <Text style={styles.contactLink}>+225 07 14 56 50 76</Text>
          </TouchableOpacity>
          <Text style={styles.contactHours}>Lun–Ven · 9h–18h (GMT)</Text>
        </View>

        {/* Liens légaux */}
        <View style={styles.legalBlock}>
          {LINKS.map((l) => (
            <TouchableOpacity
              key={l.label}
              style={styles.legalRow}
              onPress={() => openUrl(l.url)}
              activeOpacity={0.7}
            >
              <Feather name={l.icon} size={18} color={Colors.textMuted} />
              <Text style={styles.legalLabel}>{l.label}</Text>
              <Feather name="chevron-right" size={18} color={Colors.textDisabled} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Santé Afrique · Abidjan, Côte d'Ivoire</Text>
          <Text style={styles.footerSub}>Tous droits réservés</Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Shadows.header,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 32, marginTop: -2 },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  content: { paddingBottom: 48 },

  hero: {
    margin: Spacing['4'],
    borderRadius: Radius.lg,
    padding: Spacing['5'],
    alignItems: 'center',
    gap: Spacing['2'],
  },
  heroLogo: {
    fontFamily: FontFamily.logo,
    fontSize: 28,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: -0.5,
  },
  heroLogoWhite: { color: Colors.white },
  heroTagline: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing['3'],
    paddingVertical: 4,
    marginTop: Spacing['1'],
  },
  heroBadgeText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.white,
  },

  section: {
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['5'],
    paddingBottom: Spacing['2'],
  },
  sectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing['3'],
  },
  body: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 24,
  },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing['4'],
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing['4'],
    borderRightWidth: 1,
    borderRightColor: Colors.borderLight,
    gap: 4,
  },
  statValue: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize['2xl'],
    color: Colors.primary,
  },
  statLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3'],
    paddingVertical: Spacing['2'],
  },
  teamIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  teamRole: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },

  socialsRow: {
    flexDirection: 'row',
    gap: Spacing['3'],
    flexWrap: 'wrap',
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
  },
  socialEmoji: { fontSize: 18 },
  socialLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  contactBlock: {
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['5'],
    gap: Spacing['2'],
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
  },
  contactLink: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
  contactHours: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },

  legalBlock: {
    marginHorizontal: Spacing['4'],
    marginTop: Spacing['5'],
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing['3'],
  },
  legalIcon: { fontSize: 18 },
  legalLabel: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  legalChevron: { fontSize: 20, color: Colors.textDisabled },

  footer: {
    alignItems: 'center',
    paddingTop: Spacing['6'],
    paddingBottom: Spacing['4'],
    gap: 4,
  },
  footerText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  footerSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.textDisabled,
  },
});
