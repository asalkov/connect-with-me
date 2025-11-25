const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

class ApiService {
  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Handle 401 Unauthorized - clear auth state
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Only redirect if not already on login/register page
        if (!window.location.pathname.match(/^\/(login|register)/)) {
          window.location.href = '/login';
        }
      }
      const error: ApiError = await response.json();
      throw error;
    }
    return response.json();
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(true),
      credentials: 'include',
    });
    return this.handleResponse<void>(response);
  }

  async getProfile(): Promise<AuthResponse['user']> {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: this.getHeaders(true),
      credentials: 'include',
    });
    return this.handleResponse<AuthResponse['user']>(response);
  }
}

export const apiService = new ApiService();
