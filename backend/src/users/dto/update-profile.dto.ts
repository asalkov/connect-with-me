import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../entities/user.entity';

export class UpdateProfileDto {
  @ApiProperty({ required: false, description: 'User first name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ required: false, description: 'User last name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ required: false, description: 'User bio/description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({ required: false, description: 'User status', enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ required: false, description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
