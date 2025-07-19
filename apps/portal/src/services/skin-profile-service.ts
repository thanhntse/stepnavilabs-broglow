import { apiClient } from "@/lib/instance";

export interface SkinQuestion {
  _id: string;
  question: string;
  order: number;
  isRequired: boolean;
  isActive: boolean;
  options?: string[];
  questionType: 'text' | 'multiple_choice' | 'single_choice';
}

export interface SkinProfileAnswer {
  questionId: string;
  answer: string | string[];
}

export interface SubmitSkinProfileDto {
  answers: SkinProfileAnswer[];
}

export interface SkinProfile {
  _id: string;
  userId: string;
  answers: Array<{
    questionId: SkinQuestion;
    answer: string | string[];
  }>;
  skinType?: string;
  concerns?: string[];
  recommendations?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class SkinProfileService {
  // Get all skin profile questions with pagination
  static async getQuestions(params?: PaginationParams): Promise<PaginatedResponse<SkinQuestion>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiClient.get<PaginatedResponse<SkinQuestion>>(`/skin-profile/questions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error("Error getting skin questions:", error);
      throw error;
    }
  }

  // Get specific skin profile question
  static async getQuestionById(id: string): Promise<SkinQuestion> {
    try {
      const response = await apiClient.get<SkinQuestion>(`/skin-profile/questions/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting skin question:", error);
      throw error;
    }
  }

  // Submit skin profile answers
  static async submitSkinProfile(submitData: SubmitSkinProfileDto): Promise<SkinProfile> {
    try {
      const response = await apiClient.post<SkinProfile>('/skin-profile', submitData);
      return response.data;
    } catch (error) {
      console.error("Error submitting skin profile:", error);
      throw error;
    }
  }

  // Get current user's skin profile
  static async getUserSkinProfile(): Promise<SkinProfile> {
    try {
      const response = await apiClient.get<SkinProfile>('/skin-profile');
      return response.data;
    } catch (error) {
      console.error("Error getting user skin profile:", error);
      throw error;
    }
  }

  // Delete current user's skin profile
  static async deleteUserSkinProfile(): Promise<void> {
    try {
      await apiClient.delete('/skin-profile');
    } catch (error) {
      console.error("Error deleting user skin profile:", error);
      throw error;
    }
  }
}
