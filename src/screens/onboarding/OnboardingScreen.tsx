import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontSize, Spacing } from '@/theme';

const { width: W, height: H } = Dimensions.get('window');
const IMAGE_H = Math.round(H * 0.62);
const N = 3;

// ─── Slides ───────────────────────────────────────────────────────

const SLIDES = [
  {
    id: '1',
    title: 'Santé Afrique',
    subtitle: 'Infos fiables. Experts africains. Toujours avec vous.',
    image: require('../../assets/images/doctor.png'),
    image2: null as null,
  },
  {
    id: '2',
    title: 'Accès illimité',
    subtitle: 'Créez votre compte. Abonnez-vous. Profitez sans limite.',
    image: require('../../assets/images/sagef.png'),
    image2: require('../../assets/images/sagefemme.png'),
  },
  {
    id: '3',
    title: 'Carrière santé',
    subtitle: 'Publiez vos offres. Mettez votre CV. Trouvez des opportunités.',
    image: require('../../assets/images/medecin.jpg'),
    image2: null as null,
  },
];

// ─── Slide 2 phone sizes ──────────────────────────────────────────

const PHONE_W = W * 0.52;

// ─── Main screen ──────────────────────────────────────────────────

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);

  // Ref pour éviter le stale closure dans PanResponder
  const indexRef = useRef(0);
  const tx = useRef(new Animated.Value(0)).current;
  const isLast = index === N - 1;

  const goTo = (i: number) => {
    if (i < 0 || i >= N) return;
    indexRef.current = i;
    Animated.spring(tx, {
      toValue: -i * W,
      useNativeDriver: true,
      tension: 68,
      friction: 11,
    }).start();
    setIndex(i);
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
      onPanResponderRelease: (_, gs) => {
        // Utilise indexRef.current (jamais stale)
        const cur = indexRef.current;
        if (gs.vx < -0.3 || gs.dx < -50) goTo(Math.min(cur + 1, N - 1));
        else if (gs.vx > 0.3 || gs.dx > 50) goTo(Math.max(cur - 1, 0));
      },
    })
  ).current;

  const handleNext = () => {
    if (isLast) onComplete();
    else goTo(index + 1);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Images strip ─────────────────────────────── */}
      <View style={styles.imageContainer} {...pan.panHandlers}>
        <Animated.View style={[styles.imageStrip, { transform: [{ translateX: tx }] }]}>

          {/* Slide 1 — image pleine largeur */}
          <View style={styles.imageSlot}>
            <Image source={SLIDES[0].image} style={styles.image} resizeMode="cover" />
            <SlideOverlay index={0} tx={tx} />
          </View>

          {/* Slide 2 — deux téléphones (frames déjà intégrés dans les images) */}
          <View style={[styles.imageSlot, styles.dualBg]}>
            <Image
              source={SLIDES[1].image}
              style={[styles.phoneLeft, { width: PHONE_W, height: PHONE_W * 2.10 }]}
              resizeMode="contain"
            />
            <Image
              source={SLIDES[1].image2!}
              style={[styles.phoneRight, { width: PHONE_W, height: PHONE_W * 2.10 }]}
              resizeMode="contain"
            />
            <SlideOverlay index={1} tx={tx} />
          </View>

          {/* Slide 3 — image pleine largeur */}
          <View style={styles.imageSlot}>
            <Image source={SLIDES[2].image} style={styles.image} resizeMode="cover" />
            <SlideOverlay index={2} tx={tx} />
          </View>

        </Animated.View>
      </View>

      {/* ── White panel ──────────────────────────────── */}
      <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom + 8, 28) }]}>

        {/* Text animé par slide */}
        <View style={styles.textArea}>
          {SLIDES.map((slide, i) => {
            const opacity = tx.interpolate({
              inputRange: [-(i + 1) * W, -i * W, -(i - 1) * W],
              outputRange: [0, 1, 0],
              extrapolate: 'clamp',
            });
            const ty = tx.interpolate({
              inputRange: [-(i + 1) * W, -i * W, -(i - 1) * W],
              outputRange: [18, 0, -18],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={slide.id}
                style={[styles.slideText, { opacity, transform: [{ translateY: ty }] }]}
                pointerEvents={i === index ? 'auto' : 'none'}
              >
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>
              </Animated.View>
            );
          })}
        </View>

        {/* Dots animés */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const dotW = tx.interpolate({
              inputRange: [-(i + 1) * W, -i * W, -(i - 1) * W],
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = tx.interpolate({
              inputRange: [-(i + 1) * W, -i * W, -(i - 1) * W],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotW, opacity: dotOpacity }]}
              />
            );
          })}
        </View>

        {/* Nav : PASSER + bouton rond */}
        <View style={styles.nav}>
          <TouchableOpacity
            onPress={onComplete}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }}
          >
            <Text style={styles.skip}>PASSER</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <Feather
              name={isLast ? 'check' : 'arrow-right'}
              size={26}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ─── Overlay de transition entre slides ──────────────────────────

const SlideOverlay: React.FC<{ index: number; tx: Animated.Value }> = ({ index: i, tx }) => {
  const opacity = tx.interpolate({
    inputRange: [-(i + 1) * W, -i * W, -(i - 1) * W],
    outputRange: [0.35, 0, 0.35],
    extrapolate: 'clamp',
  });
  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity }]} />;
};

// ─── Styles ───────────────────────────────────────────────────────

const PANEL_H = H - IMAGE_H;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },

  imageContainer: { height: IMAGE_H, overflow: 'hidden' },
  imageStrip: {
    flexDirection: 'row',
    width: W * N,
    height: IMAGE_H,
  },
  imageSlot: { width: W, height: IMAGE_H },
  image: { width: W, height: IMAGE_H },

  // Slide 2 — fond clair + téléphones en absolu
  dualBg: {
    backgroundColor: '#E4F3FC',
  },
  phoneLeft: {
    position: 'absolute',
    left: 0,
    bottom: 20,
    transform: [{ rotate: '-6deg' }],
    zIndex: 1,
  },
  phoneRight: {
    position: 'absolute',
    right: W * 0.04,
    bottom: 4,
    transform: [{ rotate: '4deg' }],
    zIndex: 2,
  },

  // Panel bas
  panel: {
    height: PANEL_H,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing['5'],
    paddingTop: Spacing['5'],
    gap: Spacing['4'],
  },
  textArea: { flex: 1, position: 'relative', minHeight: 80 },
  slideText: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    gap: Spacing['2'],
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize['3xl'],
    color: Colors.primary,
    letterSpacing: -0.5,
    lineHeight: FontSize['3xl'] * 1.15,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: FontSize.md * 1.65,
  },

  // Dots
  dots: { flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] },
  dot: { height: 8, borderRadius: 4, backgroundColor: Colors.primary },

  // Navigation
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skip: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  nextBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 10,
    elevation: 10,
  },
});
