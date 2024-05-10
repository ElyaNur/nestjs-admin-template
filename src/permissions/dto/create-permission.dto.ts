import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'Can update user', description: 'Permission name' })
  @IsString()
  @Length(1, 20)
  name: string;

  constructor(partial: Partial<CreatePermissionDto>) {
    Object.assign(this, partial);
  }
}
