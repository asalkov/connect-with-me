import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserStatus } from '../entities/user.entity';
import { UpdateProfileDto } from './dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    avatarUrl: null,
    bio: 'Test bio',
    status: UserStatus.OFFLINE,
    lastSeenAt: new Date(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
    conversations: [],
  };

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.username).toBe(mockUser.username);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateDto: UpdateProfileDto = {
        firstName: 'Updated',
        lastName: 'Name',
        bio: 'Updated bio',
      };

      const updatedUser = { ...mockUser, ...updateDto };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(mockUser.id, updateDto);

      expect(result.firstName).toBe(updateDto.firstName);
      expect(result.lastName).toBe(updateDto.lastName);
      expect(result.bio).toBe(updateDto.bio);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateProfile('nonexistent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchUsers', () => {
    it('should search users with query', async () => {
      const mockUsers = [mockUser];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockUsers),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchUsers({ query: 'test', page: 1, limit: 20 });

      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should exclude current user from search results', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.searchUsers({ query: 'test' }, mockUser.id);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.id != :currentUserId',
        { currentUserId: mockUser.id },
      );
    });
  });

  describe('updateAvatar', () => {
    it('should update user avatar', async () => {
      const avatarUrl = '/uploads/avatars/avatar-123.jpg';
      const updatedUser = { ...mockUser, avatarUrl };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateAvatar(mockUser.id, avatarUrl);

      expect(result.avatarUrl).toBe(avatarUrl);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateAvatar('nonexistent', '/avatar.jpg')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteAvatar', () => {
    it('should delete user avatar', async () => {
      const updatedUser = { ...mockUser, avatarUrl: null };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.deleteAvatar(mockUser.id);

      expect(result.avatarUrl).toBeNull();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(result).toBe(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername(mockUser.username);

      expect(result).toBe(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { username: mockUser.username },
      });
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toBe(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
    });
  });
});
