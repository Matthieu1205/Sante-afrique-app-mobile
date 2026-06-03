import type { Article } from "@/components/common";
import { ArticleCard, ArticleTypeBadge, CategoryBadge } from "@/components/common";
import { FontFamily, FontSize, Radius, Spacing } from "@/theme";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemeColors } from "@/contexts/ThemeContext";
import { fetchArticleDetail, formatDate, getImageUrl } from "@/services/api";
import { addBookmark, categoryLabel, isBookmarked, removeBookmark, typeLabel } from "@/services/bookmarks";
import { Feather } from "@expo/vector-icons";
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_WIDTH * 0.75;

function decodeEntities(text: string): string {
  return text
    // Entités numériques &#123; et &#xA9;
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    // Entités nommées communes
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”').replace(/&ldquo;/g, '“')
    .replace(/&hellip;/g, '…').replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–').replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»').replace(/&apos;/g, "'")
    // Lettres accentuées françaises
    .replace(/&eacute;/g, 'é').replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê').replace(/&euml;/g, 'ë')
    .replace(/&agrave;/g, 'à').replace(/&acirc;/g, 'â')
    .replace(/&ugrave;/g, 'ù').replace(/&ucirc;/g, 'û')
    .replace(/&uuml;/g, 'ü').replace(/&ocirc;/g, 'ô')
    .replace(/&ouml;/g, 'ö').replace(/&iuml;/g, 'ï')
    .replace(/&icirc;/g, 'î').replace(/&ccedil;/g, 'ç')
    .replace(/&Eacute;/g, 'É').replace(/&Egrave;/g, 'È')
    .replace(/&Ecirc;/g, 'Ê').replace(/&Agrave;/g, 'À')
    .replace(/&Ccedil;/g, 'Ç').replace(/&Ocirc;/g, 'Ô');
}

function htmlToText(html: string): string[] {
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
  return clean
    .split(/<\/p>|<\/h[1-6]>|<br\s*\/?>/gi)
    .map(p => decodeEntities(p.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 10);
}

function estimateReadingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

interface ArticleDetail extends Article {
  author: string;
  readingTime: number;
  content: string[];
  tags: string[];
  canonicalUrl?: string;
}

const MOCK_DETAIL: ArticleDetail = {
  id: "h1",
  title: "Paludisme 2026 : les nouvelles stratégies de l'OMS pour réduire la mortalité infantile en Afrique",
  category: "actualites",
  articleType: "actualite",
  date: "25 avr. 2026",
  hasAudio: true,
  isPremium: false,
  author: "Dr Ibrahim Coulibaly",
  readingTime: 4,
  content: [
    "Le paludisme demeure l'une des maladies infectieuses les plus meurtrières en Afrique subsaharienne. Selon le dernier rapport de l'Organisation mondiale de la Santé (OMS), la région enregistre chaque année plus de 200 millions de cas, dont la grande majorité concerne des enfants de moins de cinq ans.",
    "En 2026, l'OMS a déployé un nouveau protocole de traitement basé sur la combinaison thérapeutique à base d'artémisinine (CTA) de deuxième génération, montrant une efficacité accrue contre les souches résistantes identifiées en Afrique de l'Ouest.",
    '"Nous observons une résistance croissante aux traitements conventionnels dans plusieurs zones du Burkina Faso et du Mali", a déclaré le Dr Ibrahim Coulibaly, épidémiologiste à l\'Institut National de Santé Publique d\'Abidjan. "Cette nouvelle combinaison offre un espoir réel pour les populations les plus vulnérables."',
    "Le programme inclut également un volet préventif majeur : distribution de moustiquaires imprégnées d'insecticide de longue durée (MIILD), pulvérisations intradomiciliaires à grande échelle, et sensibilisation communautaire en langues locales.",
    "Les résultats préliminaires dans les zones pilotes de Côte d'Ivoire et du Sénégal montrent une réduction de 34 % des hospitalisations pédiatriques liées au paludisme sur les six premiers mois d'application du protocole.",
    "Cette initiative s'inscrit dans le cadre du plan stratégique mondial de l'OMS contre le paludisme (2021-2030), qui vise une réduction d'au moins 90 % de l'incidence et de la mortalité d'ici la fin de la décennie. Un objectif ambitieux, mais selon les experts, atteignable à condition d'un financement pérenne et d'une volonté politique affirmée des gouvernements africains.",
  ],
  tags: ["#paludisme", "#OMS", "#AfriqueOuest", "#santé2026", "#pédiatrie"],
  canonicalUrl: 'https://santeafrique.net',
};

const RELATED_ARTICLES: Article[] = [
  { id: "r1", title: "Choléra au Sahel : les mesures d'urgence qui sauvent des vies", category: "actualites", articleType: "actualite", date: "23 avr.", hasAudio: false },
  { id: "r2", title: "Vaccination anti-paludique RTS,S : bilan après 2 ans de déploiement", category: "vaccination", articleType: "vaccination", date: "18 avr.", hasAudio: true },
  { id: "r3", title: "Moustiquaires MIILD : l'enjeu de la distribution au dernier kilomètre", category: "conseils_pratiques", articleType: "conseil_pratique", date: "14 avr.", hasAudio: false },
];

const makeAudioStyles = (C: ThemeColors) => StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.primaryUltraLight,
    borderRadius: Radius.md,
    padding: Spacing["3"],
    gap: Spacing["3"],
    overflow: "hidden",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, gap: 2 },
  label: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: C.primaryDark },
  duration: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: C.primaryLight,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: C.primary },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  speedBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: C.primaryLight,
  },
  speedBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  speedText: { fontFamily: FontFamily.bodySemiBold, fontSize: 10, color: C.textMuted },
  speedTextActive: { color: '#FFFFFF' },
  stopBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.primaryLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});

