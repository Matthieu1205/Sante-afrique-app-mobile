import type { Article } from "@/components/common";
import { ArticleCard, ArticleDetailSkeleton, ArticleTypeBadge, CategoryBadge } from "@/components/common";
import { FontFamily, FontSize, Radius, Spacing } from "@/theme";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemeColors } from "@/contexts/ThemeContext";
import { fetchArticleDetail, fetchArticlesByRubrique, formatDate, getImageUrl } from "@/services/api";
import { trackArticleRead } from "@/services/history";
import { addBookmark, categoryLabel, isBookmarked, removeBookmark, typeLabel } from "@/services/bookmarks";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from "react";
import WebView from 'react-native-webview';
import {
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

function chunkText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxLen, text.length);
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('. ', end);
      if (lastPeriod > start + maxLen / 2) end = lastPeriod + 2;
      else {
        const lastSpace = text.lastIndexOf(' ', end);
        if (lastSpace > start) end = lastSpace + 1;
      }
    }
    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    start = end;
  }
  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
}

interface ArticleDetail extends Article {
  author: string;
  readingTime: number;
  content: string[];
  tags: string[];
  canonicalUrl?: string;
  rawBody?: string;
  isPremiumContent?: boolean;
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
  onLoginPress?: () => void;
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

  // ── Paywall ──────────────────────────────────────────────────────
  paywallWrap: {
    marginTop: -32,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  paywallGradient: {
    paddingTop: 48,
    paddingBottom: Spacing["5"],
    paddingHorizontal: Spacing["4"],
    alignItems: 'center',
    gap: Spacing["3"],
  },
  paywallIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing["1"],
  },
  paywallTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: C.textPrimary,
    textAlign: 'center',
  },
  paywallSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  paywallBtnPrimary: {
    width: '100%',
    backgroundColor: '#1B9DD9',
    borderRadius: Radius.sm,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: Spacing["2"],
  },
  paywallBtnPrimaryText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.sm,
    color: '#fff',
    letterSpacing: 0.5,
  },
  paywallBtnOutline: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: Radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  paywallBtnOutlineText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: C.textPrimary,
  },
});

// ─── Rendu HTML du corps de l'article ────────────────────────────

