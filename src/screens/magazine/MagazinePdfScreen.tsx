import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Pdf from 'react-native-pdf';
import { Colors, FontFamily, FontSize, Spacing } from '@/theme';

interface MagazinePdfScreenProps {
  url: string;
  title: string;
  authToken: string | null;
  onBack: () => void;
}

const { width: W, height: H } = Dimensions.get('window');

export const MagazinePdfScreen: React.FC<MagazinePdfScreenProps> = ({
  url,
  title,
  authToken,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const [page, setPage]   = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const source = {
    uri: url,
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    cache: true,
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        {total > 0 ? (
          <Text style={styles.pageCount}>{page}/{total}</Text>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </View>

      {/* Lecteur PDF */}
      {error ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={40} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={onBack} style={styles.errorBtn}>
            <Text style={styles.errorBtnText}>Retour</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Pdf
          source={source}
          style={styles.pdf}
          onLoadComplete={(numberOfPages) => setTotal(numberOfPages)}
          onPageChanged={(p) => setPage(p)}
          onError={(err) => {
            console.log('[MagazinePdf] erreur:', err);
            setError('Impossible de charger ce magazine.\nVérifiez votre connexion.');
          }}
          renderActivityIndicator={() => (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loaderText}>Chargement du magazine…</Text>
            </View>
          )}
          enablePaging
          horizontal={false}
          fitPolicy={0}
          spacing={0}
          trustAllCerts={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1A1A2E' },

  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['3'],
    gap: Spacing['3'],
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: '#fff',
    textAlign: 'center',
  },
  pageCount: {
    width: 48,
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'right',
  },

  pdf: { flex: 1, width: W, height: H },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: '#94A3B8',
  },

  errorBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: Spacing['6'], gap: Spacing['4'],
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  errorBtnText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.sm,
    color: '#fff',
  },
});
