import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const READ_KEY   = 'notifications_read_v1';
const TOKEN_KEY  = 'push_token_v1';
const PROJECT_ID = '2fd4ad64-9845-403b-a1f1-fafa0945f0c5';
const API_BASE   = 'https://api.santeafrique.net/api';

// Expo Go SDK 53+ ne supporte plus les push distantes
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestPushPermissions(): Promise<string | null> {
  if (!Device.isDevice || isExpoGo) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Santé Afrique',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1B9DD9',
    });
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID })).data;
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return token;
  } catch {
    return null;
  }
}

export async function getPushToken(): Promise<string | null> {
  try { return await AsyncStorage.getItem(TOKEN_KEY); } catch { return null; }
}

// ─── État lu/non-lu ────────────────────────────────────────────────

async function loadReadIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(READ_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

async function saveReadIds(ids: Set<string>): Promise<void> {
  try { await AsyncStorage.setItem(READ_KEY, JSON.stringify([...ids])); } catch {}
}

export async function markAllRead(ids: string[]): Promise<void> {
  const readIds = await loadReadIds();
  ids.forEach((id) => readIds.add(id));
  await saveReadIds(readIds);
  await Notifications.setBadgeCountAsync(0).catch(() => {});
}

export async function getUnreadCount(ids: string[]): Promise<number> {
  const readIds = await loadReadIds();
  return ids.filter((id) => !readIds.has(id)).length;
}

export async function isRead(id: string): Promise<boolean> {
  const readIds = await loadReadIds();
  return readIds.has(id);
}

// ─── Marquer une seule notification comme lue ─────────────────────

export async function markOneRead(id: string): Promise<number> {
  const readIds = await loadReadIds();
  readIds.add(id);
  await saveReadIds(readIds);
  return 0; // le caller recalcule le count depuis l'état React
}

// ─── Enregistrer le token push auprès du serveur Laravel ─────────

export async function sendPushTokenToServer(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/push-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ token, platform: Platform.OS, device: Device.modelName ?? 'unknown' }),
    });
  } catch {}
}

// ─── Listeners de notifications ───────────────────────────────────

/**
 * Configure les listeners Expo Notifications.
 * - onNewNotification : notification reçue en foreground → badge +1
 * - onNotificationRead : utilisateur tape sur la notif → badge -1
 * - onArticleOpen : ouvre l'article correspondant dans l'app
 * Retourne une fonction de nettoyage à appeler en unmount.
 */
export function setupNotificationListeners(
  onNewNotification: () => void,
  onNotificationRead: () => void,
  onArticleOpen: (articleId: string) => void,
): () => void {
  // Notification reçue pendant que l'app est ouverte → badge +1
  const receivedSub = Notifications.addNotificationReceivedListener(() => {
    onNewNotification();
  });

  // Utilisateur tape sur la notification (depuis le tiroir système) → ouvre l'article + badge -1
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as Record<string, unknown>;
    const articleId = (data?.article_id ?? data?.articleId) as string | undefined;
    if (articleId) {
      markOneRead(articleId).catch(() => {});
      onArticleOpen(articleId);
    }
    onNotificationRead();
  });

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}
