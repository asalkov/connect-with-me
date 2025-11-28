export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeenAt?: Date | string;
  isActive?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
}
