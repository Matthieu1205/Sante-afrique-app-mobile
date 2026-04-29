import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';

export interface MagazineIssue {
  id: string;
  number: number;
  label: string;
  theme: string;
  free: boolean;
  price: string;
  color: [string, string];
  icon: React.ComponentProps<typeof Feather>['name'];
}

interface MagazineScreenProps {
  onBack?: () => void;
  onSubscribe?: () => void;
  onLogin?: () => void;
  onSettings?: () => void;
  onAbout?: () => void;
  onIssuePress?: (issue: MagazineIssue) => void;
}

const { width: W } = Dimensions.get('window');
const DRAWER_W = W * 0.72;
const CARD_W = (W - Spacing['4'] * 2 - Spacing['3']) / 2;

export const ISSUES: MagazineIssue[] = [
  { id: '1',  number: 12, label: 'N°12 – Avril 2025',    theme: 'Paludisme : l\'offensive finale',            free: true,  price: '1 250 FCFA', color: ['#1B9DD9', '#0A5F85'], icon: 'alert-triangle' },
  { id: '2',  number: 11, label: 'N°11 – Mars 2025',     theme: 'Santé mentale : briser le tabou',            free: false, price: '1 250 FCFA', color: ['#7C3AED', '#4C1D95'], icon: 'activity'       },
  { id: '3',  number: 10, label: 'N°10 – Février 2025',  theme: 'Nutrition : la révolution verte',            free: false, price: '1 250 FCFA', color: ['#22B05B', '#14532D'], icon: 'droplet'        },
  { id: '4',  number: 9,  label: 'N°9 – Janvier 2025',   theme: 'IA & Santé : demain se soigne aujourd\'hui', free: false, price: '1 250 FCFA', color: ['#F59E0B', '#92400E'], icon: 'cpu'            },
  { id: '5',  number: 8,  label: 'N°8 – Déc. 2024',      theme: 'Maternité en Afrique : enjeux 2025',         free: false, price: '1 250 FCFA', color: ['#EF4444', '#7F1D1D'], icon: 'heart'          },
  { id: '6',  number: 7,  label: 'N°7 – Nov. 2024',      theme: 'Vaccination : 70% de couverture',            free: false, price: '1 250 FCFA', color: ['#0891B2', '#164E63'], icon: 'thermometer'    },
  { id: '7',  number: 6,  label: 'N°6 – Oct. 2024',      theme: 'One Health : l\'Afrique en première ligne',  free: false, price: '1 250 FCFA', color: ['#059669', '#064E3B'], icon: 'feather'        },
  { id: '8',  number: 5,  label: 'N°5 – Sept. 2024',     theme: 'Business Santé : 30 milliards USD',          free: false, price: '1 250 FCFA', color: ['#6366F1', '#3730A3'], icon: 'briefcase'      },
];

// ─── Couverture magazine ──────────────────────────────────────────

export const IssueCover: React.FC<{
  issue: MagazineIssue;
  width: number;
  height: number;
  showLock?: boolean;
}> = ({ issue, width, height, showLock = true }) => (
  <LinearGradient
    colors={issue.color}
    style={[cvr.wrap, { width, height }]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    {showLock && !issue.free && (
      <View style={cvr.lock}><Feather name="lock" size={14} color={Colors.white} /></View>
    )}
    <View style={cvr.numBadge}>
      <Text style={cvr.numText}>N°{issue.number}</Text>
    </View>
    <Feather name={issue.icon} size={44} color="rgba(255,255,255,0.85)" />
    <View style={cvr.logoWrap}>
      <Text style={cvr.logo}>santé <Text style={cvr.logoW}>afrique</Text></Text>
    </View>
  </LinearGradient>
);

const cvr = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', borderRadius: Radius.sm, overflow: 'hidden' },
  lock: { position: 'absolute', top: 8, right: 8 },
  numBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  numText: { fontFamily: FontFamily.bodyBold, fontSize: 10, color: Colors.white },
  logoWrap: { position: 'absolute', bottom: 8 },
  logo: { fontFamily: FontFamily.logo, fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  logoW: { color: Colors.white },
});