interface AudioBarProps {
  isPlaying: boolean;
  onToggle: () => void;
  onStop: () => void;
  readingTime: number;
  speed: number;
  onSpeedChange: (s: number) => void;
}

const SPEEDS = [0.75, 1, 1.25];

const AudioBar: React.FC<AudioBarProps> = ({ isPlaying, onToggle, onStop, readingTime, speed, onSpeedChange }) => {
  const { colors } = useTheme();
  const audioStyles = makeAudioStyles(colors);
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSec = readingTime * 60;

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setElapsedSec((s) => Math.min(s + 1, totalSec));
      }, 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      // Don't reset on pause — memorize position
    }
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [isPlaying]);

  const handleStop = () => {
    setElapsedSec(0);
    onStop();
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = totalSec > 0 ? Math.min(elapsedSec / totalSec, 1) : 0;

  return (
    <View style={audioStyles.bar}>
      <TouchableOpacity style={audioStyles.iconBtn} onPress={onToggle} activeOpacity={0.8}>
        <Feather name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
      </TouchableOpacity>
      <View style={audioStyles.info}>
        <Text style={audioStyles.label}>
          {isPlaying ? "Lecture en cours…" : elapsedSec > 0 ? "En pause" : "Écouter l'article"}
        </Text>
        <Text style={audioStyles.duration}>
          {elapsedSec > 0 || isPlaying
            ? `${fmt(elapsedSec)} / ${fmt(totalSec)}`
            : `${readingTime} min de lecture`}
        </Text>
      </View>
      <View style={audioStyles.controls}>
        {SPEEDS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[audioStyles.speedBtn, speed === s && audioStyles.speedBtnActive]}
            onPress={() => onSpeedChange(s)}
            activeOpacity={0.7}
          >
            <Text style={[audioStyles.speedText, speed === s && audioStyles.speedTextActive]}>
              {s === 1 ? '1×' : `${s}×`}
            </Text>
          </TouchableOpacity>
        ))}
        {(isPlaying || elapsedSec > 0) && (
          <TouchableOpacity style={audioStyles.stopBtn} onPress={handleStop} activeOpacity={0.8}>
            <Feather name="square" size={14} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={audioStyles.progressTrack}>
        <View style={[audioStyles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const makeShareBarStyles = (C: ThemeColors) => StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
    paddingTop: Spacing["3"],
    paddingBottom: Spacing["2"],
    gap: Spacing["2"],
  },
  label: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: C.textMuted },
  row: { flexDirection: 'row', gap: Spacing["2"] },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  btnLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm },
  whatsapp: { backgroundColor: '#25D366', borderColor: '#25D366' },
  facebook: { backgroundColor: '#1877F2', borderColor: '#1877F2' },
  nativeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.background,
  },
  nativeBtnLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: C.textSecondary },
});

