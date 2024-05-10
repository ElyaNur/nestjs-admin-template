import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionDto } from './dto/permission.dto';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { RolesService } from '../roles/roles.service';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @Inject(forwardRef(() => RolesService))
    private readonly roleService: RolesService,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    this.logger.info(
      `Creating a new permission: ${JSON.stringify(createPermissionDto)}`,
    );

    const permissionExist = await this.permissionRepository.existsBy({
      name: createPermissionDto.name,
    });

    if (permissionExist) {
      throw new BadRequestException([
        {
          name: 'permission name already been taken',
          property: 'name',
          value: createPermissionDto.name,
        },
      ]);
    }

    const permission = await this.permissionRepository.save(
      new Permission(createPermissionDto),
    );

    return new PermissionDto(permission);
  }

  async getList(option: IPaginationOptions) {
    const permissions = await paginate(this.permissionRepository, option);

    const listPermission = permissions.items.map(
      (permission) => new PermissionDto(permission),
    );

    return { listPermission, meta: permissions.meta };
  }

  async findOne(id: number) {
    const permission = await this.permissionRepository.findOneBy({ id });

    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }

    return new PermissionDto(permission);
  }

  async findOneByName(name: string) {
    const permission = await this.permissionRepository.findOneBy({ name });

    if (!permission) {
      throw new NotFoundException(`Permission with name ${name} not found`);
    }

    return new PermissionDto(permission);
  }

  async findByIds(ids: number[]) {
    const permissions = await this.permissionRepository.findBy({
      id: In(ids),
    });

    if (permissions.length !== ids.length) {
      throw new NotFoundException('Some permissions not found');
    }

    if (permissions.length === 0) {
      throw new NotFoundException('Permissions not found');
    }

    return permissions;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permissionExist = await this.permissionRepository.findOneBy({ id });

    if (!permissionExist) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }

    const role = await this.permissionRepository.save({
      ...permissionExist,
      ...updatePermissionDto,
    });

    return new PermissionDto(role);
  }

  async remove(id: number) {
    const permission = await this.permissionRepository.delete(id);
    if (permission.affected === 0) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
  }

  async assignPermissionToRole(roleId: number, permissionId: number) {
    const role = new Role(await this.roleService.findOne(roleId));

    const permission = new Permission(
      await this.permissionRepository.findOne({
        where: { id: permissionId },
        relations: { roles: true },
      }),
    );

    if (!permission) {
      throw new NotFoundException(
        `Permission with id ${permissionId} not found`,
      );
    }

    if (role.permissions?.some((p) => p.id === permission.id)) {
      throw new BadRequestException([
        {
          name: 'role already has this permission',
          property: 'name',
          value: permission.name,
        },
      ]);
    }

    permission.roles.push(role);

    return new PermissionDto(await this.permissionRepository.save(permission));
  }

  async removePermissionFromRole(roleId: number, permissionId: number) {
    const role = new Role(
      await this.roleRepository.findOne({
        where: { id: roleId },
        relations: { permissions: true },
      }),
    );

    const permission = new Permission(
      await this.permissionRepository.findOne({
        where: { id: permissionId },
        relations: { roles: true },
      }),
    );

    if (!permission) {
      throw new NotFoundException(
        `Permission with id ${permissionId} not found`,
      );
    }

    if (!role.permissions?.some((p) => p.id === permission.id)) {
      throw new BadRequestException([
        {
          name: 'role does not have this permission',
          property: 'name',
          value: permission.name,
        },
      ]);
    }

    role.permissions = role.permissions.filter((p) => p.id !== permission.id);

    await this.roleRepository.save(role);
  }

  async syncRoles(id: number, roleIds: number[]) {
    let permission = await this.permissionRepository.findOneBy({ id });

    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }

    permission.roles = await this.roleService.findByIds(roleIds);

    permission = await this.permissionRepository.save(permission);

    return new PermissionDto(permission);
  }

  async getAllRoles(id: number) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: { roles: true },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }

    return new PermissionDto(permission);
  }
}
