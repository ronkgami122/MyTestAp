export interface ThemeColors {
  background: string;
  card: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  border: string;
  cardBorder: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  headerBackground: string;
  headerText: string;
  statusBar: 'light-content' | 'dark-content';
}

export const lightColors: ThemeColors = {
  background: '#F4F6F9',
  card: '#FFFFFF',
  surface: '#EDF1F7',
  surfaceHover: '#E2E8F0',
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  primaryDark: '#3730A3',
  border: '#E5E7EB',
  cardBorder: '#E5E7EB',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#06B6D4',
  infoLight: '#CFFAFE',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabBarActive: '#4F46E5',
  tabBarInactive: '#9CA3AF',
  headerBackground: '#FFFFFF',
  headerText: '#111827',
  statusBar: 'dark-content',
};

export const darkColors: ThemeColors = {
  background: '#0F172A',
  card: '#1E293B',
  surface: '#334155',
  surfaceHover: '#475569',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#6366F1',
  primaryLight: '#312E81',
  primaryDark: '#4338CA',
  border: '#334155',
  cardBorder: '#1E293B',
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#78350F',
  danger: '#F87171',
  dangerLight: '#7F1D1D',
  info: '#38BDF8',
  infoLight: '#164E63',
  tabBarBackground: '#1E293B',
  tabBarBorder: '#334155',
  tabBarActive: '#818CF8',
  tabBarInactive: '#64748B',
  headerBackground: '#1E293B',
  headerText: '#F8FAFC',
  statusBar: 'light-content',
};
