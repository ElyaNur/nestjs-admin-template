import { forwardRef, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { RolesModule } from '../roles/roles.module';
import { Role } from '../roles/entities/role.entity';

@Module({
  imports: [
    forwardRef(() => RolesModule),
    TypeOrmModule.forFeature([Permission, Role]),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
