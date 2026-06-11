import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { ListSkeleton } from '@/components/common';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeColors } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getStoredNotifications,
  markStoredRead,
  markAllStoredRead,
  countUnread,
} from '@/services/notifications';
import type { StoredNotification, NotifType } from '@/services/notifications';

interface NotificationsScreenProps {
  onBack?: () => void;
  onArticlePress?: (id: string) => void;
  onMagazinePress?: () => void;
  onUnreadChange?: (count: number) => void;
}

type Tab = 'alerts' | 'settings';
type FeatherName = React.ComponentProps<typeof Feather>['name'];

interface TopicData {
  id: string; label: string; sublabel: string; icon: FeatherName;
}

const ALERT_TOPICS: TopicData[] = [
  { id: 'breaking',    label: 'Alertes urgentes',   sublabel: 'Épidémies, crises sanitaires',    icon: 'alert-triangle' },
  { id: 'actualites',  label: 'Actualités santé',   sublabel: 'Nouvelles quotidiennes',           icon: 'file-text'      },
  { id: 'vaccination', label: 'Vaccination',         sublabel: 'Campagnes et rappels',             icon: 'thermometer'    },
  { id: 'dossiers',    label: 'Nouveaux dossiers',   sublabel: 'Publications hebdomadaires',       icon: 'clipboard'      },
  { id: 'business',    label: 'Business Santé',      sublabel: 'Marché et innovations',            icon: 'briefcase'      },
  { id: 'evenements',  label: 'Événements',           sublabel: 'Conférences et formations',        icon: 'calendar'       },
];

const TYPE_META: Record<NotifType, { icon: FeatherName; color: string; label: string }> = {
  article:      { icon: 'file-text',      color: '#1B9DD9', label: 'Article'      },
  magazine:     { icon: 'book-open',      color: '#8E44AD', label: 'Magazine'     },
  subscription: { icon: 'star',           color: '#E67E22', label: 'Abonnement'   },
  update:       { icon: 'download-cloud', color: '#27AE60', label: 'Mise à jour'  },
  info:         { icon: 'bell',           color: '#8E8E93', label: 'Info'         },
};

function relativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Il y a moins d\'1h';
    if (h < 24) return `Il y a ${h}h`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'Hier';
    if (d < 7) return `Il y a ${d} jours`;
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
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
  content: { flex: 1, gap: 3 },
  title: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textSecondary, lineHeight: 20 },
  titleUnread: { fontFamily: FontFamily.bodySemiBold, color: C.textPrimary },
  body: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textMuted, lineHeight: 18 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  typeLabel: { fontFamily: FontFamily.body, fontSize: FontSize.xs },
  sep: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textDisabled },
  time: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: C.textDisabled },
});

const NotifRow: React.FC<{ item: StoredNotification; onPress: () => void }> = ({ item, onPress }) => {
  const { colors } = useTheme();
  const s = makeNotifStyle(colors);
  const meta = TYPE_META[item.type];
  return (
    <TouchableOpacity style={[s.row, !item.read && s.rowUnread]} onPress={onPress} activeOpacity={0.75}>
      {!item.read && <View style={s.dot} />}
      <View style={[s.iconWrap, { backgroundColor: item.read ? colors.background : `${meta.color}18` }]}>
        <Feather name={meta.icon} size={20} color={item.read ? colors.textSecondary : meta.color} />
      </View>
      <View style={s.content}>
        <Text style={[s.title, !item.read && s.titleUnread]} numberOfLines={2}>{item.title}</Text>
        {!!item.body && (
          <Text style={s.body} numberOfLines={2}>{item.body}</Text>
        )}
        <View style={s.meta}>
          <Text style={[s.typeLabel, { color: meta.color }]}>
            {item.category ?? meta.label}
          </Text>
          <Text style={s.sep}> · </Text>
          <Text style={s.time}>{relativeTime(item.receivedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Topic toggle ────────────────────────────────────────────────

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

// ─── Styles globaux ───────────────────────────────────────────────

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
  empty: { flex: 1, alignItems: 'center', paddingTop: 80, gap: Spacing['3'] },
  emptyTitle: { fontFamily: FontFamily.bodyBold, fontSize: FontSize.base, color: C.textMuted },
  emptySub: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: C.textDisabled, textAlign: 'center', paddingHorizontal: 32 },
});

// ─── Écran principal ──────────────────────────────────────────────

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onArticlePress,
  onMagazinePress,
  onUnreadChange,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [tab, setTab] = useState<Tab>('alerts');
  const [items, setItems] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabledTopics, setEnabledTopics] = useState<Set<string>>(
    new Set(['breaking', 'actualites', 'vaccination'])
  );

  useEffect(() => {
    AsyncStorage.getItem('notification_topics').then((raw) => {
      if (raw) setEnabledTopics(new Set(JSON.parse(raw) as string[]));
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const notifs = await getStoredNotifications();
    setItems(notifs);
    onUnreadChange?.(countUnread(notifs));
    setLoading(false);
  }, [onUnreadChange]);

  useEffect(() => { void load(); }, [load]);

  const handleMarkAllRead = async () => {
    await markAllStoredRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    onUnreadChange?.(0);
  };

  const handleItemPress = async (item: StoredNotification) => {
    if (!item.read) {
      const updated = await markStoredRead(item.id);
      setItems(updated);
      onUnreadChange?.(countUnread(updated));
    }
    if (item.type === 'article' && item.articleId) {
      onArticlePress?.(item.articleId);
    } else if (item.type === 'magazine') {
      onMagazinePress?.();
    }
  };

  const toggleTopic = (id: string) =>
    setEnabledTopics((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      AsyncStorage.setItem('notification_topics', JSON.stringify([...next]));
      return next;
    });

  const unreadCount = countUnread(items);

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
          <ListSkeleton count={6} />
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
                <Feather name="bell-off" size={48} color={colors.textDisabled} />
                <Text style={styles.emptyTitle}>Aucune notification</Text>
                <Text style={styles.emptySub}>
                  Vous recevrez des alertes dès qu'un article est publié ou que votre abonnement approche de son expiration.
                </Text>
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
