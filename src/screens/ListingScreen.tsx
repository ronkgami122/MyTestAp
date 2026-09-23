import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { generateDummyData, DummyItem } from '../utils/dummyData';

export const ListingScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  const [items, setItems] = useState<DummyItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedUser, setSelectedUser] = useState<DummyItem | null>(null);

  const loadData = useCallback(() => {
    const data = generateDummyData(25);
    setItems(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadData();
      setIsRefreshing(false);
    }, 600);
  }, [loadData]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'All' || item.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, selectedStatus]);

  const getStatusColor = (status: DummyItem['status']) => {
    switch (status) {
      case 'Active':
        return colors.success;
      case 'Away':
        return colors.warning;
      case 'Offline':
        return colors.danger;
      default:
        return colors.textMuted;
    }
  };

  const getStatusBgColor = (status: DummyItem['status']) => {
    switch (status) {
      case 'Active':
        return isDark ? 'rgba(52, 211, 153, 0.2)' : '#D1FAE5';
      case 'Away':
        return isDark ? 'rgba(251, 191, 36, 0.2)' : '#FEF3C7';
      case 'Offline':
        return isDark ? 'rgba(248, 113, 113, 0.2)' : '#FEE2E2';
      default:
        return colors.surface;
    }
  };

  const renderItem = ({ item }: { item: DummyItem }) => {
    const statusColor = getStatusColor(item.status);
    const statusBg = getStatusBgColor(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSelectedUser(item)}
        style={[
          styles.itemCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: item.avatar }}
            style={styles.avatar}
            defaultSource={require('../assets/logo.jpg')}
          />
          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.nameText, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusLabel, { color: statusColor }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={[styles.roleText, { color: colors.primary }]} numberOfLines={1}>
              {item.role}
            </Text>

            <Text style={[styles.departmentText, { color: colors.textSecondary }]} numberOfLines={1}>
              🏢 {item.department} • 📍 {item.city}
            </Text>

            <Text style={[styles.emailText, { color: colors.textMuted }]} numberOfLines={1}>
              ✉️ {item.email}
            </Text>
          </View>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

        <View style={styles.cardFooter}>
          <Text style={[styles.joinDateText, { color: colors.textMuted }]}>
            Joined: {item.joinDate}
          </Text>
          <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
            View Details →
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar Header */}
      <View style={[styles.searchSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search by name, role, email..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={[styles.clearSearch, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}
        >
          {['All', 'Active', 'Away', 'Offline'].map(status => {
            const isSelected = selectedStatus === status;
            return (
              <TouchableOpacity
                key={status}
                activeOpacity={0.7}
                onPress={() => setSelectedStatus(status)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : isDark
                      ? colors.surface
                      : '#F1F5F9',
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Stats Counter */}
      <View style={styles.statsBar}>
        <Text style={[styles.statsText, { color: colors.textSecondary }]}>
          Showing <Text style={{ fontWeight: '700', color: colors.text }}>{filteredItems.length}</Text> dummy records from <Text style={{ color: colors.primary, fontWeight: '700' }}>@faker-js/faker</Text>
        </Text>
      </View>

      {/* Dummy List */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔎</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Results Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              No users match your query "{searchQuery}".
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedStatus('All');
              }}
              style={[styles.resetSearchButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.resetSearchText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* User Details Modal */}
      {selectedUser ? (
        <Modal
          visible={!!selectedUser}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedUser(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
              ]}
            >
              <View style={styles.modalTopBar}>
                <Text style={[styles.modalHeading, { color: colors.text }]}>Profile Details</Text>
                <TouchableOpacity onPress={() => setSelectedUser(null)}>
                  <Text style={[styles.closeModalText, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHero}>
                  <Image
                    source={{ uri: selectedUser.avatar }}
                    style={styles.modalAvatar}
                  />
                  <Text style={[styles.modalName, { color: colors.text }]}>{selectedUser.name}</Text>
                  <Text style={[styles.modalRole, { color: colors.primary }]}>{selectedUser.role}</Text>
                  <View
                    style={[
                      styles.modalStatusPill,
                      { backgroundColor: getStatusBgColor(selectedUser.status) },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(selectedUser.status) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusLabel,
                        { color: getStatusColor(selectedUser.status) },
                      ]}
                    >
                      {selectedUser.status} Status
                    </Text>
                  </View>
                </View>

                <View style={[styles.modalDetailsBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.modalDetailRow}>
                    <Text style={[styles.modalDetailLabel, { color: colors.textSecondary }]}>Email</Text>
                    <Text style={[styles.modalDetailValue, { color: colors.text }]}>{selectedUser.email}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={[styles.modalDetailLabel, { color: colors.textSecondary }]}>Phone</Text>
                    <Text style={[styles.modalDetailValue, { color: colors.text }]}>{selectedUser.phone}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={[styles.modalDetailLabel, { color: colors.textSecondary }]}>Department</Text>
                    <Text style={[styles.modalDetailValue, { color: colors.text }]}>{selectedUser.department}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={[styles.modalDetailLabel, { color: colors.textSecondary }]}>Location</Text>
                    <Text style={[styles.modalDetailValue, { color: colors.text }]}>{selectedUser.city}, {selectedUser.country}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={[styles.modalDetailLabel, { color: colors.textSecondary }]}>Joined</Text>
                    <Text style={[styles.modalDetailValue, { color: colors.text }]}>{selectedUser.joinDate}</Text>
                  </View>
                </View>

                <View style={styles.bioSection}>
                  <Text style={[styles.bioTitle, { color: colors.textSecondary }]}>Biography</Text>
                  <Text style={[styles.bioBody, { color: colors.text }]}>{selectedUser.bio}</Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedUser(null)}
                  style={[styles.closeModalButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.closeModalButtonText}>Close Profile</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    padding: 14,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  clearSearch: {
    fontSize: 16,
    padding: 4,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  statsBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statsText: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 24,
    gap: 12,
  },
  itemCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  departmentText: {
    fontSize: 12,
    marginTop: 3,
  },
  emailText: {
    fontSize: 11,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinDateText: {
    fontSize: 11,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  resetSearchButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetSearchText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
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
    maxHeight: '85%',
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeModalText: {
    fontSize: 18,
    fontWeight: '700',
    padding: 4,
  },
  modalHero: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  modalAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 10,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalRole: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  modalStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 8,
  },
  modalDetailsBox: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalDetailLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalDetailValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  bioSection: {
    marginTop: 16,
    padding: 12,
  },
  bioTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  bioBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeModalButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ListingScreen;
