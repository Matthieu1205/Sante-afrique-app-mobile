import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';
import { fetchArticles, formatDate } from '@/services/api';
import { markAllRead, isRead } from '@/services/notifications';

interface NotificationsScreenProps {
  onBack?: () => void;
  onArticlePress?: (id: string) => void;
  onUnreadChange?: (count: number) => void;
}

type Tab = 'alerts' | 'settings';
type FeatherName = React.ComponentProps<typeof Feather>['name'];

interface NotifItem {
  id: string;
  title: string;
  time: string;
  category: string;
  read: boolean;
  icon: FeatherName;
}

interface TopicData {
  id: string; label: string; sublabel: string; icon: FeatherName;
}

const ALERT_TOPICS: TopicData[] = [
  { id: 'breaking',    label: 'Alertes urgentes',  sublabel: 'Épidémies, crises sanitaires',   icon: 'alert-triangle' },
  { id: 'actualites',  label: 'Actualités santé',  sublabel: 'Nouvelles quotidiennes',          icon: 'file-text'      },
  { id: 'vaccination', label: 'Vaccination',        sublabel: 'Campagnes et rappels',            icon: 'thermometer'    },
  { id: 'dossiers',    label: 'Nouveaux dossiers',  sublabel: 'Publications hebdomadaires',      icon: 'clipboard'      },
  { id: 'business',    label: 'Business Santé',     sublabel: 'Marché et innovations',           icon: 'briefcase'      },
  { id: 'evenements',  label: 'Événements',          sublabel: 'Conférences et formations',       icon: 'calendar'       },
];

const CATEGORY_ICONS: Record<string, FeatherName> = {
  'business-sante':      'briefcase',
  'vaccination':         'thermometer',
  'sante-maternelle':    'heart',
  'one-health':          'feather',
  'sante-mentale':       'activity',
  'nutrition-infantile': 'droplet',
  'les-odd':             'globe',
  'equite-acces':        'sliders',
  'conseils-pratiques':  'zap',
  'dossier':             'clipboard',
  'actualites':          'file-text',
};

function iconForCategory(slug: string): FeatherName {
  return CATEGORY_ICONS[slug] ?? 'bell';
}

function relativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Il y a moins d\'1h';
    if (h < 24) return `Il y a ${h}h`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'Hier';
    if (d < 7) return `Il y a ${d} jours`;
    return formatDate(dateStr);
  } catch { return ''; }
}

// ─── Styles ───────────────────────────────────────────────────────

const makeNotifStyle = (C: ThemeColors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    backgroundColor: C.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    gap: Spacing['3'],
  },
  rowUnread: { backgroundColor: C.primaryUltraLight },
  dot: {
    position: 'absolute',
    left: 10,
    top: 22,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.primary,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: C.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing['1'],
  },
  content: { flex: 1, gap: 4 },
  title: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textSecondary, lineHeight: 20 },
  titleUnread: { fontFamily: FontFamily.bodySemiBold, color: C.textPrimary },
  meta: { flexDirection: 'row', alignItems: 'center' },
  category: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.primary },
  sep: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textDisabled },
  time: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textDisabled },
});

const NotifRow: React.FC<{ item: NotifItem; onPress: () => void }> = ({ item, onPress }) => {
  const { colors } = useTheme();
  const s = makeNotifStyle(colors);
  return (
    <TouchableOpacity style={[s.row, !item.read && s.rowUnread]} onPress={onPress} activeOpacity={0.75}>
      {!item.read && <View style={s.dot} />}
      <View style={s.iconWrap}>
        <Feather name={item.icon} size={20} color={colors.textSecondary} />
      </View>
      <View style={s.content}>
        <Text style={[s.title, !item.read && s.titleUnread]} numberOfLines={2}>{item.title}</Text>
        <View style={s.meta}>
          <Text style={s.category}>{item.category}</Text>
          <Text style={s.sep}> · </Text>
          <Text style={s.time}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const makeTopicStyle = (C: ThemeColors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    backgroundColor: C.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    gap: Spacing['3'],
  },
  iconWrap: {
    width: 36, height: 36,
    borderRadius: Radius.sm,
    backgroundColor: C.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1 },
  label: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: C.textPrimary },
  sub: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted },
});

