import {
  Colors,
  FontFamily,
  Layout,
  Shadows,
  Spacing,
} from "@/theme";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemeColors } from "@/contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LOGO_FULL = require("../../assets/logo-SA.png");
const LOGO_ICON = require("../../assets/icon.png");

interface AppHeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
  variant?: "default" | "dark";
}

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: C.backgroundCard,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing["4"],
    paddingBottom: Spacing["2"],
    height:
      Layout.headerHeight +
      (Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0),
  },
  containerDark: {
    backgroundColor: Colors.backgroundDark,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    height: 34,
    width: 160,
    resizeMode: "contain",
  },
  logoIconDark: {
    height: 34,
    width: 34,
    resizeMode: "contain",
    tintColor: Colors.white,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  notifWrapper: { position: "relative" },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: Colors.error,
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 9,
    color: Colors.white,
  },
});

export const AppHeader: React.FC<AppHeaderProps> = ({
  onSearchPress,
  onNotificationPress,
  notificationCount = 0,
  variant = "default",
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const isVariantDark = variant === "dark";
  const iconColor = isVariantDark ? Colors.white : colors.textPrimary;

  return (
    <View
      style={[
        styles.container,
        isVariantDark && styles.containerDark,
        { paddingTop: insets.top + Spacing["3"] },
        Shadows.header,
      ]}
    >
      <StatusBar
        barStyle={isVariantDark ? "light-content" : "dark-content"}
        backgroundColor={isVariantDark ? Colors.backgroundDark : colors.backgroundCard}
      />

      <TouchableOpacity
        style={styles.iconButton}
        onPress={onSearchPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="search" size={22} color={iconColor} />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        {isVariantDark ? (
          <Image source={LOGO_ICON} style={styles.logoIconDark} />
        ) : (
          <Image source={LOGO_FULL} style={styles.logoImage} />
        )}
      </View>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={onNotificationPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={styles.notifWrapper}>
          <Feather name="bell" size={22} color={iconColor} />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? "9+" : notificationCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};
