import { User } from "@/data/types";
import { apiClient } from "@/lib/instance";

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  password?: string;
  avatar?: string;
}

export class ProfileService {
  static async updateProfile(userId: string, updateData: UpdateUserDto): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/users/${userId}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  static async deleteProfile(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${userId}`);
    } catch (error) {
      console.error("Error deleting user profile:", error);
      throw error;
    }
  }
}
