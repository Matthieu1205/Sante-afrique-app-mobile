import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const TOKEN_KEY       = 'push_token_v1';
const NOTIF_STORE_KEY = 'stored_notifications_v2';
const PROJECT_ID      = '2fd4ad64-9845-403b-a1f1-fafa0945f0c5';
const API_BASE        = 'https://api.santeafrique.net/api';

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

// ─── Types ────────────────────────────────────────────────────────

export type NotifType = 'article' | 'magazine' | 'subscription' | 'update' | 'info';

export interface StoredNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  articleId?: string;
  category?: string;
  read: boolean;
  receivedAt: string; // ISO date
}

// ─── Token push ───────────────────────────────────────────────────

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

// Enregistre le token côté serveur. Inclut le Bearer token si l'utilisateur est connecté
// afin que le backend puisse lier la notification à son compte.
export async function sendPushTokenToServer(token: string): Promise<void> {
  try {
    const authToken = await AsyncStorage.getItem('auth_token');
    await fetch(`${API_BASE}/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        token,
        platform: Platform.OS,
        device: Device.modelName ?? 'unknown',
      }),
    });
  } catch {}
}

// ─── Stockage local des notifications ─────────────────────────────

async function loadNotifStore(): Promise<StoredNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_STORE_KEY);
    return raw ? (JSON.parse(raw) as StoredNotification[]) : [];
  } catch { return []; }
}

async function saveNotifStore(notifs: StoredNotification[]): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIF_STORE_KEY, JSON.stringify(notifs.slice(0, 50)));
  } catch {}
}

export async function storeNotification(
  n: Omit<StoredNotification, 'read' | 'receivedAt'> & { id?: string },
): Promise<StoredNotification> {
  const id = n.id ?? `local_${Date.now()}`;
  const stored: StoredNotification = { ...n, id, read: false, receivedAt: new Date().toISOString() };
  const existing = await loadNotifStore();
  if (!existing.find((e) => e.id === id)) {
    await saveNotifStore([stored, ...existing]);
  }
  return stored;
}

export async function getStoredNotifications(): Promise<StoredNotification[]> {
  return loadNotifStore();
}

export async function markStoredRead(id: string): Promise<StoredNotification[]> {
  const notifs = await loadNotifStore();
  const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
  await saveNotifStore(updated);
  return updated;
}

export async function markAllStoredRead(): Promise<void> {
  const notifs = await loadNotifStore();
  await saveNotifStore(notifs.map((n) => ({ ...n, read: true })));
  await Notifications.setBadgeCountAsync(0).catch(() => {});
}

export function countUnread(notifs: StoredNotification[]): number {
  return notifs.filter((n) => !n.read).length;
}

// ─── Notification locale : abonnement expirant ────────────────────

export async function checkAndNotifySubscriptionExpiry(expiresAt: string): Promise<boolean> {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (daysLeft > 7 || daysLeft <= 0) return false;

  // Éviter de créer la même alerte plusieurs fois (clé = nombre de jours)
  const dedupeKey = `sub_expiry_shown_d${daysLeft}`;
  const already = await AsyncStorage.getItem(dedupeKey);
  if (already) return false;
  await AsyncStorage.setItem(dedupeKey, '1');

  await storeNotification({
    id: dedupeKey,
    type: 'subscription',
    title: 'Abonnement expirant bientôt',
    body: `Votre abonnement expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}. Renouvelez dès maintenant pour conserver votre accès.`,
  });

  if (!isExpoGo) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Abonnement expirant bientôt',
        body: `Votre abonnement expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.`,
        data: { type: 'subscription' },
      },
      trigger: null, // affiche immédiatement
    }).catch(() => {});
  }

  return true;
}

// ─── Listeners de notifications ───────────────────────────────────

/**
 * Configure les listeners Expo Notifications.
 * - notification reçue en foreground  → stocke + badge +1
 * - utilisateur tape sur la notif     → marque lue + badge -1 + navigation
 * Retourne une fonction de nettoyage.
 */
export function setupNotificationListeners(
  onNewNotification: () => void,
  onNotificationRead: () => void,
  onArticleOpen: (articleId: string) => void,
  onMagazineOpen?: () => void,
): () => void {
  const receivedSub = Notifications.addNotificationReceivedListener(async (notif) => {
    const data = (notif.request.content.data ?? {}) as Record<string, unknown>;
    await storeNotification({
      id: notif.request.identifier,
      type: (data['type'] as NotifType) ?? 'info',
      title: notif.request.content.title ?? 'Santé Afrique',
      body: notif.request.content.body ?? '',
      articleId: (data['article_id'] ?? data['articleId']) as string | undefined,
      category: data['category'] as string | undefined,
    });
    onNewNotification();
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener(async (response) => {
    const data = (response.notification.request.content.data ?? {}) as Record<string, unknown>;
    const type = (data['type'] as NotifType) ?? 'info';
    const articleId = (data['article_id'] ?? data['articleId']) as string | undefined;
    await markStoredRead(response.notification.request.identifier);
    if (type === 'magazine') {
      onMagazineOpen?.();
    } else if (articleId) {
      onArticleOpen(articleId);
    }
    onNotificationRead();
  });

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}

// ─── Cold start : app ouverte depuis une notification ────────────

export async function getLastNotificationArticleId(): Promise<string | null> {
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (!response) return null;
    const data = (response.notification.request.content.data ?? {}) as Record<string, unknown>;
    return (data['article_id'] ?? data['articleId']) as string ?? null;
  } catch { return null; }
}

// ─── Fonctions legacy (compatibilité) ────────────────────────────

const READ_KEY = 'notifications_read_v1';

async function loadReadIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(READ_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

async function saveReadIds(ids: Set<string>): Promise<void> {
  try { await AsyncStorage.setItem(READ_KEY, JSON.stringify([...ids])); } catch {}
}

export async function markAllRead(ids: string[]): Promise<void> {
  const readIds = await loadReadIds();
  ids.forEach((id) => readIds.add(id));
  await saveReadIds(readIds);
  await markAllStoredRead();
}

export async function getUnreadCount(ids: string[]): Promise<number> {
  const readIds = await loadReadIds();
  return ids.filter((id) => !readIds.has(id)).length;
}

export async function isRead(id: string): Promise<boolean> {
  const readIds = await loadReadIds();
  return readIds.has(id);
}

export async function markOneRead(id: string): Promise<number> {
  const readIds = await loadReadIds();
  readIds.add(id);
  await saveReadIds(readIds);
  return 0;
}
