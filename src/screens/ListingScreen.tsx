import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import PostsService, { Post } from '../services/postsService';

const PAGE_SIZE = 10;
const TAG_FILTERS = ['All', 'history', 'fiction', 'crime', 'french', 'magical', 'english', 'mystery'];

export const ListingScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const searchTimeoutRef = useRef<any>(null);

  // Fetch posts from DummyJSON API via Axios
  const fetchPosts = useCallback(
    async (isRefresh = false, query = searchQuery, tag = selectedTag) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (posts.length === 0) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        let response;
        if (query.trim()) {
          response = await PostsService.searchPosts(query.trim(), PAGE_SIZE, 0);
        } else if (tag !== 'All') {
          response = await PostsService.getPostsByTag(tag, PAGE_SIZE, 0);
        } else {
          response = await PostsService.getPosts(PAGE_SIZE, 0);
        }

        setPosts(response.posts);
        setTotalPosts(response.total);
      } catch (err: any) {
        console.error('Failed to fetch posts from DummyJSON:', err);
        setErrorMessage(err?.message || 'Failed to load posts from DummyJSON API.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchQuery, selectedTag, posts.length],
  );

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle Search Input with debounce
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchPosts(false, text, selectedTag);
    }, 450);
  };

  // Handle Tag Selection
  const handleTagPress = (tag: string) => {
    setSelectedTag(tag);
    setSearchQuery('');
    fetchPosts(false, '', tag);
  };

  // Handle Pagination (Load More)
  const handleLoadMore = async () => {
    if (isLoadingMore || isLoading || isRefreshing || posts.length >= totalPosts) {
      return;
    }

    setIsLoadingMore(true);
    try {
      let response;
      const skip = posts.length;

      if (searchQuery.trim()) {
        response = await PostsService.searchPosts(searchQuery.trim(), PAGE_SIZE, skip);
      } else if (selectedTag !== 'All') {
        response = await PostsService.getPostsByTag(selectedTag, PAGE_SIZE, skip);
      } else {
        response = await PostsService.getPosts(PAGE_SIZE, skip);
      }

      setPosts(prev => [...prev, ...response.posts]);
    } catch (err) {
      console.warn('Failed to load more posts:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    const likes = item.reactions?.likes ?? (typeof item.reactions === 'number' ? item.reactions : 0);
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
          <View style={[styles.idBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.idBadgeText, { color: colors.primary }]}>Post #{item.id}</Text>
          </View>
          <View style={styles.viewsBadge}>
            <Text style={[styles.viewsText, { color: colors.textSecondary }]}>
              👁️ {item.views.toLocaleString()} views
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.postTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Body Snippet */}
        <Text style={[styles.postBody, { color: colors.textSecondary }]} numberOfLines={3}>
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
              <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Footer: Reactions & Author */}
        <View style={styles.postFooter}>
          <View style={styles.reactionsGroup}>
            <Text style={[styles.reactionPill, { color: colors.success }]}>
              👍 {likes}
            </Text>
            {dislikes > 0 ? (
              <Text style={[styles.reactionPill, { color: colors.danger }]}>
                👎 {dislikes}
              </Text>
            ) : null}
          </View>

          <Text style={[styles.authorText, { color: colors.textMuted }]}>
            Author ID: {item.userId}
          </Text>

          <Text style={[styles.readMoreText, { color: colors.primary }]}>
            Read More →
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={[styles.searchSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search DummyJSON posts by title or keyword..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearchChange}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                fetchPosts(false, '', selectedTag);
              }}
            >
              <Text style={[styles.clearSearch, { color: colors.textMuted }]}>✕</Text>
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

      {/* Info Bar */}
      <View style={styles.infoBar}>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          API: <Text style={{ color: colors.primary, fontWeight: '700' }}>dummyjson.com/posts</Text>
          {totalPosts > 0 ? ` • ${posts.length} of ${totalPosts} loaded` : ''}
        </Text>
      </View>

      {/* Main Content / Loading / Error State */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingLabel, { color: colors.textSecondary }]}>
            Fetching live posts via Axios...
          </Text>
        </View>
      ) : errorMessage && posts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>⚠️</Text>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to Load Posts</Text>
          <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>{errorMessage}</Text>
          <TouchableOpacity
            onPress={() => fetchPosts(true)}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.retryButtonText}>Retry Request</Text>
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
              <Text style={[styles.endReachedText, { color: colors.textMuted }]}>
                ✓ All {totalPosts} posts loaded from DummyJSON
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Posts Found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                No DummyJSON posts matched your query "{searchQuery}".
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedTag('All');
                  fetchPosts(false, '', 'All');
                }}
                style={[styles.retryButton, { backgroundColor: colors.primary, marginTop: 16 }]}
              >
                <Text style={styles.retryButtonText}>Clear Search & Reset</Text>
              </TouchableOpacity>
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
                <View style={[styles.idBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.idBadgeText, { color: colors.primary }]}>
                    Post #{selectedPost.id}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                  <Text style={[styles.closeModalText, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedPost.title}
                </Text>

                <View style={styles.modalMetaRow}>
                  <Text style={[styles.modalMetaText, { color: colors.textSecondary }]}>
                    👤 Author ID: {selectedPost.userId}
                  </Text>
                  <Text style={[styles.modalMetaText, { color: colors.textSecondary }]}>
                    👁️ {selectedPost.views.toLocaleString()} views
                  </Text>
                </View>

                {/* Tags */}
                <View style={styles.modalTagsRow}>
                  {selectedPost.tags.map(tag => (
                    <View
                      key={tag}
                      style={[
                        styles.tagChip,
                        { backgroundColor: isDark ? colors.surface : '#EEF2FF' },
                      ]}
                    >
                      <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>

                {/* Full Body */}
                <Text style={[styles.modalBodyText, { color: colors.text }]}>
                  {selectedPost.body}
                </Text>

                {/* Reactions Card */}
                <View style={[styles.reactionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.reactionsHeading, { color: colors.text }]}>Community Reactions</Text>
                  <View style={styles.reactionsDetailRow}>
                    <View style={styles.reactionStat}>
                      <Text style={{ fontSize: 24 }}>👍</Text>
                      <Text style={[styles.reactionCount, { color: colors.success }]}>
                        {selectedPost.reactions?.likes ?? 0}
                      </Text>
                      <Text style={[styles.reactionLabel, { color: colors.textSecondary }]}>Likes</Text>
                    </View>
                    <View style={styles.reactionStat}>
                      <Text style={{ fontSize: 24 }}>👎</Text>
                      <Text style={[styles.reactionCount, { color: colors.danger }]}>
                        {selectedPost.reactions?.dislikes ?? 0}
                      </Text>
                      <Text style={[styles.reactionLabel, { color: colors.textSecondary }]}>Dislikes</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedPost(null)}
                  style={[styles.closeModalButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.closeModalButtonText}>Close Article</Text>
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
  searchBar: {
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
  tagsScroll: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  filterTagChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTagText: {
    fontSize: 12,
  },
  infoBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 28,
    gap: 12,
  },
  postCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  postTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  idBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  idBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  viewsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  postBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reactionsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  reactionPill: {
    fontSize: 13,
    fontWeight: '600',
  },
  authorText: {
    fontSize: 11,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingLabel: {
    marginTop: 12,
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorSubtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 13,
  },
  endReachedText: {
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
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
  closeModalText: {
    fontSize: 20,
    fontWeight: '700',
    padding: 4,
  },
  modalScroll: {
    paddingTop: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 10,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalMetaText: {
    fontSize: 13,
  },
  modalTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  modalBodyText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },
  reactionsCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  reactionsHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  reactionsDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reactionStat: {
    alignItems: 'center',
    gap: 4,
  },
  reactionCount: {
    fontSize: 18,
    fontWeight: '700',
  },
  reactionLabel: {
    fontSize: 12,
  },
  closeModalButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ListingScreen;
