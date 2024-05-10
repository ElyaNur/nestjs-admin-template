import { CreateRoleDto } from './create-role.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PermissionDto } from '../../permissions/dto/permission.dto';

export class RoleDto extends CreateRoleDto {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  id: number;

  @ApiProperty()
  @Expose({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<RoleDto>) {
    super(partial);
  }
}

export class RoleWithPermissionsDto extends RoleDto {
  @ApiProperty({ type: [PermissionDto] })
  permissions: PermissionDto[];

  constructor(partial: Partial<RoleWithPermissionsDto>) {
    super(partial);
  }
}
