import { apiClient } from "@/lib/instance";

export interface RoutineQuestion {
  _id: string;
  question: string;
  order: number;
  isRequired: boolean;
  isActive: boolean;
  options?: string[];
  questionType: 'text' | 'multiple_choice' | 'single_choice';
}

export interface RoutineAnswer {
  questionId: string;
  answer: string | string[];
}

export interface CreateRoutineAnswersDto {
  answers: RoutineAnswer[];
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

export interface RoutineSuggestionResponse {
  threadId: string;
  responseStream: ReadableStream;
}

export class RoutineService {
  // Get all routine questions with pagination
  static async getQuestions(params?: PaginationParams): Promise<PaginatedResponse<RoutineQuestion>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiClient.get<PaginatedResponse<RoutineQuestion>>(`/routine-questions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error("Error getting routine questions:", error);
      throw error;
    }
  }

  // Get specific routine question
  static async getQuestionById(id: string): Promise<RoutineQuestion> {
    try {
      const response = await apiClient.get<RoutineQuestion>(`/routine-questions/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting routine question:", error);
      throw error;
    }
  }

  // Submit routine answers and get suggestions
  static async getSuggestions(answersData: CreateRoutineAnswersDto): Promise<RoutineSuggestionResponse> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/routine-questions/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(answersData),
      });

      if (!response.ok) {
        throw new Error('Failed to get routine suggestions');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      return {
        threadId: '', // Will be set from the first data chunk
        responseStream: new ReadableStream({
          start(controller) {
            function push() {
              reader?.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');

                lines.forEach(line => {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.slice(6));
                      if (data.threadId) {
                        // Store threadId for later use
                        (response as any).threadId = data.threadId;
                      } else {
                        controller.enqueue(new TextEncoder().encode(data));
                      }
                    } catch (e: any) {
                      console.error("Error parsing JSON:", e.message || e);
                      // If not JSON, treat as regular text
                      controller.enqueue(value);
                    }
                  }
                });

                push();
              }).catch(error => {
                controller.error(error);
              });
            }

            push();
          }
        })
      };
    } catch (error) {
      console.error("Error getting routine suggestions:", error);
      throw error;
    }
  }
}
