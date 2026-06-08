import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import {
  requestPushPermissions,
  getUnreadCount,
  sendPushTokenToServer,
  setupNotificationListeners,
} from './src/services/notifications';
import { fetchArticles, getAuthToken, logoutUser, fetchUserProfile } from './src/services/api';
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
import { JobsScreen } from './src/screens/jobs/JobsScreen';
import { PartnersScreen } from './src/screens/partners/PartnersScreen';
import { KitMediaScreen } from './src/screens/partners/KitMediaScreen';
import { LegalScreen } from './src/screens/legal/LegalScreen';
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
  | 'legal';

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

  const go = (screen: Screen, params?: NavState['params']) =>
    setNav({ screen, params });

  const handleLogin = (dest: Screen = 'home') => {
    setIsLoggedIn(true);
    fetchUserProfile().then(setUserProfile);
    go(dest);
  };

  const handleLogout = async () => {
    await logoutUser();
    setIsLoggedIn(false);
    setUserProfile(null);
    go('home');
  };

  useEffect(() => {
    getAuthToken().then((t) => {
      setIsLoggedIn(!!t);
      if (t) fetchUserProfile().then(setUserProfile);
    });
    // 1. Demande permission + envoie le token au serveur Laravel
    requestPushPermissions().then((token) => {
      if (token) sendPushTokenToServer(token);
    });

    // 2. Calcul du badge initial depuis les articles récents
    fetchArticles(1).then((res) => {
      const ids = (res?.data ?? []).slice(0, 20).map((a) => String(a.id));
      getUnreadCount(ids).then(setUnreadCount);
    });

    // 3. Listeners push : reçue → +1 badge ; lue (tap) → -1 badge + navigation
    const cleanup = setupNotificationListeners(
      () => setUnreadCount((n) => n + 1),
      () => setUnreadCount((n) => Math.max(0, n - 1)),
      (articleId) => go('article-detail', { articleId, fromScreen: 'home' }),
    );
    return cleanup;
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
            onSubscribe={() => go('subscription')}
            onLogin={() => go('gateway')}
            onSettings={() => go('settings')}
            onAbout={() => go('about')}
            onIssuePress={(issue) => go('magazine-issue', { issue })}
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
            onSubscribe={() => go('subscription')}
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
            onAboutPress={() => go('legal', { legalTitle: 'À propos', legalUrl: 'https://santeafrique.net/a-propos', legalHideChrome: true })}
            onLogout={handleLogout}
            onLegalPress={() => go('legal', { legalTitle: 'Mentions légales', legalUrl: 'https://santeafrique.net/mentions-legales' })}
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

      case 'magazine-issue':
        return params?.issue ? (
          <MagazineIssueScreen
            issue={params.issue}
            onBack={() => go('magazine')}
            onSubscribe={() => go('subscription')}
            onLogin={() => go('login')}
          />
        ) : null;

      case 'jobs':
        return (
          <JobsScreen
            onSearchPress={() => go('search')}
            onNotificationPress={() => go('notifications')}
            onLogin={() => go('gateway')}
            onSubscribe={() => go('subscription')}
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
            onBack={() => go('menu')}
          />
        );

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
});
