import { apiClient } from "@/lib/instance";

export class AIService {
  /**
   * Tạo một thread mới
   * @returns Promise với threadId
   */
  static async createThread(): Promise<any> {
    try {
      const response = await apiClient.post<any>("/openai/thread");
      return response.data;
    } catch (error) {
      console.error("Error creating thread:", error);
      throw error;
    }
  }

  /**
   * Upload file lên server
   * @param formData FormData chứa file cần upload
   * @returns Promise với file id
   */
  static async uploadFile(formData: FormData): Promise<any> {
    try {
      const response = await apiClient.post<any>("/openai/upload", formData, {
        formData: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  /**
   * Gửi tin nhắn tới thread
   * @param threadId ID của thread
   * @param content Nội dung tin nhắn (có thể là text hoặc image)
   * @param tone Phong thái của AI khi trả lời (tùy chọn)
   * @returns Stream response từ OpenAI
   */
  static async sendMessage(
    threadId: string,
    content: any[],
    tone?: string,
  ): Promise<Response> {
    try {
      // Đảm bảo gửi đúng định dạng content
      const formattedContent = content.map((item) => {
        if (item.type === "text") {
          // Đảm bảo text được gửi đúng định dạng
          return {
            type: "text",
            text:
              typeof item.text === "string"
                ? item.text
                : JSON.stringify(item.text),
          };
        }
        return item;
      });

      const requestBody: any = {
        content: formattedContent,
        tone: tone
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/openai/thread/${threadId}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      // Nếu status không ok, xử lý lỗi
      if (!response.ok) {
        // Thử đọc body lỗi nếu có thể
        try {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(
            errorData.error ||
              errorData.message ||
              `HTTP error! status: ${response.status}`
          );
        } catch (jsonError) {
          console.error("JSON Error:", jsonError);
          // Nếu không thể parse JSON, ném lỗi với status code
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // Trả về response
      return response;
    } catch (error: any) {
      console.error("Error sending message:", error);
      // Tạo một Response lỗi để trả về
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  /**
   * Lấy thông tin thread
   * @param threadId ID của thread
   * @returns Promise với thông tin thread
   */
  static async getThread(threadId: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/openai/thread/${threadId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting thread:", error);
      throw error;
    }
  }

  /**
   * Submit tool outputs cho một run
   * @param threadId ID của thread
   * @param runId ID của run
   * @param toolCallOutputs Output từ tool calls
   * @returns Stream response
   */
  static async submitToolOutputs(
    threadId: string,
    runId: string,
    toolCallOutputs: any[]
  ): Promise<any> {
    try {
      const response = await apiClient.post<any>(
        `/openai/thread/${threadId}/run/${runId}`,
        { toolCallOutputs }
      );
      return response;
    } catch (error) {
      console.error("Error submitting tool outputs:", error);
      throw error;
    }
  }

  /**
   * Lấy file từ server
   * @param fileId ID của file
   * @returns Promise với file URL
   */
  static async getFile(fileId: string): Promise<string> {
    try {
      const response = await apiClient.get<Blob>(`/openai/file/${fileId}`, {
        responseType: "blob",
      });

      // Tạo URL từ blob
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error("Error getting file:", error);
      throw error;
    }
  }

  /**
   * Lấy thông tin sử dụng AI
   * @returns Promise với thông tin usage
   */
  static async getAIUsage(): Promise<any> {
    try {
      const response = await apiClient.get<number>(`/openai/usage`);
      return response;
    } catch (error) {
      console.error("Error getting usage:", error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tin nhắn từ thread
   * @param threadId ID của thread
   * @returns Promise với danh sách tin nhắn
   */
  static async listMessagesByThread(threadId: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(
        `/openai/thread/${threadId}/list-messages`
      );
      return response;
    } catch (error) {
      console.error("Error listing messages:", error);
      throw error;
    }
  }

  /**
   * Lấy danh sách thread của người dùng
   * @returns Promise với danh sách thread
   */
  static async listThreadsByUser(): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/openai/list-threads`);
      return response;
    } catch (error) {
      console.error("Error listing threads:", error);
      throw error;
    }
  }

  /**
   * Check if the current user is the owner of a thread
   * @param threadId ID of the thread to check
   * @returns Promise with ownership status
   */
  static async isThreadOwner(threadId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<any>(`/openai/thread/${threadId}/check-ownership`);
      return response.data?.isOwner || false;
    } catch (error) {
      console.error("Error checking thread ownership:", error);
      return false;
    }
  }

  /**
   * Get product recommendations based on skin scan results
   * @param threadId ID of the thread
   * @returns Promise with recommended product IDs
   */
  static async getProductRecommendations(threadId: string): Promise<string[]> {
    try {
      const response = await apiClient.post<any>(`/openai/thread/${threadId}/recommend-products`);
      return response.data?.recommendedProducts || [];
    } catch (error) {
      console.error("Error getting product recommendations:", error);
      return [];
    }
  }

  /**
   * Get product details by ID
   * @param productId ID of the product
   * @returns Promise with product details
   */
  static async getProductById(productId: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/products/${productId}`);

      // Ensure the product has a valid image URL
      if (response.data && response.data.imageUrl) {
        // If the image URL is relative (doesn't start with http or https),
        // prepend the API URL to make it absolute
        if (!response.data.imageUrl.startsWith('http')) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
          response.data.imageUrl = `${baseUrl}${response.data.imageUrl.startsWith('/') ? '' : '/'}${response.data.imageUrl}`;
        }
      }

      return response.data;
    } catch (error) {
      console.error(`Error getting product ${productId}:`, error);
      return null;
    }
  }
}
