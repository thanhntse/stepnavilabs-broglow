import { apiClient } from "@/lib/instance";

export interface RoutineQuestion {
  _id: string;
  question: string;
  description?: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT' | 'SCALE';
  options?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  order: number;
  isActive: boolean;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineAnswer {
  questionId: string;
  answers: string[];
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
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RoutineSuggestionStream {
  getThreadId: () => Promise<string>;
  getTextStream: () => AsyncGenerator<string, void, unknown>;
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
  static async getSuggestions(answersData: CreateRoutineAnswersDto): Promise<RoutineSuggestionStream> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/routine-questions/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(answersData),
    });

    if (!response.ok) {
      throw new Error('Failed to get routine suggestions');
    }

    const reader = response.body && response.body.getReader ? response.body.getReader() : undefined;
    if (!reader) {
      throw new Error('No response stream available');
    }

    let threadId = '';
    let threadIdPromiseResolve: ((id: string) => void) | null = null;
    const threadIdPromise = new Promise<string>((resolve) => {
      threadIdPromiseResolve = resolve;
    });

    async function* textStreamGenerator() {
      if (!reader) return;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim()) continue; // Skip empty lines

          if (line.startsWith('data: ')) {
            try {
              // First line containing threadId
              const jsonData = line.slice(6); // Remove 'data: ' prefix
              const data = JSON.parse(jsonData);

              if (data.threadId && !threadId) {
                threadId = data.threadId;
                if (threadIdPromiseResolve) threadIdPromiseResolve(threadId);
                continue;
              }
            } catch (err) {
              console.log('Error parsing threadId line:', err);
            }
          } else {
            try {
              // All other events as JSON objects
              const data = JSON.parse(line);

              // Handle message delta events which contain the actual text content
              if (data.event === 'thread.message.delta') {
                const delta = data.data?.delta;

                if (delta?.content && delta.content.length > 0) {
                  const content = delta.content[0];

                  if (content.type === 'text' && content.text?.value) {
                    yield content.text.value;
                  }
                }
              }
            } catch (err) {
              console.log('Error parsing event line:', line, err);
            }
          }
        }
      }
    }

    return {
      getThreadId: async () => {
        if (threadId) return threadId;
        return threadIdPromise;
      },
      getTextStream: textStreamGenerator,
    };
  }
}
