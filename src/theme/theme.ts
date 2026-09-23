import { lightColors, darkColors, ThemeColors } from './colors';

export interface AppTheme {
  dark: boolean;
  colors: ThemeColors;
}

export const lightTheme: AppTheme = {
  dark: false,
  colors: lightColors,
};

export const darkTheme: AppTheme = {
  dark: true,
  colors: darkColors,
};

export { lightColors, darkColors };
export type { ThemeColors };
