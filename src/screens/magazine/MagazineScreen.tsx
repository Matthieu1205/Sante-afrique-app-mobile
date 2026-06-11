import { MagazineSkeleton } from "@/components/common";
import type { ThemeColors } from "@/contexts/ThemeContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { ApiMagazineIssue } from "@/services/api";
import { fetchMagazineIssues, clearMagazineCache } from "@/services/api";
import {
  Colors,
  FontFamily,
  FontSize,
  Radius,
  Shadows,
  Spacing,
} from "@/theme";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COVER_COLORS: [string, string][] = [
  ["#1E3A5F", "#0A2540"],
  ["#0A3D2E", "#051F17"],
  ["#4B1D6B", "#2A0E3F"],
  ["#166534", "#052E16"],
  ["#7F1D1D", "#450A0A"],
  ["#1B4D6E", "#0D2B40"],
];

function mapApiIssue(a: ApiMagazineIssue, idx: number): MagazineIssue {
  return {
    id: String(a.id),
    number: a.number,
    label: (a.label ?? a.title ?? `N°${a.number}`),
    theme: (a.theme ?? ''),
    free: a.free,
    price: (a.price ?? ''),
    color: COVER_COLORS[idx % COVER_COLORS.length],
    icon: "book-open",
    coverImage: a.cover_url ? { uri: a.cover_url } : undefined,
    publishedAt: a.date,
  };
}

export interface MagazineIssue {
  id: string;
  number: number;
  label: string;
  theme: string;
  free: boolean;
  price: string;
  color: [string, string];
  icon: React.ComponentProps<typeof Feather>["name"];
  coverImage?: any;
  publishedAt?: string;
}

interface MagazineScreenProps {
  onBack?: () => void;
  onSubscribe?: () => void;
  onLogin?: () => void;
  onProfile?: () => void;
  isLoggedIn?: boolean;
  isSubscribed?: boolean;
  userName?: string;
  onSettings?: () => void;
  onAbout?: () => void;
  onLegal?: () => void;
  onPrivacy?: () => void;
  onConsent?: () => void;
  onIssuePress?: (issue: MagazineIssue) => void;
}

const { width: W } = Dimensions.get("window");
const CARD_W = (W - Spacing["4"] * 2 - Spacing["3"]) / 2;
const HERO_COVER_W = W * 0.62;
const HERO_COVER_H = HERO_COVER_W * 1.38;

export const ISSUES: MagazineIssue[] = [
  {
    id: "21",
    number: 21,
    label: "N°21 • Oct. 2025",
    theme: "#10 ans de transformations : la santé modernisée en Côte d'Ivoire",
    free: true,
    price: "1 250 FCFA",
    color: ["#1E3A5F", "#0A2540"],
    icon: "award",
    coverImage: require("../../assets/covers/cover-21.jpeg"),
  },
  {
    id: "20",
    number: 20,
    label: "N°20 • Juil.–Août 2025",
    theme: "CMU : Santé pour tous, le défi ivoirien",
    free: false,
    price: "1 550 FCFA",
    color: ["#0A3D2E", "#051F17"],
    icon: "users",
    coverImage: require("../../assets/covers/cover-20.jpeg"),
  },
  {
    id: "19",
    number: 19,
    label: "N°19 • Mai–Juin 2025",
    theme: "Comprendre pour agir : décryptage du phénomène toxicomanie",
    free: false,
    price: "1 550 FCFA",
    color: ["#4B1D6B", "#2A0E3F"],
    icon: "alert-circle",
    coverImage: require("../../assets/covers/cover-19.jpeg"),
  },
  {
    id: "18",
    number: 18,
    label: "N°18 • Mars–Avril 2025",
    theme:
      "Approche One Health en Côte d'Ivoire : la vision du Dr Djeneba Ouattara",
    free: false,
    price: "1 550 FCFA",
    color: ["#166534", "#052E16"],
    icon: "feather",
    coverImage: require("../../assets/covers/cover-18.jpeg"),
  },
  {
    id: "17",
    number: 17,
    label: "N°17 • Déc. 2024",
    theme: "Infertilité dans les couples : quelles prises en charge ?",
    free: false,
    price: "1 250 FCFA",
    color: ["#7F1D1D", "#450A0A"],
    icon: "heart",
    coverImage: require("../../assets/covers/cover-17.jpeg"),
  },
];

