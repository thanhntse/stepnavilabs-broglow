import { User } from "@/data/types";
import { apiClient } from "@/lib/instance";

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  password?: string;
  avatar?: string;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
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

  static async uploadAvatar(file: File): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<FileUploadResponse>('/files/upload', formData);
      return response.data;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  static async uploadMultipleFiles(files: File[]): Promise<FileUploadResponse[]> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await apiClient.post<FileUploadResponse[]>('/files/upload-multiple', formData);
      return response.data;
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    }
  }
}
