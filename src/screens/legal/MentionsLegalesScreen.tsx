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
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';

interface MentionsLegalesScreenProps {
  onBack?: () => void;
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
    borderLeftColor: C.primary,
    paddingLeft: Spacing['3'],
    marginBottom: Spacing['4'],
    marginTop: Spacing['2'],
  },
  pageTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize['2xl'],
    color: C.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textMuted,
  },

  section: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: Spacing['4'],
    marginBottom: Spacing['3'],
  },
  sectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: C.textPrimary,
    marginBottom: Spacing['3'],
  },
  paragraph: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing['2'],
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: C.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: Spacing['2'],
    gap: Spacing['2'],
  },
  infoLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: C.textPrimary,
    minWidth: 110,
  },
  infoValue: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: C.borderLight,
    marginVertical: Spacing['3'],
  },
  updateNote: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: Spacing['4'],
  },
});

const InfoRow: React.FC<{ label: string; value: string; C: ThemeColors }> = ({ label, value, C }) => {
  const s = makeStyles(C);
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
};

export const MentionsLegalesScreen: React.FC<MentionsLegalesScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

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
        <Text style={styles.headerTitle}>Mentions légales</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <View style={styles.sectionHead}>
          <Text style={styles.pageTitle}>Mentions légales</Text>
          <Text style={styles.pageSubtitle}>Application mobile Santé Afrique</Text>
        </View>

        {/* Éditeur */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Éditeur de l'application</Text>
          <InfoRow label="Raison sociale" value="Santé Afrique" C={colors} />
          <InfoRow label="Forme juridique" value="Société par actions simplifiée (SAS)" C={colors} />
          <InfoRow label="Siège social" value="Abidjan, Côte d'Ivoire" C={colors} />
          <InfoRow label="Email" value="infos@santeafrique.net" C={colors} />
          <InfoRow label="Téléphone" value="+225 07 14 56 50 76" C={colors} />
          <InfoRow label="Directeur de publication" value="Direction Santé Afrique" C={colors} />
        </View>

        {/* Hébergement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hébergement</Text>
          <Text style={styles.paragraph}>
            Le site web santeafrique.net et les données associées à cette application sont hébergés
            par un prestataire d'hébergement professionnel. Pour toute demande relative à l'hébergement,
            vous pouvez nous contacter à l'adresse infos@santeafrique.net.
          </Text>
        </View>

        {/* Propriété intellectuelle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Propriété intellectuelle</Text>
          <Text style={styles.paragraph}>
            L'ensemble des contenus présents sur cette application (textes, images, graphismes,
            logotype, icônes, etc.) sont la propriété exclusive de Santé Afrique ou de ses partenaires,
            sauf mention contraire explicite.
          </Text>
          <Text style={styles.paragraph}>
            Toute reproduction, distribution, modification, adaptation, retransmission ou publication
            de ces éléments est strictement interdite sans l'accord écrit préalable de Santé Afrique.
          </Text>
        </View>

        {/* Données personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données personnelles</Text>
          <Text style={styles.paragraph}>
            Santé Afrique collecte et traite vos données personnelles (nom, adresse email, données
            de connexion) dans le cadre de la fourniture de ses services d'abonnement au magazine
            numérique.
          </Text>
          <Text style={styles.paragraph}>
            Conformément aux lois applicables en matière de protection des données personnelles,
            vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition
            au traitement de vos données.
          </Text>
          <Text style={styles.paragraph}>
            Pour exercer ces droits ou pour toute question relative à vos données personnelles,
            contactez-nous à : <Text style={styles.label}>infos@santeafrique.net</Text>
          </Text>
        </View>

        {/* Cookies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cookies et données de session</Text>
          <Text style={styles.paragraph}>
            L'application utilise un stockage local sécurisé (AsyncStorage) pour conserver votre
            session de connexion et vos préférences (favoris, historique de lecture, thème).
          </Text>
          <Text style={styles.paragraph}>
            Ces données restent sur votre appareil et ne sont pas partagées avec des tiers.
            Vous pouvez les supprimer à tout moment depuis les Paramètres de l'application.
          </Text>
        </View>

        {/* Responsabilité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limitation de responsabilité</Text>
          <Text style={styles.paragraph}>
            Les informations publiées dans le magazine Santé Afrique sont fournies à titre informatif
            et ne constituent en aucun cas un avis médical professionnel. Consultez un professionnel
            de santé pour tout problème de santé.
          </Text>
          <Text style={styles.paragraph}>
            Santé Afrique s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées
            mais ne peut être tenue responsable des erreurs ou omissions, ni de l'utilisation qui en
            est faite par les utilisateurs.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.infoRow}>
            <Feather name="mail" size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
            <Text style={styles.infoValue}>infos@santeafrique.net</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="phone" size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
            <Text style={styles.infoValue}>+225 07 14 56 50 76 — Lun–Ven · 9h–18h (GMT)</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="globe" size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
            <Text style={styles.infoValue}>santeafrique.net</Text>
          </View>
        </View>

        <Text style={styles.updateNote}>Dernière mise à jour : Juin 2025</Text>

      </ScrollView>
    </View>
  );
};
