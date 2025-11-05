import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrgOwnerGuard } from './org-owner.guard';
import { AdminGuard } from './admin.guard';

/**
 * Guard that allows access if user is either an org owner OR an admin.
 * Combines OrgOwnerGuard and AdminGuard with OR logic.
 */
@Injectable()
export class OrgOwnerOrAdminGuard implements CanActivate {
  private orgOwnerGuard: OrgOwnerGuard;
  private adminGuard: AdminGuard;

  constructor(private reflector: Reflector) {
    this.orgOwnerGuard = new OrgOwnerGuard(reflector);
    this.adminGuard = new AdminGuard(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Try admin guard first (it's synchronous and faster)
    try {
      const isAdmin = this.adminGuard.canActivate(context);
      if (isAdmin) {
        return true;
      }
    } catch {
      // Admin check failed, continue to org owner check
    }

    // Try org owner guard
    try {
      const isOrgOwner = await this.orgOwnerGuard.canActivate(context);
      if (isOrgOwner) {
        return true;
      }
    } catch {
      // Org owner check failed
    }

    // If neither guard passes, throw the org owner error (more specific)
    return this.orgOwnerGuard.canActivate(context);
  }
}
