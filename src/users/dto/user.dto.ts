import { CreateUserDto } from './create-user.dto';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RoleDto } from '../../roles/dto/role.dto';

export class UserDto extends CreateUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  @Expose({ name: 'refresh_token' })
  refreshToken: string;

  @ApiProperty()
  @Expose({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<UserDto>) {
    super(partial);
  }
}

export class UserWithRolesDto extends UserDto {
  @ApiProperty({ type: [RoleDto] })
  roles: RoleDto[];

  constructor(partial: Partial<UserWithRolesDto>) {
    super(partial);
  }
}
