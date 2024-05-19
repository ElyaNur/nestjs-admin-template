import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateMenuDto {
  @ApiProperty({ example: 'Menu 1', description: 'The name of the menu' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @ApiProperty({
    example: 'Group',
    description: 'The icon of the menu get from https://lucide.dev/',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  icon: string;

  @ApiProperty({ example: 1, description: 'The sort of the menu' })
  @IsInt()
  @IsNotEmpty()
  sort: number;

  @ApiProperty({
    example: '/menu-1',
    description: 'The path of the menu',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.parent_id)
  @Length(1, 50)
  path: string;

  @ApiProperty({ example: 1, description: 'The parent ID of the menu' })
  @Expose({ name: 'parent_id' })
  @IsOptional()
  parentId: number;

  @ApiProperty({
    example: [1, 2],
    description: 'The permission IDs of the menu',
  })
  @Expose({ name: 'permission_ids' })
  @IsArray()
  @IsOptional()
  permissionIds: number[];

  constructor(partial: Partial<CreateMenuDto>) {
    Object.assign(this, partial);
  }
}
