import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { AppHeader } from '@/components/common';
import type { Category } from '@/components/common';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '@/theme';

// ─── Types ────────────────────────────────────────────────────────

interface MenuScreenProps {
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onSubscribe?: () => void;
  onCategoryPress?: (category: Category, title: string) => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onMagazinePress?: () => void;
  onJobsPress?: () => void;
  onPartnersPress?: () => void;
  onSettingsPress?: () => void;
  onFavoritesPress?: () => void;
  onHistoryPress?: () => void;
  onAboutPress?: () => void;
}

// ─── Données ──────────────────────────────────────────────────────

const SHORTCUTS: { id: string; icon: React.ComponentProps<typeof Feather>['name']; label: string }[] = [
  { id: 'login',    icon: 'user',      label: 'Se connecter' },
  { id: 'prefs',   icon: 'settings',  label: 'Préférences'  },
  { id: 'alerts',  icon: 'bell',      label: 'Alertes'       },
  { id: 'magazine',icon: 'book-open', label: 'Magazine'      },
];

const CATEGORIES: { value: Category; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { value: 'actualites',         label: 'Actualités',          icon: 'file-text'   },
  { value: 'conseils_pratiques', label: 'Conseils Pratiques',  icon: 'zap'         },
  { value: 'dossier',            label: 'Dossiers',            icon: 'clipboard'   },
  { value: 'equite_acces',       label: 'Équité & Accès',      icon: 'sliders'     },
  { value: 'les_odd',            label: 'Les ODD',             icon: 'globe'       },
  { value: 'business_sante',     label: 'Business Santé',      icon: 'briefcase'   },
  { value: 'sante_mentale',      label: 'Santé Mentale',       icon: 'activity'    },
  { value: 'one_health',         label: 'One Health',          icon: 'feather'     },
  { value: 'nutrition_infantile',label: 'Nutrition Infantile', icon: 'droplet'     },
  { value: 'sante_maternelle',   label: 'Santé Maternelle',    icon: 'heart'       },
  { value: 'vaccination',        label: 'Vaccination',         icon: 'thermometer' },
];

// ─── Sous-composants ──────────────────────────────────────────────

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <Text style={sectionStyle.title}>{title}</Text>
);

const sectionStyle = StyleSheet.create({
  title: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['5'],
    paddingBottom: Spacing['2'],
  },
});

const MenuRow: React.FC<{
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  sublabel?: string;
  onPress?: () => void;
  chevron?: boolean;
  badge?: string;
}> = ({ icon, label, sublabel, onPress, chevron = true, badge }) => (
  <TouchableOpacity
    style={rowStyle.row}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={rowStyle.iconWrapper}>
      <Feather name={icon} size={18} color={Colors.textSecondary} />
    </View>
    <View style={rowStyle.textBlock}>
      <Text style={rowStyle.label}>{label}</Text>
      {sublabel && <Text style={rowStyle.sublabel}>{sublabel}</Text>}
    </View>
    <View style={rowStyle.right}>
      {badge && (
        <View style={rowStyle.badge}>
          <Text style={rowStyle.badgeText}>{badge}</Text>
        </View>
      )}
      {chevron && <Feather name="chevron-right" size={18} color={Colors.textDisabled} />}
    </View>
  </TouchableOpacity>
);

const rowStyle = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing['3'],
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1, gap: 2 },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  sublabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textDisabled,
    lineHeight: 22,
  },
});

// ─── Écran principal ──────────────────────────────────────────────