const ShareBar: React.FC<{ title: string; url: string }> = ({ title, url }) => {
  const { colors } = useTheme();
  const s = makeShareBarStyles(colors);

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${title}\n${url}`);
    Linking.openURL(`whatsapp://send?text=${text}`).catch(() =>
      Linking.openURL(`https://wa.me/?text=${text}`)
    );
  };

  const shareFacebook = () => {
    Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  };

  const shareNative = () => {
    Share.share({ title, message: `${title}\n${url}`, url });
  };

  return (
    <View style={s.container}>
      <Text style={s.label}>Partager cet article</Text>
      <View style={s.row}>
        <TouchableOpacity style={[s.btn, s.whatsapp]} onPress={shareWhatsApp} activeOpacity={0.8}>
          <Feather name="message-circle" size={16} color="#fff" />
          <Text style={[s.btnLabel, { color: '#fff' }]}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.facebook]} onPress={shareFacebook} activeOpacity={0.8}>
          <Feather name="facebook" size={16} color="#fff" />
          <Text style={[s.btnLabel, { color: '#fff' }]}>Facebook</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={s.nativeBtn} onPress={shareNative} activeOpacity={0.8}>
        <Feather name="share-2" size={16} color={colors.textSecondary} />
        <Text style={s.nativeBtnLabel}>Plus d'options de partage</Text>
      </TouchableOpacity>
    </View>
  );
};

interface ArticleDetailScreenProps {
  articleId?: string;
  article?: ArticleDetail;
  onBack: () => void;
  onArticlePress?: (articleId: string) => void;
  isSubscriber?: boolean;
  onSubscribePress?: () => void;
}

const makeStyles = (C: ThemeColors, fontScale = 1) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.backgroundCard },
  navBar: {
    position: "absolute",
    top: 44,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing["4"],
    zIndex: 10,
  },
  navRight: { flexDirection: "row", gap: Spacing["2"] },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  heroPlaceholder: { width: SCREEN_WIDTH, height: HERO_HEIGHT, backgroundColor: C.backgroundNavy, alignItems: "center", justifyContent: "center" },
  heroPlaceholderText: { fontSize: 48, opacity: 0.3 },
  articleBody: { paddingHorizontal: Spacing["4"], paddingTop: Spacing["4"], gap: Spacing["3"] },
  title: { fontFamily: FontFamily.headingBold, fontSize: FontSize["2xl"], color: C.textPrimary, lineHeight: FontSize["2xl"] * 1.25, letterSpacing: -0.3 },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 },
  metaSep: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textDisabled },
  metaText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted },
  authorRow: { flexDirection: "row", alignItems: "center", gap: Spacing["2"] },
  authorAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.primaryUltraLight, alignItems: "center", justifyContent: "center" },
  authorAvatarText: { fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: C.primary },
  authorName: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: C.textSecondary },
  separator: { height: 1, backgroundColor: C.borderLight, marginVertical: Spacing["2"] },
  paragraph: { fontFamily: FontFamily.body, fontSize: FontSize.md * fontScale, color: C.textSecondary, lineHeight: FontSize.md * fontScale * 1.7 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: Spacing["2"], paddingBottom: Spacing["2"] },
  tag: { backgroundColor: C.background, borderRadius: Radius.sm, paddingHorizontal: Spacing["2"], paddingVertical: 4, borderWidth: 1, borderColor: C.border },
  tagText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted },
  relatedSection: { marginTop: Spacing["4"], borderTopWidth: 4, borderTopColor: C.background },
  relatedTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: C.textPrimary, paddingHorizontal: Spacing["4"], paddingVertical: Spacing["3"] },
});

