import {
  Colors,
  FontFamily,
  FontSize,
  Radius,
  Shadows,
  Spacing,
} from "@/theme";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemeColors } from "@/contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { fetchMagazineIssues } from "@/services/api";
import type { ApiMagazineIssue } from "@/services/api";

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
    id:         String(a.id),
    number:     a.number,
    label:      a.label,
    theme:      a.theme,
    free:       a.free,
    price:      a.price,
    color:      COVER_COLORS[idx % COVER_COLORS.length],
    icon:       "book-open",
    coverImage: a.cover_url ? { uri: a.cover_url } : undefined,
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
}

interface MagazineScreenProps {
  onBack?: () => void;
  onSubscribe?: () => void;
  onLogin?: () => void;
  onSettings?: () => void;
  onAbout?: () => void;
  onIssuePress?: (issue: MagazineIssue) => void;
}

const { width: W } = Dimensions.get("window");
const DRAWER_W = W * 0.72;
const CARD_W = (W - Spacing["4"] * 2 - Spacing["3"]) / 2;

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
    theme: "Approche One Health en Côte d'Ivoire : la vision du Dr Djeneba Ouattara",
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

// ─── Couverture magazine ── (gradient-based, colors.white only)

export const IssueCover: React.FC<{
  issue: MagazineIssue;
  width: number;
  height: number;
  showLock?: boolean;
}> = ({ issue, width, height, showLock = true }) => {
  if (issue.coverImage) {
    return (
      <View style={[cvr.wrap, { width, height }]}>
        <Image source={issue.coverImage} style={{ width, height }} resizeMode="cover" />
        {showLock && !issue.free && (
          <View style={cvr.lock}>
            <Feather name="lock" size={16} color={Colors.white} />
          </View>
        )}
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
      {showLock && !issue.free && (
        <View style={cvr.lock}>
          <Feather name="lock" size={14} color={Colors.white} />
        </View>
      )}
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
  lock: { position: "absolute", top: 8, right: 8 },
  numBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  numText: { fontFamily: FontFamily.bodyBold, fontSize: 10, color: Colors.white },
  logoWrap: { position: "absolute", bottom: 8 },
  logo: { fontFamily: FontFamily.logo, fontSize: 11, color: "rgba(255,255,255,0.75)" },
  logoW: { color: Colors.white },
});

// ─── Carte grille ─────────────────────────────────────────────────

const makeGcStyles = (C: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.md,
    overflow: "hidden",
    ...Shadows.card,
  },
  info: { padding: Spacing["2"], gap: 3 },
  label: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted },
  theme: { fontFamily: FontFamily.headingBold, fontSize: FontSize.sm, color: C.textPrimary, lineHeight: 17 },
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
      <View style={gc.info}>
        <Text style={gc.label}>{issue.label}</Text>
        <Text style={gc.theme} numberOfLines={2}>
          {issue.theme}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Drawer menu ── (always primary blue bg — theme-invariant)

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
    if (key === "account") onAccount?.();
    if (key === "settings") onSettings?.();
    if (key === "about") onAbout?.();
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
  backLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: Colors.white },
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
  itemLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.lg, color: Colors.white },
});

// ─── Écran principal ──────────────────────────────────────────────

type TabKey = "kiosk" | "mine";

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing["4"],
    paddingBottom: Spacing["3"],
  },
  menuBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.logo,
    fontSize: FontSize.xl,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  headerTitleW: { color: C.white },
  list: { paddingBottom: 80 },
  row: { paddingHorizontal: Spacing["4"], gap: Spacing["3"], marginBottom: Spacing["3"] },
  hero: {
    marginHorizontal: Spacing["4"],
    marginTop: Spacing["4"],
    marginBottom: Spacing["2"],
    borderRadius: Radius.md,
    overflow: "hidden",
    ...Shadows.card,
  },
  heroLabel: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: C.textPrimary,
    textAlign: "center",
    paddingVertical: Spacing["2"],
    backgroundColor: C.backgroundCard,
  },
  archiveTitle: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: Spacing["4"],
    paddingTop: Spacing["4"],
    paddingBottom: Spacing["3"],
  },
  emptyMine: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing["3"],
    paddingHorizontal: Spacing["8"],
    paddingBottom: 80,
  },
  emptyTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: C.textPrimary, textAlign: "center" },
  emptySub: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: C.textMuted, textAlign: "center", lineHeight: 22 },
  subBtn: {
    backgroundColor: C.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing["6"],
    paddingVertical: Spacing["3"],
    marginTop: Spacing["2"],
  },
  subBtnText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: C.white },
  bottomBar: {
    flexDirection: "row",
    backgroundColor: C.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
    paddingTop: 8,
    elevation: 8,
  },
  bottomTab: { flex: 1, alignItems: "center", gap: 3 },
  bottomTabLabel: { fontFamily: FontFamily.body, fontSize: 10, color: C.textMuted },
  bottomTabLabelActive: { fontFamily: FontFamily.bodySemiBold, color: C.primary },
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
  onSettings,
  onAbout,
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
    fetchMagazineIssues().then((data) => {
      if (data.length > 0) setIssues(data.map(mapApiIssue));
      setLoadingIssues(false);
    });
  }, []);

  const latest = issues[0];
  const archives = issues.slice(1);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <DrawerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onBack={onBack}
        onAccount={onLogin}
        onSettings={onSettings}
        onAbout={onAbout}
      />

      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + Spacing["2"] }]}
      >
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setDrawerOpen(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="menu" size={24} color={colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          santé <Text style={styles.headerTitleW}>afrique</Text>
        </Text>

        <View style={{ width: 40 }} />
      </LinearGradient>

      {tab === "kiosk" ? (
        loadingIssues ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) :
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
              <TouchableOpacity
                style={styles.hero}
                onPress={() => onIssuePress?.(latest)}
                activeOpacity={0.9}
              >
                <IssueCover
                  issue={latest}
                  width={W - Spacing["4"] * 2}
                  height={(W - Spacing["4"] * 2) * 0.55}
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
          <Feather name="book-open" size={52} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Aucune édition téléchargée</Text>
          <Text style={styles.emptySub}>
            Abonnez-vous pour accéder à toutes les éditions.
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

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}
      >
        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => setTab("kiosk")}
        >
          <Feather
            name="book-open"
            size={22}
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
            size={22}
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
