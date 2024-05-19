import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { PermissionDto } from '../../permissions/dto/permission.dto';
import { Permission } from '../../permissions/entities/permission.entity';

export class MenuDto {
  @ApiProperty({ example: 1, description: 'The ID of the menu' })
  id: number;

  @ApiProperty({ example: 'Menu 1', description: 'The name of the menu' })
  name: string;

  @ApiProperty({
    example: 'Group',
    description: 'The icon of the menu get from https://lucide.dev/',
  })
  icon: string;

  @ApiProperty({ example: 1, description: 'The sort of the menu' })
  sort: number;

  @ApiProperty({
    example: '/menu-1',
    description: 'The path of the menu',
  })
  path: string;

  @ApiProperty({ type: MenuDto, isArray: true })
  children: MenuDto[];

  @ApiProperty({ type: MenuDto })
  parent: MenuDto;

  @Exclude({ toPlainOnly: true })
  parentId: number;

  @ApiProperty({ type: PermissionDto })
  permissions: Permission[];

  @ApiProperty({
    example: '2021-09-01T00:00:00.000Z',
    description: 'The date the menu was created',
  })
  @Expose({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    example: '2021-09-01T00:00:00.000Z',
    description: 'The date the menu was last updated',
  })
  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<MenuDto>) {
    Object.assign(this, partial);
  }
}