// ─── Couverture magazine ──────────────────────────────────────────

export const IssueCover: React.FC<{
  issue: MagazineIssue;
  width: number;
  height: number;
}> = ({ issue, width, height }) => {
  if (issue.coverImage) {
    return (
      <View style={[cvr.wrap, { width, height }]}>
        <Image
          source={issue.coverImage}
          style={{ width, height }}
          resizeMode="cover"
        />
      </View>
    );
  }
  return (
    <LinearGradient
      colors={issue.color}
      style={[cvr.wrap, { width, height }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={cvr.numBadge}>
        <Text style={cvr.numText}>N°{issue.number}</Text>
      </View>
      <Feather name={issue.icon} size={44} color="rgba(255,255,255,0.85)" />
      <View style={cvr.logoWrap}>
        <Text style={cvr.logo}>
          santé <Text style={cvr.logoW}>afrique</Text>
        </Text>
      </View>
    </LinearGradient>
  );
};

const cvr = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.sm,
    overflow: "hidden",
  },
  numBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  numText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    color: Colors.white,
  },
  logoWrap: { position: "absolute", bottom: 8 },
  logo: {
    fontFamily: FontFamily.logo,
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
  },
  logoW: { color: Colors.white },
});

// ─── Carte grille ─────────────────────────────────────────────────

const makeGcStyles = (C: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: C.backgroundCard,
      borderRadius: Radius.sm,
      overflow: "hidden",
      ...Shadows.card,
    },
    label: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: C.textMuted,
      paddingHorizontal: Spacing["2"],
      paddingVertical: Spacing["2"],
      textAlign: "center",
    },
  });

