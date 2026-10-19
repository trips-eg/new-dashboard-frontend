import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { REVIEW_ADMIN_ROLES } from '../model/review.model';

export const reviewsAdminGuard: CanActivateFn = () => {
  const config = inject(ConfigureService);
  const router = inject(Router);
  if (!config.UserToken()) return router.parseUrl('/login');
  return config.userRoles().some((role) => REVIEW_ADMIN_ROLES.includes(role)) ? true : router.parseUrl('/unauthorized');
};
