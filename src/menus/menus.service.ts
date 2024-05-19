import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { ILike, IsNull, Repository } from 'typeorm';
import { MenuDto } from './dto/menu.dto';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { PermissionsService } from '../permissions/permissions.service';
import { Permission } from '../permissions/entities/permission.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MenusService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    private readonly permissionsService: PermissionsService,
    private readonly usersService: UsersService,
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    this.logger.info(`Creating a new menu: ${JSON.stringify(createMenuDto)}`);

    const menuExist = await this.menuRepository.existsBy({
      name: createMenuDto.name,
    });

    if (menuExist) {
      throw new BadRequestException([
        {
          name: 'menu name already been taken',
          property: 'name',
          value: createMenuDto.name,
        },
      ]);
    }

    const newMenu = new Menu(createMenuDto);

    if (createMenuDto.parentId) {
      const parentMenu = await this.menuRepository.findOneBy({
        id: createMenuDto.parentId,
      });

      if (!parentMenu) {
        throw new NotFoundException(
          `Menu with id ${createMenuDto.parentId} not found`,
        );
      }

      newMenu.parent = parentMenu;
    }

    const menu = await this.menuRepository.save(newMenu);

    return new MenuDto(menu);
  }

  async getList(option: IPaginationOptions, sort?: string, filter?: string) {
    const paginationOptions = {
      relations: ['parent', 'permissions'],
    };

    if (sort) {
      const [sortField, sortOrder] = sort.split(':');
      paginationOptions['order'] = { [sortField]: sortOrder };
    }

    if (filter) {
      paginationOptions['where'] = [
        { name: ILike(`%${filter}%`) },
        { path: ILike(`%${filter}%`) },
        { icon: ILike(`%${filter}%`) },
      ];
    }

    const menus = await paginate(
      this.menuRepository,
      option,
      paginationOptions,
    );

    const listMenu = menus.items.map(
      (menu) => new MenuDto({ ...menu, parent: new MenuDto(menu.parent) }),
    );

    return { listMenu, meta: menus.meta };
  }

  async getAll() {
    const menu = await this.menuRepository.find({
      relations: { permissions: true },
      order: {
        permissions: {
          id: 'ASC',
        },
      },
    });
    return menu.map(
      (menu) =>
        new MenuDto({
          ...menu,
          permissions: menu.permissions.map(
            (permission) => new Permission(permission),
          ),
        }),
    );
  }

  async findOne(id: number) {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!menu) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }

    return new MenuDto(menu);
  }

  async update(id: number, updateMenuDto: UpdateMenuDto) {
    const menuExist = await this.menuRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!menuExist) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }

    if (updateMenuDto.parentId) {
      const parentMenu = await this.menuRepository.findOneBy({
        id: updateMenuDto.parentId,
      });

      if (!parentMenu) {
        throw new NotFoundException(
          `Menu with id ${updateMenuDto.parentId} not found`,
        );
      }

      updateMenuDto.parent = parentMenu;
    }

    if (updateMenuDto.permissionIds.length > 0) {
      updateMenuDto.permissions = await this.permissionsService.findByIds(
        updateMenuDto.permissionIds,
      );
    }

    const menu = await this.menuRepository.save({
      ...menuExist,
      ...updateMenuDto,
    });

    return new MenuDto(menu);
  }

  async remove(id: number) {
    const menu = await this.menuRepository.delete(id);
    if (menu.affected === 0) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }
  }

  async bulkRemove(ids: number[]) {
    const menu = await this.menuRepository.delete(ids);
    if (menu.affected === 0) {
      throw new NotFoundException('Menu not found');
    }

    if (menu.affected !== ids.length) {
      throw new NotFoundException('Some menus not found');
    }
  }

  hasPermission(menu: Menu, user: User) {
    if (menu.permissions.length === 0) {
      return false;
    }

    return menu.permissions.every((permission) =>
      user
        .getPermissions()
        .some((userPermission) => userPermission.id === permission.id),
    );
  }

  async menuTree(userId: number) {
    const user = new User(
      await this.usersService.findOneWithRelation({ id: userId }),
    );

    const menus = await this.menuRepository.find({
      relations: ['children', 'parent', 'permissions'],
      order: { sort: 'ASC' },
    });

    let userMenus = menus;

    if (!user.roles.some((role) => role.name === 'super admin')) {
      // compare the permission that user have with the menu permission
      // if the user has permissions that match each menu permissions, then the menu will be displayed
      userMenus = menus
        .filter((menu) => this.hasPermission(menu, user))
        .map((menu) => ({
          ...menu,
          children: menu.children.filter((child) =>
            this.hasPermission(child, user),
          ),
        }));
    }

    return this.buildTree(userMenus);
  }

  private buildTree(menu: Menu[]) {
    const root = menu
      .filter((menu) => !menu.parent)
      .map((menu) => this.buildNode(menu));

    for (const menu of root) {
      if (menu.title) {
        menu.group.sort((a, b) => a.sort - b.sort);
      }
    }

    const group = [];

    for (const menu of root) {
      if (menu.group.length === 0) {
        delete menu.group;
        group.push(menu);
      }
    }

    return [{ group }, ...root.filter((menu) => menu.group?.length > 0)];
  }

  private buildNode(menu: Menu) {
    const tree = {
      id: menu.id,
      title: menu.name,
      icon: menu.icon,
      path: menu.path,
      group: [],
      sort: menu.sort,
    };

    if (menu.children && menu.children.length > 0) {
      tree['group'] = menu.children.map((child) => this.buildNode(child));
      delete tree.path;
    }

    return tree;
  }

  async getAllParentMenus() {
    const parentMenu = await this.menuRepository.find({
      relations: { parent: true },
      where: {
        parent: {
          id: IsNull(),
        },
      },
    });

    return parentMenu.map((menu) => new MenuDto(menu));
  }
}
