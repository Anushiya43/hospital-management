import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/generated/prisma/enums';
import { ROLES_KEY } from '../roles.decorator';

export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles= this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(),
      context.getClass(),]
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied');
    }

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
