import { useState, useEffect, useCallback, useRef } from 'react';
import PostsService, { Post } from '../../services/postsService';

export const PAGE_SIZE = 10;
export const TAG_FILTERS = [
  'All',
  'history',
  'fiction',
  'crime',
  'french',
  'magical',
  'english',
  'mystery',
];

export const useListingScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        setPosts([]);
        setTotalPosts(0);
        setErrorMessage(
          err?.message || 'Failed to load posts from DummyJSON API.',
        );
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

  // Handle Search Input with debounce (450ms)
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

  // Clear search and reset
  const handleClearSearch = () => {
    setSearchQuery('');
    fetchPosts(false, '', selectedTag);
  };

  // Full reset (clear search and revert tag to All)
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTag('All');
    fetchPosts(false, '', 'All');
  };

  // Handle Pagination (Load More)
  const handleLoadMore = async () => {
    if (
      isLoadingMore ||
      isLoading ||
      isRefreshing ||
      posts.length >= totalPosts
    ) {
      return;
    }

    setIsLoadingMore(true);
    try {
      let response;
      const skip = posts.length;

      if (searchQuery.trim()) {
        response = await PostsService.searchPosts(
          searchQuery.trim(),
          PAGE_SIZE,
          skip,
        );
      } else if (selectedTag !== 'All') {
        response = await PostsService.getPostsByTag(
          selectedTag,
          PAGE_SIZE,
          skip,
        );
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

  return {
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
  };
};
