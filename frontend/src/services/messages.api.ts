const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  senderId: string;
  conversationId: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageDto {
  content: string;
  type?: 'text' | 'image' | 'file';
  conversationId: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
}

export interface UpdateMessageDto {
  content: string;
}

export interface MessagesResponse {
  messages: Message[];
  nextCursor?: string;
}

class MessagesService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (!window.location.pathname.match(/^\/(login|register)/)) {
          window.location.href = '/login';
        }
      }
      const error = await response.json();
      throw error;
    }
    return response.json();
  }

  async getMessages(
    conversationId: string,
    limit?: number,
    cursor?: string
  ): Promise<MessagesResponse> {
    const url = new URL(`${API_URL}/messages/${conversationId}`);
    if (limit) {
      url.searchParams.append('limit', limit.toString());
    }
    if (cursor) {
      url.searchParams.append('cursor', cursor);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<MessagesResponse>(response);
  }

  async sendMessage(data: CreateMessageDto): Promise<Message> {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<{ message: Message }>(response);
    return result.message;
  }

  async updateMessage(id: string, data: UpdateMessageDto): Promise<Message> {
    const response = await fetch(`${API_URL}/messages/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<{ message: Message }>(response);
    return result.message;
  }

  async deleteMessage(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/messages/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    await this.handleResponse<{ message: string }>(response);
  }

  async markAsRead(messageId: string): Promise<void> {
    const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    await this.handleResponse<{ message: string }>(response);
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    const response = await fetch(`${API_URL}/messages/${conversationId}/read-all`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    await this.handleResponse<{ message: string }>(response);
  }
}

export const messagesService = new MessagesService();
