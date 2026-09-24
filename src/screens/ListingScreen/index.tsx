import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../context/ThemeContext';
import { Post } from '../../services/postsService';
import { useListingScreen, TAG_FILTERS } from './useListingScreen';
import { styles } from './styles';

export const ListingScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const {
    posts,
    totalPosts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    errorMessage,
    searchQuery,
    selectedTag,
    selectedPost,
    setSelectedPost,
    fetchPosts,
    handleSearchChange,
    handleTagPress,
    handleClearSearch,
    handleResetFilters,
    handleLoadMore,
  } = useListingScreen();

  const renderPostItem = ({ item }: { item: Post }) => {
    const likes =
      item.reactions?.likes ??
      (typeof item.reactions === 'number' ? item.reactions : 0);
    const dislikes = item.reactions?.dislikes ?? 0;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSelectedPost(item)}
        style={[
          styles.postCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Post Top Row: Post ID & Views */}
        <View style={styles.postTopRow}>
          <View
            style={[styles.idBadge, { backgroundColor: colors.primaryLight }]}
          >
            <Text style={[styles.idBadgeText, { color: colors.primary }]}>
              Post #{item.id}
            </Text>
          </View>
          <View style={styles.viewsBadge}>
            <Ionicons
              name="eye-outline"
              size={13}
              color={colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.viewsText, { color: colors.textSecondary }]}>
              {item.views.toLocaleString()} views
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text
          style={[styles.postTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {/* Body Snippet */}
        <Text
          style={[styles.postBody, { color: colors.textSecondary }]}
          numberOfLines={3}
        >
          {item.body}
        </Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {item.tags.map(tag => (
            <View
              key={tag}
              style={[
                styles.tagChip,
                { backgroundColor: isDark ? colors.surface : '#EEF2FF' },
              ]}
            >
              <Text style={[styles.tagText, { color: colors.primary }]}>
                #{tag}
              </Text>
            </View>
          ))}
        </View>

        {/* End-to-end Separator */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Footer: Reactions & Author */}
        <View style={styles.postFooter}>
          <View style={styles.reactionsGroup}>
            <View style={styles.reactionItem}>
              <Ionicons
                name="thumbs-up-outline"
                size={13}
                color={colors.success}
              />
              <Text style={[styles.reactionPill, { color: colors.success }]}>
                {likes}
              </Text>
            </View>
            {dislikes > 0 ? (
              <View style={styles.reactionItem}>
                <Ionicons
                  name="thumbs-down-outline"
                  size={13}
                  color={colors.danger}
                />
                <Text style={[styles.reactionPill, { color: colors.danger }]}>
                  {dislikes}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.authorBadge}>
            <Ionicons
              name="person-outline"
              size={11}
              color={colors.textMuted}
            />
            <Text style={[styles.authorText, { color: colors.textMuted }]}>
              Author #{item.userId}
            </Text>
          </View>

          <Text style={[styles.readMoreText, { color: colors.primary }]}>
            Read More
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View
        style={[
          styles.searchSection,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search posts by title or keyword..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearchChange}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Chips by Tag */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsScroll}
        >
          {TAG_FILTERS.map(tag => {
            const isSelected = selectedTag === tag;
            return (
              <TouchableOpacity
                key={tag}
                activeOpacity={0.7}
                onPress={() => handleTagPress(tag)}
                style={[
                  styles.filterTagChip,
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
                    styles.filterTagText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tag === 'All' ? 'All Posts' : `#${tag}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content / Loading / Error State */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingLabel, { color: colors.textSecondary }]}>
            Fetching posts...
          </Text>
        </View>
      ) : errorMessage && posts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons
            name="file-tray-outline"
            size={48}
            color={colors.textMuted}
            style={{ marginBottom: 10 }}
          />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            No Data Found
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
            Unable to get data from API. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => fetchPosts(true)}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons
              name="refresh-outline"
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => String(item.id)}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchPosts(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                  Loading more posts...
                </Text>
              </View>
            ) : posts.length >= totalPosts && totalPosts > 0 ? (
              <Text
                style={[styles.endReachedText, { color: colors.textMuted }]}
              >
                ✓ All {totalPosts} posts loaded from DummyJSON
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="file-tray-outline"
                size={48}
                color={colors.textMuted}
                style={{ marginBottom: 10 }}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Data Found
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
                {searchQuery
                  ? `We couldn't find any posts for “${searchQuery}”. Try another search`
                  : 'No posts available.'}
              </Text>
              {searchQuery || selectedTag !== 'All' ? (
                <TouchableOpacity
                  onPress={handleResetFilters}
                  style={[
                    styles.retryButton,
                    { backgroundColor: colors.primary, marginTop: 16 },
                  ]}
                >
                  <Text style={styles.retryButtonText}>Clear Search & Reset</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => fetchPosts(true)}
                  style={[
                    styles.retryButton,
                    { backgroundColor: colors.primary, marginTop: 16 },
                  ]}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={16}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Post Details Modal */}
      {selectedPost ? (
        <Modal
          visible={!!selectedPost}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedPost(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
              ]}
            >
              <View style={styles.modalTopBar}>
                <View
                  style={[
                    styles.idBadge,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <Text style={[styles.idBadgeText, { color: colors.primary }]}>
                    Post #{selectedPost.id}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.modalScroll}
              >
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedPost.title}
                </Text>

                <View style={styles.modalMetaRow}>
                  <View style={styles.modalMetaItem}>
                    <Ionicons
                      name="person-outline"
                      size={14}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.modalMetaText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Author ID: {selectedPost.userId}
                    </Text>
                  </View>
                  <View style={styles.modalMetaItem}>
                    <Ionicons
                      name="eye-outline"
                      size={14}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.modalMetaText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {selectedPost.views.toLocaleString()} views
                    </Text>
                  </View>
                </View>

                {/* Tags */}
                <View style={styles.modalTagsRow}>
                  {selectedPost.tags.map(tag => (
                    <View
                      key={tag}
                      style={[
                        styles.tagChip,
                        {
                          backgroundColor: isDark ? colors.surface : '#EEF2FF',
                        },
                      ]}
                    >
                      <Text style={[styles.tagText, { color: colors.primary }]}>
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Full Body */}
                <Text style={[styles.modalBodyText, { color: colors.text }]}>
                  {selectedPost.body}
                </Text>

                {/* Reactions Card */}
                <View
                  style={[
                    styles.reactionsCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.reactionsHeading, { color: colors.text }]}
                  >
                    Community Reactions
                  </Text>
                  <View style={styles.reactionsDetailRow}>
                    <View style={styles.reactionStat}>
                      <Ionicons
                        name="thumbs-up"
                        size={24}
                        color={colors.success}
                      />
                      <Text
                        style={[
                          styles.reactionCount,
                          { color: colors.success },
                        ]}
                      >
                        {selectedPost.reactions?.likes ?? 0}
                      </Text>
                      <Text
                        style={[
                          styles.reactionLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Likes
                      </Text>
                    </View>
                    <View style={styles.reactionStat}>
                      <Ionicons
                        name="thumbs-down"
                        size={24}
                        color={colors.danger}
                      />
                      <Text
                        style={[styles.reactionCount, { color: colors.danger }]}
                      >
                        {selectedPost.reactions?.dislikes ?? 0}
                      </Text>
                      <Text
                        style={[
                          styles.reactionLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Dislikes
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};

export default ListingScreen;
