import { Injectable, Optional } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @Optional()
    @InjectDataSource()
    private dataSource?: DataSource,
  ) {}

  getInfo() {
    return {
      name: 'Chat Application API',
      version: '1.0.0',
      description: 'Real-time chat application backend',
      documentation: '/api/docs',
    };
  }

  async getHealth() {
    let dbStatus = 'not-configured';
    
    // Check if using DynamoDB (Lambda environment)
    if (process.env.DYNAMODB_USERS_TABLE) {
      dbStatus = 'dynamodb';
    } else if (this.dataSource) {
      // Check TypeORM/SQLite connection
      try {
        if (this.dataSource.isInitialized) {
          await this.dataSource.query('SELECT 1');
          dbStatus = 'connected';
        } else {
          dbStatus = 'disconnected';
        }
      } catch (error) {
        dbStatus = 'error';
      }
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
    };
  }
}
