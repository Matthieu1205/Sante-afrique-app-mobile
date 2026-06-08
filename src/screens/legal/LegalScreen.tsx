import { FontFamily, FontSize, Spacing } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

interface LegalScreenProps {
  title: string;
  url: string;
  onBack: () => void;
  hideChrome?: boolean;
  onLoginSuccess?: () => void;
}

const HIDE_CHROME_JS = `
(function() {
  var s = document.createElement('style');
  s.innerHTML = 'header,footer,nav,.site-header,.site-footer,#masthead,#colophon,.navbar,.nav-bar,.menu-bar,.top-bar,.bottom-bar,.cookie-notice,.cookie-banner,.gdpr-banner,[class*="header"],[class*="footer"],[id*="header"],[id*="footer"]{display:none!important;}body,html{padding-top:0!important;margin-top:0!important;}';
  document.head.appendChild(s);
})();
true;
`;

export const LegalScreen: React.FC<LegalScreenProps> = ({ title, url, onBack, hideChrome = false, onLoginSuccess }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const loginDetected = React.useRef(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.backgroundCard}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing['2'], backgroundColor: colors.backgroundCard, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>
        <View style={styles.backBtn} />
      </View>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <WebView
        source={{ uri: url }}
        style={{ flex: 1, opacity: loading ? 0 : 1 }}
        injectedJavaScript={hideChrome ? HIDE_CHROME_JS : undefined}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(navState) => {
          if (!onLoginSuccess || loginDetected.current) return;
          const current = navState.url;
          // Connexion réussie = redirigé ailleurs que /connexion sur le site
          if (
            current.includes('santeafrique.net') &&
            !current.includes('/connexion') &&
            !current.includes('/login') &&
            navState.loading === false
          ) {
            loginDetected.current = true;
            onLoginSuccess();
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing['3'],
    paddingHorizontal: Spacing['4'],
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    textAlign: 'center',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
