import { apiClient } from '@/lib/instance';

export class SubscriptionService {
  static async getSubscription() {
    try {
      const response = await apiClient.get(`/subscription`);
      return response.data;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  }

  static async getSubscriptionById(id: string) {
    try {
      const response = await apiClient.get(`/subscription/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting subscription by id:', error);
      throw error;
    }
  }
}
