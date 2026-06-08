import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchServerBookmarks,
  addServerBookmark,
  removeServerBookmark,
  fetchArticleDetail,
  formatDate,
  getImageUrl,
} from './api';

const KEY = 'bookmarks_v1';

export interface BookmarkedArticle {
  id: string;
  title: string;
  category: string;   // display name, e.g. "Actualités"
  date: string;       // formatted
  readTime: string;   // e.g. "5 min"
  type: string;       // e.g. "Actualité"
  imageUrl?: string;
}

async function load(): Promise<BookmarkedArticle[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function save(items: BookmarkedArticle[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
}

export async function getBookmarks(): Promise<BookmarkedArticle[]> {
  return load();
}

export async function isBookmarked(id: string): Promise<boolean> {
  const items = await load();
  return items.some((b) => b.id === id);
}

export async function addBookmark(article: BookmarkedArticle): Promise<void> {
  const items = await load();
  if (items.some((b) => b.id === article.id)) return;
  await save([article, ...items]);
  addServerBookmark(article.id); // best-effort, fire-and-forget
}

export async function removeBookmark(id: string): Promise<void> {
  const items = await load();
  await save(items.filter((b) => b.id !== id));
  removeServerBookmark(id); // best-effort, fire-and-forget
}

export async function clearBookmarks(): Promise<void> {
  await save([]);
}

/**
 * Appelée au chargement de BookmarksScreen quand l'utilisateur est connecté.
 * - Envoie au serveur les favoris locaux non encore synchronisés.
 * - Rapatrie les favoris serveur absents du local (ex. ajoutés sur le web).
 */
export async function syncWithServer(): Promise<BookmarkedArticle[]> {
  const [localItems, serverIds] = await Promise.all([load(), fetchServerBookmarks()]);
  if (!serverIds.length && !localItems.length) return localItems;

  const localIdSet = new Set(localItems.map((b) => b.id));
  const serverIdSet = new Set(serverIds);

  // Local → server : push les favoris non encore sur le serveur
  const toUpload = localItems.filter((b) => !serverIdSet.has(b.id));
  toUpload.forEach((b) => addServerBookmark(b.id));

  // Server → local : récupère les articles présents sur le serveur mais pas en local
  const toDownload = serverIds.filter((id) => !localIdSet.has(id));
  const fetched = await Promise.all(
    toDownload.map(async (id): Promise<BookmarkedArticle | null> => {
      const article = await fetchArticleDetail(id);
      if (!article) return null;
      return {
        id: String(article.id),
        title: article.title,
        category: categoryLabel(article.category?.slug ?? ''),
        date: formatDate(article.published_at),
        readTime: '5 min',
        type: typeLabel(article.category?.slug),
        imageUrl: getImageUrl(article) ?? undefined,
      };
    }),
  );

  const downloaded = fetched.filter((b): b is BookmarkedArticle => b !== null);
  if (!downloaded.length) return localItems;

  const merged = [...downloaded, ...localItems];
  await save(merged);
  return merged;
}

// ─── Helpers ──────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  actualites:          'Actualités',
  vaccination:         'Vaccination',
  sante_maternelle:    'Santé Maternelle',
  one_health:          'One Health',
  business_sante:      'Business Santé',
  equite_acces:        'Équité & Accès',
  nutrition_infantile: 'Nutrition Infantile',
  sante_mentale:       'Santé Mentale',
  dossier:             'Dossier',
  conseils_pratiques:  'Conseils Pratiques',
  les_odd:             'Les ODD',
};

const TYPE_LABELS: Record<string, string> = {
  actualite:       'Actualité',
  dossier:         'Dossier',
  interview:       'Interview',
  tribune:         'Tribune',
  conseil_pratique:'Conseil',
  vaccination:     'Vaccination',
};

export function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? slug;
}

export function typeLabel(slug?: string): string {
  if (!slug) return 'Actualité';
  return TYPE_LABELS[slug] ?? 'Actualité';
}
