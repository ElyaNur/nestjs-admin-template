import { forwardRef, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    forwardRef(() => PermissionsModule),
    TypeOrmModule.forFeature([Role]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
