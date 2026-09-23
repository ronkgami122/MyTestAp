import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import CountriesService, { ApiCountry } from '../services/countriesService';

export type Country = ApiCountry;

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

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch countries live from https://countries.dev/countries via Axios
  const loadCountries = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const data = await CountriesService.getCountries({
        fields: 'name,capital,flag,alpha2Code,callingCodes,population,region',
        full: true,
        sort: 'name',
        limit: 100,
        offset: 0,
      });
      setCountries(data);
    } catch (err: any) {
      console.warn('Error loading countries from API:', err);
      setFetchError('Failed to fetch live country list. Tap to retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;
    const q = searchQuery.toLowerCase().trim();
    return countries.filter(c => {
      const dial = c.callingCodes ? c.callingCodes.join(' ') : '';
      return (
        c.name.toLowerCase().includes(q) ||
        (c.capital && c.capital.toLowerCase().includes(q)) ||
        (c.alpha2Code && c.alpha2Code.toLowerCase().includes(q)) ||
        dial.includes(q)
      );
    });
  }, [countries, searchQuery]);

  const handleSelect = (country: Country) => {
    onChange(country);
    setModalVisible(false);
    setSearchQuery('');
  };

  const getDialCodeDisplay = (c: Country): string => {
    if (c.callingCodes && c.callingCodes.length > 0) {
      const code = c.callingCodes[0];
      return code.startsWith('+') ? code : `+${code}`;
    }
    return '';
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
          numberOfLines={1}
        >
          {value
            ? `${value.name} (${getDialCodeDisplay(value)})`
            : placeholder}
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
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Select Country
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Live API: countries.dev/countries
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalCancel, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <TextInput
              placeholder="Search by country, capital, code..."
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

            {isLoading ? (
              <View style={styles.loaderArea}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loaderText, { color: colors.textSecondary }]}>
                  Fetching countries from countries.dev API...
                </Text>
              </View>
            ) : fetchError && countries.length === 0 ? (
              <View style={styles.errorArea}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>⚠️</Text>
                <Text style={[styles.errorMsg, { color: colors.danger }]}>{fetchError}</Text>
                <TouchableOpacity
                  onPress={loadCountries}
                  style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.retryBtnText}>Retry Loading</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredCountries}
                keyExtractor={(item, index) => item.alpha2Code || item.name || String(index)}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isSelected = value?.name === item.name;
                  const dial = getDialCodeDisplay(item);

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
                      <View style={styles.countryInfo}>
                        <Text
                          style={[
                            styles.itemName,
                            { color: isSelected ? colors.primary : colors.text },
                            isSelected && { fontWeight: '700' },
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {item.capital ? (
                          <Text style={[styles.itemCapital, { color: colors.textMuted }]} numberOfLines={1}>
                            Capital: {item.capital}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={[styles.itemCode, { color: colors.textSecondary }]}>
                        {dial}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyResults}>
                    <Text style={[styles.emptyResultsText, { color: colors.textMuted }]}>
                      No countries match "{searchQuery}".
                    </Text>
                  </View>
                }
                style={styles.list}
              />
            )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
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
  loaderArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 13,
  },
  errorArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorMsg: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 1,
  },
  itemFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
  },
  itemCapital: {
    fontSize: 12,
    marginTop: 2,
  },
  itemCode: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyResultsText: {
    fontSize: 14,
  },
});

export default CustomCountryPicker;
