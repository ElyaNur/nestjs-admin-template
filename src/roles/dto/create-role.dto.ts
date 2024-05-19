import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { Expose } from 'class-transformer';
import { PermissionDto } from '../../permissions/dto/permission.dto';

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN', description: 'Role name' })
  @IsString()
  @Length(1, 20)
  name: string;

  @ApiProperty({ example: [1, 2, 3], description: 'Array of permission IDs' })
  @Expose({ name: 'permission_ids' })
  permissionIds?: number[];

  permissions?: PermissionDto[];

  constructor(partial: Partial<CreateRoleDto>) {
    Object.assign(this, partial);
  }
}
