import { APIError, APIResponse, TokenPair } from "@/data/types";
import { TokenStorage } from "./token-storage";

interface RequestOptions {
  headers?: Record<string, string>;
  responseType?: "json" | "blob" | "text";
  params?: Record<string, string>;
  formData?: boolean;
}

export class APIClient {
  private baseURL: string;
  private headers: Record<string, string>;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.headers = {
      "Content-Type": "application/json",
    };
    this.loadTokens();
  }

  private loadTokens() {
    const tokens = TokenStorage.getTokens();
    if (tokens) {
      this.setAuthToken(tokens.token);
    }
  }

  setAuthToken(token: string) {
    this.headers["Authorization"] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.headers["Authorization"];
  }

  private async refreshToken(): Promise<TokenPair> {
    const tokens = TokenStorage.getTokens();
    if (!tokens?.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (!response.ok) {
      TokenStorage.clearTokens();
      throw new Error("Failed to refresh token");
    }

    const newTokens: TokenPair = await response.json();
    TokenStorage.setTokens(newTokens);
    return newTokens;
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private async handleTokenRefresh(): Promise<string> {
    try {
      const { token } = await this.refreshToken();
      this.onTokenRefreshed(token);
      return token;
    } catch (error) {
      this.refreshSubscribers = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private async handleResponse<T>(
    response: Response,
    options?: RequestOptions,
    retryCount = 0
  ): Promise<APIResponse<T>> {
    if (response.status === 401 && retryCount < 1) {
      // Token refresh logic giữ nguyên
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        try {
          const newToken = await this.handleTokenRefresh();
          this.setAuthToken(newToken);
          const newResponse = await fetch(response.url, {
            ...response,
            headers: {
              ...this.headers,
              ...(options?.headers || {}),
            },
          });
          return this.handleResponse<T>(newResponse, options, retryCount + 1);
        } catch (error) {
          console.error("Failed to refresh token:", error);
          TokenStorage.clearTokens();
          throw new Error("Authentication required");
        }
      } else {
        return new Promise((resolve, reject) => {
          this.addRefreshSubscriber(async (token) => {
            try {
              this.setAuthToken(token);
              const newResponse = await fetch(response.url, {
                ...response,
                headers: {
                  ...this.headers,
                  ...(options?.headers || {}),
                },
              });
              resolve(
                this.handleResponse<T>(newResponse, options, retryCount + 1)
              );
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    }

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      const isJson = contentType?.includes("application/json");
      const error: APIError = isJson
        ? await response.json()
        : { status: response.status, message: response.statusText };
      throw error;
    }

    let data: any;
    if (options?.responseType === "blob") {
      data = await response.blob();
    } else if (options?.responseType === "text") {
      data = await response.text();
    } else {
      const contentType = response.headers.get("content-type");
      data = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();
    }

    return {
      data,
      status: response.status,
      message: response.statusText,
    };
  }

  async get<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        ...this.headers,
        ...(options?.headers || {}),
      },
      next: { revalidate: 3600 },
    });

    return this.handleResponse<T>(response, options);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    const headers = { ...this.headers };

    // Handle FormData
    if (options?.formData || data instanceof FormData) {
      delete headers["Content-Type"];
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: {
        ...headers,
        ...(options?.headers || {}),
      },
      body:
        options?.formData || data instanceof FormData
          ? (data as FormData)
          : data
            ? JSON.stringify(data)
            : undefined,
    });

    return this.handleResponse<T>(response, options);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    const headers = { ...this.headers };

    // Handle FormData
    if (options?.formData || data instanceof FormData) {
      delete headers["Content-Type"];
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PATCH",
      headers: {
        ...headers,
        ...(options?.headers || {}),
      },
      body:
        options?.formData || data instanceof FormData
          ? (data as FormData)
          : data
            ? JSON.stringify(data)
            : undefined,
    });

    return this.handleResponse<T>(response, options);
  }

  async delete<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers: {
        ...this.headers,
        ...(options?.headers || {}),
      },
    });

    return this.handleResponse<T>(response, options);
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    turnstileToken: string,
    ip: string
  ): Promise<{ success: boolean; message: string; email: string }> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        turnstileToken,
        ip,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Register failed");
    }

    const result = await response.json();
    return result;
  }

  async login(
    email: string,
    password: string,
    turnstileToken: string,
    ip: string
  ): Promise<TokenPair> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, turnstileToken, ip }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const tokens: TokenPair = await response.json();
    TokenStorage.setTokens(tokens);
    this.setAuthToken(tokens.token);
    return tokens;
  }

  loginGoogle() {
    window.location.href = `${this.baseURL}/auth/google`;
  }

  async getTokenByGoogleLogin(code: string): Promise<TokenPair> {
    const response = await fetch(`${this.baseURL}/auth/google/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const tokens: TokenPair = await response.json();
    TokenStorage.setTokens(tokens);
    this.setAuthToken(tokens.token);
    return tokens;
  }

  logout() {
    TokenStorage.clearTokens();
    this.removeAuthToken();
  }
}
