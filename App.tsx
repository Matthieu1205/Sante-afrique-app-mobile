import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, AppState, ActivityIndicator } from 'react-native';
import {
  requestPushPermissions,
  sendPushTokenToServer,
  setupNotificationListeners,
  getStoredNotifications,
  countUnread,
  checkAndNotifySubscriptionExpiry,
  getLastNotificationArticleId,
  getPushToken,
} from './src/services/notifications';
import { getAuthToken, logoutUser, fetchUserProfile, fetchMagazineReaderUrl, fetchMagazineIssueDetail, PROFILE_UNAUTHORIZED } from './src/services/api';
import { openMagazinePdf } from './src/utils/openPdf';
import type { UserProfile } from './src/services/api';
import { Feather } from '@expo/vector-icons';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MENU_LOGO = require('./src/assets/icon.png') as number;
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { SplashScreen } from './src/screens/splash/SplashScreen';
import { OnboardingScreen } from './src/screens/onboarding/OnboardingScreen';
import { HomeScreen } from './src/screens/home/HomeScreen';
import { CategoriesScreen } from './src/screens/categories/CategoriesScreen';
import { CategoryDetailScreen } from './src/screens/categories/CategoryDetailScreen';
import { ArticleDetailScreen } from './src/screens/article/ArticleDetailScreen';
import { SearchScreen } from './src/screens/search/SearchScreen';
import { MenuScreen } from './src/screens/menu/MenuScreen';
import { AccountGatewayScreen } from './src/screens/auth/AccountGatewayScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { BookmarksScreen } from './src/screens/bookmarks/BookmarksScreen';
import { NotificationsScreen } from './src/screens/notifications/NotificationsScreen';
import { SettingsScreen } from './src/screens/settings/SettingsScreen';
import { MagazineScreen } from './src/screens/magazine/MagazineScreen';
import type { MagazineIssue } from './src/screens/magazine/MagazineScreen';
import { MagazineIssueScreen } from './src/screens/magazine/MagazineIssueScreen';
import { AboutScreen } from './src/screens/about/AboutScreen';
import { SubscriptionScreen } from './src/screens/subscription/SubscriptionScreen';
import { MonAbonnementScreen } from './src/screens/subscription/MonAbonnementScreen';
import { JobsScreen } from './src/screens/jobs/JobsScreen';
import { PartnersScreen } from './src/screens/partners/PartnersScreen';
import { KitMediaScreen } from './src/screens/partners/KitMediaScreen';
import { LegalScreen } from './src/screens/legal/LegalScreen';
import { MentionsLegalesScreen } from './src/screens/legal/MentionsLegalesScreen';
import { ProfileScreen } from './src/screens/auth/ProfileScreen';
import { HistoryScreen } from './src/screens/history/HistoryScreen';
import { FacturesScreen } from './src/screens/factures/FacturesScreen';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import type { Category } from './src/components/common';

// ─── Navigation par états ──────────────────────────────────────────────────────

type Screen =
  | 'splash'
  | 'onboarding'
  | 'home'
  | 'categories'
  | 'category-detail'
  | 'article-detail'
  | 'search'
  | 'menu'
  | 'gateway'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'bookmarks'
  | 'notifications'
  | 'settings'
  | 'magazine'
  | 'magazine-issue'
  | 'about'
  | 'subscription'
  | 'jobs'
  | 'partners'
  | 'kit-media'
  | 'legal'
  | 'profile'
  | 'history'
  | 'factures'
  | 'mon-abonnement'
  | 'mentions-legales';

interface NavState {
  screen: Screen;
  params?: {
    category?: Category;
    categoryTitle?: string;
    articleId?: string;
    fromScreen?: Screen;
    issue?: MagazineIssue;
    legalTitle?: string;
    legalUrl?: string;
    legalHideChrome?: boolean;
    legalRequiresAuth?: boolean;
  };
}

// ─── Bottom Tab Bar ────────────────────────────────────────────────────────────

type TabDef = { id: Screen; icon: React.ComponentProps<typeof Feather>['name']; label: string };

const TABS: TabDef[] = [
  { id: 'home',      icon: 'home',      label: 'Accueil'  },
  { id: 'magazine',  icon: 'book-open', label: 'Magazine' },
  { id: 'jobs',      icon: 'briefcase', label: 'Emplois'  },
  { id: 'menu',      icon: 'menu',      label: 'Menu'     },
];

const MAIN_SCREENS: Screen[] = ['home', 'magazine', 'jobs', 'menu'];

