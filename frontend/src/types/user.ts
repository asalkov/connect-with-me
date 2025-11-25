export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  status: UserStatus;
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  status?: UserStatus;
}

export interface SearchUsersParams {
  query?: string;
  page?: number;
  limit?: number;
}

export interface SearchUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}
