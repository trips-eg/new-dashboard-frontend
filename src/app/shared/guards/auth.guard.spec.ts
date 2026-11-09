import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { ConfigureService } from '../../theme/shared/services/configure.service';

function jwt(exp?: number): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64({ alg: 'HS256' })}.${b64(exp === undefined ? {} : { exp })}.sig`;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let token: string | null;
  let logouts: number;

  beforeEach(() => {
    token = null;
    logouts = 0;
    TestBed.configureTestingModule({
      providers: [
        { provide: ConfigureService, useValue: { UserToken: () => token, Logout: () => logouts++ } },
        { provide: Router, useValue: { parseUrl: (u: string) => ({ url: u }) as unknown as UrlTree } }
      ]
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('opens the page with a valid token', () => {
    token = jwt(Math.floor(Date.now() / 1000) + 3600);
    expect(guard.canActivate()).toBe(true);
    expect(logouts).toBe(0);
  });

  it('sends a user without a token to login', () => {
    const result = guard.canActivate();
    expect(result).not.toBe(true);
    expect(logouts).toBe(1);
  });

  it('sends a user with an expired token to login', () => {
    token = jwt(Math.floor(Date.now() / 1000) - 60);
    expect(guard.canActivate()).not.toBe(true);
    expect(logouts).toBe(1);
  });

  it('treats a token without exp or an unreadable token as valid', () => {
    expect(AuthGuard.isExpired(jwt())).toBe(false);
    expect(AuthGuard.isExpired('not-a-jwt')).toBe(false);
  });
});
