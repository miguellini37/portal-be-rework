import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_ORG_OWNER_KEY } from '../decorators/is-org-owner.decorator';
import { IAuthenticatedRequest } from '../models/request.models';
import { Company } from '../entities/Company';
import { School } from '../entities/School';

/**
 * Guard to validate that the user is the owner of their organization.
 * Works in conjunction with @IsOrgOwner decorator.
 */
@Injectable()
export class OrgOwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isOrgOwnerRequired = this.reflector.getAllAndOverride<boolean>(IS_ORG_OWNER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If org owner is not required, allow access
    if (!isOrgOwnerRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IAuthenticatedRequest>();
    const user = request.user;

    // If no user is authenticated, deny access
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user belongs to a company or school
    const { companyId, schoolId, sub: userId } = user;

    if (companyId) {
      // Check if user is the owner of the company
      const company = await Company.findOne({
        where: { id: companyId },
        relations: ['companyOwner'],
      });

      if (!company) {
        throw new ForbiddenException('Company not found');
      }

      if (company.ownerId !== userId) {
        throw new ForbiddenException('You must be the company owner to perform this action');
      }

      return true;
    }

    if (schoolId) {
      // Check if user is the owner of the school
      const school = await School.findOne({
        where: { id: schoolId },
        relations: ['schoolOwner'],
      });

      if (!school) {
        throw new ForbiddenException('School not found');
      }

      if (school.ownerId !== userId) {
        throw new ForbiddenException('You must be the school owner to perform this action');
      }

      return true;
    }

    // User doesn't belong to any organization
    throw new ForbiddenException('User is not associated with any organization');
  }
}
