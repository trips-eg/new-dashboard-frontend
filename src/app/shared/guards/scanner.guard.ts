import { CanActivateFn } from '@angular/router';

export const scannerGuard: CanActivateFn = (route, state) => {
  return true;
};
