import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { tripStarPermissionGuard } from './trip-star-permission.guard';

describe('tripStarPermissionGuard', () => {
  let permissions: string[];
  let token: string | null;

  beforeEach(() => {
    permissions = [];
    token = 'token';
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{
        provide: ConfigureService,
        useValue: { UserToken: () => token, userPermissions: () => permissions }
      }]
    });
  });

  const check = (permission: string) => TestBed.runInInjectionContext(() =>
    tripStarPermissionGuard({ data: { permission } } as unknown as ActivatedRouteSnapshot, {} as any)
  );

  it('allows only the required AD permission', () => {
    permissions = ['Permissions.AD.View'];
    expect(check('Permissions.AD.View')).toBe(true);
    expect((check('Permissions.AD.Edit') as UrlTree).toString()).toBe('/unauthorized');
  });

  it('sends unauthenticated users to login', () => {
    token = null;
    expect((check('Permissions.AD.View') as UrlTree).toString()).toBe('/login');
  });
});

