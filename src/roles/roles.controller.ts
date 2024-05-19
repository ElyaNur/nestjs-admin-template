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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResponseDto } from '../common/dtos/response.dto';
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
import { ApiOkCustomResponse } from '../common/dtos/api-ok-custom-response.decorator';
import { RoleDto, RoleWithPermissionsDto } from './dto/role.dto';
import { PaginatedDto } from '../common/dtos/paginate.dto';
import { ApiPaginatedResponse } from '../common/dtos/api-paginated-response.decorator';
import { ApiCreatedCustomResponse } from '../common/dtos/api-created-custom-response.decorator';

@ApiTags('Roles Endpoint')
@Controller('api/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiBadRequestCustom(BadRequestSchema)
  @ApiCreatedCustomResponse(RoleDto)
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.rolesService.create(createRoleDto);

    return new ResponseDto(true, role);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of roles' })
  @ApiQuery({ name: 'pageIndex', type: PageDTO })
  @ApiQuery({ name: 'pageSize', type: LimitDTO })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'filter', required: false })
  @ApiPaginatedResponse(RoleDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  async getList(
    @Query('pageIndex', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
  ) {
    const { listRole, meta } = await this.rolesService.getList(
      { page, limit },
      sort,
      filter,
    );

    return new PaginatedDto(true, listRole, meta);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiOkCustomResponse(RoleWithPermissionsDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  async getAll() {
    const roles = await this.rolesService.getAll();

    return new ResponseDto(true, roles);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by id' })
  @ApiOkCustomResponse(RoleDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundSchema,
  })
  async findOne(@Param('id') id: number) {
    const role = await this.rolesService.findOne(id);

    return new ResponseDto(true, role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role by id' })
  @ApiOkCustomResponse(RoleDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'Role not found',
    type: NotFoundSchema,
  })
  @ApiBody({
    type: UpdateRoleDto,
    examples: {
      partial: {
        value: {
          name: 'Admin',
        },
      },
    },
  })
  async update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    const role = await this.rolesService.update(id, updateRoleDto);

    return new ResponseDto(true, role);
  }

  @Delete('bulk-delete')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete menu by id' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'Menu not found',
    type: NotFoundSchema,
  })
  bulkRemove(@Body('ids') ids: number[]) {
    return this.rolesService.bulkRemove(ids);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete role by id' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'Role not found',
    type: NotFoundSchema,
  })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }

  @Post(':id/permissions/:permissionName')
  @ApiOperation({ summary: 'Give permission to role' })
  @ApiCreatedCustomResponse(RoleWithPermissionsDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'Role not found',
    type: NotFoundSchema,
  })
  @ApiBadRequestCustom(BadRequestSchema)
  async givePermissionTo(
    @Param('id') id: number,
    @Param('permissionName') permissionInput: string | number,
  ) {
    const role = await this.rolesService.givePermissionTo(id, permissionInput);

    return new ResponseDto(true, role);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Sync permissions to role' })
  @ApiCreatedCustomResponse(RoleWithPermissionsDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'Role not found',
    type: NotFoundSchema,
  })
  @ApiBadRequestCustom(BadRequestSchema)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissions: {
          type: 'array',
          items: {
            type: 'number',
          },
          example: [1, 2, 3],
        },
      },
      required: ['permissions'],
    },
  })
  async syncPermissions(
    @Param('id') id: number,
    @Body('permissions') permissionIds: number[],
  ) {
    const role = await this.rolesService.syncPermissions(id, permissionIds);

    return new ResponseDto(true, role);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get all permissions from role id' })
  @ApiOkCustomResponse(RoleWithPermissionsDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'Role not found',
    type: NotFoundSchema,
  })
  async getAllPermissions(@Param('id') id: number) {
    const role = await this.rolesService.getAllPermissions(id);

    return new ResponseDto(true, role);
  }

  @Delete(':id/permissions/:permissionId')
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
  async removePermission(
    @Param('id') id: number,
    @Param('permission_id') permissionId: number,
  ) {
    await this.rolesService.removePermission(id, permissionId);
  }
}
