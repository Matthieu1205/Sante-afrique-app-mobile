import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  TextInput,
  ListRenderItem,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { fetchJobs, formatDate, getAuthToken, applyToJob } from '@/services/api';
import type { ApiJob } from '@/services/api';
import { JobsListSkeleton } from '@/components/common';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';
import { PostJobModal } from './PostJobModal';
import { SubmitCVModal } from './SubmitCVModal';
import { BrowseCVsModal } from './BrowseCVsModal';

// ─── Données réelles ──────────────────────────────────────────────────────────

interface Job {
  id: string;
  title: string;
  subtitle: string;
  company: string;
  logoUrl?: string;
  location: string;
  contractType: string;
  profession: string;
  experience: string;
  date: string;
  description: string;
  detailUrl: string;
  applyUrl: string;
}

const JOBS: Job[] = [
  {
    id: '2',
    title: 'Journaliste reporter',
    subtitle: 'Stage évolutif vers CDD/CDI',
    company: 'PharmaConsults Expertise',
    location: "Abidjan, Côte d'Ivoire",
    contractType: 'Stage',
    profession: 'Journaliste Santé',
    experience: '0+',
    date: '09 jan. 2026',
    description: "Recrute un(e) journaliste stagiaire motivé(e) et créatif(ve), passionné(e) par la santé en Afrique.",
    detailUrl: 'https://santeafrique.net/offres-emploi/2',
    applyUrl: 'https://santeafrique.net/offres-emploi/2/postuler',
  },
  {
    id: '3',
    title: 'Journaliste reporter',
    subtitle: 'Pigiste / Freelance',
    company: 'PharmaConsults Expertise',
    location: "Abidjan, Côte d'Ivoire",
    contractType: 'Freelance',
    profession: 'Journaliste reporter',
    experience: '1+',
    date: '09 jan. 2026',
    description: "Recherche des journalistes pigistes pour contribuer à l'écriture de dossiers sur la santé en Afrique.",
    detailUrl: 'https://santeafrique.net/offres-emploi/3',
    applyUrl: 'https://santeafrique.net/offres-emploi/3/postuler',
  },
  {
    id: '1',
    title: 'Animatrice Parapharmacie & Social Media',
    subtitle: 'F/H',
    company: 'PESAN',
    location: "Abidjan, Côte d'Ivoire",
    contractType: 'CDD',
    profession: 'Animatrice Parapharmacie',
    experience: '1+',
    date: '28 nov. 2025',
    description: "Tu transformes un 'bonjour' en conseil utile et un conseil en vente, au sein d'une parapharmacie.",
    detailUrl: 'https://santeafrique.net/offres-emploi/1',
    applyUrl: 'https://santeafrique.net/offres-emploi/1/postuler',
  },
];

function mapJob(a: ApiJob): Job {
  return {
    id: String(a.id),
    title: a.title,
    subtitle: a.type,
    company: a.company,
    logoUrl: a.logo_url ?? undefined,
    location: a.country ? `${a.location}, ${a.country}` : a.location,
    contractType: a.type,
    profession: a.profession,
    experience: `${a.experienceMin}+`,
    date: formatDate(a.publishedAt),
    description: a.excerpt,
    detailUrl: `https://santeafrique.net/offres-emploi/${a.id}`,
    applyUrl: `https://santeafrique.net/offres-emploi/${a.id}/postuler`,
  };
}

const CONTRACT_COLORS: Record<string, string> = {
  Stage:     '#2563EB',
  CDD:       '#059669',
  CDI:       '#7C3AED',
  Freelance: '#D97706',
};

const CONTRACT_TYPES  = ['Tous', 'Stage', 'CDD', 'CDI', 'Freelance'];
const PAYS_OPTIONS    = ['Tous', "Côte d'Ivoire", 'Sénégal', 'Cameroun', 'Mali', 'Burkina Faso', 'Ghana', 'Nigeria', 'Maroc', 'Autre'];
const PROF_OPTIONS    = ['Toutes', 'Médecin', 'Pharmacien(ne)', 'Sage-femme', 'Infirmier(e)', 'Journaliste santé', 'Nutritionniste', 'Autre'];
const ENTREPRISE_OPT  = ['Toutes', 'PESAN', 'PharmaConsults Expertise'];
const EXP_OPTIONS     = ['—', '0+', '1+', '2+', '3+', '5+', '7+', '10+'];
const TRI_OPTIONS     = ['Plus récentes', 'Plus anciennes', 'A–Z'];

