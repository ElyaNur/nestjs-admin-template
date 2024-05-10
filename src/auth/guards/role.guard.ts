import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  matchRoles(roles: string[] | string, userRoles: string[]): boolean {
    if (Array.isArray(roles)) {
      return roles.some((role) => userRoles.includes(role));
    }

    return userRoles.includes(roles);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[] | string>(
      'roles',
      context.getHandler(),
    );

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = await this.usersService.findOneWithRelation({
      id: request.user.userId,
    });

    const isMatch = this.matchRoles(
      roles,
      user.roles.map((role) => role.name),
    );

    if (!isMatch) {
      throw new ForbiddenException('You dont have access from this resources');
    }
    return true;
  }
}
