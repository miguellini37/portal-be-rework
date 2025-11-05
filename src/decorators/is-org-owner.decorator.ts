import { SetMetadata } from '@nestjs/common';

export const IS_ORG_OWNER_KEY = 'is_org_owner';

/**
 * Decorator to require organization ownership on a route.
 * Throws ForbiddenException if user is not the owner of their company or school.
 *
 * @example
 * @IsOrgOwner()
 * @Put('update-organization')
 * async updateOrganization() { ... }
 */
export const IsOrgOwner = () => SetMetadata(IS_ORG_OWNER_KEY, true);
