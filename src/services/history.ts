import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackReadingHistoryRemote } from './api';

const HISTORY_KEY = 'reading_history';
const MAX_ITEMS = 50;

export interface HistoryEntry {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  readAt: string; // ISO string
}

export async function trackArticleRead(entry: Omit<HistoryEntry, 'readAt'>): Promise<void> {
  try {
    const existing = await getHistory();
    const filtered = existing.filter((e) => e.id !== entry.id);
    const updated: HistoryEntry[] = [{ ...entry, readAt: new Date().toISOString() }, ...filtered];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated.slice(0, MAX_ITEMS)));
    // Sync distant (fire-and-forget)
    trackReadingHistoryRemote(entry.id, entry.title).catch(() => {});
  } catch {}
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {}
}