const IssueCard: React.FC<{ issue: MagazineIssue; onPress: () => void }> = ({
  issue,
  onPress,
}) => {
  const { colors } = useTheme();
  const gc = makeGcStyles(colors);
  return (
    <TouchableOpacity
      style={[gc.card, { width: CARD_W }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <IssueCover issue={issue} width={CARD_W} height={CARD_W * 1.38} />
      <Text style={gc.label} numberOfLines={1}>
        {issue.label}
      </Text>
    </TouchableOpacity>
  );
};

// ─── Drawer menu ──────────────────────────────────────────────────

const DRAWER_W = W * 0.72;

const DRAWER_ITEMS: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  key: string;
}[] = [
  { icon: "user", label: "Mon compte", key: "account" },
  { icon: "settings", label: "Configuration", key: "settings" },
  { icon: "info", label: "À propos", key: "about" },
  { icon: "file-text", label: "Mentions légales", key: "legal" },
  { icon: "lock", label: "Politique de confidentialité", key: "privacy" },
  { icon: "check-square", label: "Consentements", key: "consent" },
];

const DrawerMenu: React.FC<{
  visible: boolean;
  onClose: () => void;
  onBack?: () => void;
  onAccount?: () => void;
  onSettings?: () => void;
  onAbout?: () => void;
  onLegal?: () => void;
  onPrivacy?: () => void;
  onConsent?: () => void;
  isLoggedIn?: boolean;
  userName?: string;
}> = ({ visible, onClose, onBack, onAccount, onSettings, onAbout, onLegal, onPrivacy, onConsent, isLoggedIn = false, userName }) => {
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
    if (key === "account") onAccount?.();
    if (key === "settings") onSettings?.();
    if (key === "about") onAbout?.();
    if (key === "legal") onLegal?.();
    if (key === "privacy") onPrivacy?.();
    if (key === "consent") onConsent?.();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={dr.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={dr.backdrop} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            dr.drawer,
            { paddingTop: insets.top, transform: [{ translateX: slideX }] },
          ]}
        >
          <TouchableOpacity
            style={dr.backRow}
            onPress={() => {
              onClose();
              onBack?.();
            }}
          >
            <Feather name="arrow-left" size={22} color={Colors.white} />
            <Text style={dr.backLabel}>Retour</Text>
          </TouchableOpacity>
          <View style={dr.divider} />
          {isLoggedIn && userName ? (
            <TouchableOpacity style={dr.userSection} onPress={() => handleItem('account')} activeOpacity={0.8}>
              <View style={dr.avatarCircle}>
                <Text style={dr.avatarInitials}>
                  {userName.trim().split(/\s+/).map((w) => w[0] ?? '').slice(0, 2).join('').toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={dr.userName}>{userName}</Text>
                <Text style={dr.userSub}>Compte connecté</Text>
              </View>
            </TouchableOpacity>
          ) : null}
          {DRAWER_ITEMS.map((item) => {
            const isAccount = item.key === 'account';
            if (isAccount && isLoggedIn) return null;
            return (
              <TouchableOpacity
                key={item.key}
                style={dr.item}
                onPress={() => handleItem(item.key)}
                activeOpacity={0.75}
              >
                <Feather name={item.icon} size={20} color={Colors.white} />
                <Text style={dr.itemLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>
    </Modal>
  );
};

const dr = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_W,
    backgroundColor: Colors.primary,
    paddingTop: 20,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing["5"],
    paddingVertical: Spacing["4"],
    gap: Spacing["3"],
  },
  backLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: Spacing["5"],
    marginBottom: Spacing["2"],
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing["5"],
    paddingVertical: Spacing["4"],
    gap: Spacing["4"],
  },
  itemLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['5'],
    paddingVertical: Spacing['4'],
    gap: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
    marginBottom: Spacing['2'],
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarInitials: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  userName: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  userSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});

// ─── Écran principal ──────────────────────────────────────────────

type TabKey = "kiosk" | "mine";

const makeStyles = (C: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },

    topBar: {
      backgroundColor: C.backgroundCard,
      borderBottomWidth: 1,
      borderBottomColor: C.borderLight,
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing["4"],
      paddingVertical: Spacing["2"],
    },
    menuBtn: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      fontFamily: FontFamily.logo,
      fontSize: FontSize.lg,
      color: C.textPrimary,
    },
    logoW: { color: C.primary },

    // Liste
    list: { paddingBottom: 140 },
    row: {
      paddingHorizontal: Spacing["4"],
      gap: Spacing["3"],
      marginBottom: Spacing["3"],
    },

    // Hero (grande couverture)
    heroSection: {
      backgroundColor: Colors.primary,
      paddingTop: Spacing["2"],
      paddingBottom: Spacing["3"],
      alignItems: "center",
    },
    heroWrap: {
      ...Shadows.card,
      borderRadius: Radius.sm,
      overflow: "hidden",
    },
    heroLabel: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: C.textMuted,
      textAlign: "center",
      marginBottom: Spacing["4"],
      marginTop: Spacing["3"],
    },

    // Section archives
    archiveTitle: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.xs,
      color: C.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      paddingHorizontal: Spacing["4"],
      paddingTop: Spacing["2"],
      paddingBottom: Spacing["3"],
      borderTopWidth: 1,
      borderTopColor: C.borderLight,
      marginTop: Spacing["2"],
    },

    // Onglet Mes éditions
    mineHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing['2'],
      backgroundColor: C.primaryUltraLight,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing['3'],
      paddingVertical: Spacing['3'],
      marginBottom: Spacing['3'],
      borderWidth: 1,
      borderColor: C.primaryLight,
    },
    mineHeaderText: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: C.primaryDark,
      flex: 1,
    },
    emptyMine: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing["3"],
      paddingHorizontal: Spacing["8"],
      paddingBottom: 80,
    },
    emptyTitle: {
      fontFamily: FontFamily.headingBold,
      fontSize: FontSize.lg,
      color: C.textPrimary,
      textAlign: "center",
    },
    emptySub: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      color: C.textMuted,
      textAlign: "center",
      lineHeight: 22,
    },
    subBtn: {
      backgroundColor: C.primary,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing["6"],
      paddingVertical: Spacing["3"],
      marginTop: Spacing["2"],
    },
    subBtnText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.base,
      color: C.white,
    },

    // Barre du bas
    bottomBar: {
      flexDirection: "row",
      backgroundColor: C.backgroundCard,
      borderTopWidth: 1,
      borderTopColor: C.borderLight,
      paddingTop: 2,
      elevation: 8,
    },
    bottomTab: { flex: 1, alignItems: "center", gap: 1 },
    bottomTabLabel: {
      fontFamily: FontFamily.body,
      fontSize: 7,
      color: C.textMuted,
    },
    bottomTabLabelActive: {
      fontFamily: FontFamily.bodySemiBold,
      color: C.primary,
    },
    bottomTabDot: {
      position: "absolute",
      top: -4,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: C.primary,
    },
  });

