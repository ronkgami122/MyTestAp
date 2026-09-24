import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../context/ThemeContext';
import CountriesService, { ApiCountry } from '../services/countriesService';

export type Country = ApiCountry;

const PAGE_SIZE = 20;
const DEBOUNCE_DELAY_MS = 400;

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
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search input state (immediate for smooth typing) and debounced state (400ms)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);

  // Request race-condition guard
  const lastRequestId = useRef<number>(0);

  // 400ms Debounce effect
  useEffect(() => {
    if (searchQuery.trim() === debouncedQuery.trim()) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setIsDebouncing(false);
      setDebouncedQuery(searchQuery);
    }, DEBOUNCE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedQuery]);

  // Fetch countries handler (supports both initial/search and pagination append)
  const fetchCountries = useCallback(
    async (query: string, targetOffset: number, isAppend: boolean) => {
      const requestId = ++lastRequestId.current;

      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setFetchError(null);
      }

      try {
        const data = await CountriesService.getCountries({
          search: query.trim() || undefined,
          limit: PAGE_SIZE,
          offset: targetOffset,
        });

        // Discard if a newer search/request was triggered
        if (requestId !== lastRequestId.current) {
          return;
        }

        if (isAppend) {
          setCountries(prev => [...prev, ...data]);
        } else {
          setCountries(data);
        }

        setOffset(targetOffset);
        setHasMore(data.length >= PAGE_SIZE);
      } catch (err: any) {
        if (requestId === lastRequestId.current) {
          console.warn('Error loading countries from API:', err);
          if (!isAppend) {
            setFetchError(
              'Failed to fetch country list from API. Tap to retry.',
            );
          }
        }
      } finally {
        if (requestId === lastRequestId.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
          setIsRefreshing(false);
        }
      }
    },
    [],
  );

  // Trigger search / initial load when debouncedQuery changes
  useEffect(() => {
    fetchCountries(debouncedQuery, 0, false);
  }, [debouncedQuery, fetchCountries]);

  // Pagination: load next page when reaching the end of the list
  const handleLoadMore = () => {
    if (isLoading || isLoadingMore || !hasMore || fetchError) {
      return;
    }
    const nextOffset = offset + PAGE_SIZE;
    fetchCountries(debouncedQuery, nextOffset, true);
  };

  // Pull to refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCountries(debouncedQuery, 0, false);
  };

  // Clear search input immediately and reset list
  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setIsDebouncing(false);
  };

  const handleSelect = (country: Country) => {
    onChange(country);
    setModalVisible(false);
    handleClearSearch();
  };

  const getDialCodeDisplay = (c: Country): string => {
    if (c.callingCodes && c.callingCodes.length > 0) {
      const code = c.callingCodes[0];
      return code.startsWith('+') ? code : `+${code}`;
    }
    return c.dialCode || '';
  };

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text
          style={[
            styles.label,
            { color: isDark ? colors.textSecondary : '#374151' },
          ]}
        >
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
        {value ? (
          <Text style={styles.flagIcon}>{value.flag}</Text>
        ) : (
          <Ionicons
            name="globe-outline"
            size={18}
            color={colors.primary}
            style={styles.flagIcon}
          />
        )}
        <Text
          style={[
            styles.inputText,
            { color: value ? colors.text : colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {value ? `${value.name} (${getDialCodeDisplay(value)})` : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </TouchableOpacity>

      {error ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </Text>
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
            {/* Search Input Bar & Close Icon in Single Row */}
            <View style={styles.searchHeaderRow}>
              <View
                style={[
                  styles.searchBarContainer,
                  {
                    backgroundColor: isDark ? colors.surface : '#F1F5F9',
                    borderColor:
                      isDebouncing || isLoading ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={colors.textMuted}
                  style={styles.searchIcon}
                />
                <TextInput
                  placeholder="Search by country name..."
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={[styles.searchInput, { color: colors.text }]}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {/* Debounce / Loading Spinner */}
                {isDebouncing || (isLoading && searchQuery.length > 0) ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={styles.searchRightAction}
                  />
                ) : searchQuery.length > 0 ? (
                  <TouchableOpacity
                    onPress={handleClearSearch}
                    style={styles.searchRightAction}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Content Area */}
            {isLoading && countries.length === 0 ? (
              <View style={styles.loaderArea}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={[styles.loaderText, { color: colors.textSecondary }]}
                >
                  {debouncedQuery
                    ? `Searching countries for "${debouncedQuery}"...`
                    : 'Fetching countries from API...'}
                </Text>
              </View>
            ) : fetchError && countries.length === 0 ? (
              <View style={styles.errorArea}>
                <Ionicons
                  name="alert-circle-outline"
                  size={36}
                  color={colors.danger}
                  style={{ marginBottom: 8 }}
                />
                <Text style={[styles.errorMsg, { color: colors.danger }]}>
                  {fetchError}
                </Text>
                <TouchableOpacity
                  onPress={() => fetchCountries(debouncedQuery, 0, false)}
                  style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                >
                  <View style={styles.retryInner}>
                    <Ionicons
                      name="refresh-outline"
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.retryBtnText}>Retry Loading</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={countries}
                keyExtractor={(item, index) =>
                  `${item.alpha2Code || item.name}-${index}`
                }
                keyboardShouldPersistTaps="handled"
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                  />
                }
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
                            {
                              color: isSelected ? colors.primary : colors.text,
                            },
                            isSelected && { fontWeight: '700' },
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {item.capital ? (
                          <Text
                            style={[
                              styles.itemCapital,
                              { color: colors.textMuted },
                            ]}
                            numberOfLines={1}
                          >
                            Capital: {item.capital}
                          </Text>
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.itemCode,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {dial}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                ListFooterComponent={() => {
                  if (isLoadingMore) {
                    return (
                      <View style={styles.footerLoader}>
                        <ActivityIndicator
                          size="small"
                          color={colors.primary}
                        />
                        <Text
                          style={[
                            styles.footerText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Loading more countries...
                        </Text>
                      </View>
                    );
                  }
                  if (!hasMore && countries.length > 0) {
                    return null;
                  }
                  return <View style={{ height: 16 }} />;
                }}
                ListEmptyComponent={
                  <View style={styles.emptyResults}>
                    <Ionicons
                      name="search-outline"
                      size={32}
                      color={colors.textMuted}
                      style={{ marginBottom: 8 }}
                    />
                    <Text
                      style={[styles.emptyResultsTitle, { color: colors.text }]}
                    >
                      No countries found
                    </Text>
                    <Text
                      style={[
                        styles.emptyResultsText,
                        { color: colors.textMuted },
                      ]}
                    >
                      No country matched "{debouncedQuery}". Try another keyword
                      or dial code.
                    </Text>
                    <TouchableOpacity
                      onPress={handleClearSearch}
                      style={[
                        styles.resetSearchBtn,
                        { borderColor: colors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.resetSearchBtnText,
                          { color: colors.primary },
                        ]}
                      >
                        Reset Search
                      </Text>
                    </TouchableOpacity>
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
    height: '82%',
  },
  searchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    padding: 0,
  },
  searchRightAction: {
    padding: 4,
  },
  modalCloseButton: {
    marginLeft: 12,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
  },
  footerEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  footerEndText: {
    fontSize: 12,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyResultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyResultsText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  resetSearchBtn: {
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 100,
  },
  resetSearchBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default CustomCountryPicker;
