import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
  | 'subscription';

interface NavState {
  screen: Screen;
  params?: {
    category?: Category;
    categoryTitle?: string;
    articleId?: string;
    fromScreen?: Screen;
    issue?: MagazineIssue;
  };
}

// ─── Bottom Tab Bar ────────────────────────────────────────────────────────────

type TabDef = { id: Screen; icon: React.ComponentProps<typeof Feather>['name']; label: string };

const TABS: TabDef[] = [
  { id: 'home',       icon: 'home',   label: 'Accueil'  },
  { id: 'categories', icon: 'grid',   label: 'Rubriques' },
  { id: 'search',     icon: 'search', label: 'Recherche' },
  { id: 'menu',       icon: 'menu',   label: 'Menu'      },
];

const MAIN_SCREENS: Screen[] = ['home', 'categories', 'search', 'menu'];

const BottomTabBar: React.FC<{
  active: Screen;
  onPress: (screen: Screen) => void;
}> = ({ active, onPress }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[tabStyles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={tabStyles.tab}
            onPress={() => onPress(tab.id)}
            activeOpacity={0.7}
          >
            <Feather name={tab.icon} size={22} color={isActive ? '#1B9DD9' : '#9CA3AF'} />
            <Text style={[tabStyles.label, isActive && tabStyles.labelActive]}>
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
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 12,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  label: { fontSize: 10, fontFamily: 'Inter_400Regular', color: '#9CA3AF' },
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

export default function App() {
  const [nav, setNav] = useState<NavState>({ screen: 'splash' });

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

  const go = (screen: Screen, params?: NavState['params']) =>
    setNav({ screen, params });

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
          />
        );

      case 'categories':
        return (
          <CategoriesScreen
            onCategoryPress={(cat, title) =>
              go('category-detail', { category: cat, categoryTitle: title })
            }
            onSearchPress={() => go('search')}
          />
        );

      case 'category-detail':
        return params?.category ? (
          <CategoryDetailScreen
            category={params.category}
            categoryTitle={params.categoryTitle ?? ''}
            onArticlePress={(id) => go('article-detail', { articleId: id, fromScreen: 'category-detail' })}
            onBack={() => go('categories')}
          />
        ) : null;

      case 'article-detail':
        return (
          <ArticleDetailScreen
            onBack={() => go(params?.fromScreen ?? 'home')}
            onArticlePress={(id) => go('article-detail', { articleId: id })}
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
            onLogin={() => go('gateway')}
            onSubscribe={() => go('subscription')}
            onCategoryPress={(cat, title) =>
              go('category-detail', { category: cat, categoryTitle: title })
            }
            onSearchPress={() => go('search')}
            onNotificationPress={() => go('notifications')}
            onMagazinePress={() => go('magazine')}
            onSettingsPress={() => go('settings')}
            onFavoritesPress={() => go('bookmarks')}
            onAboutPress={() => go('about')}
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
            onLogin={() => go('home')}
            onRegister={() => go('register')}
            onForgotPassword={() => go('forgot-password')}
            onBack={() => go('gateway')}
          />
        );

      case 'register':
        return (
          <RegisterScreen
            onRegister={() => go('home')}
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
            onBack={() => go('menu')}
            onArticlePress={(id) => go('article-detail', { articleId: id, fromScreen: 'bookmarks' })}
          />
        );

      case 'notifications':
        return (
          <NotificationsScreen
            onBack={() => go(params?.fromScreen ?? 'home')}
            onArticlePress={(id) => go('article-detail', { articleId: id })}
          />
        );

      case 'settings':
        return <SettingsScreen onBack={() => go('menu')} />;

      case 'magazine':
        return (
          <MagazineScreen
            onBack={() => go('menu')}
            onSubscribe={() => go('subscription')}
            onLogin={() => go('gateway')}
            onSettings={() => go('settings')}
            onAbout={() => go('about')}
            onIssuePress={(issue) => go('magazine-issue', { issue })}
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
    <SafeAreaProvider>
      <View style={styles.root}>
        <View style={styles.content}>{renderScreen()}</View>
        {isMainTab && (
          <BottomTabBar
            active={screen}
            onPress={(s) => go(s)}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { flex: 1 },
});
