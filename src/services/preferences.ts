import AsyncStorage from '@react-native-async-storage/async-storage';

const TOPICS_KEY   = 'settings_topics_v1';
const COUNTRY_KEY  = 'settings_country_v1';
const DEFAULT_TOPICS = ['actualites', 'dossiers', 'vaccination'];

// Mapping settings-id → slug CAT_CONFIG (underscores)
export const TOPIC_TO_SLUG: Record<string, string> = {
  actualites:    'actualites',
  dossiers:      'dossier',
  conseils:      'conseils_pratiques',
  sante_mentale: 'sante_mentale',
  vaccination:   'vaccination',
  nutrition:     'nutrition_infantile',
  maternelle:    'sante_maternelle',
  business:      'business_sante',
  one_health:    'one_health',
};

/** Retourne les slugs CAT_CONFIG des thèmes choisis par l'utilisateur. */
export async function getPreferredSlugs(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(TOPICS_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : DEFAULT_TOPICS;
    return ids.map((id) => TOPIC_TO_SLUG[id] ?? id).filter(Boolean);
  } catch {
    return DEFAULT_TOPICS.map((id) => TOPIC_TO_SLUG[id] ?? id);
  }
}

export async function savePreferredSlugs(ids: string[]): Promise<void> {
  try { await AsyncStorage.setItem(TOPICS_KEY, JSON.stringify(ids)); } catch {}
}

export async function getPreferredCountry(): Promise<string> {
  try { return (await AsyncStorage.getItem(COUNTRY_KEY)) ?? 'ci'; } catch { return 'ci'; }
}

export async function savePreferredCountry(code: string): Promise<void> {
  try { await AsyncStorage.setItem(COUNTRY_KEY, code); } catch {}
}