export const ArticleDetailScreen: React.FC<ArticleDetailScreenProps> = ({
  articleId,
  article: articleProp = MOCK_DETAIL,
  onBack,
  onArticlePress,
  isSubscriber: _isSubscriber = false,
  onSubscribePress: _onSubscribePress,
}) => {
  const { colors, fontScale } = useTheme();
  const styles = makeStyles(colors, fontScale);
  const [bookmarked, setBookmarked] = useState(false);
  const [article, setArticle] = useState<ArticleDetail>(articleProp);
  const [loading, setLoading] = useState(!!articleId);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);

  const articleUrl = article.canonicalUrl ?? `https://santeafrique.net/articles/${article.id}`;

  const toggleAudio = async () => {
    if (audioPlaying) {
      await Speech.stop();
      setAudioPlaying(false);
    } else {
      const text = [article.title, ...article.content].join('. ');
      Speech.speak(text, {
        language: 'fr-FR',
        rate: audioSpeed * 0.88,
        onStart: () => setAudioPlaying(true),
        onDone: () => setAudioPlaying(false),
        onStopped: () => setAudioPlaying(false),
        onError: () => setAudioPlaying(false),
      });
    }
  };

  const stopAudio = async () => {
    await Speech.stop();
    setAudioPlaying(false);
  };

  const handleSpeedChange = async (newSpeed: number) => {
    setAudioSpeed(newSpeed);
    if (audioPlaying) {
      await Speech.stop();
      const text = [article.title, ...article.content].join('. ');
      Speech.speak(text, {
        language: 'fr-FR',
        rate: newSpeed * 0.88,
        onStart: () => setAudioPlaying(true),
        onDone: () => setAudioPlaying(false),
        onStopped: () => setAudioPlaying(false),
        onError: () => setAudioPlaying(false),
      });
    }
  };

  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);

  useEffect(() => {
    isBookmarked(article.id).then(setBookmarked);
  }, [article.id]);

  const toggleBookmark = async () => {
    if (bookmarked) {
      await removeBookmark(article.id);
      setBookmarked(false);
    } else {
      await addBookmark({
        id: article.id,
        title: article.title,
        category: categoryLabel(article.category),
        date: article.date,
        readTime: `${article.readingTime} min`,
        type: typeLabel(article.articleType),
        imageUrl: article.imageUrl,
      });
      setBookmarked(true);
    }
  };

  const handleShare = () => {
    Share.share({ title: article.title, message: `${article.title}\n${articleUrl}`, url: articleUrl });
  };

  useEffect(() => {
    if (!articleId) return;
    let mounted = true;
    setLoading(true);
    fetchArticleDetail(articleId).then((res) => {
      if (!mounted || !res) { setLoading(false); return; }
      setArticle({
        id: String(res.id),
        title: res.title,
        category: res.category?.slug ?? 'actualites',
        date: formatDate(res.published_at),
        imageUrl: getImageUrl(res) ?? undefined,
        hasAudio: false,
        author: res.author,
        readingTime: estimateReadingTime(res.body),
        content: htmlToText(res.body),
        tags: res.tags ?? [],
        canonicalUrl: res.canonical,
      });
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [articleId]);

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.navBtn} onPress={handleShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="share-2" size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={toggleAudio} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name={audioPlaying ? "pause" : "volume-2"} size={22} color={audioPlaying ? colors.primary : colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={toggleBookmark} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="bookmark" size={22} color={bookmarked ? colors.primary : colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {article.imageUrl ? (
          <View style={[styles.heroPlaceholder, { overflow: 'hidden' }]}>
            <Image
              source={{ uri: article.imageUrl }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, width: SCREEN_WIDTH, height: HERO_HEIGHT }}
              resizeMode="cover"
            />
          </View>
        ) : (
          <View style={styles.heroPlaceholder} />
        )}

        <View style={styles.articleBody}>
          {article.articleType && <ArticleTypeBadge type={article.articleType} />}
          <Text style={styles.title}>{article.title}</Text>

          <View style={styles.meta}>
            <CategoryBadge category={article.category} />
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.metaText}>{article.date}</Text>
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.metaText}>{article.readingTime} min de lecture</Text>
          </View>

          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>{article.author.charAt(0)}</Text>
            </View>
            <Text style={styles.authorName}>Par {article.author}</Text>
          </View>

          <View style={styles.separator} />

          {article.hasAudio && (
            <AudioBar
              isPlaying={audioPlaying}
              onToggle={toggleAudio}
              onStop={stopAudio}
              readingTime={article.readingTime}
              speed={audioSpeed}
              onSpeedChange={handleSpeedChange}
            />
          )}

          {article.content.map((paragraph, i) => (
            <Text key={i} style={styles.paragraph}>{paragraph}</Text>
          ))}

          <ShareBar title={article.title} url={articleUrl} />

          <View style={styles.tags}>
            {article.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Articles similaires</Text>
          {RELATED_ARTICLES.map((rel) => (
            <ArticleCard key={rel.id} article={rel} onPress={() => onArticlePress?.(rel.id)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
