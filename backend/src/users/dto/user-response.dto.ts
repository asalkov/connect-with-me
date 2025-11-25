import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../entities/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ required: false })
  avatarUrl?: string;

  @ApiProperty({ required: false })
  bio?: string;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ required: false })
  lastSeenAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(user: any): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.username = user.username;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.avatarUrl = user.avatarUrl;
    dto.bio = user.bio;
    dto.status = user.status;
    dto.lastSeenAt = user.lastSeenAt;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
