import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 2200,
}) => {
  const { colors, isDark } = useAppTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const logoPath = require('../assets/logo.jpg');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, duration, onFinish]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#0A0F1D' : '#F8FAFC' },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={logoPath}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        <Text
          style={[
            styles.title,
            { color: isDark ? '#FFFFFF' : '#1E1B4B' },
          ]}
        >
          MyTestAp
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: isDark ? '#94A3B8' : '#64748B' },
          ]}
        >
          React Native Practical App
        </Text>

        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />
          <Text
            style={[
              styles.loadingText,
              { color: isDark ? '#64748B' : '#94A3B8' },
            ]}
          >
            Initializing application...
          </Text>
        </View>
      </Animated.View>

      <Text
        style={[
          styles.footer,
          { color: isDark ? '#475569' : '#CBD5E1' },
        ]}
      >
        Version 1.0.0
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 35,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 36,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
