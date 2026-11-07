import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { ConfigureService } from '../../theme/shared/services/configure.service';

/**
 * Lets a page open only with a saved token that has not expired.
 * The token is the field every login type saves (admin, vendor and scanner users),
 * so the check does not depend on the shape of the saved user.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private _configService: ConfigureService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    const token = this._configService.UserToken();
    if (token && !AuthGuard.isExpired(token)) {
      return true;
    }
    this._configService.Logout();
    return this.router.parseUrl('/login');
  }

  /** True when the JWT has an exp claim in the past. A token without exp counts as valid. */
  static isExpired(token: string, nowMs: number = Date.now()): boolean {
    try {
      const payload = token.split('.')[1];
      if (!payload) return false;
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return typeof json.exp === 'number' && json.exp * 1000 <= nowMs;
    } catch {
      return false;
    }
  }
}
