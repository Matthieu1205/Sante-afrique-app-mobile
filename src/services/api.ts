import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE         = 'https://api.santeafrique.net/api';
const BASE_STORAGE = 'https://api.santeafrique.net'; // pour /storage/...
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─── Types ────────────────────────────────────────────────────────

export interface ApiArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string;
  views: number;
  category: { name: string; slug: string } | null;
  category_name: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  cover_url: string | null;
  author: string;
  author_slug: string;
  featured: boolean;
}

export interface ApiArticleDetail extends ApiArticle {
  body: string;
  tags: string[];
  sources: string[];
  canonical: string;
  updated_at: string;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface ApiJob {
  id: number;
  title: string;
  company: string;
  company_id: number;
  logo_url: string | null;
  type: string;
  location: string;
  country: string;
  profession: string;
  experienceMin: number;
  publishedAt: string;
  excerpt: string;
  pinnedUntil: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

// ─── Cache ────────────────────────────────────────────────────────

async function cacheGet<T>(key: string, ttl = CACHE_TTL): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`api_cache_${key}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > ttl) return null;
    return data as T;
  } catch {
    return null;
  }
}

async function cacheSet(key: string, data: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(`api_cache_${key}`, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

// ─── Fetch helper ─────────────────────────────────────────────────

async function apiFetch<T>(path: string, cacheKey?: string, ttl = CACHE_TTL): Promise<T | null> {
  const key = cacheKey ?? path;
  const cached = await cacheGet<T>(key, ttl);
  if (cached) return cached;

  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json() as T;
    await cacheSet(key, json);
    return json;
  } catch {
    return null;
  }
}

// ─── API functions ────────────────────────────────────────────────

export async function fetchArticles(page = 1, perPage = 30): Promise<PaginatedResponse<ApiArticle> | null> {
  return apiFetch<PaginatedResponse<ApiArticle>>(
    `/articles?page=${page}&per_page=${perPage}`,
    `articles_p${page}_n${perPage}`,
  );
}

export async function fetchArticlesByRubrique(rubrique: string, page = 1): Promise<PaginatedResponse<ApiArticle> | null> {
  const apiSlug = rubrique.replace(/_/g, '-'); // L'API utilise des tirets
  return apiFetch<PaginatedResponse<ApiArticle>>(
    `/articles?rubrique=${encodeURIComponent(apiSlug)}&page=${page}`,
    `articles_${rubrique}_p${page}`
  );
}

export async function fetchFeaturedArticles(): Promise<ApiArticle[]> {
  const res = await fetchArticles(1);
  if (!res?.data) return [];
  return res.data.filter((a) => a.featured).slice(0, 5);
}

export async function fetchArticleDetail(id: number | string): Promise<ApiArticleDetail | null> {
  return apiFetch<ApiArticleDetail>(`/articles/${id}`, `article_${id}`);
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await apiFetch<{ data: ApiCategory[] }>('/categories', 'categories');
  return res?.data ?? [];
}

export async function fetchJobs(): Promise<{ items: ApiJob[]; pinned: ApiJob[]; total: number } | null> {
  return apiFetch<{ items: ApiJob[]; pinned: ApiJob[]; total: number }>('/jobs', 'jobs_v2');
}

export interface ApiBanner {
  id: string | number;
  tag?: string;
  title: string;
  title_highlight?: string | null;
  subtitle?: string | null;
  button_text?: string;
  button_url?: string;
  cta_text?: string;
  cta_url?: string;
  link_url?: string;
  position?: number;
  color_start?: string;
  color_end?: string;
  dark_text?: boolean;
  image_url?: string | null;
  image?: string | null;
  order?: number;
  is_active?: boolean;
}

export async function fetchBanners(): Promise<ApiBanner[] | null> {
  const res = await apiFetch<{ data: ApiBanner[] } | { items: ApiBanner[] } | ApiBanner[]>(
    '/hero-slides',
    'hero_slides',
  );
  if (!res) return null;
  let items: ApiBanner[] | null = null;
  if (Array.isArray(res)) items = res;
  else if ('data' in res) items = res.data;
  else if ('items' in res) items = res.items;
  if (!items) return null;
  // Les URLs /storage/... sont relatives — on préfixe avec le domaine racine (sans /api)
  return items.map((b) => ({
    ...b,
    image_url: b.image_url?.startsWith('/') ? `${BASE_STORAGE}${b.image_url}` : b.image_url,
    image:     b.image?.startsWith('/')     ? `${BASE_STORAGE}${b.image}`     : b.image,
  }));
}

// ─── Vidéos YouTube ───────────────────────────────────────────────

export interface ApiVideo {
  id: number;
  title: string;
  youtube_id: string;
  thumbnail_url: string | null;
  published_at: string | null;
}

export async function fetchVideos(): Promise<ApiVideo[]> {
  try {
    const res = await fetch(`${BASE}/videos`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = await res.json() as { items: ApiVideo[] };
    return json.items ?? [];
  } catch {
    return [];
  }
}

// ─── Cache ────────────────────────────────────────────────────────

export async function clearCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const apiKeys = keys.filter((k) => k.startsWith('api_cache_'));
    await AsyncStorage.multiRemove(apiKeys);
  } catch {}
}

// ─── Slug resolver ────────────────────────────────────────────────

// Mapping découvert en interrogeant l'API : slug local → slug API réel (avec tirets)
// Les rubriques sans slug ('') n'ont pas encore d'articles publiés via l'API.
const RUBRIQUE_SLUG_MAP: Record<string, string> = {
  actualites:          'actualites',
  vaccination:         'vaccination',
  sante_maternelle:    'sante-maternelle',
  one_health:          'one-health',
  business_sante:      'business-sante',
  equite_acces:        'equite-acces-produits-sante',
  nutrition_infantile: 'sante-nutrition-infantile',
  sante_mentale:       '',   // pas encore dans l'API
  dossier:             '',   // pas encore dans l'API
  conseils_pratiques:  '',   // pas encore dans l'API
  les_odd:             '',   // pas encore dans l'API
};

/** Retourne le slug API réel (tirets) pour un slug local (underscores). */
export function resolveRubriqueSlug(localSlug: string): string {
  if (localSlug in RUBRIQUE_SLUG_MAP) return RUBRIQUE_SLUG_MAP[localSlug];
  return localSlug.replace(/_/g, '-'); // fallback générique
}

// ─── Authentification ────────────────────────────────────────────

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface LoginResult {
  ok: true;
  token: string;
  user: AuthUser;
}

export interface LoginError {
  ok: false;
  message: string;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResult | LoginError> {
  try {
    const res = await fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json() as Record<string, unknown>;
    console.log('[loginUser] status:', res.status, 'body:', JSON.stringify(json));
    if (!res.ok) {
      const msg = (json.message as string) ?? (json.error as string) ?? 'Identifiants incorrects';
      return { ok: false, message: msg };
    }
    const token = (json.token ?? json.access_token) as string;
    const user  = (json.user ?? json.data) as AuthUser;
    await AsyncStorage.setItem('auth_token', token);
    return { ok: true, token, user };
  } catch {
    return { ok: false, message: 'Impossible de se connecter au serveur' };
  }
}

export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem('auth_token');
}

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem('auth_token');
}

// ─── Recherche full-text ──────────────────────────────────────────

export async function searchArticlesApi(query: string): Promise<ApiArticle[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(
      `${BASE}/articles?search=${encodeURIComponent(query)}&per_page=20`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return [];
    const json = await res.json() as PaginatedResponse<ApiArticle>;
    return json.data ?? [];
  } catch {
    return [];
  }
}

// ─── Magazine ────────────────────────────────────────────────────

export interface ApiMagazineIssue {
  id: number;
  number: number;
  label: string;
  theme: string;
  free: boolean;
  price: string;
  cover_url: string | null;
}

export async function fetchMagazineIssues(): Promise<ApiMagazineIssue[]> {
  const res = await apiFetch<{ data: ApiMagazineIssue[] }>('/magazine/issues', 'magazine_issues');
  return res?.data ?? [];
}

// ─── Abonnements ─────────────────────────────────────────────────

export interface ApiPlan {
  id: string;
  name: string;
  price_year: string;
  price_month: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

export async function fetchSubscriptionPlans(): Promise<ApiPlan[]> {
  const res = await apiFetch<{ data: ApiPlan[] }>(
    '/subscriptions/plans',
    'subscription_plans',
    30 * 60 * 1000,
  );
  return res?.data ?? [];
}

// ─── Helpers ──────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function getImageUrl(article: ApiArticle): string | null {
  return article.cover_url ?? article.image_url ?? article.thumbnail_url ?? null;
}
