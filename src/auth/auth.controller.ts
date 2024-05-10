import {
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import {
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  BadRequestSchema,
  UnauthorizedSchema,
} from '../common/schemas/response.schema';
import { ApiBadRequestCustom } from '../common/dtos/api-bad-request-custom.decorator';
import { ResponseDto } from '../common/dtos/response.dto';
import { ApiOkCustomResponse } from '../common/dtos/api-ok-custom-response.decorator';
import { UserWithRolesDto } from '../users/dto/user.dto';

@ApiTags('Auth Endpoint')
@ApiExtraModels(UnauthorizedSchema)
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Login in user' })
  @ApiBody({
    schema: {
      example: {
        username: 'charis',
        password: 'chariselyasa',
      },
    },
  })
  @ApiOkResponse({
    description: 'Login Success',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  @ApiBadRequestCustom(BadRequestSchema)
  async login(@Req() req: Request) {
    return await this.authService.login(req.user);
  }

  @Public()
  @UseGuards(RefreshJwtAuthGuard)
  @Get('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh token' })
  @ApiOkResponse({
    description: 'Refresh token success',
    schema: {
      example: {
        access_token: 'new_access_token',
      },
    },
  })
  @ApiBody({
    schema: {
      example: {
        refresh_token: 'refresh_token',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  refresh(@Req() req: Request) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Get('user')
  @ApiOperation({ summary: 'Get authenticated user' })
  @ApiOkResponse({
    description: 'Get user success',
    schema: {
      example: {
        id: 1,
        email: 'charis.aceh@gmail.com',
        username: 'charis',
        created_at: '2024-05-08T03:03:47.140Z',
        updated_at: '2024-05-08T03:03:47.140Z',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  async getUser(@Req() req: Request) {
    const user = await this.authService.getAuthenticatedUser(req.user);

    return new ResponseDto(true, user);
  }

  @Get('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiOkCustomResponse(UserWithRolesDto)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedSchema,
  })
  async logout(@Req() req: Request) {
    const userId = req.user['sub'];
    const user = await this.authService.logout(userId);

    return new ResponseDto(true, user);
  }
}
