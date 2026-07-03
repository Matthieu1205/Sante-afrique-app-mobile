import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import { Colors, FontFamily, FontSize, Spacing } from '@/theme';

interface MagazinePdfScreenProps {
  url: string;
  title: string;
  authToken: string | null;
  onBack: () => void;
}

export const MagazinePdfScreen: React.FC<MagazinePdfScreenProps> = ({
  url,
  title,
  authToken,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Corps */}
      <View style={styles.body}>
        {error ? (
          <View style={styles.center}>
            <Feather name="alert-circle" size={44} color="#DC2626" />
            <Text style={styles.errorText}>
              Impossible de charger ce magazine.{'\n'}Vérifiez votre connexion.
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onBack}>
              <Text style={styles.retryBtnText}>Retour</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <WebView
              source={{ uri: url, headers }}
              style={styles.webview}
              originWhitelist={['*']}
              scalesPageToFit
              allowsInlineMediaPlayback
              javaScriptEnabled={false}
              onLoadStart={() => { setLoading(true); setError(false); }}
              onLoadEnd={() => setLoading(false)}
              onError={() => { setLoading(false); setError(true); }}
              onHttpError={(e) => {
                if (e.nativeEvent.statusCode >= 400) {
                  setLoading(false);
                  setError(true);
                }
              }}
            />
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Chargement du magazine…</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D1B2A' },

  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['3'],
    gap: Spacing['3'],
  },
  backBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: '#fff',
    textAlign: 'center',
  },

  body: { flex: 1, backgroundColor: '#fff' },

  webview: { flex: 1 },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: '#64748B',
  },

  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: Spacing['6'], gap: 16,
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  retryBtnText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.sm,
    color: '#fff',
  },
});
