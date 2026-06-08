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
    const json = await res.json() as { items?: ApiVideo[]; data?: ApiVideo[] } | ApiVideo[];
    if (Array.isArray(json)) return json;
    return json.items ?? json.data ?? [];
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

export async function clearMagazineCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const magKeys = keys.filter((k) => k.startsWith('api_cache_magazine'));
    await AsyncStorage.multiRemove(magKeys);
  } catch {}
}

// ─── Inscription ─────────────────────────────────────────────────

export async function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  country: string,
): Promise<LoginResult | LoginError> {
  try {
    const res = await fetch(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: `${firstName} ${lastName}`.trim(),
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        password_confirmation: password,
        country,
      }),
    });
    const json = await res.json() as Record<string, unknown>;
    if (!res.ok) {
      const msg = (json.message as string) ?? 'Erreur lors de l\'inscription';
      return { ok: false, message: msg };
    }
    const token = (json.token ?? json.access_token) as string;
    const user  = (json.user ?? json.data ?? { id: 0, name: '', email }) as AuthUser;
    if (!token) return { ok: false, message: 'Token manquant dans la réponse serveur' };
    await AsyncStorage.setItem('auth_token', token);
    return { ok: true, token, user };
  } catch {
    return { ok: false, message: 'Impossible de se connecter au serveur' };
  }
}

// ─── Mot de passe oublié ──────────────────────────────────────────

export async function forgotPassword(
  email: string,
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json() as Record<string, unknown>;
    return {
      ok: res.ok,
      message: (json.message as string) ?? (res.ok ? 'Email envoyé' : 'Erreur serveur'),
    };
  } catch {
    return { ok: false, message: 'Impossible de se connecter au serveur' };
  }
}

// ─── Emplois (création) ───────────────────────────────────────────

export async function postJob(data: {
  title: string;
  company: string;
  type: string;
  location: string;
  country: string;
  email: string;
  experience?: string;
  description?: string;
}): Promise<{ ok: boolean; message: string; needsSubscription?: boolean }> {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    const res = await fetch(`${BASE}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    const json = await res.json() as Record<string, unknown>;
    if (res.status === 403) {
      return { ok: false, needsSubscription: true, message: (json.message as string) ?? 'Un abonnement actif est requis pour poster une offre.' };
    }
    return { ok: res.ok, message: (json.message as string) ?? (res.ok ? 'Offre soumise' : 'Erreur') };
  } catch {
    return { ok: false, message: 'Impossible de se connecter au serveur' };
  }
}

// ─── CV (dépôt) ───────────────────────────────────────────────────

export async function submitCV(data: {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  profession: string;
  experience?: string;
  skills?: string;
  contract?: string;
  availability?: string;
  cv_uri?: string | null;
  cv_name?: string | null;
}): Promise<{ ok: boolean; message: string }> {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    const form = new FormData();
    const { cv_uri, cv_name, ...fields } = data;
    (Object.entries(fields) as [string, string | null | undefined][]).forEach(([k, v]) => {
      if (v != null && v !== '') form.append(k, v);
    });
    if (cv_uri && cv_name) {
      const ext = cv_name.split('.').pop()?.toLowerCase() ?? 'pdf';
      const mime = ext === 'pdf' ? 'application/pdf'
        : ext === 'doc' ? 'application/msword'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      form.append('cv_file', { uri: cv_uri, name: cv_name, type: mime } as unknown as Blob);
    }
    const res = await fetch(`${BASE}/cv/submit`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    });
    const json = await res.json() as Record<string, unknown>;
    return { ok: res.ok, message: (json.message as string) ?? (res.ok ? 'CV soumis' : 'Erreur') };
  } catch {
    return { ok: false, message: 'Impossible de se connecter au serveur' };
  }
}

// ─── CV (consultation recruteur) ──────────────────────────────────

export interface ApplicantCV {
  id: number;
  name: string;
  profession: string;
  experience: string;
  country: string;
  cv_url?: string | null;
}

export async function browseCVs(filters: {
  profession?: string;
  experience?: string;
  country?: string;
  contract?: string;
}): Promise<ApplicantCV[]> {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const res = await fetch(`${BASE}/cv/browse?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) return [];
    const json = await res.json() as { data?: ApplicantCV[]; items?: ApplicantCV[] } | ApplicantCV[];
    if (Array.isArray(json)) return json;
    return json.data ?? json.items ?? [];
  } catch { return []; }
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
  sante_mentale:       'sante-mentale',
  dossier:             'dossier',
  conseils_pratiques:  'conseils-pratiques',
  les_odd:             'les-odd',
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

// Endpoints login à essayer dans l'ordre
const LOGIN_URLS = [
  `${BASE}/login`,
  'https://santeafrique.net/api/login',
];

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResult | LoginError> {
  for (const url of LOGIN_URLS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      console.log('[loginUser] url:', url, 'status:', res.status);
      if (res.status === 404) continue; // Essaie l'URL suivante
      const json = await res.json() as Record<string, unknown>;
      if (!res.ok) {
        const msg = (json.message as string) ?? (json.error as string) ?? 'Identifiants incorrects';
        return { ok: false, message: msg };
      }
      const token = (json.token ?? json.access_token) as string;
      const user  = (json.user ?? json.data ?? { id: 0, name: '', email }) as AuthUser;
      if (!token) return { ok: false, message: 'Token manquant dans la réponse serveur' };
      await AsyncStorage.setItem('auth_token', token);
      return { ok: true, token, user };
    } catch {
      continue;
    }
  }
  return { ok: false, message: 'Impossible de se connecter au serveur' };
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
  label?: string;
  title?: string;
  theme?: string;
  free: boolean;
  price: string;
  cover_url: string | null;
  date?: string;
}

