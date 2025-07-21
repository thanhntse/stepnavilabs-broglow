// Blog types (mirrored from backend schema)
export interface BlogImage {
  url: string;
  caption?: string;
}

export interface Comment {
  _id?: string;
  author: any; // Can be populated User or just userId
  content: string;
  likes: number;
  likedBy: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Blog {
  _id: string;
  title: string;
  content: string;
  author: any; // Can be populated User or just userId
  likedBy: any[];
  likesCount: number;
  sharesCount: number;
  comments: Comment[];
  isActive: boolean;
  tags: string[];
  images: BlogImage[];
  createdAt?: string;
  updatedAt?: string;
  id: number;
}

export interface CreateCommentDto {
  content: string;
}

export interface Pagination {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

import { apiClient } from "@/lib/instance";

export class BlogService {
  // Create a new blog post
  static async createBlog(data: Partial<Blog>): Promise<Blog> {
    try {
      const response = await apiClient.post<Blog>(`/blogs`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating blog:", error);
      throw error;
    }
  }

  // Get all blogs (paginated)
  static async getBlogs(params?: Pagination): Promise<PaginatedResult<Blog>> {
    try {
      // Convert params to string values for APIClient
      const stringParams = params
        ? Object.fromEntries(Object.entries(params).map(([k, v]) => [k, v?.toString()]))
        : undefined;
      const response = await apiClient.get<PaginatedResult<Blog>>(`/blogs`, { params: stringParams });
      return response.data;
    } catch (error) {
      console.error("Error fetching blogs:", error);
      throw error;
    }
  }

  // Get a single blog by ID
  static async getBlog(id: string): Promise<Blog> {
    try {
      const response = await apiClient.get<Blog>(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog:", error);
      throw error;
    }
  }

  // Update a blog post
  static async updateBlog(id: string, data: Partial<Blog>): Promise<Blog> {
    try {
      const response = await apiClient.patch<Blog>(`/blogs/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating blog:", error);
      throw error;
    }
  }

  // Delete a blog post
  static async deleteBlog(id: string): Promise<void> {
    try {
      await apiClient.delete(`/blogs/${id}`);
    } catch (error) {
      console.error("Error deleting blog:", error);
      throw error;
    }
  }

  // Get blogs created by the authenticated user
  static async getMyBlogs(params?: Pagination): Promise<PaginatedResult<Blog>> {
    try {
      // Convert params to string values for APIClient
      const stringParams = params
        ? Object.fromEntries(Object.entries(params).map(([k, v]) => [k, v?.toString()]))
        : undefined;
      const response = await apiClient.get<PaginatedResult<Blog>>(`/blogs/my-blogs`, { params: stringParams });
      return response.data;
    } catch (error) {
      console.error("Error fetching my blogs:", error);
      throw error;
    }
  }

  // Add a comment to a blog post
  static async addComment(blogId: string, data: CreateCommentDto): Promise<Blog> {
    try {
      const response = await apiClient.post<Blog>(`/blogs/${blogId}/comments`, data);
      return response.data;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }

  // Remove a comment from a blog post
  static async removeComment(blogId: string, commentId: string): Promise<Blog> {
    try {
      const response = await apiClient.delete<Blog>(`/blogs/${blogId}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing comment:", error);
      throw error;
    }
  }

  // Like or unlike a blog post
  static async likeBlog(blogId: string): Promise<Blog> {
    try {
      const response = await apiClient.post<Blog>(`/blogs/${blogId}/like`);
      return response.data;
    } catch (error) {
      console.error("Error liking blog:", error);
      throw error;
    }
  }

  // Like or unlike a comment
  static async likeComment(blogId: string, commentId: string): Promise<Blog> {
    try {
      const response = await apiClient.post<Blog>(`/blogs/${blogId}/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      console.error("Error liking comment:", error);
      throw error;
    }
  }

  // Share a blog post
  static async shareBlog(blogId: string): Promise<{ message: string; shareUrl: string }> {
    try {
      const response = await apiClient.post<{ message: string; shareUrl: string }>(`/blogs/${blogId}/share`);
      return response.data;
    } catch (error) {
      console.error("Error sharing blog:", error);
      throw error;
    }
  }
}
