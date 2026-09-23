import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ThemeColors } from '../theme/colors';
import { lightTheme, darkTheme, AppTheme } from '../theme/theme';

export interface NavigationThemeType {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
}

export interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
  theme: AppTheme;
  navigationTheme: NavigationThemeType;
  toggleTheme: () => void;
  setDarkTheme: (isDark: boolean) => void;
}

const defaultContextValue: ThemeContextValue = {
  isDark: false,
  colors: lightColors,
  theme: lightTheme,
  navigationTheme: {
    dark: false,
    colors: {
      primary: lightColors.primary,
      background: lightColors.background,
      card: lightColors.card,
      text: lightColors.text,
      border: lightColors.border,
      notification: lightColors.danger,
    },
  },
  toggleTheme: () => {},
  setDarkTheme: () => {},
};

export const ThemeContext = createContext<ThemeContextValue>(defaultContextValue);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(systemScheme === 'dark');

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setDarkTheme = (value: boolean) => {
    setIsDark(value);
  };

  const colors = isDark ? darkColors : lightColors;
  const theme = isDark ? darkTheme : lightTheme;

  const navigationTheme = useMemo<NavigationThemeType>(() => {
    return {
      dark: isDark,
      colors: {
        primary: colors.primary,
        background: colors.background,
        card: colors.headerBackground,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [isDark, colors]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      isDark,
      colors,
      theme,
      navigationTheme,
      toggleTheme,
      setDarkTheme,
    }),
    [isDark, colors, theme, navigationTheme],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