// ─── Carte grille ─────────────────────────────────────────────────

const IssueCard: React.FC<{ issue: MagazineIssue; onPress: () => void }> = ({ issue, onPress }) => (
  <TouchableOpacity style={[gc.card, { width: CARD_W }]} onPress={onPress} activeOpacity={0.85}>
    <IssueCover issue={issue} width={CARD_W} height={CARD_W * 1.38} />
    <View style={gc.info}>
      <Text style={gc.label}>{issue.label}</Text>
      <Text style={gc.theme} numberOfLines={2}>{issue.theme}</Text>
    </View>
  </TouchableOpacity>
);

const gc = StyleSheet.create({
  card: { backgroundColor: Colors.backgroundCard, borderRadius: Radius.md, overflow: 'hidden', ...Shadows.card },
  info: { padding: Spacing['2'], gap: 3 },
  label: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.textMuted },
  theme: { fontFamily: FontFamily.headingBold, fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 17 },
});

// ─── Drawer menu ──────────────────────────────────────────────────

const DRAWER_ITEMS: { icon: React.ComponentProps<typeof Feather>['name']; label: string; key: string }[] = [
  { icon: 'user',        label: 'Mon compte',                   key: 'account' },
  { icon: 'settings',   label: 'Configuration',                key: 'settings' },
  { icon: 'info',       label: 'À propos',                     key: 'about' },
  { icon: 'file-text',  label: 'Mentions légales',             key: 'legal' },
  { icon: 'lock',       label: 'Politique de confidentialité', key: 'privacy' },
  { icon: 'check-square', label: 'Consentements',              key: 'consent' },
];

