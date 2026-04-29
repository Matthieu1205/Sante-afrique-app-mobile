import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Colors, FontFamily, FontSize } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onFinish, 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <Text style={styles.logoSante}>santé</Text>
          <Text style={styles.logoAfrique}>afrique</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          La santé en Afrique, à votre portée
        </Text>
      </Animated.View>

      {/* Indicateur chargement en bas */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={styles.loadingBar}>
          <Animated.View
            style={[
              styles.loadingFill,
              {
                width: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.footerText}>santeafrique.net</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logoSante: {
    fontFamily: FontFamily.logo,
    fontSize: 52,
    color: Colors.white,
    letterSpacing: -1,
    lineHeight: 56,
  },
  logoAfrique: {
    fontFamily: FontFamily.logo,
    fontSize: 52,
    color: Colors.white,
    letterSpacing: -1,
    opacity: 0.9,
    lineHeight: 52,
  },
  tagline: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
    gap: 12,
    width: SCREEN_WIDTH * 0.5,
  },
  loadingBar: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  loadingFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 1,
  },
  footerText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
});