export async function fetchMagazineIssues(): Promise<ApiMagazineIssue[]> {
  const res = await apiFetch<unknown>('/magazine/issues', 'magazine_issues');
  if (!res) return [];
  let list: ApiMagazineIssue[];
  if (Array.isArray(res)) {
    list = res as ApiMagazineIssue[];
  } else {
    const wrapped = res as Record<string, unknown>;
    list = (wrapped['data'] ?? wrapped['items'] ?? wrapped['issues'] ?? []) as ApiMagazineIssue[];
  }
  if (list.length > 0) {
    console.log('[issues] clés du 1er item:', Object.keys(list[0] as object).join(', '));
  }
  return list;
}

export interface ApiMagazineSommaireItem {
  page: number;
  title: string;
}

export interface ApiMagazineIssueDetail extends ApiMagazineIssue {
  sommaire?: ApiMagazineSommaireItem[];
  extrait?: string | null;
  date?: string;
}

export async function fetchMagazineIssueDetail(id: number): Promise<ApiMagazineIssueDetail | null> {
  console.log('[detail] fetching id:', id);
  const res = await apiFetch<Record<string, unknown>>(`/magazine/issues/${id}`, `magazine_issue_${id}`);
  if (!res) {
    console.log('[detail] NULL — route 404 ou réseau');
    return null;
  }
  // Déballe { data: {...} } si besoin
  const payload = (res['data'] && typeof res['data'] === 'object' && !Array.isArray(res['data']))
    ? res['data'] as Record<string, unknown>
    : res;
  console.log('[detail] clés reçues:', Object.keys(payload).join(', '));

  // Normalise le champ sommaire quel que soit le nom utilisé côté backend
  const sommaireField = payload['sommaire'] ?? payload['table_of_contents'] ?? payload['toc'] ?? payload['contents'] ?? payload['summary'];
  const sommaireRaw = sommaireField as ApiMagazineSommaireItem[] | null | undefined;
  console.log('[detail] sommaire:', Array.isArray(sommaireRaw) ? `${sommaireRaw.length} items` : String(sommaireField ?? 'absent'));

  const extraitField = payload['extrait'] ?? payload['excerpt'] ?? payload['extract'];

  return {
    id:        payload['id']                               as number,
    number:    payload['number']                           as number,
    label:     (payload['label'] ?? payload['title'])      as string,
    theme:     (payload['theme'] ?? payload['summary_title'] ?? '') as string,
    free:      payload['free']                             as boolean,
    price:     (payload['price'] ?? '')                   as string,
    cover_url: (payload['cover_url'] ?? payload['cover']) as string | null,
    date:      payload['date']                             as string | undefined,
    sommaire:  Array.isArray(sommaireRaw) ? sommaireRaw : undefined,
    extrait:   extraitField as string | null | undefined,
  };
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

// ─── Publicités ──────────────────────────────────────────────────

export interface ApiAd {
  id: number;
  image_url: string;
  link_url: string;
  is_active?: boolean;
}

export async function fetchAds(): Promise<ApiAd[]> {
  const res = await apiFetch<{ data?: ApiAd[] } | ApiAd[]>('/ads', 'ads', 15 * 60 * 1000);
  if (!res) return [];
  if (Array.isArray(res)) return res.filter((a) => a.is_active !== false);
  return (res.data ?? []).filter((a) => a.is_active !== false);
}

// ─── Favoris serveur ─────────────────────────────────────────────

export async function fetchServerBookmarks(): Promise<string[]> {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) return [];
    const res = await fetch(`${BASE}/bookmarks`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const json = await res.json() as
      | { data?: ({ article_id: string | number } | string | number)[] }
      | (string | number)[];
    const items = Array.isArray(json) ? json : (json.data ?? []);
    return items.map((b) =>
      typeof b === 'object' && b !== null && 'article_id' in b
        ? String((b as { article_id: string | number }).article_id)
        : String(b),
    );
  } catch { return []; }
}

export async function addServerBookmark(articleId: string): Promise<void> {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) return;
    await fetch(`${BASE}/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ article_id: articleId }),
    });
  } catch {}
}

export async function removeServerBookmark(articleId: string): Promise<void> {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) return;
    await fetch(`${BASE}/bookmarks/${articleId}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
  } catch {}
}

// ─── Profil utilisateur ──────────────────────────────────────────

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  subscription?: { plan: string; expires_at: string | null; is_active: boolean } | null;
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) return null;
    const res = await fetch(`${BASE}/user`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = await res.json() as Record<string, unknown>;
    const profile = (json.data ?? json) as UserProfile;
    if (!profile?.id) return null;
    return profile;
  } catch { return null; }
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
