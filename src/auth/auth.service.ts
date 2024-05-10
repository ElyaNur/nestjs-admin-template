import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { compare, hash } from 'bcrypt';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserWithRolesDto } from '../users/dto/user.dto';
import { jwtConstants } from './constants';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne('username', username);

    if (!user) throw new UnauthorizedException('Username is incorrect');

    const isPasswordValid = await compare(pass, user.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Password is incorrect');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return result;
  }

  async login(user: any) {
    const { accessToken, refreshToken } = await this.getTokens(
      user.id,
      user.username,
    );
    await this.updateRefreshToken(user.id, refreshToken);
    return new LoginResponseDto({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  async getAuthenticatedUser(data: any) {
    const user = await this.usersService.findOneWithRelation({
      id: data.userId,
    });

    return new UserWithRolesDto(user);
  }

  hashData(data: string) {
    return hash(data, 10);
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: number, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: jwtConstants.secret,
          expiresIn: '30m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: jwtConstants.refreshSecret,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = new User(await this.usersService.findOne('id', userId));
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.username);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return new LoginResponseDto({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });
  }

  async logout(userId: number) {
    const user = await this.usersService.update(userId, {
      refreshToken: null,
    });

    return new UserWithRolesDto(new User(user));
  }
}
