import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_ADMIN_KEY } from '../decorators/require-admin.decorator';
import { IAuthenticatedRequest } from '../models/request.models';

/**
 * Guard to validate that the user has admin permission.
 * Works in conjunction with @RequireAdmin decorator.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireAdmin = this.reflector.getAllAndOverride<boolean>(REQUIRE_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If admin is not required, allow access
    if (!requireAdmin) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IAuthenticatedRequest>();
    const user = request.user;

    // If no user is authenticated, deny access
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has admin permission
    if (user.permission !== 'admin') {
      throw new ForbiddenException('Admin permission required');
    }

    return true;
  }
}
