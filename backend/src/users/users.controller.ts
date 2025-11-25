import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, UserResponseDto, SearchUsersDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved', type: UserResponseDto })
  async getMyProfile(@GetUser() user: User): Promise<UserResponseDto> {
    return this.usersService.getProfile(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated', type: UserResponseDto })
  async updateMyProfile(
    @GetUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  @ApiResponse({ status: 200, description: 'Users found' })
  async searchUsers(
    @Query() searchDto: SearchUsersDto,
    @GetUser() user: User,
  ): Promise<{ users: UserResponseDto[]; total: number; page: number; limit: number }> {
    return this.usersService.searchUsers(searchDto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiResponse({ status: 200, description: 'User profile retrieved', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserProfile(@Param('id') userId: string): Promise<UserResponseDto> {
    return this.usersService.getProfile(userId);
  }

  @Put('me/avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar uploaded', type: UserResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'avatars');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Delete old avatar if exists
    const currentUser = await this.usersService.findById(user.id);
    if (currentUser?.avatarUrl) {
      const oldAvatarPath = path.join(process.cwd(), currentUser.avatarUrl);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Generate URL for the uploaded file
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(user.id, avatarUrl);
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: 'Delete user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar deleted', type: UserResponseDto })
  async deleteAvatar(@GetUser() user: User): Promise<UserResponseDto> {
    // Delete avatar file from disk
    const currentUser = await this.usersService.findById(user.id);
    if (currentUser?.avatarUrl) {
      const avatarPath = path.join(process.cwd(), currentUser.avatarUrl);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    return this.usersService.deleteAvatar(user.id);
  }
}
