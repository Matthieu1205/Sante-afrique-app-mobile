import * as FileSystem from 'expo-file-system';
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
  // Nom de fichier stable basé sur le dernier segment de l'URL
  const segment = pdfUrl.split('/').pop()?.split('?')[0] ?? 'magazine.pdf';
  const localUri = cacheDir + segment;

  // Téléchargement (skip si déjà en cache)
  const info = await FileSystem.getInfoAsync(localUri);
  if (!info.exists) {
    const result = await FileSystem.downloadAsync(
      pdfUrl,
      localUri,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    );
    if (result.status !== 200) {
      Alert.alert('Erreur', 'Impossible de télécharger le magazine. Vérifiez votre connexion.');
      return;
    }
  }

  if (Platform.OS === 'android') {
    try {
      const contentUri = await FileSystem.getContentUriAsync(localUri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: 'application/pdf',
      });
    } catch {
      // Fallback si aucune app PDF installée
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(localUri, { mimeType: 'application/pdf' });
      } else {
        Alert.alert('Aucun lecteur PDF', 'Installez une application PDF (ex. Adobe Acrobat) pour lire ce magazine.');
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
