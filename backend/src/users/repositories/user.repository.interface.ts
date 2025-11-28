import { User } from '../../types/user.types';

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  avatarUrl?: string;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  avatarUrl?: string;
  password?: string;
}

export interface SearchUsersParams {
  query?: string;
  limit?: number;
  cursor?: string;
}

export interface SearchUsersResult {
  users: User[];
  nextCursor?: string;
}

export interface IUserRepository {
  /**
   * Create a new user
   */
  create(userData: CreateUserData): Promise<User>;

  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by username
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Update user data
   */
  update(id: string, userData: UpdateUserData): Promise<User>;

  /**
   * Delete user
   */
  delete(id: string): Promise<void>;

  /**
   * Search users with optional query and pagination
   */
  search(params: SearchUsersParams): Promise<SearchUsersResult>;
}