export const MagazineScreen: React.FC<MagazineScreenProps> = ({
  onBack,
  onSubscribe,
  onLogin,
  onProfile,
  isLoggedIn = false,
  isSubscribed = false,
  userName,
  onSettings,
  onAbout,
  onLegal,
  onPrivacy,
  onConsent,
  onIssuePress,
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [tab, setTab] = useState<TabKey>("kiosk");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [issues, setIssues] = useState<MagazineIssue[]>(ISSUES);
  const [loadingIssues, setLoadingIssues] = useState(true);

  useEffect(() => {
    clearMagazineCache().then(() =>
      fetchMagazineIssues().then((data) => {
        if (data.length > 0) setIssues(data.map(mapApiIssue));
        setLoadingIssues(false);
      })
    );
  }, []);

  const latest = issues[0];
  const archives = issues.slice(1);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.backgroundCard}
      />

      <DrawerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onBack={onBack}
        onAccount={isLoggedIn ? onProfile : onLogin}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onSettings={onSettings}
        onAbout={onAbout}
        onLegal={onLegal}
        onPrivacy={onPrivacy}
        onConsent={onConsent}
      />

      {/* ── En-tête ────────────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        {/* Ligne logo + menu */}
        <View style={styles.menuRow}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setDrawerOpen(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="menu" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.logoText}>
            santé <Text style={styles.logoW}>afrique</Text>
          </Text>

          <View style={{ width: 36 }} />
        </View>
      </View>

      {/* ── Contenu ────────────────────────────────────────────── */}
      {tab === "kiosk" ? (
        loadingIssues ? (
          <MagazineSkeleton />
        ) : (
          <FlatList
            key="grid-2cols"
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
                {/* Section hero fond bleu */}
                <View style={styles.heroSection}>
                  <TouchableOpacity
                    onPress={() => onIssuePress?.(latest)}
                    activeOpacity={0.9}
                    style={styles.heroWrap}
                  >
                    <IssueCover
                      issue={latest}
                      width={HERO_COVER_W}
                      height={HERO_COVER_H}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.heroLabel}>{latest.label}</Text>

                <Text style={styles.archiveTitle}>Numéros précédents</Text>
              </>
            }
          />
        )
      ) : isLoggedIn && isSubscribed ? (
        <FlatList
          key="mine-2cols"
          data={issues}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <IssueCard issue={item} onPress={() => onIssuePress?.(item)} />
          )}
          ListHeaderComponent={
            <View style={styles.mineHeader}>
              <Feather name="check-circle" size={16} color={colors.primary} />
              <Text style={styles.mineHeaderText}>
                Toutes les éditions incluses dans votre abonnement
              </Text>
            </View>
          }
        />
      ) : !isLoggedIn ? (
        <View style={styles.emptyMine}>
          <Feather name="user" size={52} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Connectez-vous</Text>
          <Text style={styles.emptySub}>
            Accédez à vos éditions en vous connectant à votre compte.
          </Text>
          <TouchableOpacity
            style={styles.subBtn}
            onPress={onLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.subBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyMine}>
          <Feather name="book-open" size={52} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Aucune édition disponible</Text>
          <Text style={styles.emptySub}>
            Abonnez-vous pour accéder à toutes les éditions du magazine.
          </Text>
          <TouchableOpacity
            style={styles.subBtn}
            onPress={onSubscribe}
            activeOpacity={0.85}
          >
            <Text style={styles.subBtnText}>S'abonner</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Barre de navigation du bas ─────────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom - 28 }]}>
        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => setTab("kiosk")}
        >
          <Feather
            name="book-open"
            size={14}
            color={tab === "kiosk" ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.bottomTabLabel,
              tab === "kiosk" && styles.bottomTabLabelActive,
            ]}
          >
            Kiosque
          </Text>
          {tab === "kiosk" && <View style={styles.bottomTabDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => setTab("mine")}
        >
          <Feather
            name="download"
            size={14}
            color={tab === "mine" ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.bottomTabLabel,
              tab === "mine" && styles.bottomTabLabelActive,
            ]}
          >
            Mes éditions
          </Text>
          {tab === "mine" && <View style={styles.bottomTabDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};
