import { SetMetadata } from '@nestjs/common';

export const REQUIRE_ADMIN_KEY = 'require_admin';

/**
 * Decorator to require admin permission on a route.
 * Throws ForbiddenException if user.permission !== 'admin'
 *
 * @example
 * @RequireAdmin()
 * @Get('admin-only-route')
 * async adminRoute() { ... }
 */
export const RequireAdmin = () => SetMetadata(REQUIRE_ADMIN_KEY, true);
