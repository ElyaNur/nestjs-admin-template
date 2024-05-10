import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { hash } from 'bcrypt';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { UserDto, UserWithRolesDto } from './dto/user.dto';
import { RolesService } from '../roles/roles.service';
import { RoleDto } from '../roles/dto/role.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly roleService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    this.logger.info(`Creating a new user: ${JSON.stringify(createUserDto)}`);

    const userExist = await this.userRepository.existsBy({
      username: createUserDto.username,
    });

    if (userExist) {
      throw new BadRequestException([
        {
          username: 'username already been taken',
          property: 'username',
          value: createUserDto.username,
        },
      ]);
    }

    const emailExist = await this.userRepository.existsBy({
      email: createUserDto.email,
    });

    if (emailExist) {
      throw new BadRequestException({
        email: 'email already been taken',
        property: 'email',
        value: createUserDto.email,
      });
    }

    createUserDto.password = await hash(createUserDto.password, 10);

    const user = await this.userRepository.save(new User(createUserDto));

    return new UserDto(user);
  }

  async getList(option: IPaginationOptions) {
    const users = await paginate(this.userRepository, option);

    const listUser = users.items.map((user) => new CreateUserDto(user));

    return { listUser, meta: users.meta };
  }

  async findOne(key: string, value: number | string) {
    const user = await this.userRepository.findOneBy({ [key]: value });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserDto(user);
  }

  async findOneWithRelation(where: FindOptionsWhere<User>) {
    const user = await this.userRepository.findOne({
      where,
      relations: { roles: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userExist = await this.userRepository.findOne({
      where: { id },
      relations: { roles: true },
    });

    if (!userExist) {
      throw new NotFoundException('User not found');
    }

    const user = await this.userRepository.save({
      ...userExist,
      ...new User(updateUserDto),
    });

    return new UserDto(user);
  }

  async remove(id: number) {
    const user = await this.userRepository.delete(id);
    if (user.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async assignRole(id: number, roleIds: number[]) {
    const user = await this.findOneWithRelation({ id });

    const roles = await this.roleService.findByIds(roleIds);

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('Some roles not found');
    }

    if (roles.length === 0) {
      throw new NotFoundException('Roles not found');
    }

    if (user.roles.some((role) => roleIds.includes(role.id))) {
      throw new BadRequestException([
        {
          roles: 'user already has some roles',
          property: 'roles',
          value: roles.map((role) => role.name),
        },
      ]);
    }

    user.roles = [...user.roles, ...roles];

    const newUser = await this.userRepository.save(new User(user));

    return new UserWithRolesDto({
      ...newUser,
      roles: newUser.roles.map((role) => new RoleDto(role)),
    });
  }

  async removeRole(id: number, roleIds: number[]) {
    const user = await this.findOneWithRelation({ id });

    const roles = await this.roleService.findByIds(roleIds);

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('Some roles not found');
    }

    if (roles.length === 0) {
      throw new NotFoundException('Roles not found');
    }

    if (!user.roles.some((role) => roleIds.includes(role.id))) {
      throw new BadRequestException([
        {
          roles: 'user does not have some roles',
          property: 'roles',
          value: roles.map((role) => role.name),
        },
      ]);
    }

    user.roles = user.roles.filter(
      (role) => !roles.some((r) => r.id === role.id),
    );

    const newUser = await this.userRepository.save(new User(user));

    return new UserWithRolesDto({
      ...newUser,
      roles: newUser.roles.map((role) => new RoleDto(role)),
    });
  }

  async syncRole(id: number, roleIds: number[]) {
    const user = await this.findOneWithRelation({ id });

    const roles = await this.roleService.findByIds(roleIds);

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('Some roles not found');
    }

    if (roles.length === 0) {
      throw new NotFoundException('Roles not found');
    }

    user.roles = roles;

    const newUser = await this.userRepository.save(new User(user));

    return new UserWithRolesDto({
      ...newUser,
      roles: newUser.roles.map((role) => new RoleDto(role)),
    });
  }

  async getAllUserRoles(id: number) {
    const user = await this.findOneWithRelation({ id });

    return new UserWithRolesDto({
      ...user,
      roles: user.roles.map((role) => new RoleDto(role)),
    });
  }
}