const ArticleBodyWebView: React.FC<{
  html: string;
  isDark: boolean;
  fontScale: number;
}> = React.memo(({ html, isDark, fontScale }) => {
  const [height, setHeight] = useState(200);

  const basePx   = Math.round(16 * fontScale);
  const textClr  = isDark ? '#D1D5DB' : '#374151';
  const titleClr = isDark ? '#F9FAFB' : '#111827';
  const quoteClr = isDark ? '#9CA3AF' : '#6B7280';
  const quoteBg  = isDark ? '#374151' : '#F0F9FF';
  const borderClr= isDark ? '#374151' : '#E5E7EB';
  const thBg     = isDark ? '#374151' : '#F3F4F6';

  const css = `
    * { max-width: 100%; box-sizing: border-box; }
    body {
      font-family: -apple-system, system-ui, sans-serif !important;
      font-size: ${basePx}px;
      color: ${textClr};
      line-height: 1.75;
      margin: 0; padding: 0 4px 16px 4px;
      background: transparent;
      word-wrap: break-word;
      -webkit-text-size-adjust: none;
    }
    p { margin: 0.75em 0; }
    h2 { font-size: 1.25em; font-weight: 700; color: ${titleClr}; margin: 1.2em 0 0.5em; }
    h3 { font-size: 1.1em;  font-weight: 600; color: ${titleClr}; margin: 1em 0 0.4em;  }
    img { max-width: 100% !important; height: auto !important; border-radius: 8px; display: block; margin: 12px auto; }
    a { color: #1B9DD9; }
    blockquote {
      border-left: 3px solid #1B9DD9;
      margin: 1em 0; padding: 0.5em 1em;
      color: ${quoteClr}; font-style: italic;
      background: ${quoteBg}; border-radius: 0 6px 6px 0;
    }
    ul, ol { padding-left: 1.4em; }
    li { margin: 0.4em 0; }
    strong, b { font-weight: 700; }
    em, i { font-style: italic; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
    td, th { padding: 8px; border: 1px solid ${borderClr}; }
    th { background: ${thBg}; font-weight: 600; }
    hr { border: none; border-top: 1px solid ${borderClr}; margin: 1.5em 0; }
  `;

  // Supprime les font-family inline (Word/CKEditor) et mesure la hauteur
  const js = `
    (function() {
      var els = document.querySelectorAll('[style]');
      for (var i = 0; i < els.length; i++) {
        els[i].style.fontFamily = '';
        els[i].style.lineHeight = '';
      }
      function sendH() {
        window.ReactNativeWebView.postMessage(String(document.body.scrollHeight));
      }
      var imgs = document.querySelectorAll('img');
      if (imgs.length === 0) { sendH(); return; }
      var done = 0;
      function onImg() { if (++done >= imgs.length) sendH(); }
      for (var j = 0; j < imgs.length; j++) {
        if (imgs[j].complete) onImg();
        else { imgs[j].addEventListener('load', onImg); imgs[j].addEventListener('error', onImg); }
      }
      setTimeout(sendH, 1500);
    })();
    true;
  `;

  const source = {
    html: `<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
      <style>${css}</style>
    </head><body>${html}</body></html>`,
    baseUrl: 'https://api.santeafrique.net',
  };

  return (
    <WebView
      source={source}
      scrollEnabled={false}
      style={{ height, backgroundColor: 'transparent' }}
      onMessage={(e) => setHeight(parseInt(e.nativeEvent.data) + 32)}
      injectedJavaScript={js}
      onShouldStartLoadWithRequest={(req) => {
        if (req.url !== 'about:blank' && !req.url.startsWith('data:')) {
          Linking.openURL(req.url);
          return false;
        }
        return true;
      }}
    />
  );
});

