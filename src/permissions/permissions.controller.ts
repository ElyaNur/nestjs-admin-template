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
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import {
  ApiBody,
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
  UnauthorizedSchema,
} from '../common/schemas/response.schema';
import { ApiBadRequestCustom } from '../common/dtos/api-bad-request-custom.decorator';
import { ApiCreatedCustomResponse } from '../common/dtos/api-created-custom-response.decorator';
import { PermissionDto, PermissionWithRolesDto } from './dto/permission.dto';
import { ResponseDto } from '../common/dtos/response.dto';
import { ApiPaginatedResponse } from '../common/dtos/api-paginated-response.decorator';
import { PaginatedDto } from '../common/dtos/paginate.dto';
import { ApiOkCustomResponse } from '../common/dtos/api-ok-custom-response.decorator';

@ApiTags('Permissions Endpoint')
@Controller('api/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiBadRequestCustom(BadRequestSchema)
  @ApiCreatedCustomResponse(PermissionDto)
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const permission =
      await this.permissionsService.create(createPermissionDto);

    return new ResponseDto(true, permission);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of permissions' })
  @ApiQuery({ name: 'page', type: PageDTO })
  @ApiQuery({ name: 'limit', type: LimitDTO })
  @ApiPaginatedResponse(PermissionDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  async getList(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const { listPermission, meta } = await this.permissionsService.getList({
      page,
      limit,
    });

    return new PaginatedDto(true, listPermission, meta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by id' })
  @ApiOkCustomResponse(PermissionDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundSchema,
  })
  async findOne(@Param('id') id: number) {
    const permission = await this.permissionsService.findOne(id);

    return new ResponseDto(true, permission);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update permission by id' })
  @ApiOkCustomResponse(PermissionDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'Role not found',
    type: NotFoundSchema,
  })
  @ApiBody({
    type: UpdatePermissionDto,
    examples: {
      partial: {
        value: {
          name: 'can delete',
        },
      },
    },
  })
  async update(
    @Param('id') id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    const permission = await this.permissionsService.update(
      id,
      updatePermissionDto,
    );

    return new ResponseDto(true, permission);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete permission by id' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'Role not found',
    type: NotFoundSchema,
  })
  remove(@Param('id') id: number) {
    return this.permissionsService.remove(id);
  }

  @Post(':id/roles/:roleId')
  @ApiOperation({ summary: 'Assign permission to role' })
  @ApiCreatedCustomResponse(PermissionWithRolesDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiBadRequestCustom(BadRequestSchema)
  async assignPermissionToRole(
    @Param('id') permissionId: number,
    @Param('roleId') roleId: number,
  ) {
    const role = await this.permissionsService.assignPermissionToRole(
      roleId,
      permissionId,
    );

    return new ResponseDto(true, role);
  }

  @Delete(':id/roles/:roleId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove permission from role' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'Role not found',
    type: NotFoundSchema,
  })
  async removePermissionFromRole(
    @Param('id') permissionId: number,
    @Param('roleId') roleId: number,
  ) {
    await this.permissionsService.removePermissionFromRole(
      roleId,
      permissionId,
    );
  }

  @Post(':id/roles')
  @ApiOperation({ summary: 'Sync roles to permission' })
  @ApiCreatedCustomResponse(PermissionWithRolesDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'Permission not found',
    type: NotFoundSchema,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roles: {
          type: 'array',
          items: {
            type: 'number',
          },
          example: [1, 2, 3],
        },
      },
      required: ['roles'],
    },
  })
  @ApiBadRequestCustom(BadRequestSchema)
  async syncRoles(@Param('id') id: number, @Body('roles') roleIds: number[]) {
    const permission = await this.permissionsService.syncRoles(id, roleIds);

    return new ResponseDto(true, permission);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Get all roles from permission id' })
  @ApiOkCustomResponse(PermissionWithRolesDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'Permission not found',
    type: NotFoundSchema,
  })
  async getAllRoles(@Param('id') id: number) {
    const permission = await this.permissionsService.getAllRoles(id);

    return new ResponseDto(true, permission);
  }
}
