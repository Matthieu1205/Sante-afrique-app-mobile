import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@/theme';

interface NotificationsScreenProps {
  onBack?: () => void;
  onArticlePress?: (id: string) => void;
}

type Tab = 'alerts' | 'settings';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

interface NotifData {
  id: string; title: string; time: string; category: string; read: boolean; icon: FeatherName;
}
interface TopicData {
  id: string; label: string; sublabel: string; icon: FeatherName;
}

const MOCK_NOTIFICATIONS: NotifData[] = [
  { id: '1', title: 'Alerte OMS : nouveau variant de grippe détecté au Sahel',              time: 'Il y a 2h', category: 'Actualités',     read: false, icon: 'alert-triangle' },
  { id: '2', title: 'Rappel : campagne de vaccination rougeole ce week-end à Abidjan',      time: 'Il y a 5h', category: 'Vaccination',     read: false, icon: 'thermometer'    },
  { id: '3', title: 'Nouveau dossier : Santé maternelle en zones rurales',                  time: 'Hier',      category: 'Santé Maternelle',read: true,  icon: 'clipboard'      },
  { id: '4', title: 'Business Santé : le marché pharmaceutique africain atteint 30 Mds USD',time: 'Hier',      category: 'Business Santé', read: true,  icon: 'trending-up'    },
  { id: '5', title: "Conseil pratique : 7 aliments pour renforcer l'immunité naturellement",time: '23 Avr',    category: 'Conseils',        read: true,  icon: 'zap'            },
  { id: '6', title: 'Conférence Africa Health 2025 : inscriptions ouvertes',                time: '21 Avr',    category: 'Événement',       read: true,  icon: 'calendar'       },
];

const ALERT_TOPICS: TopicData[] = [
  { id: 'breaking',   label: 'Alertes urgentes',   sublabel: 'Épidémies, crises sanitaires',    icon: 'alert-triangle' },
  { id: 'actualites', label: 'Actualités santé',   sublabel: 'Nouvelles quotidiennes',           icon: 'file-text'      },
  { id: 'vaccination',label: 'Vaccination',         sublabel: 'Campagnes et rappels',             icon: 'thermometer'    },
  { id: 'dossiers',   label: 'Nouveaux dossiers',  sublabel: 'Publications hebdomadaires',       icon: 'clipboard'      },
  { id: 'business',   label: 'Business Santé',     sublabel: 'Marché et innovations',            icon: 'briefcase'      },
  { id: 'evenements', label: 'Événements',          sublabel: 'Conférences et formations',        icon: 'calendar'       },
];

type NotificationItem = NotifData;
type Topic = TopicData;

const NotifRow: React.FC<{ item: NotificationItem; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity
    style={[notifStyle.row, !item.read && notifStyle.rowUnread]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    {!item.read && <View style={notifStyle.dot} />}
    <View style={notifStyle.iconWrap}>
      <Feather name={item.icon} size={20} color={Colors.textSecondary} />
    </View>
    <View style={notifStyle.content}>
      <Text style={[notifStyle.title, !item.read && notifStyle.titleUnread]} numberOfLines={2}>
        {item.title}
      </Text>
      <View style={notifStyle.meta}>
        <Text style={notifStyle.category}>{item.category}</Text>
        <Text style={notifStyle.dot2}> · </Text>
        <Text style={notifStyle.time}>{item.time}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const notifStyle = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing['3'],
  },
  rowUnread: { backgroundColor: Colors.primaryUltraLight },
  dot: {
    position: 'absolute',
    left: 10,
    top: 22,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing['1'],
  },
  icon: { fontSize: 20 },
  content: { flex: 1, gap: 4 },
  title: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  titleUnread: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.textPrimary,
  },
  meta: { flexDirection: 'row', alignItems: 'center' },
  category: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.primary,
  },
  dot2: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.textDisabled,
  },
  time: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.textDisabled,
  },
});

const TopicRow: React.FC<{ topic: Topic; enabled: boolean; onToggle: () => void }> = ({
  topic,
  enabled,
  onToggle,
}) => (
  <View style={topicStyle.row}>
    <View style={topicStyle.iconWrap}>
      <Feather name={topic.icon} size={18} color={Colors.textSecondary} />
    </View>
    <View style={topicStyle.textBlock}>
      <Text style={topicStyle.label}>{topic.label}</Text>
      <Text style={topicStyle.sub}>{topic.sublabel}</Text>
    </View>
    <Switch
      value={enabled}
      onValueChange={onToggle}
      trackColor={{ false: Colors.border, true: Colors.primaryLight }}
      thumbColor={enabled ? Colors.primary : Colors.white}
    />
  </View>
);

const topicStyle = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing['3'],
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 18 },
  textBlock: { flex: 1 },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  sub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onArticlePress,
}) => {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('alerts');
  const [enabledTopics, setEnabledTopics] = useState<Set<string>>(
    new Set(['breaking', 'actualites', 'vaccination'])
  );

  const toggleTopic = (id: string) =>
    setEnabledTopics((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundCard} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing['2'] }]}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Alertes</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'alerts' && styles.tabActive]}
          onPress={() => setTab('alerts')}
        >
          <Text style={[styles.tabLabel, tab === 'alerts' && styles.tabLabelActive]}>
            Notifications
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'settings' && styles.tabActive]}
          onPress={() => setTab('settings')}
        >
          <Text style={[styles.tabLabel, tab === 'settings' && styles.tabLabelActive]}>
            Paramètres
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'alerts' ? (
        <FlatList
          data={MOCK_NOTIFICATIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotifRow
              item={item}
              onPress={() => onArticlePress?.(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="bell" size={48} color={Colors.textDisabled} />
              <Text style={styles.emptyTitle}>Aucune notification</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={ALERT_TOPICS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TopicRow
              topic={item}
              enabled={enabledTopics.has(item.id)}
              onToggle={() => toggleTopic(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionLabel}>Recevoir des alertes pour :</Text>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Shadows.header,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 32, marginTop: -2 },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2'],
  },
  headerTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  headerBadge: {
    backgroundColor: Colors.error,
    borderRadius: Radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  headerBadgeText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing['3'],
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  tabLabelActive: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.primary,
  },

  sectionLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing['4'],
    paddingTop: Spacing['5'],
    paddingBottom: Spacing['2'],
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: Spacing['3'],
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },
});
