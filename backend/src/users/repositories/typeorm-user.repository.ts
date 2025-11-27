import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../../entities/user.entity';
import {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
  SearchUsersParams,
  SearchUsersResult,
} from './user.repository.interface';

@Injectable()
export class TypeORMUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userData: CreateUserData): Promise<User> {
    const user = this.userRepository.create(userData as any);
    const result = await this.userRepository.save(user);
    const savedUser = Array.isArray(result) ? result[0] : result;
    console.log(`✅ User created in TypeORM: ${savedUser.id}`);
    return savedUser;
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    await this.userRepository.update(id, userData as any);
    const updatedUser = await this.findById(id);
    console.log(`✅ User updated in TypeORM: ${id}`);
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
    console.log(`✅ User deleted from TypeORM: ${id}`);
  }

  async search(params: SearchUsersParams): Promise<SearchUsersResult> {
    const { query, limit = 20 } = params;

    if (!query) {
      const users = await this.userRepository.find({
        take: limit,
        order: { createdAt: 'DESC' },
      });
      return { users };
    }

    // Search across multiple fields
    const users = await this.userRepository.find({
      where: [
        { firstName: Like(`%${query}%`) },
        { lastName: Like(`%${query}%`) },
        { username: Like(`%${query}%`) },
        { email: Like(`%${query}%`) },
      ],
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { users };
  }
}
