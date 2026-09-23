import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

export const HeaderThemeToggle: React.FC = () => {
  const { isDark, toggleTheme, colors } = useAppTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onPress={toggleTheme}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surface : colors.primaryLight,
          borderColor: isDark ? colors.border : '#C7D2FE',
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{isDark ? '🌙' : '☀️'}</Text>
        <Text
          style={[
            styles.label,
            { color: isDark ? colors.text : colors.primary },
          ]}
        >
          {isDark ? 'Dark' : 'Light'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default HeaderThemeToggle;
