import { apiClient } from "@/lib/instance";

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

export class NotificationService {
  static async getNotifications(page = 1, limit = 10): Promise<NotificationsResponse> {
    try {
      const response = await apiClient.get<NotificationsResponse>(`/notifications?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await apiClient.patch<Notification>(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  static async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch<void>("/notifications/mark-all-read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  static async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<UnreadCountResponse>("/notifications/unread-count");
      return response.data.count;
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  static async deleteAllNotifications(): Promise<void> {
    try {
      await apiClient.delete("/notifications");
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      throw error;
    }
  }
}
