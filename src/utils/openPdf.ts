import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';

/**
 * Télécharge un PDF protégé avec Bearer token puis l'ouvre dans l'app PDF du téléphone.
 * Android : ouvre directement via Intent (sans dialog de partage).
 * iOS     : ouvre via Sharing (feuille de partage).
 */
export async function openMagazinePdf(pdfUrl: string, token: string | null): Promise<void> {
  const cacheDir = FileSystem.cacheDirectory ?? '';
  const segment = pdfUrl.split('/').pop()?.split('?')[0] ?? 'magazine.pdf';
  const localUri = cacheDir + segment;

  console.log('[openPdf] url:', pdfUrl);
  console.log('[openPdf] localUri:', localUri);

  // Téléchargement (skip si déjà en cache)
  const info = await FileSystem.getInfoAsync(localUri);
  if (!info.exists) {
    console.log('[openPdf] téléchargement en cours...');
    const result = await FileSystem.downloadAsync(
      pdfUrl,
      localUri,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    );
    console.log('[openPdf] download status:', result.status);
    if (result.status !== 200) {
      Alert.alert(
        'Erreur de téléchargement',
        `Statut ${result.status}. Vérifiez votre connexion ou votre abonnement.`,
      );
      return;
    }
  } else {
    console.log('[openPdf] fichier déjà en cache');
  }

  console.log('[openPdf] ouverture...');

  if (Platform.OS === 'android') {
    try {
      const contentUri = await FileSystem.getContentUriAsync(localUri);
      console.log('[openPdf] contentUri:', contentUri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: 'application/pdf',
      });
    } catch (e) {
      console.log('[openPdf] intent échoué, fallback sharing:', e);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(localUri, { mimeType: 'application/pdf' });
      } else {
        Alert.alert(
          'Aucun lecteur PDF',
          'Installez une application PDF (ex. Adobe Acrobat) pour lire ce magazine.',
        );
      }
    }
  } else {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(localUri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
      });
    }
  }
}
