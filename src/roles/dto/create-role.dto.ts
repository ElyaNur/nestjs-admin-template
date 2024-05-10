import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN', description: 'Role name' })
  @IsString()
  @Length(1, 20)
  name: string;

  constructor(partial: Partial<CreateRoleDto>) {
    Object.assign(this, partial);
  }
}
