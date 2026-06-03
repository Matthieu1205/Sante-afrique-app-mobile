import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

export async function removeBookmark(id: string): Promise<void> {
  const items = await load();
  await save(items.filter((b) => b.id !== id));
}

export async function clearBookmarks(): Promise<void> {
  await save([]);
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
