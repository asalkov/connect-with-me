import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../types/user.types';
import { UpdateProfileDto, UserResponseDto, SearchUsersDto } from './dto';
import { IUserRepository } from './repositories/user.repository.interface';
import { DynamoDBUserRepository } from './repositories/dynamodb-user.repository';
import { DynamoDBService } from '../database/dynamodb';

@Injectable()
export class UsersService {
  private userRepository: IUserRepository;

  constructor(
    private configService: ConfigService,
    private dynamoDBService: DynamoDBService,
  ) {
    console.log('👤 Users Service: Using DynamoDB User Repository');
    this.userRepository = new DynamoDBUserRepository(this.dynamoDBService);
  }

  /**
   * Create a new user (internal use - for Auth service)
   */
  async create(userData: any): Promise<User> {
    return await this.userRepository.create(userData);
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserResponseDto.fromEntity(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user fields
    const updatedUser = await this.userRepository.update(userId, updateProfileDto);
    return UserResponseDto.fromEntity(updatedUser);
  }

  /**
   * Search users by username, email, or name
   */
  async searchUsers(
    searchDto: SearchUsersDto,
    currentUserId?: string,
  ): Promise<{ users: UserResponseDto[]; total: number; page: number; limit: number }> {
    const { query, page = 1, limit = 20 } = searchDto;

    // Use repository search method
    const result = await this.userRepository.search({
      query: query?.trim(),
      limit,
    });

    // Filter out current user if specified
    let filteredUsers = result.users;
    if (currentUserId) {
      filteredUsers = filteredUsers.filter(user => user.id !== currentUserId);
    }

    return {
      users: filteredUsers.map((user) => UserResponseDto.fromEntity(user)),
      total: filteredUsers.length,
      page,
      limit,
    };
  }

  /**
   * Get user by ID (internal use)
   */
  async findById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  /**
   * Get user by username (internal use)
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  /**
   * Get user by email (internal use)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Update user avatar URL
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.update(userId, { avatarUrl });
    return UserResponseDto.fromEntity(updatedUser);
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.update(userId, { avatarUrl: null });
    return UserResponseDto.fromEntity(updatedUser);
  }

  /**
   * Update user status
   */
  async updateStatus(userId: string, status: string): Promise<void> {
    await this.userRepository.update(userId, { status });
  }

  /**
   * Update last seen timestamp
   */
  async updateLastSeen(userId: string): Promise<void> {
    // Note: lastSeenAt is not in UpdateUserData interface, so we skip this for now
    // TODO: Add lastSeenAt to UpdateUserData interface if needed
    console.warn('updateLastSeen not implemented for repository pattern');
  }
}