// ─── Styles ──────────────────────────────────────────────────────────────────

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },

  // Hero
  hero: {
    paddingHorizontal: Spacing['4'],
    paddingBottom: 0,
    paddingTop: Spacing['4'],
  },
  heroLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10, color: '#1B9DD9',
    letterSpacing: 1.5, textTransform: 'uppercase',
    marginBottom: Spacing['2'],
  },
  heroTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 28, color: '#fff',
    lineHeight: 36, marginBottom: Spacing['2'],
  },
  heroSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20, marginBottom: Spacing['4'],
  },
  heroButtons: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'],
    marginBottom: Spacing['4'],
  },
  heroBtnBlue: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1B9DD9', borderRadius: Radius.sm,
    paddingHorizontal: Spacing['3'], paddingVertical: 11, gap: 6,
  },
  heroBtnGreen: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#10B981', borderRadius: Radius.sm,
    paddingHorizontal: Spacing['3'], paddingVertical: 11, gap: 6,
  },
  heroBtnOutline: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fff',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing['3'], paddingVertical: 11, gap: 6,
  },
  heroBtnText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs, color: '#fff',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  // Stats bar
  statsBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: Spacing['5'],
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingVertical: Spacing['3'],
  },
  statItem: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  statNum: {
    fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: '#fff',
  },
  statLabel: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.65)',
  },

  // Section filtres
  filtersCard: {
    backgroundColor: C.backgroundCard,
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['4'],
    paddingBottom: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    marginBottom: Spacing['2'],
  },
  filtersTopRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: Spacing['3'],
  },
  filtersTopLeft: { flex: 1 },
  filtersMainTitle: {
    fontFamily: FontFamily.headingBold, fontSize: 18, color: C.textPrimary,
  },
  filtersSub: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: C.textMuted, marginTop: 2,
  },
  filtersCountText: {
    fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm,
    color: C.textMuted, marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.background, borderRadius: Radius.md,
    paddingHorizontal: Spacing['3'],
    borderWidth: 1, borderColor: C.borderLight,
    height: 42, gap: Spacing['2'],
  },
  searchInput: {
    flex: 1, fontFamily: FontFamily.body,
    fontSize: FontSize.sm, color: C.textPrimary,
    height: 42,
  },
  filterLabel: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 9,
    color: C.textMuted, textTransform: 'uppercase',
    letterSpacing: 0.6, marginBottom: 4,
  },
  filtersGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: Spacing['2'], marginTop: Spacing['3'],
  },
  filterItem: { width: '48%' },
  filterItemThird: { flex: 1 },
  selectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.background, borderWidth: 1, borderColor: C.borderLight,
    borderRadius: Radius.md, paddingHorizontal: Spacing['2'], height: 38,
  },
  selectBtnText: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs,
    color: C.textSecondary, flex: 1,
  },
  selectBtnTextActive: { color: C.textPrimary },
  filtreRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    gap: Spacing['2'], marginTop: Spacing['2'],
  },
  filtrerBtn: {
    backgroundColor: '#1B9DD9', borderRadius: Radius.sm,
    paddingVertical: 9, paddingHorizontal: Spacing['4'],
    marginLeft: 'auto' as any,
  },
  filtrerBtnText: {
    fontFamily: FontFamily.bodyBold, fontSize: FontSize.sm,
    color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5,
  },
  offresRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['4'], marginBottom: Spacing['3'],
  },
  offresTitle: {
    fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: C.textPrimary,
  },
  offresOnline: {
    fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted,
  },
  // Picker modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: C.backgroundCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '55%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  pickerTitle: {
    flex: 1,
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: C.textPrimary,
  },
  pickerOption: {
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  pickerOptionActive: { backgroundColor: C.primaryUltraLight },
  pickerOptionText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: C.textPrimary,
  },
  pickerOptionTextActive: {
    color: C.primary,
    fontFamily: FontFamily.bodySemiBold,
  },

  // Carte offre
  card: {
    backgroundColor: C.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing['4'],
    borderWidth: 1,
    borderColor: C.borderLight,
    marginHorizontal: Spacing['4'],
    marginBottom: Spacing['3'],
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing['3'],
  },
  companyAvatar: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: C.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing['3'],
  },
  cardInfo: { flex: 1 },
  cardTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.base,
    color: C.textPrimary,
    lineHeight: 20,
    marginBottom: 2,
  },
  cardCompany: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textMuted,
  },
  contractBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing['2'],
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  contractText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    color: C.white,
  },
  cardDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing['3'],
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing['2'],
    marginBottom: Spacing['3'],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing['2'],
    paddingVertical: 4,
  },
  metaText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: C.textSecondary,
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
    paddingTop: Spacing['3'],
  },
  cardDate: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: C.textDisabled,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing['2'],
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
    borderWidth: 1,
    borderColor: C.primary,
  },
  detailBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: C.primary,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
    gap: 4,
  },
  applyBtnText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.sm,
    color: C.white,
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: Spacing['4'],
  },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: C.textMuted,
    marginTop: Spacing['3'],
    textAlign: 'center',
  },

  // Footer
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing['4'],
    marginTop: Spacing['2'],
    marginBottom: Spacing['6'],
    paddingVertical: Spacing['3'],
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: C.primary,
    gap: Spacing['2'],
  },
  seeAllText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: C.primary,
  },
});

