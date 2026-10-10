import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

export const tripStarPermissionGuard: CanActivateFn = (route) => {
  const config = inject(ConfigureService);
  const router = inject(Router);
  if (!config.UserToken()) return router.parseUrl('/login');
  const required = route.data?.['permission'] as string | undefined;
  return !required || config.userPermissions().includes(required) ? true : router.parseUrl('/unauthorized');
};
