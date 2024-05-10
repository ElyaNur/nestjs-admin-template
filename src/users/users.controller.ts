import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseDto } from '../common/dtos/response.dto';
import { PaginatedDto } from '../common/dtos/paginate.dto';
import { UserDto, UserWithRolesDto } from './dto/user.dto';
import {
  ApiBody,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  BadRequestSchema,
  LimitDTO,
  NotFoundSchema,
  PageDTO,
  ResponseExceptionSchema,
  UnauthorizedSchema,
} from '../common/schemas/response.schema';
import { ApiPaginatedResponse } from '../common/dtos/api-paginated-response.decorator';
import { ApiBadRequestCustom } from '../common/dtos/api-bad-request-custom.decorator';
import { ApiOkCustomResponse } from '../common/dtos/api-ok-custom-response.decorator';
import { ApiCreatedCustomResponse } from '../common/dtos/api-created-custom-response.decorator';
import { RoleGuard } from '../auth/guards/role.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Users Endpoint')
@ApiExtraModels(ResponseExceptionSchema, BadRequestSchema)
@UseGuards(RoleGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBadRequestCustom(BadRequestSchema)
  @ApiCreatedCustomResponse(UserDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return new ResponseDto(true, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get list user' })
  @ApiQuery({ name: 'page', type: PageDTO })
  @ApiQuery({ name: 'limit', type: LimitDTO })
  @ApiPaginatedResponse(CreateUserDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  async getList(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const { listUser, meta } = await this.usersService.getList({
      page,
      limit,
    });

    return new PaginatedDto<CreateUserDto[]>(true, listUser, meta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detail user' })
  @ApiOkCustomResponse(UserDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundSchema,
  })
  async findOne(@Param('id') id: number) {
    const user = await this.usersService.findOne('id', id);

    return new ResponseDto<UserDto>(true, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiOkCustomResponse(UserDto)
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      partial: {
        value: {
          username: 'charis',
        },
      },
      complete: {
        value: {
          username: 'charis',
          email: 'charis.aceh@gmail.com',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);

    return new ResponseDto<UserDto>(true, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete user' })
  @ApiNoContentResponse({
    description: 'Delete user success',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundSchema,
  })
  async remove(@Param('id') id: number) {
    await this.usersService.remove(id);
  }

  @Post(':id/roles')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiCreatedCustomResponse(UserWithRolesDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundSchema,
  })
  @ApiBadRequestCustom(BadRequestSchema)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role_ids: {
          type: 'array',
          items: {
            type: 'number',
          },
          example: [1, 2, 3],
        },
      },
      required: ['role_ids'],
    },
  })
  async assignRole(
    @Param('id') id: number,
    @Body('role_ids', new DefaultValuePipe([])) roleIds: number[],
  ) {
    const user = await this.usersService.assignRole(id, roleIds);

    return new ResponseDto<UserWithRolesDto>(true, user);
  }

  @Delete(':id/roles')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove roles from user' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'Role not found',
    type: NotFoundSchema,
  })
  async removeRoles(
    @Param('id') id: number,
    @Query('role_ids') roleIds: number[],
  ) {
    await this.usersService.removeRole(
      id,
      roleIds.map((id) => +id),
    );
  }

  @Post(':id/roles/sync')
  @ApiOperation({ summary: 'Sync roles to user' })
  @ApiCreatedCustomResponse(UserWithRolesDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundSchema,
  })
  @ApiBadRequestCustom(BadRequestSchema)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role_ids: {
          type: 'array',
          items: {
            type: 'number',
          },
          example: [1, 2, 3],
        },
      },
      required: ['role_ids'],
    },
  })
  async syncRoles(
    @Param('id') id: number,
    @Body('role_ids') permissionIds: number[],
  ) {
    const user = await this.usersService.syncRole(id, permissionIds);

    return new ResponseDto<UserWithRolesDto>(true, user);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Get all roles from user id' })
  @ApiOkCustomResponse(UserWithRolesDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundSchema,
  })
  async getAllUserRoles(@Param('id') id: number) {
    const user = await this.usersService.getAllUserRoles(id);

    return new ResponseDto<UserWithRolesDto>(true, user);
  }
}
