const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ConversationParticipant {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  status?: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  avatarUrl?: string;
  participants: ConversationParticipant[];
  otherUser?: ConversationParticipant;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  };
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationDto {
  type: 'direct' | 'group';
  participantIds: string[];
  name?: string;
  description?: string;
}

export interface UpdateConversationDto {
  name?: string;
  description?: string;
  avatarUrl?: string;
}

class ConversationsService {
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

  async getConversations(limit?: number): Promise<Conversation[]> {
    const url = new URL(`${API_URL}/conversations`);
    if (limit) {
      url.searchParams.append('limit', limit.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    const data = await this.handleResponse<{ conversations: Conversation[] }>(response);
    return data.conversations;
  }

  async getConversation(id: string): Promise<Conversation> {
    const response = await fetch(`${API_URL}/conversations/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    const data = await this.handleResponse<{ conversation: Conversation }>(response);
    return data.conversation;
  }

  async createConversation(data: CreateConversationDto): Promise<Conversation> {
    const response = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<{ conversation: Conversation }>(response);
    return result.conversation;
  }

  async updateConversation(id: string, data: UpdateConversationDto): Promise<Conversation> {
    const response = await fetch(`${API_URL}/conversations/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<{ conversation: Conversation }>(response);
    return result.conversation;
  }

  async deleteConversation(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/conversations/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    await this.handleResponse<{ message: string }>(response);
  }

  async addParticipant(conversationId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/participants`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ userId }),
    });

    await this.handleResponse<{ message: string }>(response);
  }

  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/participants/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    await this.handleResponse<{ message: string }>(response);
  }

  async leaveConversation(conversationId: string): Promise<void> {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/leave`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    await this.handleResponse<{ message: string }>(response);
  }
}

export const conversationsService = new ConversationsService();
