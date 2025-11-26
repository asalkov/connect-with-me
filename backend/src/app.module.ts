import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({})
export class AppModule {
  static forRoot(): DynamicModule {
    const isProduction = process.env.NODE_ENV === 'production';
    const useDynamoDB = process.env.DYNAMODB_USERS_TABLE !== undefined;

    const imports: any[] = [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      DatabaseModule.forRoot(),
    ];

    const providers: any[] = [AppService];

    // Only load Auth and Users modules in development
    // In production, these require DynamoDB repositories which aren't implemented yet
    if (!isProduction || !useDynamoDB) {
      imports.push(AuthModule, UsersModule);
      providers.push({
        provide: APP_GUARD,
        useClass: JwtAuthGuard,
      });
    }

    return {
      module: AppModule,
      imports,
      controllers: [AppController],
      providers,
    };
  }
}
