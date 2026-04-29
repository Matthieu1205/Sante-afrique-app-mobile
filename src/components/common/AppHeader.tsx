import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontSize, Spacing, Shadows, Layout } from '@/theme';

interface AppHeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
  variant?: 'default' | 'dark';
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onSearchPress,
  onNotificationPress,
  notificationCount = 0,
  variant = 'default',
}) => {
  const insets = useSafeAreaInsets();
  const isDark = variant === 'dark';
  const iconColor = isDark ? Colors.white : Colors.textPrimary;

  return (
    <View
      style={[
        styles.container,
        isDark && styles.containerDark,
        { paddingTop: insets.top + Spacing['2'] },
        Shadows.header,
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? Colors.backgroundDark : Colors.white}
      />

      {/* Recherche */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onSearchPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="search" size={22} color={iconColor} />
      </TouchableOpacity>

      {/* Logo centré */}
      <View style={styles.logoContainer}>
        <Text style={[styles.logoBold, isDark && styles.logoTextDark]}>santé</Text>
        <Text style={[styles.logoBold, styles.logoBlue]}>{' '}afrique</Text>
      </View>

      {/* Notifications */}
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
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['3'],
    height: Layout.headerHeight + (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0),
  },
  containerDark: {
    backgroundColor: Colors.backgroundDark,
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBold: {
    fontFamily: FontFamily.logo,
    fontSize: FontSize.xl,
    letterSpacing: -0.5,
    color: Colors.textPrimary,
  },
  logoTextDark: { color: Colors.white },
  logoBlue: { color: Colors.primary },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifWrapper: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.error,
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 9,
    color: Colors.white,
  },
});