export const MenuScreen: React.FC<MenuScreenProps> = ({
  isLoggedIn = false,
  onLogin,
  onSubscribe,
  onCategoryPress,
  onSearchPress,
  onNotificationPress,
  onMagazinePress,
  onJobsPress,
  onPartnersPress,
  onSettingsPress,
  onFavoritesPress,
  onHistoryPress,
  onAboutPress,
}) => (
  <View style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundCard} />
    <AppHeader
      onSearchPress={onSearchPress}
      onNotificationPress={onNotificationPress}
      notificationCount={3}
    />

    <ScrollView showsVerticalScrollIndicator={false}>

      {/* 4 Raccourcis (pattern Jeune Afrique) */}
      <View style={styles.shortcuts}>
        {SHORTCUTS.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={styles.shortcutBtn}
            onPress={
              s.id === 'login' ? onLogin
              : s.id === 'magazine' ? onMagazinePress
              : s.id === 'alerts' ? onNotificationPress
              : onSettingsPress
            }
            activeOpacity={0.75}
          >
            <View style={styles.shortcutIcon}>
              <Feather name={s.icon} size={22} color={Colors.textSecondary} />
            </View>
            <Text style={styles.shortcutLabel}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA abonnement (si non connecté) */}
      {!isLoggedIn && (
        <TouchableOpacity style={styles.subscribeBanner} onPress={onSubscribe} activeOpacity={0.85}>
          <View style={styles.subscribeBannerText}>
            <Text style={styles.subscribeBannerTitle}>Accès illimité</Text>
            <Text style={styles.subscribeBannerSub}>
              À partir de 1 250 FCFA/mois
            </Text>
          </View>
          <View style={styles.subscribeBannerCta}>
            <Text style={styles.subscribeBannerCtaText}>S'abonner</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Rubriques */}
      <SectionTitle title="Rubriques" />
      <View style={styles.menuGroup}>
        {CATEGORIES.map((cat) => (
          <MenuRow
            key={cat.value}
            icon={cat.icon}
            label={cat.label}
            onPress={() => onCategoryPress?.(cat.value, cat.label)}
          />
        ))}
      </View>

      {/* Votre compte */}
      <SectionTitle title="Votre compte" />
      <View style={styles.menuGroup}>
        {isLoggedIn ? (
          <>
            <MenuRow icon="star" label="Mon abonnement" sublabel="Numérique Annuel · 15 000 FCFA/an" onPress={onSubscribe} />
            <MenuRow icon="bookmark" label="Mes favoris" onPress={onFavoritesPress} />
            <MenuRow icon="clock" label="Historique de lecture" onPress={onHistoryPress} />
          </>
        ) : (
          <>
            <MenuRow icon="user" label="Se connecter" onPress={onLogin} />
            <MenuRow icon="star" label="S'abonner" sublabel="À partir de 1 250 FCFA/mois" onPress={onSubscribe} badge="Nouveau" />
          </>
        )}
      </View>

      {/* Plus */}
      <SectionTitle title="Plus" />
      <View style={styles.menuGroup}>
        <MenuRow icon="briefcase" label="Offres d'emploi" sublabel="Secteur santé en Afrique" onPress={onJobsPress} />
        <MenuRow icon="users" label="Espace Partenaires" sublabel="Solutions B2B pour la santé" onPress={onPartnersPress} />
        <MenuRow icon="settings" label="Paramètres" sublabel="Pays, thème, notifications" onPress={onSettingsPress} />
        <MenuRow icon="info" label="À propos" onPress={onAboutPress} />
      </View>

      {/* Contact */}
      <View style={styles.contact}>
        <Text style={styles.contactTitle}>Service client</Text>
        <View style={styles.contactRow}>
          <Feather name="mail" size={14} color={Colors.textMuted} />
          <Text style={styles.contactLine}>infos@santeafrique.net</Text>
        </View>
        <View style={styles.contactRow}>
          <Feather name="phone" size={14} color={Colors.textMuted} />
          <Text style={styles.contactLine}>+225 07 14 56 50 76</Text>
        </View>
        <Text style={styles.contactHours}>Lun–Ven · 9h–18h (GMT)</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLogo}>santé <Text style={styles.footerLogoBlue}>afrique</Text></Text>
        <Text style={styles.footerVersion}>v1.0.0 · santeafrique.net</Text>
      </View>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Raccourcis
  shortcuts: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingVertical: Spacing['4'],
    paddingHorizontal: Spacing['4'],
  },
  shortcutBtn: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing['2'],
  },
  shortcutIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutEmoji: { fontSize: 22 },
  shortcutLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Bannière abonnement
  subscribeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryUltraLight,
    marginHorizontal: Spacing['4'],
    marginTop: Spacing['4'],
    borderRadius: Radius.md,
    padding: Spacing['4'],
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  subscribeBannerText: { flex: 1 },
  subscribeBannerTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: Colors.primaryDark,
  },
  subscribeBannerSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  subscribeBannerCta: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
  },
  subscribeBannerCtaText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },

  // Groupes de menu
  menuGroup: {
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },

  // Contact
  contact: {
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['5'],
    paddingBottom: Spacing['4'],
    gap: Spacing['1'],
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
  },
  contactTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing['1'],
  },
  contactLine: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  contactHours: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing['1'],
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing['5'],
    gap: Spacing['1'],
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: Spacing['3'],
  },
  footerLogo: {
    fontFamily: FontFamily.logo,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  footerLogoBlue: {
    color: Colors.primary,
  },
  footerVersion: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.textDisabled,
  },
});