// ─── Composant filtre sélecteur ──────────────────────────────────────────────

const FilterSelect: React.FC<{
  title: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  styles: ReturnType<typeof makeStyles>;
  colors: ThemeColors;
}> = ({ title, options, value, onChange, styles, colors }) => {
  const [open, setOpen] = useState(false);
  const isActive = value !== options[0];
  return (
    <>
      <TouchableOpacity style={styles.selectBtn} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={[styles.selectBtnText, isActive && styles.selectBtnTextActive]} numberOfLines={1}>
          {value}
        </Text>
        <Feather name="chevron-down" size={13} color={colors.textSecondary} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Feather name="x" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.pickerOption, value === opt && styles.pickerOptionActive]}
                  onPress={() => { onChange(opt); setOpen(false); }}
                >
                  <Text style={[styles.pickerOptionText, value === opt && styles.pickerOptionTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// ─── Composant carte ─────────────────────────────────────────────────────────

const JobCard: React.FC<{
  job: Job;
  styles: ReturnType<typeof makeStyles>;
  colors: ThemeColors;
  onJobPress?: (url: string, title: string) => void;
  onApplyPress?: (url: string, title: string) => void;
}> = ({ job, styles, colors, onJobPress, onApplyPress }) => {
  const contractColor = CONTRACT_COLORS[job.contractType] ?? colors.primary;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.companyAvatar, job.logoUrl ? { overflow: 'hidden', backgroundColor: 'white' } : null]}>
          {job.logoUrl ? (
            <Image source={{ uri: job.logoUrl }} style={{ width: 46, height: 46 }} resizeMode="contain" />
          ) : (
            <Feather name="briefcase" size={22} color={colors.primary} />
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{job.title}</Text>
          <Text style={styles.cardCompany}>{job.company}</Text>
          <View style={[styles.contractBadge, { backgroundColor: contractColor }]}>
            <Text style={styles.contractText}>{job.contractType} · {job.subtitle}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>{job.description}</Text>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Feather name="map-pin" size={11} color={colors.textSecondary} />
          <Text style={styles.metaText}>{job.location}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="tag" size={11} color={colors.textSecondary} />
          <Text style={styles.metaText}>{job.profession}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="clock" size={11} color={colors.textSecondary} />
          <Text style={styles.metaText}>{job.experience} an(s) d'exp.</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>Publié le {job.date}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => onJobPress?.(job.detailUrl, job.title)}
            activeOpacity={0.8}
          >
            <Text style={styles.detailBtnText}>Voir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => onApplyPress?.(job.applyUrl, `Postuler — ${job.title}`)}
            activeOpacity={0.8}
          >
            <Text style={styles.applyBtnText}>Postuler</Text>
            <Feather name="send" size={12} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ─── Écran principal ─────────────────────────────────────────────────────────

interface JobsScreenProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onLogin?: () => void;
  onSubscribe?: () => void;
  onJobPress?: (url: string, title: string) => void;
  onApplyPress?: (url: string, title: string) => void;
  onViewCV?: (url: string, title: string) => void;
  isSubscribed?: boolean;
}

export const JobsScreen: React.FC<JobsScreenProps> = ({ onLogin, onSubscribe, onJobPress, onApplyPress, onViewCV, isSubscribed = false }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState('');
  const [activeContract, setActiveContract] = useState(CONTRACT_TYPES[0]);
  const [pays, setPays] = useState(PAYS_OPTIONS[0]);
  const [profession, setProfession] = useState(PROF_OPTIONS[0]);
  const [entreprise, setEntreprise] = useState(ENTREPRISE_OPT[0]);
  const [expMin, setExpMin] = useState(EXP_OPTIONS[0]);
  const [tri, setTri] = useState(TRI_OPTIONS[0]);
  const [showPostJob, setShowPostJob] = useState(false);
  const [showSubmitCV, setShowSubmitCV] = useState(false);
  const [showBrowseCVs, setShowBrowseCVs] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAuthToken().then((t) => { if (mounted) setIsLoggedIn(!!t); });
    fetchJobs().then((res) => {
      if (!mounted) return;
      if (res === null) {
        // API inaccessible → données statiques de secours
        setJobs(JOBS);
      } else {
        const all = [...(res.pinned ?? []), ...(res.items ?? [])];
        setJobs(all.map(mapJob));
      }
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  // Vérifie la connexion avant d'ouvrir un modal réservé
  const requireAuth = (open: () => void) => {
    if (!isLoggedIn) { onLogin?.(); return; }
    open();
  };

  const filtered = useMemo(() => {
    let list = jobs.filter((job) => {
      const matchContract = activeContract === 'Tous' || job.contractType === activeContract;
      const matchPays = pays === 'Tous' || job.location.includes(pays);
      const matchProf = profession === 'Toutes' || job.profession.toLowerCase().includes(profession.toLowerCase());
      const matchEntreprise = entreprise === 'Toutes' || job.company === entreprise;
      const matchExp = expMin === '—' || job.experience >= expMin;
      const q = query.toLowerCase();
      const matchQuery = !q
        || job.title.toLowerCase().includes(q)
        || job.company.toLowerCase().includes(q)
        || job.profession.toLowerCase().includes(q)
        || job.location.toLowerCase().includes(q);
      return matchContract && matchPays && matchProf && matchEntreprise && matchExp && matchQuery;
    });
    if (tri === 'Plus anciennes') list = [...list].reverse();
    if (tri === 'A–Z') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [jobs, query, activeContract, pays, profession, entreprise, expMin, tri]);

  const handleApply = async (job: Job) => {
    if (!isLoggedIn) { onLogin?.(); return; }
    const res = await applyToJob(job.id);
    if (res.ok) {
      Alert.alert('Candidature envoyée', `Votre candidature pour "${job.title}" a bien été enregistrée.`);
    } else if (res.alreadyApplied) {
      Alert.alert('Déjà postulé', `Vous avez déjà postulé à cette offre.`);
    } else {
      // Fallback web si l'endpoint n'est pas encore disponible
      Linking.openURL(job.applyUrl).catch(() => {});
    }
  };

  const renderJob: ListRenderItem<Job> = ({ item }) => (
    <JobCard job={item} styles={styles} colors={colors} onJobPress={onJobPress} onApplyPress={(_, __) => handleApply(item)} />
  );

  const ListHeader = (
    <>
      {/* ── Hero dark navy ── */}
      <LinearGradient
        colors={['#0D1B2E', '#152440']}
        style={[styles.hero, { paddingTop: insets.top + Spacing['4'] }]}
      >
        <Text style={styles.heroLabel}>Emploi &amp; Carrière</Text>
        <Text style={styles.heroTitle}>Votre carrière en santé commence ici</Text>
        <Text style={styles.heroSub}>
          La première plateforme panafricaine des métiers de la santé.
        </Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity
            style={styles.heroBtnBlue}
            onPress={() => requireAuth(() => setShowPostJob(true))}
            activeOpacity={0.85}
          >
            <Text style={styles.heroBtnText}>Poster une offre</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroBtnGreen}
            onPress={() => requireAuth(() => setShowSubmitCV(true))}
            activeOpacity={0.85}
          >
            <Text style={styles.heroBtnText}>Déposer mon CV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroBtnOutline}
            onPress={() => requireAuth(() => setShowBrowseCVs(true))}
            activeOpacity={0.85}
          >
            <Text style={styles.heroBtnText}>Parcourir les CV</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ── Stats bar ── */}
      <LinearGradient colors={['#152440', '#0D1B2E']} style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{loading ? '…' : jobs.length}</Text>
          <Text style={styles.statLabel}>offres actives</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>15+</Text>
          <Text style={styles.statLabel}>pays</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>200+</Text>
          <Text style={styles.statLabel}>employeurs</Text>
        </View>
      </LinearGradient>

      {/* ── Filtres ── */}
      <View style={styles.filtersCard}>
        <View style={styles.filtersTopRow}>
          <View style={styles.filtersTopLeft}>
            <Text style={styles.filtersMainTitle}>Toutes les offres d'emploi</Text>
            <Text style={styles.filtersSub}>Filtrez par pays, métier ou type de contrat.</Text>
          </View>
          {!loading && (
            <Text style={styles.filtersCountText}>
              {filtered.length} offre{filtered.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Ligne 1 : RECHERCHE pleine largeur */}
        <Text style={styles.filterLabel}>Recherche</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Poste, société, ville..."
            placeholderTextColor={colors.textDisabled}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={15} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Ligne 2 : TYPE DE CONTRAT | PAYS | PROFESSION | ENTREPRISE (2×2) */}
        <View style={styles.filtersGrid}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Type de contrat</Text>
            <FilterSelect title="Type de contrat" options={CONTRACT_TYPES}
              value={activeContract} onChange={setActiveContract} styles={styles} colors={colors} />
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Pays</Text>
            <FilterSelect title="Pays" options={PAYS_OPTIONS}
              value={pays} onChange={setPays} styles={styles} colors={colors} />
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Profession</Text>
            <FilterSelect title="Profession" options={PROF_OPTIONS}
              value={profession} onChange={setProfession} styles={styles} colors={colors} />
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Entreprise</Text>
            <FilterSelect title="Entreprise" options={ENTREPRISE_OPT}
              value={entreprise} onChange={setEntreprise} styles={styles} colors={colors} />
          </View>
        </View>

        {/* Ligne 3 : EXP. MIN. | TRI | FILTRER -->  */}
        <View style={styles.filtreRow}>
          <View style={styles.filterItemThird}>
            <Text style={styles.filterLabel}>Exp. min.</Text>
            <FilterSelect title="Expérience min." options={EXP_OPTIONS}
              value={expMin} onChange={setExpMin} styles={styles} colors={colors} />
          </View>
          <View style={styles.filterItemThird}>
            <Text style={styles.filterLabel}>Tri</Text>
            <FilterSelect title="Trier par" options={TRI_OPTIONS}
              value={tri} onChange={setTri} styles={styles} colors={colors} />
          </View>
          <TouchableOpacity style={styles.filtrerBtn} activeOpacity={0.85}>
            <Text style={styles.filtrerBtnText}>Filtrer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Résultats count ── */}
      <View style={styles.offresRow}>
        <Text style={styles.offresTitle}>
          {filtered.length} offre{filtered.length > 1 ? 's' : ''}
        </Text>
        <Text style={styles.offresOnline}>résultat{filtered.length > 1 ? 's' : ''}</Text>
      </View>
    </>
  );

  const ListFooter = (
    <TouchableOpacity
      style={styles.seeAllBtn}
      onPress={() => Linking.openURL('https://santeafrique.net/offres-emploi/')}
      activeOpacity={0.8}
    >
      <Text style={styles.seeAllText}>Voir sur santeafrique.net</Text>
      <Feather name="external-link" size={15} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B9DD9" />

      <PostJobModal visible={showPostJob} onClose={() => setShowPostJob(false)} onSubscribe={onSubscribe} />
      <SubmitCVModal visible={showSubmitCV} onClose={() => setShowSubmitCV(false)} />
      <BrowseCVsModal
        visible={showBrowseCVs}
        onClose={() => setShowBrowseCVs(false)}
        onPostJob={() => setShowPostJob(true)}
        onViewCV={onViewCV}
        onSubscribe={onSubscribe}
        isSubscribed={isSubscribed}
      />

      {loading ? (
        <JobsListSkeleton />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderJob}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="briefcase" size={40} color={colors.textDisabled} />
              <Text style={styles.emptyText}>Aucune offre ne correspond{'\n'}à votre recherche</Text>
            </View>
          }
        />
      )}
    </View>
  );
};
