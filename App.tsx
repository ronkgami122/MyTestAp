import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import SplashScreen from './src/components/SplashScreen';

const AppContent: React.FC = () => {
  const { navigationTheme, isDark, colors } = useAppTheme();
  const [showSplash, setShowSplash] = useState<boolean>(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} duration={2000} />;
  }

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBackground}
      />
      <NavigationContainer theme={navigationTheme as any}>
        <BottomTabNavigator />
      </NavigationContainer>
    </>
  );
};

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
