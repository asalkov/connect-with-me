import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'Chat Application API',
      version: '1.0.0',
      description: 'Real-time chat application backend',
      documentation: '/api/docs',
    };
  }

  async getHealth() {
    const dbStatus = process.env.DYNAMODB_USERS_TABLE ? 'dynamodb' : 'not-configured';

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
    };
  }
}
