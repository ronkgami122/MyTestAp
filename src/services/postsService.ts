import ApiClient from './apiClient';

export interface Post {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
  views: number;
  userId: number;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
}

export interface PostTag {
  slug: string;
  name: string;
  url: string;
}

const BASE_URL = 'https://dummyjson.com';

export const PostsService = {
  /**
   * Fetch paginated posts from DummyJSON
   */
  async getPosts(limit = 10, skip = 0): Promise<PostsResponse> {
    return await ApiClient.get<PostsResponse>(`${BASE_URL}/posts`, {
      limit,
      skip,
    });
  },

  /**
   * Search posts by title or body query
   */
  async searchPosts(query: string, limit = 10, skip = 0): Promise<PostsResponse> {
    return await ApiClient.get<PostsResponse>(`${BASE_URL}/posts/search`, {
      q: query,
      limit,
      skip,
    });
  },

  /**
   * Fetch posts filtered by a specific tag
   */
  async getPostsByTag(tag: string, limit = 10, skip = 0): Promise<PostsResponse> {
    return await ApiClient.get<PostsResponse>(`${BASE_URL}/posts/tag/${encodeURIComponent(tag)}`, {
      limit,
      skip,
    });
  },

  /**
   * Fetch all available post tags for filtering
   */
  async getTags(): Promise<Array<string | PostTag>> {
    try {
      const tags = await ApiClient.get<Array<string | PostTag>>(`${BASE_URL}/posts/tags`);
      return tags;
    } catch {
      return ['history', 'american', 'crime', 'french', 'fiction', 'english', 'magical', 'love', 'mystery'];
    }
  },
};

export default PostsService;
