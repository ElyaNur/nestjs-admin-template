import { CreatePermissionDto } from './create-permission.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { RoleDto } from '../../roles/dto/role.dto';

export class PermissionDto extends CreatePermissionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  @Expose({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<PermissionDto>) {
    super(partial);
  }
}

export class PermissionWithRolesDto extends PermissionDto {
  @ApiProperty({ type: [RoleDto] })
  roles: RoleDto[];

  constructor(partial: Partial<PermissionWithRolesDto>) {
    super(partial);
  }
}
