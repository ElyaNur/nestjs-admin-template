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
  Req,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
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
import { ResponseDto } from '../common/dtos/response.dto';
import { ApiPaginatedResponse } from '../common/dtos/api-paginated-response.decorator';
import { PaginatedDto } from '../common/dtos/paginate.dto';
import { ApiOkCustomResponse } from '../common/dtos/api-ok-custom-response.decorator';
import { MenuDto } from './dto/menu.dto';
import { PermissionDto } from '../permissions/dto/permission.dto';
import { Request } from 'express';

@ApiTags('Menus Endpoint')
@Controller('/api/menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new menu' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiBadRequestCustom(BadRequestSchema)
  @ApiCreatedCustomResponse(CreateMenuDto)
  async create(@Body() createMenuDto: CreateMenuDto) {
    const menu = await this.menusService.create(createMenuDto);

    return new ResponseDto(true, menu);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of menus' })
  @ApiQuery({ name: 'pageIndex', type: PageDTO })
  @ApiQuery({ name: 'pageSize', type: LimitDTO })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'filter', required: false })
  @ApiPaginatedResponse(CreateMenuDto)
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
    const { listMenu, meta } = await this.menusService.getList(
      { page, limit },
      sort,
      filter,
    );

    return new PaginatedDto(true, listMenu, meta);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiOkCustomResponse(PermissionDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  async getAll() {
    const menu = await this.menusService.getAll();

    return new ResponseDto(true, menu);
  }

  @Get('parent')
  @ApiOperation({ summary: 'Get all parent menus' })
  @ApiOkCustomResponse(MenuDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  async getAllParentMenus() {
    const menus = await this.menusService.getAllParentMenus();

    return new ResponseDto(true, menus);
  }

  @Get('tree')
  async menuTree(@Req() req: Request) {
    const userId = req.user['userId'];
    const menus = await this.menusService.menuTree(userId);

    return new ResponseDto(true, menus);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu by id' })
  @ApiOkCustomResponse(MenuDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundSchema,
  })
  async findOne(@Param('id') id: number) {
    const role = await this.menusService.findOne(id);

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
    return this.menusService.bulkRemove(ids);
  }

  @Delete(':id')
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
  remove(@Param('id') id: number) {
    return this.menusService.remove(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update menu by id' })
  @ApiOkCustomResponse(MenuDto)
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
    type: UpdateMenuDto,
    examples: {
      'Update Menu 1': {
        value: {
          name: 'Menu 1 Updated',
        },
      },
      'Update Menu 2': {
        value: {
          name: 'Menu 1 Updated',
          parent_id: 1,
        },
      },
    },
  })
  async update(@Param('id') id: number, @Body() updateMenuDto: UpdateMenuDto) {
    const menu = await this.menusService.update(id, updateMenuDto);

    return new ResponseDto(true, menu);
  }
}
