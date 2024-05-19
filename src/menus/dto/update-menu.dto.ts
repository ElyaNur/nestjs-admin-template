import { PartialType } from '@nestjs/swagger';
import { CreateMenuDto } from './create-menu.dto';
import { Permission } from '../../permissions/entities/permission.entity';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  parent: UpdateMenuDto;
  permissions: Permission[];
}
