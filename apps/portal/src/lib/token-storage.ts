// token-storage.ts

import { TokenPair } from "@/data/types";

export class TokenStorage {
  private static ACCESS_TOKEN_KEY = "token";
  private static REFRESH_TOKEN_KEY = "refresh_token";

  static getTokens(): TokenPair | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    if (!token || !refreshToken) return null;

    return { token, refreshToken };
  }

  static setTokens(tokens: TokenPair): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  static clearTokens(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}
