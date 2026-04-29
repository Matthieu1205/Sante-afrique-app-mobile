import { Category } from '@/components/common';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  AccountGateway: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Magazine: undefined;
  Account: undefined;
  Menu: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ArticleDetail: { articleId: string };
};

export type CategoriesStackParamList = {
  CategoriesList: undefined;
  CategoryDetail: { category: Category; title: string };
  ArticleDetail: { articleId: string };
};