export const ArticleDetailScreen: React.FC<ArticleDetailScreenProps> = ({
  articleId,
  article: articleProp = MOCK_DETAIL,
  onBack,
  onArticlePress,
  isSubscriber = false,
  onSubscribePress,
  onLoginPress,
}) => {
  const { colors, fontScale, isDark } = useTheme();
  const styles = makeStyles(colors, fontScale);
  const [bookmarked, setBookmarked] = useState(false);
  const [article, setArticle] = useState<ArticleDetail>(articleProp);
  const [loading, setLoading] = useState(!!articleId);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>(RELATED_ARTICLES);

  const chunksRef = useRef<string[]>([]);
  const chunkIdxRef = useRef(0);
  const speedRef = useRef(1);
  const speakNext = useRef<((idx: number) => void) | undefined>(undefined);

  speakNext.current = (idx: number) => {
    const chunks = chunksRef.current;
    if (idx >= chunks.length) { setAudioPlaying(false); return; }
    chunkIdxRef.current = idx;
    Speech.speak(chunks[idx], {
      language: 'fr-FR',
      rate: speedRef.current * 0.88,
      onDone: () => speakNext.current!(idx + 1),
      onStopped: () => {},
      onError: () => setAudioPlaying(false),
    });
  };

  const articleUrl = article.canonicalUrl ?? `https://santeafrique.net/articles/${article.id}`;

  const toggleAudio = async () => {
    if (audioPlaying) {
      await Speech.stop();
      setAudioPlaying(false);
    } else {
      const rawText = [article.title, ...article.content].join('. ');
      chunksRef.current = chunkText(rawText, 3000);
      chunkIdxRef.current = 0;
      setAudioPlaying(true);
      speakNext.current!(0);
    }
  };

  const stopAudio = async () => {
    chunksRef.current = [];
    await Speech.stop();
    setAudioPlaying(false);
  };

  const handleSpeedChange = async (newSpeed: number) => {
    speedRef.current = newSpeed;
    setAudioSpeed(newSpeed);
    if (audioPlaying) {
      await Speech.stop();
      speakNext.current!(chunkIdxRef.current);
    }
  };

  useEffect(() => {
    return () => { chunksRef.current = []; Speech.stop(); };
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
      const categorySlug = res.category?.slug ?? 'actualites';
      setArticle({
        id: String(res.id),
        title: res.title,
        category: categorySlug,
        date: formatDate(res.published_at),
        imageUrl: getImageUrl(res) ?? undefined,
        hasAudio: false,
        author: res.author,
        readingTime: estimateReadingTime(res.body),
        content: htmlToText(res.body),
        tags: res.tags ?? [],
        canonicalUrl: res.canonical,
        rawBody: res.body,
        isPremiumContent: (res.is_locked ?? res.is_premium) ?? false,
      });
      setLoading(false);
      trackArticleRead({
        id: String(res.id),
        title: res.title,
        category: res.category?.slug ?? 'actualites',
        imageUrl: getImageUrl(res) ?? undefined,
      });

      // Charge les articles similaires de la même catégorie
      fetchArticlesByRubrique(categorySlug, 1).then((similar) => {
        if (!mounted || !similar?.data?.length) return;
        const mapped = similar.data
          .filter((a) => String(a.id) !== articleId)
          .slice(0, 3)
          .map((a) => ({
            id: String(a.id),
            title: a.title,
            category: (a.category?.slug ?? 'actualites').replace(/-/g, '_') as Article['category'],
            date: formatDate(a.published_at),
            imageUrl: getImageUrl(a) ?? undefined,
          }));
        if (mapped.length > 0) setRelatedArticles(mapped);
      });
    });
    return () => { mounted = false; };
  }, [articleId]);

  if (loading) {
    return <ArticleDetailSkeleton />;
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

          {(
            <AudioBar
              isPlaying={audioPlaying}
              onToggle={toggleAudio}
              onStop={stopAudio}
              readingTime={article.readingTime}
              speed={audioSpeed}
              onSpeedChange={handleSpeedChange}
            />
          )}

          {(() => {
            const isLocked = (article.isPremiumContent ?? article.isPremium) && !isSubscriber;
            if (isLocked) {
              // Affiche les 2 premiers paragraphes puis le paywall
              const preview = article.content.slice(0, 2);
              return (
                <>
                  {preview.map((paragraph, i) => (
                    <Text key={i} style={styles.paragraph}>{paragraph}</Text>
                  ))}
                  <View style={styles.paywallWrap}>
                    <LinearGradient
                      colors={[`${colors.backgroundCard}00`, colors.backgroundCard]}
                      style={{ height: 48, marginBottom: -1 }}
                    />
                    <View style={styles.paywallGradient}>
                      <View style={styles.paywallIcon}>
                        <Feather name="lock" size={22} color={colors.primary} />
                      </View>
                      <Text style={styles.paywallTitle}>Contenu réservé aux abonnés</Text>
                      <Text style={styles.paywallSub}>
                        Abonnez-vous pour accéder à l'intégralité de cet article et à tous les contenus Santé Afrique.
                      </Text>
                      <TouchableOpacity style={styles.paywallBtnPrimary} onPress={onSubscribePress} activeOpacity={0.85}>
                        <Text style={styles.paywallBtnPrimaryText}>S'abonner — À partir de 1 250 FCFA/mois</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.paywallBtnOutline} onPress={onLoginPress} activeOpacity={0.8}>
                        <Text style={styles.paywallBtnOutlineText}>J'ai déjà un compte</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              );
            }
            return article.rawBody ? (
              <ArticleBodyWebView html={article.rawBody} isDark={isDark} fontScale={fontScale} />
            ) : (
              article.content.map((paragraph, i) => (
                <Text key={i} style={styles.paragraph}>{paragraph}</Text>
              ))
            );
          })()}

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
          {relatedArticles.map((rel) => (
            <ArticleCard key={rel.id} article={rel} onPress={() => onArticlePress?.(rel.id)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
