import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UrlTree } from '@angular/router';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { reviewsAdminGuard } from './reviews-admin.guard';
import { NavigationItem } from 'src/app/theme/layout/admin/navigation/navigation';
import { EMPTY } from 'rxjs';

describe('Reviews page access', () => {
  let roles: string[];
  let token: string | null;
  const config = {
    UserToken: () => token,
    userRoles: () => roles,
    User: () => (token ? {} : null),
    userPermissions: () => [],
    userState$: EMPTY
  };
  beforeEach(() => {
    spyOn(console, 'log');
    roles = [];
    token = 'token';
    TestBed.configureTestingModule({ imports: [RouterTestingModule], providers: [{ provide: ConfigureService, useValue: config }] });
  });
  const check = () => TestBed.runInInjectionContext(() => reviewsAdminGuard({} as any, {} as any));
  for (const role of ['Admin.Super', 'Admin.Manager', 'Admin.Support']) {
    it(`allows ${role} without requiring an invented review permission`, () => {
      roles = [role];
      expect(check()).toBe(true);
      const navigation = new NavigationItem(config as any);
      expect((navigation as any).getFilteredNavigation().some((item: any) => item.id === 'reviews')).toBe(true);
    });
  }
  it('hides the sidebar item and denies vendors, customers and unknown admin roles', () => {
    const navigation = new NavigationItem(config as any);
    for (const role of ['Vendor.Owner', 'User.Registered', 'Admin.Other']) {
      roles = [role];
      expect((check() as UrlTree).toString()).toBe('/unauthorized');
      expect((navigation as any).getFilteredNavigation().some((item: any) => item.id === 'reviews')).toBe(false);
    }
  });
  it('redirects signed-out visitors to login', () => {
    token = null;
    roles = ['Admin.Super'];
    expect((check() as UrlTree).toString()).toBe('/login');
  });
});
