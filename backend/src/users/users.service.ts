import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateProfileDto, UserResponseDto, SearchUsersDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

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
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user fields
    Object.assign(user, updateProfileDto);

    const updatedUser = await this.userRepository.save(user);
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
    const skip = (page - 1) * limit;

    let queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true });

    // Exclude current user from search results
    if (currentUserId) {
      queryBuilder = queryBuilder.andWhere('user.id != :currentUserId', { currentUserId });
    }

    // Add search conditions
    if (query && query.trim()) {
      queryBuilder = queryBuilder.andWhere(
        '(user.username LIKE :query OR user.email LIKE :query OR user.firstName LIKE :query OR user.lastName LIKE :query)',
        { query: `%${query}%` },
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated results
    const users = await queryBuilder
      .orderBy('user.username', 'ASC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      users: users.map((user) => UserResponseDto.fromEntity(user)),
      total,
      page,
      limit,
    };
  }

  /**
   * Get user by ID (internal use)
   */
  async findById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  /**
   * Get user by username (internal use)
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  /**
   * Get user by email (internal use)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  /**
   * Update user avatar URL
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatarUrl = avatarUrl;
    const updatedUser = await this.userRepository.save(user);
    return UserResponseDto.fromEntity(updatedUser);
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatarUrl = null;
    const updatedUser = await this.userRepository.save(user);
    return UserResponseDto.fromEntity(updatedUser);
  }

  /**
   * Update user status
   */
  async updateStatus(userId: string, status: string): Promise<void> {
    await this.userRepository.update(userId, { status: status as any });
  }

  /**
   * Update last seen timestamp
   */
  async updateLastSeen(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastSeenAt: new Date() });
  }
}
