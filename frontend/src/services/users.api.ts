import { User, UpdateProfileData, SearchUsersParams, SearchUsersResponse } from '../types/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class UsersApiService {
  private getHeaders(includeAuth = true, isFormData = false): HeadersInit {
    const headers: HeadersInit = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

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
      const error = await response.json();
      throw error;
    }
    return response.json();
  }

  async getMyProfile(): Promise<User> {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse<User>(response);
  }

  async updateMyProfile(data: UpdateProfileData): Promise<User> {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(response);
  }

  async getUserProfile(userId: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse<User>(response);
  }

  async searchUsers(params: SearchUsersParams): Promise<SearchUsersResponse> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_URL}/users/search?${queryParams.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse<SearchUsersResponse>(response);
  }

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/users/me/avatar`, {
      method: 'PUT',
      headers: this.getHeaders(true, true),
      credentials: 'include',
      body: formData,
    });
    return this.handleResponse<User>(response);
  }

  async deleteAvatar(): Promise<User> {
    const response = await fetch(`${API_URL}/users/me/avatar`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse<User>(response);
  }
}

export const usersApi = new UsersApiService();
