export interface APIResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface APIError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export interface TokenPair {
  token: string;
  refreshToken: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
