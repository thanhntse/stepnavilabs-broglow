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

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
}
