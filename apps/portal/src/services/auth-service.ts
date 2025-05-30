import { User } from "@/data/types";
import { apiClient } from "@/lib/instance";

export class AuthService {
  static async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    turnstileToken: string
  ): Promise<{ success: boolean; message: string; email: string }> {
    const ip = await this.getClientIP();
    const response = await apiClient.register(
      firstName,
      lastName,
      email,
      password,
      turnstileToken,
      ip
    );
    return response;
  }

  static async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.get<{ success: boolean; message: string }>(`/auth/verify-email?token=${token}`);
    return response.data;
  }

  static async login(
    email: string,
    password: string,
    turnstileToken: string
  ): Promise<void> {
    const ip = await this.getClientIP();
    await apiClient.login(email, password, turnstileToken, ip);
  }

  static async redirectGoogleLogin(code: string): Promise<void> {
    await apiClient.getTokenByGoogleLogin(code);
  }

  static loginGoogle(): void {
    apiClient.loginGoogle();
  }

  static logout(): void {
    apiClient.logout();
  }

  static async getUserProfile(): Promise<User> {
    try {
      const response = await apiClient.get<User>("/auth/profile");
      return response.data;
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  }

  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error getting IP:", error);
      return "";
    }
  }
}
