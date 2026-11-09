import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { NavigationItem } from './navigation';

/** The vendor's menu follows the vendor permissions switches (bookings, products, scanner); More is always there. */
describe('NavigationItem (vendor menu)', () => {
  let permissions: string[];
  let roles: string[];

  function menu(): string[] {
    const nav = TestBed.inject(NavigationItem);
    nav.refreshNavigation();
    return nav.get().map((i: any) => i.id);
  }

  beforeEach(() => {
    spyOn(console, 'log');
    roles = ['Vendor.Admin'];
    permissions = [];
    TestBed.configureTestingModule({
      providers: [
        NavigationItem,
        {
          provide: ConfigureService,
          useValue: { userPermissions: () => permissions, userRoles: () => roles, User: () => ({ roles }), userState$: new Subject() }
        }
      ]
    });
  });

  it('shows My products with any one of the four product views, without Booking.View', () => {
    for (const p of ['Permissions.Travel.View', 'Permissions.Outings.View', 'Permissions.Hajj.View', 'Permissions.Hotel.View']) {
      permissions = [p];
      const ids = menu();
      expect(ids).withContext(p).toContain('v-products');
      expect(ids).withContext(p).not.toContain('v-bookings');
    }
  });

  it('hides My products when bookings is on but no product view is', () => {
    permissions = ['Permissions.Booking.View'];
    const ids = menu();
    expect(ids).toContain('v-bookings');
    expect(ids).not.toContain('v-products');
  });

  it('keeps More for every vendor, whatever the switches', () => {
    permissions = ['Permissions.Travel.View'];
    expect(menu()).toContain('v-more');
    permissions = ['Permissions.Booking.View'];
    expect(menu()).toContain('v-more');
  });

  it('shows the scanner only with Scanner.View', () => {
    permissions = ['Permissions.Travel.View'];
    expect(menu()).not.toContain('v-scanner');
    permissions = ['Permissions.Travel.View', 'Permissions.Scanner.View'];
    expect(menu()).toContain('v-scanner');
  });

  it('does not give the vendor items to an admin', () => {
    roles = ['SuperAdmin'];
    permissions = ['Permissions.Booking.View', 'Permissions.Travel.View', 'Permissions.Users.View'];
    const ids = menu();
    expect(ids).not.toContain('v-more');
    expect(ids).not.toContain('v-products');
    expect(ids).toContain('a-more');
  });
});
