import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RoleDto, RoleWithPermissionsDto } from './dto/role.dto';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { PermissionsService } from '../permissions/permissions.service';
import { Permission } from '../permissions/entities/permission.entity';
import { isNumeric } from '../common/helpers';

@Injectable()
export class RolesService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @Inject(forwardRef(() => PermissionsService))
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    this.logger.info(`Creating a new role: ${JSON.stringify(createRoleDto)}`);

    const roleExist = await this.roleRepository.existsBy({
      name: createRoleDto.name,
    });

    if (roleExist) {
      throw new BadRequestException([
        {
          name: 'role name already been taken',
          property: 'name',
          value: createRoleDto.name,
        },
      ]);
    }

    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      createRoleDto.permissions = await this.permissionsService.findByIds(
        createRoleDto.permissionIds,
      );
    }

    const role = await this.roleRepository.save(
      new Role({
        ...createRoleDto,
        permissions: createRoleDto.permissions?.map(
          (permission) => new Permission(permission),
        ),
      }),
    );

    return new RoleDto(role);
  }

  async getList(option: IPaginationOptions, sort?: string, filter?: string) {
    const paginationOptions = {};

    if (sort) {
      const [sortField, sortOrder] = sort.split(':');
      paginationOptions['order'] = { [sortField]: sortOrder };
    }

    if (filter) {
      paginationOptions['where'] = [{ name: ILike(`%${filter}%`) }];
    }

    const roles = await paginate(this.roleRepository, option, {
      ...paginationOptions,
      relations: ['permissions'],
    });

    const listRole = roles.items.map(
      (role) => new RoleWithPermissionsDto(role),
    );

    return { listRole, meta: roles.meta };
  }

  async getAll() {
    const roles = await this.roleRepository.find({
      relations: ['permissions'],
    });

    return roles.map((role) => new RoleWithPermissionsDto(role));
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    return new RoleWithPermissionsDto(role);
  }

  async findByIds(ids: number[]) {
    const roles = await this.roleRepository.findBy({ id: In(ids) });

    if (roles.length !== ids.length) {
      throw new NotFoundException('Some roles not found');
    }

    if (roles.length === 0) {
      throw new NotFoundException(`Roles with ids ${ids.join(', ')} not found`);
    }

    return roles;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const roleExist = await this.roleRepository.findOneBy({ id });

    if (!roleExist) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    if (updateRoleDto.permissionIds && updateRoleDto.permissionIds.length > 0) {
      updateRoleDto.permissions = await this.permissionsService.findByIds(
        updateRoleDto.permissionIds,
      );
    }

    if (updateRoleDto.permissionIds) {
      updateRoleDto.permissions = [];
    }

    const role = await this.roleRepository.save({
      ...roleExist,
      ...updateRoleDto,
    });

    return new RoleDto(role);
  }

  async remove(id: number) {
    const role = await this.roleRepository.delete(id);
    if (role.affected === 0) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
  }

  async bulkRemove(ids: number[]) {
    const menu = await this.roleRepository.delete(ids);
    if (menu.affected === 0) {
      throw new NotFoundException('Role not found');
    }

    if (menu.affected !== ids.length) {
      throw new NotFoundException('Some roles not found');
    }
  }

  async givePermissionTo(id: number, permissionInput: string | number) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    let permissionEntity: Permission;
    if (!isNumeric(String(permissionInput))) {
      permissionEntity = new Permission(
        await this.permissionsService.findOneByName(String(permissionInput)),
      );
    }

    if (isNumeric(String(permissionInput))) {
      permissionEntity = new Permission(
        await this.permissionsService.findOne(Number(permissionInput)),
      );
    }

    if (role.permissions?.some((p) => p.id === permissionEntity.id)) {
      throw new BadRequestException([
        {
          name: 'role already has this permission',
          property: 'name',
          value: permissionEntity.name,
        },
      ]);
    }

    role.permissions.push(permissionEntity);

    return new RoleDto(await this.roleRepository.save(role));
  }

  async syncPermissions(id: number, permissionIds: number[]) {
    let role = await this.roleRepository.findOneBy({ id });

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    role.permissions = await this.permissionsService.findByIds(permissionIds);

    role = await this.roleRepository.save(role);

    return new RoleDto(role);
  }

  async getAllPermissions(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    return new RoleDto(role);
  }

  async removePermission(id: number, permissionId: number) {
    const role = await this.roleRepository.findOneBy({ id });

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    const permission = role.permissions.find((p) => p.id === permissionId);

    if (!permission) {
      throw new NotFoundException(
        `Permission with id ${permissionId} not found`,
      );
    }

    role.permissions = role.permissions.filter((p) => p.id !== permissionId);

    await this.roleRepository.save(role);
  }
}