const TopicRow: React.FC<{ topic: TopicData; enabled: boolean; onToggle: () => void }> = ({ topic, enabled, onToggle }) => {
  const { colors } = useTheme();
  const s = makeTopicStyle(colors);
  return (
    <View style={s.row}>
      <View style={s.iconWrap}>
        <Feather name={topic.icon} size={18} color={colors.textSecondary} />
      </View>
      <View style={s.textBlock}>
        <Text style={s.label}>{topic.label}</Text>
        <Text style={s.sub}>{topic.sublabel}</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={enabled ? colors.primary : colors.white}
      />
    </View>
  );
};

const makeStyles = (C: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.backgroundCard,
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    ...Shadows.header,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing['2'] },
  headerTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.lg, color: C.textPrimary },
  headerBadge: {
    backgroundColor: C.error,
    borderRadius: Radius.full,
    minWidth: 20, height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  headerBadgeText: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.xs, color: C.white },
  markAllBtn: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.primary, width: 80, textAlign: 'right' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: C.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  tab: { flex: 1, paddingVertical: Spacing['3'], alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: C.primary },
  tabLabel: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textMuted },
  tabLabelActive: { fontFamily: FontFamily.bodySemiBold, color: C.primary },
  sectionLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['5'],
    paddingBottom: Spacing['2'],
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: Spacing['3'] },
  emptyTitle: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: C.textMuted },
});

// ─── Écran principal ──────────────────────────────────────────────

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onArticlePress,
  onUnreadChange,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [tab, setTab] = useState<Tab>('alerts');
  const [items, setItems] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabledTopics, setEnabledTopics] = useState<Set<string>>(
    new Set(['breaking', 'actualites', 'vaccination'])
  );

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const res = await fetchArticles(1);
    const articles = res?.data ?? [];

    const mapped: NotifItem[] = await Promise.all(
      articles.slice(0, 20).map(async (a) => ({
        id: String(a.id),
        title: a.title,
        time: relativeTime(a.published_at),
        category: a.category?.name ?? a.category_name ?? 'Actualités',
        read: await isRead(String(a.id)),
        icon: iconForCategory(a.category?.slug ?? ''),
      }))
    );

    setItems(mapped);
    const unread = mapped.filter((n) => !n.read).length;
    onUnreadChange?.(unread);
    setLoading(false);
  }, [onUnreadChange]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    await markAllRead(items.map((i) => i.id));
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    onUnreadChange?.(0);
  };

  const handleItemPress = async (item: NotifItem) => {
    if (!item.read) {
      await markAllRead([item.id]);
      setItems((prev) => prev.map((n) => n.id === item.id ? { ...n, read: true } : n));
      const newUnread = items.filter((n) => !n.read && n.id !== item.id).length;
      onUnreadChange?.(newUnread);
    }
    onArticlePress?.(item.id);
  };

  const toggleTopic = (id: string) =>
    setEnabledTopics((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.backgroundCard} />

      <View style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Alertes</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </View>
        {tab === 'alerts' && unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllBtn}>Tout lire</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'alerts' && styles.tabActive]} onPress={() => setTab('alerts')}>
          <Text style={[styles.tabLabel, tab === 'alerts' && styles.tabLabelActive]}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'settings' && styles.tabActive]} onPress={() => setTab('settings')}>
          <Text style={[styles.tabLabel, tab === 'settings' && styles.tabLabelActive]}>Paramètres</Text>
        </TouchableOpacity>
      </View>

      {tab === 'alerts' ? (
        loading ? (
          <View style={styles.empty}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NotifRow item={item} onPress={() => handleItemPress(item)} />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Feather name="bell" size={48} color={colors.textDisabled} />
                <Text style={styles.emptyTitle}>Aucune notification</Text>
              </View>
            }
          />
        )
      ) : (
        <FlatList
          data={ALERT_TOPICS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TopicRow topic={item} enabled={enabledTopics.has(item.id)} onToggle={() => toggleTopic(item.id)} />
          )}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.sectionLabel}>Recevoir des alertes pour :</Text>}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
};
