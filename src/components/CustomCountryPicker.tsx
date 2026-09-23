import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

export interface Country {
  name: string;
  flag: string;
  code: string;
  dialCode: string;
}

export const COUNTRIES: Country[] = [
  { name: 'United States', flag: '🇺🇸', code: 'US', dialCode: '+1' },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'GB', dialCode: '+44' },
  { name: 'India', flag: '🇮🇳', code: 'IN', dialCode: '+91' },
  { name: 'Canada', flag: '🇨🇦', code: 'CA', dialCode: '+1' },
  { name: 'Australia', flag: '🇦🇺', code: 'AU', dialCode: '+61' },
  { name: 'Germany', flag: '🇩🇪', code: 'DE', dialCode: '+49' },
  { name: 'France', flag: '🇫🇷', code: 'FR', dialCode: '+33' },
  { name: 'Japan', flag: '🇯🇵', code: 'JP', dialCode: '+81' },
  { name: 'Brazil', flag: '🇧🇷', code: 'BR', dialCode: '+55' },
  { name: 'Singapore', flag: '🇸🇬', code: 'SG', dialCode: '+65' },
  { name: 'Netherlands', flag: '🇳🇱', code: 'NL', dialCode: '+31' },
  { name: 'Switzerland', flag: '🇨🇭', code: 'CH', dialCode: '+41' },
  { name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE', dialCode: '+971' },
  { name: 'Spain', flag: '🇪🇸', code: 'ES', dialCode: '+34' },
  { name: 'Italy', flag: '🇮🇹', code: 'IT', dialCode: '+39' },
  { name: 'South Korea', flag: '🇰🇷', code: 'KR', dialCode: '+82' },
  { name: 'Mexico', flag: '🇲🇽', code: 'MX', dialCode: '+52' },
  { name: 'New Zealand', flag: '🇳🇿', code: 'NZ', dialCode: '+64' },
  { name: 'Sweden', flag: '🇸🇪', code: 'SE', dialCode: '+46' },
  { name: 'South Africa', flag: '🇿🇦', code: 'ZA', dialCode: '+27' },
];

interface CustomCountryPickerProps {
  value: Country | null;
  onChange: (country: Country) => void;
  label?: string;
  error?: string;
  placeholder?: string;
}

export const CustomCountryPicker: React.FC<CustomCountryPickerProps> = ({
  value,
  onChange,
  label = 'Country Selector',
  error,
  placeholder = 'Select your country',
}) => {
  const { colors, isDark } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const q = searchQuery.toLowerCase().trim();
    return COUNTRIES.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q),
    );
  }, [searchQuery]);

  const handleSelect = (country: Country) => {
    onChange(country);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: isDark ? colors.textSecondary : '#374151' }]}>
          {label} <Text style={{ color: colors.danger }}>*</Text>
        </Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? colors.surface : '#FFFFFF',
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        <Text style={styles.flagIcon}>{value ? value.flag : '🌐'}</Text>
        <Text
          style={[
            styles.inputText,
            { color: value ? colors.text : colors.textMuted },
          ]}
        >
          {value ? `${value.name} (${value.dialCode})` : placeholder}
        </Text>
        <Text style={[styles.chevron, { color: colors.textMuted }]}>▼</Text>
      </TouchableOpacity>

      {error ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
      ) : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Country
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalCancel, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Search country or code..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[
                styles.searchInput,
                {
                  backgroundColor: isDark ? colors.surface : '#F1F5F9',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
            />

            <FlatList
              data={filteredCountries}
              keyExtractor={item => item.code}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = value?.code === item.code;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSelect(item)}
                    style={[
                      styles.countryItem,
                      isSelected && { backgroundColor: colors.primaryLight },
                    ]}
                  >
                    <Text style={styles.itemFlag}>{item.flag}</Text>
                    <Text
                      style={[
                        styles.itemName,
                        { color: isSelected ? colors.primary : colors.text },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text style={[styles.itemCode, { color: colors.textSecondary }]}>
                      {item.dialCode}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              style={styles.list}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  flagIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
  },
  chevron: {
    fontSize: 10,
    marginLeft: 6,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalCancel: {
    fontSize: 15,
    fontWeight: '600',
  },
  searchInput: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 1,
  },
  itemFlag: {
    fontSize: 22,
    marginRight: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
  },
  itemCode: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CustomCountryPicker;
