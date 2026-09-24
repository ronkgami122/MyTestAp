import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StatusBar } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { IMAGES } from '../assets';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 2000,
}) => {
  const { isDark } = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Smooth spring animation from small to big
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      onFinish();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish, scaleAnim]);

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
      <Animated.Image
        source={IMAGES.logo}
        style={[
          styles.logo,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 160,
  },
});

export default SplashScreen;