const DrawerMenu: React.FC<{
  visible: boolean;
  onClose: () => void;
  onBack?: () => void;
  onAccount?: () => void;
  onSettings?: () => void;
  onAbout?: () => void;
}> = ({ visible, onClose, onBack, onAccount, onSettings, onAbout }) => {
  const insets = useSafeAreaInsets();
  const slideX = useRef(new Animated.Value(-DRAWER_W)).current;

  React.useEffect(() => {
    Animated.timing(slideX, {
      toValue: visible ? 0 : -DRAWER_W,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleItem = (key: string) => {
    onClose();
    if (key === 'account') onAccount?.();
    if (key === 'settings') onSettings?.();
    if (key === 'about') onAbout?.();
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <View style={dr.overlay}>
        {/* Fond sombre cliquable */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={dr.backdrop} />
        </TouchableWithoutFeedback>

        {/* Drawer */}
        <Animated.View style={[dr.drawer, { paddingTop: insets.top, transform: [{ translateX: slideX }] }]}>

          {/* Bouton retour en haut */}
          <TouchableOpacity style={dr.backRow} onPress={() => { onClose(); onBack?.(); }}>
            <Feather name="arrow-left" size={22} color={Colors.white} />
            <Text style={dr.backLabel}>Retour</Text>
          </TouchableOpacity>

          <View style={dr.divider} />

          {/* Items */}
          {DRAWER_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={dr.item}
              onPress={() => handleItem(item.key)}
              activeOpacity={0.75}
            >
              <Feather name={item.icon} size={20} color={Colors.white} />
              <Text style={dr.itemLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
};

const dr = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_W,
    backgroundColor: Colors.primary,
    paddingTop: 20,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['5'],
    paddingVertical: Spacing['4'],
    gap: Spacing['3'],
  },
  backArrow: { fontSize: 22, color: Colors.white },
  backLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: Colors.white },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: Spacing['5'], marginBottom: Spacing['2'] },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['5'],
    paddingVertical: Spacing['4'],
    gap: Spacing['4'],
  },
  itemIcon: { fontSize: 22, width: 28, textAlign: 'center' },
  itemLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.lg, color: Colors.white },
});

// ─── Écran principal ──────────────────────────────────────────────

type TabKey = 'kiosk' | 'mine';

export const MagazineScreen: React.FC<MagazineScreenProps> = ({
  onBack,
  onSubscribe,
  onLogin,
  onSettings,
  onAbout,
  onIssuePress,
}) => {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('kiosk');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const latest = ISSUES[0];
  const archives = ISSUES.slice(1);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Drawer */}
      <DrawerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onBack={onBack}
        onAccount={onLogin}
        onSettings={onSettings}
        onAbout={onAbout}
      />

      {/* Header bleu */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}
      >
        {/* Bouton hamburger */}
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setDrawerOpen(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="menu" size={24} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          santé <Text style={styles.headerTitleW}>afrique</Text>
        </Text>

        <View style={{ width: 40 }} />
      </LinearGradient>

      {tab === 'kiosk' ? (
        <FlatList
          data={archives}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <IssueCard issue={item} onPress={() => onIssuePress?.(item)} />
          )}
          ListHeaderComponent={
            <>
              {/* Hero */}
              <TouchableOpacity
                style={styles.hero}
                onPress={() => onIssuePress?.(latest)}
                activeOpacity={0.9}
              >
                <IssueCover
                  issue={latest}
                  width={W - Spacing['4'] * 2}
                  height={(W - Spacing['4'] * 2) * 0.55}
                  showLock={false}
                />
                <Text style={styles.heroLabel}>{latest.label}</Text>
              </TouchableOpacity>
              <Text style={styles.archiveTitle}>Numéros précédents</Text>
            </>
          }
        />
      ) : (
        <View style={styles.emptyMine}>
          <Feather name="book-open" size={52} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Aucune édition téléchargée</Text>
          <Text style={styles.emptySub}>Abonnez-vous pour accéder à toutes les éditions.</Text>
          <TouchableOpacity style={styles.subBtn} onPress={onSubscribe} activeOpacity={0.85}>
            <Text style={styles.subBtnText}>S'abonner</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom tab bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity style={styles.bottomTab} onPress={() => setTab('kiosk')}>
          <Feather name="book-open" size={22} color={tab === 'kiosk' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.bottomTabLabel, tab === 'kiosk' && styles.bottomTabLabelActive]}>
            Kiosque
          </Text>
          {tab === 'kiosk' && <View style={styles.bottomTabDot} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomTab} onPress={() => setTab('mine')}>
          <Feather name="download" size={22} color={tab === 'mine' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.bottomTabLabel, tab === 'mine' && styles.bottomTabLabelActive]}>
            Mes éditions
          </Text>
          {tab === 'mine' && <View style={styles.bottomTabDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['3'],
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 28,
    color: Colors.white,
    lineHeight: 32,
    fontWeight: '300',
  },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.logo,
    fontSize: FontSize.xl,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headerTitleW: { color: Colors.white },

  list: { paddingBottom: 80 },
  row: { paddingHorizontal: Spacing['4'], gap: Spacing['3'], marginBottom: Spacing['3'] },

  hero: {
    marginHorizontal: Spacing['4'],
    marginTop: Spacing['4'],
    marginBottom: Spacing['2'],
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadows.card,
  },
  heroLabel: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingVertical: Spacing['2'],
    backgroundColor: Colors.backgroundCard,
  },

  archiveTitle: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['4'],
    paddingBottom: Spacing['3'],
  },

  emptyMine: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['3'],
    paddingHorizontal: Spacing['8'],
    paddingBottom: 80,
  },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: Colors.textPrimary, textAlign: 'center' },
  emptySub: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  subBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing['6'],
    paddingVertical: Spacing['3'],
    marginTop: Spacing['2'],
  },
  subBtnText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: Colors.white },

  bottomBar: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
    elevation: 8,
  },
  bottomTab: { flex: 1, alignItems: 'center', gap: 3 },
  bottomTabIcon: { fontSize: 22 },
  bottomTabLabel: { fontFamily: FontFamily.body, fontSize: 10, color: Colors.textMuted },
  bottomTabLabelActive: { fontFamily: FontFamily.bodySemiBold, color: Colors.primary },
  bottomTabDot: {
    position: 'absolute',
    top: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});