const BottomTabBar: React.FC<{
  active: Screen;
  onPress: (screen: Screen) => void;
}> = ({ active, onPress }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View style={[
      tabStyles.bar,
      { paddingBottom: Math.max(insets.bottom, 8), backgroundColor: colors.backgroundCard, borderTopColor: colors.borderLight },
    ]}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={tabStyles.tab}
            onPress={() => onPress(tab.id)}
            activeOpacity={0.7}
          >
            {tab.id === 'home' ? (
              <Image
                source={MENU_LOGO}
                style={{ width: 26, height: 26, tintColor: isActive ? '#1B9DD9' : colors.textDisabled }}
                resizeMode="contain"
              />
            ) : (
              <Feather name={tab.icon} size={22} color={isActive ? '#1B9DD9' : colors.textDisabled} />
            )}
            <Text style={[tabStyles.label, { color: colors.textDisabled }, isActive && tabStyles.labelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={tabStyles.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 12,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  label: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  labelActive: { color: '#1B9DD9', fontFamily: 'Inter_600SemiBold' },
  dot: {
    position: 'absolute',
    top: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1B9DD9',
  },
});

// ─── App root ─────────────────────────────────────────────────────────────────

function AppContent() {
  const [nav, setNav] = useState<NavState>({ screen: 'splash' });
  const { colors, toggleTheme, isDark } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isOpeningReader, setIsOpeningReader] = useState(false);

  const go = (screen: Screen, params?: NavState['params']) =>
    setNav({ screen, params });

  const handleLogout = useCallback(async () => {
    await logoutUser();
    setIsLoggedIn(false);
    setAuthToken(null);
    setUserProfile(null);
    go('home');
  }, []);

  // Helper centralisé : charge le profil et gère le 401 automatiquement
  const loadProfile = useCallback(async () => {
    const p = await fetchUserProfile();
    if (p === PROFILE_UNAUTHORIZED) {
      await handleLogout();
      return;
    }
    if (p) setUserProfile(p);
    return p;
  }, [handleLogout]);

  const refreshProfile = useCallback(() => {
    getAuthToken().then((t) => { if (t) loadProfile(); });
  }, [loadProfile]);

  const handleIssuePress = useCallback(async (issue: MagazineIssue) => {
    setIsOpeningReader(true);
    try {
      // Profil pas encore chargé → on attend avant de vérifier l'abonnement
      let currentProfile = userProfile;
      if (isLoggedIn && !currentProfile) {
        currentProfile = (await loadProfile()) ?? null;
      }

      const isSubscribed = currentProfile?.subscription?.is_active ?? false;
      if (isLoggedIn && isSubscribed) {
        // Récupère l'URL signée ET le détail en parallèle
        const [readerUrl, detail] = await Promise.all([
          fetchMagazineReaderUrl(Number(issue.id)),
          fetchMagazineIssueDetail(Number(issue.id)),
        ]);

        const pdfUrl  = detail?.pdf_url  ?? null;
        const readUrl = detail?.read_url ?? null;

        if (readerUrl) {
          // reader-url = toujours une URL de lecture PDF (signée ou directe)
          // → téléchargement + ouverture native, quelle que soit l'extension
          await openMagazinePdf(readerUrl, authToken);
          return;
        }

        if (pdfUrl) {
          // Fichier PDF direct depuis le détail
          await openMagazinePdf(pdfUrl, authToken);
          return;
        }

        if (readUrl) {
          // Page web du magazine → WebView (pas de Bearer, le site gère sa propre auth)
          go('legal', {
            legalTitle: `Santé Afrique N°${issue.number}`,
            legalUrl: readUrl,
            legalHideChrome: true,
            legalRequiresAuth: false,
          });
          return;
        }
      }

      // Non-abonné ou URL introuvable → écran de détail
      go('magazine-issue', { issue });
    } finally {
      setIsOpeningReader(false);
    }
  }, [isLoggedIn, userProfile, loadProfile, authToken]);

  // Vérifie l'expiration de l'abonnement à chaque chargement du profil
  useEffect(() => {
    if (userProfile?.subscription?.is_active && userProfile.subscription.expires_at) {
      checkAndNotifySubscriptionExpiry(userProfile.subscription.expires_at).then((created) => {
        if (created) {
          getStoredNotifications().then((notifs) => setUnreadCount(countUnread(notifs)));
        }
      });
    }
  }, [userProfile]);

  const handleLogin = (dest: Screen = 'home') => {
    setIsLoggedIn(true);
    getAuthToken().then((t) => {
      setAuthToken(t);
      if (t) getPushToken().then((pt) => { if (pt) sendPushTokenToServer(pt); });
    });
    loadProfile();
    go(dest);
  };

  // Charge le profil quand on navigue vers l'écran profile et qu'il est null
  useEffect(() => {
    if (nav.screen !== 'profile' || userProfile !== null) return;
    setProfileLoading(true);
    setProfileError(null);
    fetchUserProfile().then((p) => {
      setProfileLoading(false);
      if (p === PROFILE_UNAUTHORIZED) {
        handleLogout();
      } else if (p) {
        setUserProfile(p);
      } else {
        setProfileError('Impossible de charger le profil. Vérifiez votre connexion.');
      }
    });
  }, [nav.screen]);

  useEffect(() => {
    getAuthToken().then((t) => {
      setIsLoggedIn(!!t);
      setAuthToken(t);
      if (t) loadProfile();
    });

    // 1. Badge initial depuis le store local
    getStoredNotifications().then((notifs) => setUnreadCount(countUnread(notifs)));

    // 2. Permission push + enregistrement du token (avec Bearer si connecté)
    requestPushPermissions().then((token) => {
      if (token) sendPushTokenToServer(token);
    });

    // 3. Cold start : app ouverte depuis une notification système
    getLastNotificationArticleId().then((articleId) => {
      if (articleId) go('article-detail', { articleId, fromScreen: 'home' });
    });

    // 4. Listeners push : reçue → stocke + badge +1 ; tap → badge -1 + navigation
    const cleanup = setupNotificationListeners(
      () => setUnreadCount((n) => n + 1),
      () => setUnreadCount((n) => Math.max(0, n - 1)),
      (articleId) => go('article-detail', { articleId, fromScreen: 'home' }),
      () => go('magazine'),
    );

    // 4. Recharge le profil quand l'app revient au premier plan
    // (cas : utilisateur s'abonne sur le site web et revient dans l'app)
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshProfile();
    });

    return () => {
      cleanup();
      appStateSub.remove();
    };
  }, []);

  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Nunito_800ExtraBold,
    Nunito_700Bold,
    Nunito_600SemiBold,
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_300Light,
  });

  if (!fontsLoaded) return null;

  const { screen, params } = nav;
  const isMainTab = MAIN_SCREENS.includes(screen);

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen onFinish={() => go('onboarding')} />;

      case 'onboarding':
        return <OnboardingScreen onComplete={() => go('home')} />;

      case 'home':
        return (
          <HomeScreen
            onArticlePress={(id) => go('article-detail', { articleId: id, fromScreen: 'home' })}
            onSearchPress={() => go('search')}
            onNotificationPress={() => go('notifications')}
            notificationCount={unreadCount}
            onMagazinePress={() => go('magazine')}
            onJobsPress={() => go('jobs')}
          />
        );

      case 'categories':
        return (
          <CategoriesScreen
            onCategoryPress={(cat, title) =>
              go('category-detail', { category: cat, categoryTitle: title })
            }
            onSearchPress={() => go('search')}
            onBack={() => go('menu')}
            notificationCount={unreadCount}
          />
        );

      case 'magazine':
        return (
          <MagazineScreen
            isLoggedIn={isLoggedIn}
            isSubscribed={userProfile?.subscription?.is_active ?? false}
            userName={userProfile?.name}
            onSubscribe={() => go('subscription')}
            onLogin={() => go('gateway')}
            onProfile={() => go('profile')}
            onSettings={() => go('settings')}
            onAbout={() => go('legal', { legalTitle: 'À propos', legalUrl: 'https://santeafrique.net/a-propos', legalHideChrome: true })}
            onLegal={() => go('mentions-legales')}
            onPrivacy={() => go('legal', { legalTitle: 'Politique de confidentialité', legalUrl: 'https://santeafrique.net/politique-de-confidentialite', legalHideChrome: true })}
            onConsent={() => go('legal', { legalTitle: 'Consentements', legalUrl: 'https://santeafrique.net/consentements', legalHideChrome: true })}
            onIssuePress={handleIssuePress}
          />
        );

      case 'category-detail':
        return params?.category ? (
          <CategoryDetailScreen
            category={params.category}
            categoryTitle={params.categoryTitle ?? ''}
            onArticlePress={(id) => go('article-detail', {
              articleId: id,
              fromScreen: 'category-detail',
              category: params.category,
              categoryTitle: params.categoryTitle,
            })}
            onBack={() => go('categories')}
          />
        ) : null;

      case 'article-detail':
        return (
          <ArticleDetailScreen
            articleId={params?.articleId}
            isSubscriber={userProfile?.subscription?.is_active ?? false}
            onSubscribePress={() => go('subscription')}
            onLoginPress={() => go('login')}
            onBack={() => {
              const from = params?.fromScreen ?? 'home';
              if (from === 'category-detail') {
                go('category-detail', {
                  category: params?.category,
                  categoryTitle: params?.categoryTitle,
                });
              } else {
                go(from);
              }
            }}
            onArticlePress={(id) => go('article-detail', {
              articleId: id,
              fromScreen: params?.fromScreen,
              category: params?.category,
              categoryTitle: params?.categoryTitle,
            })}
          />
        );

      case 'search':
        return (
          <SearchScreen
            onArticlePress={(id) => go('article-detail', { articleId: id, fromScreen: 'search' })}
            onBack={() => go('home')}
          />
        );

      case 'menu':
        return (
          <MenuScreen
            isLoggedIn={isLoggedIn}
            notificationCount={unreadCount}
            userName={userProfile?.name}
            subscriptionLabel={
              userProfile?.subscription?.is_active
                ? userProfile.subscription.plan
                : undefined
            }
            onLogin={() => go('login')}
            onSubscribe={() => isLoggedIn && userProfile?.subscription?.is_active
              ? go('mon-abonnement', { fromScreen: 'menu' })
              : go('subscription')
            }
            onCategoryPress={(cat, title) =>
              go('category-detail', { category: cat, categoryTitle: title })
            }
            onSearchPress={() => go('search')}
            onNotificationPress={() => go('notifications')}
            onRubriquesPress={() => go('categories')}
            onJobsPress={() => go('jobs')}
            onPartnersPress={() => go('partners')}
            onSettingsPress={() => go('settings')}
            onFavoritesPress={() => go('bookmarks')}
            onHistoryPress={() => go('history')}
            onAboutPress={() => go('legal', { legalTitle: 'À propos', legalUrl: 'https://santeafrique.net/a-propos', legalHideChrome: true })}
            onLogout={handleLogout}
            onLegalPress={() => go('mentions-legales')}
            onProfilePress={() => go('profile')}
          />
        );

      case 'gateway':
        return (
          <AccountGatewayScreen
            onLogin={() => go('login')}
            onSubscribe={() => go('subscription')}
            onBack={() => go(params?.fromScreen ?? 'menu')}
          />
        );

      case 'login':
        return (
          <LoginScreen
            onLogin={() => handleLogin('menu')}
            onRegister={() => go('subscription')}
            onForgotPassword={() => go('forgot-password')}
            onBack={() => go('menu')}
          />
        );

      case 'register':
        return (
          <RegisterScreen
            onRegister={() => handleLogin('home')}
            onLogin={() => go('login')}
            onBack={() => go('gateway')}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPasswordScreen
            onBack={() => go('login')}
          />
        );

      case 'bookmarks':
        return (
          <BookmarksScreen
            isLoggedIn={isLoggedIn}
            onBack={() => go('menu')}
            onArticlePress={(id) => go('article-detail', { articleId: id, fromScreen: 'bookmarks' })}
          />
        );

      case 'notifications':
        return (
          <NotificationsScreen
            onBack={() => go(params?.fromScreen ?? 'home')}
            onArticlePress={(id) => go('article-detail', { articleId: id })}
            onMagazinePress={() => go('magazine')}
            onUnreadChange={setUnreadCount}
          />
        );

      case 'settings':
        return (
          <SettingsScreen
            onBack={() => go('menu')}
            isDark={isDark}
            onToggleDark={toggleTheme}
          />
        );

      case 'magazine-issue': {
        return params?.issue ? (
          <MagazineIssueScreen
            issue={params.issue}
            isLoggedIn={isLoggedIn}
            isSubscriber={userProfile?.subscription?.is_active ?? false}
            onBack={() => go('magazine')}
            onSubscribe={() => go('subscription')}
            onLogin={() => isLoggedIn ? go('profile') : go('login')}
            onRead={(url) => go('legal', {
              legalTitle: `Santé Afrique N°${params.issue!.number}`,
              legalUrl: url,
              legalHideChrome: true,
              legalRequiresAuth: true,
            })}
          />
        ) : null;
      }

      case 'jobs':
        return (
          <JobsScreen
            onSearchPress={() => go('search')}
            onNotificationPress={() => go('notifications')}
            onLogin={() => go('gateway')}
            onSubscribe={() => go('subscription')}
            onJobPress={(url, title) => go('legal', { legalTitle: title, legalUrl: url, legalHideChrome: true, fromScreen: 'jobs' })}
            onApplyPress={(url, title) => go('legal', { legalTitle: title, legalUrl: url, legalHideChrome: true, fromScreen: 'jobs' })}
            onViewCV={(url, title) => go('legal', { legalTitle: title, legalUrl: url, legalHideChrome: true, fromScreen: 'jobs' })}
            isSubscribed={userProfile?.subscription?.is_active ?? false}
          />
        );

      case 'partners':
        return (
          <PartnersScreen
            onBack={() => go('menu')}
            onJobsPress={() => go('jobs')}
            onKitMediaPress={() => go('kit-media')}
          />
        );

      case 'kit-media':
        return <KitMediaScreen onBack={() => go('partners')} />;

      case 'legal':
        return (
          <LegalScreen
            title={params?.legalTitle ?? 'Mentions légales'}
            url={params?.legalUrl ?? 'https://santeafrique.net/mentions-legales'}
            hideChrome={params?.legalHideChrome}
            authToken={params?.legalRequiresAuth ? authToken : null}
            onBack={() => go(params?.fromScreen ?? 'menu')}
          />
        );

      case 'profile':
        if (profileLoading) {
          return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
              <ActivityIndicator size="large" color="#1B9DD9" />
            </View>
          );
        }
        if (profileError || !userProfile) {
          return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 32 }}>
              <Text style={{ fontFamily: 'System', fontSize: 16, color: '#374151', textAlign: 'center', marginBottom: 8 }}>
                Impossible de charger le profil
              </Text>
              <Text style={{ fontFamily: 'System', fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 24 }}>
                {profileError ?? 'Vérifiez votre connexion internet.'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setProfileError(null);
                  setProfileLoading(true);
                  fetchUserProfile().then((p) => {
                    setProfileLoading(false);
                    if (p === PROFILE_UNAUTHORIZED) { handleLogout(); }
                    else if (p) setUserProfile(p);
                    else setProfileError('Toujours indisponible. Réessayez plus tard.');
                  });
                }}
                style={{ backgroundColor: '#1B9DD9', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12, marginBottom: 12 }}
              >
                <Text style={{ color: '#fff', fontFamily: 'System', fontWeight: '600' }}>Réessayer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => go('menu')}>
                <Text style={{ color: '#6B7280', fontSize: 14 }}>Retour</Text>
              </TouchableOpacity>
            </View>
          );
        }
        return (
          <ProfileScreen
            userProfile={userProfile}
            onBack={() => go('menu')}
            onSubscribe={() => go('mon-abonnement', { fromScreen: 'profile' })}
            onFavoritesPress={() => go('bookmarks')}
            onHistoryPress={() => go('history')}
            onFacturesPress={() => go('factures')}
            onSettingsPress={() => go('settings')}
            onLogout={handleLogout}
            onProfileUpdated={(name) => setUserProfile((p) => p ? { ...p, name } : p)}
          />
        );

      case 'history':
        return (
          <HistoryScreen
            onBack={() => go('profile')}
            onArticlePress={(id) => go('article-detail', { articleId: id, fromScreen: 'history' })}
          />
        );

      case 'factures':
        return <FacturesScreen onBack={() => go('mon-abonnement')} />;

      case 'mon-abonnement':
        return userProfile ? (
          <MonAbonnementScreen
            userProfile={userProfile}
            onBack={() => go(nav.params?.fromScreen ?? 'menu')}
            onModifier={() => go('subscription')}
            onFactures={() => go('factures')}
          />
        ) : null;

      case 'mentions-legales':
        return <MentionsLegalesScreen onBack={() => go('menu')} />;

      case 'about':
        return <AboutScreen onBack={() => go('menu')} />;

      case 'subscription':
        return (
          <SubscriptionScreen
            onBack={() => go(params?.fromScreen ?? 'menu')}
            onSubscribe={() => go('login')}
            onLogin={() => go('login')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.content}>{renderScreen()}</View>
      {isMainTab && (
        <BottomTabBar
          active={screen}
          onPress={(s) => go(s)}
        />
      )}
      {isOpeningReader && (
        <View style={styles.readerOverlay}>
          <View style={styles.readerOverlayCard}>
            <ActivityIndicator size="large" color="#1B9DD9" />
            <Text style={styles.readerOverlayText}>Ouverture du magazine…</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  readerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  readerOverlayCard: {
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 32, paddingVertical: 24,
    alignItems: 'center', gap: 14,
  },
  readerOverlayText: {
    fontSize: 14, color: '#374151', fontFamily: 'Inter_400Regular',
  },
});
