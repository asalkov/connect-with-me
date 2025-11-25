import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../entities/user.entity';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';

export const typeOrmConfig: DataSourceOptions = {
  type: 'sqlite',
  database: 'data/chat.db',
  entities: [User, Conversation, Message],
  synchronize: true, // Set to false in production
  logging: process.env.NODE_ENV === 'development',
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
};

// DataSource for CLI migrations
const dataSource = new DataSource(typeOrmConfig);

export default dataSource;
