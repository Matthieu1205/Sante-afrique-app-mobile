import { Radius, Spacing } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, View } from 'react-native';

const { width: W } = Dimensions.get('window');
const GRID_GAP = Spacing['3'];
const GRID_PAD = Spacing['4'];
const CARD_W = (W - GRID_GAP - GRID_PAD * 2) / 2;
const BANNER_W = W - GRID_PAD * 2;

// ─── Box animée de base ───────────────────────────────────────────

interface BoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export const SkeletonBox: React.FC<BoxProps> = ({
  width = '100%',
  height = 16,
  borderRadius = Radius.sm,
  style,
}) => {
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const bg = isDark ? '#3A3A3A' : '#E0E0E0';

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: bg }, style, { opacity }]}
    />
  );
};

// ─── Carte article liste (ArticleCard variant list) ───────────────

export const ArticleCardSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={{ backgroundColor: colors.backgroundCard, paddingHorizontal: Spacing['4'], paddingVertical: Spacing['4'], flexDirection: 'row', gap: Spacing['3'] }}>
      <View style={{ flex: 1, gap: Spacing['2'] }}>
        <SkeletonBox width={60} height={18} borderRadius={4} />
        <SkeletonBox height={14} />
        <SkeletonBox height={14} width="80%" />
        <SkeletonBox height={14} width="60%" />
        <SkeletonBox width={80} height={12} style={{ marginTop: 4 }} />
      </View>
      <SkeletonBox width={80} height={80} borderRadius={Radius.sm} />
    </View>
  );
};

// ─── Carte article grille 2 colonnes (JaGridCard) ────────────────

export const GridCardSkeleton: React.FC = () => (
  <SkeletonBox width={CARD_W} height={240} borderRadius={0} />
);

// ─── Paire de grille ──────────────────────────────────────────────

export const GridPairSkeleton: React.FC = () => (
  <View style={{ flexDirection: 'row', gap: GRID_GAP, paddingHorizontal: GRID_PAD, marginBottom: Spacing['2'] }}>
    <GridCardSkeleton />
    <GridCardSkeleton />
  </View>
);

// ─── Banner promo ─────────────────────────────────────────────────

export const BannerSkeleton: React.FC = () => (
  <View style={{ marginVertical: Spacing['3'], paddingHorizontal: Spacing['4'] }}>
    <SkeletonBox width={BANNER_W} height={160} borderRadius={Radius.lg} />
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing['2'] }}>
      {[0, 1, 2, 3].map((i) => (
        <SkeletonBox key={i} width={i === 0 ? 16 : 6} height={6} borderRadius={3} />
      ))}
    </View>
  </View>
);

// ─── Petit banner pub ─────────────────────────────────────────────

export const SmallBannerSkeleton: React.FC = () => (
  <View style={{ marginHorizontal: Spacing['4'], marginVertical: Spacing['3'] }}>
    <SkeletonBox width={40} height={8} borderRadius={2} style={{ marginBottom: 4 }} />
    <SkeletonBox height={90} borderRadius={Radius.md} />
  </View>
);

// ─── Section "Les plus lus" ───────────────────────────────────────

export const MostReadSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={{ backgroundColor: colors.backgroundCard, paddingVertical: Spacing['3'] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing['4'], marginBottom: Spacing['3'], gap: Spacing['2'] }}>
        <SkeletonBox width={20} height={20} borderRadius={10} />
        <SkeletonBox width={120} height={16} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing['4'], gap: Spacing['3'] }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ width: 160, gap: Spacing['2'] }}>
            <SkeletonBox width={160} height={90} borderRadius={Radius.md} />
            <SkeletonBox height={12} />
            <SkeletonBox height={12} width="80%" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ─── Squelette complet HomeScreen ─────────────────────────────────

export const HomeScreenSkeleton: React.FC = () => (
  <View style={StyleSheet.absoluteFill}>
    <BannerSkeleton />
    <SmallBannerSkeleton />
    <GridPairSkeleton />
    <GridPairSkeleton />
    <MostReadSkeleton />
    <GridPairSkeleton />
  </View>
);

// ─── Squelette ArticleDetailScreen ───────────────────────────────

export const ArticleDetailSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Hero image */}
      <SkeletonBox height={W * 0.75} borderRadius={0} />
      <View style={{ paddingHorizontal: Spacing['4'], paddingTop: Spacing['4'], gap: Spacing['3'] }}>
        {/* Badges */}
        <View style={{ flexDirection: 'row', gap: Spacing['2'] }}>
          <SkeletonBox width={80} height={22} borderRadius={Radius.full} />
          <SkeletonBox width={60} height={22} borderRadius={Radius.full} />
        </View>
        {/* Titre */}
        <SkeletonBox height={24} />
        <SkeletonBox height={24} width="90%" />
        <SkeletonBox height={24} width="70%" />
        {/* Auteur */}
        <View style={{ flexDirection: 'row', gap: Spacing['2'], alignItems: 'center' }}>
          <SkeletonBox width={32} height={32} borderRadius={16} />
          <SkeletonBox width={120} height={14} />
        </View>
        {/* Corps */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <SkeletonBox key={i} height={14} width={i % 3 === 0 ? '75%' : '100%'} />
        ))}
      </View>
    </View>
  );
};

// ─── Squelette CategoryDetailScreen ──────────────────────────────

export const CategoryDetailSkeleton: React.FC = () => (
  <View style={{ flex: 1 }}>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <ArticleCardSkeleton key={i} />
    ))}
  </View>
);

// ─── Squelette liste générique (SearchScreen, Notifications…) ────

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <View style={{ flex: 1 }}>
    {Array.from({ length: count }).map((_, i) => (
      <ArticleCardSkeleton key={i} />
    ))}
  </View>
);

// ─── Squelette carte emploi ───────────────────────────────────────

export const JobCardSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={{ backgroundColor: colors.backgroundCard, borderRadius: Radius.md, padding: Spacing['4'], marginHorizontal: Spacing['4'], marginBottom: Spacing['3'], gap: Spacing['2'] }}>
      <View style={{ flexDirection: 'row', gap: Spacing['3'], alignItems: 'center' }}>
        <SkeletonBox width={46} height={46} borderRadius={Radius.sm} />
        <View style={{ flex: 1, gap: Spacing['2'] }}>
          <SkeletonBox height={16} width="70%" />
          <SkeletonBox height={13} width="50%" />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: Spacing['2'], marginTop: 4 }}>
        <SkeletonBox width={70} height={22} borderRadius={Radius.full} />
        <SkeletonBox width={90} height={22} borderRadius={Radius.full} />
      </View>
    </View>
  );
};

export const JobsListSkeleton: React.FC = () => (
  <View style={{ paddingTop: Spacing['4'] }}>
    {[0, 1, 2, 3, 4].map((i) => <JobCardSkeleton key={i} />)}
  </View>
);

// ─── Squelette carte magazine ─────────────────────────────────────

export const MagazineSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: Spacing['4'], gap: Spacing['4'] }}>
      {/* Couverture principale */}
      <SkeletonBox height={W * 0.7} borderRadius={Radius.lg} />
      <SkeletonBox height={20} width="60%" style={{ alignSelf: 'center' }} />
      <SkeletonBox height={44} borderRadius={Radius.full} />
      {/* Archives */}
      <SkeletonBox height={18} width={120} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['3'] }}>
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBox key={i} width={(W - Spacing['4'] * 2 - Spacing['3']) / 2} height={200} borderRadius={Radius.md} />
        ))}
      </View>
    </View>
  );
};
