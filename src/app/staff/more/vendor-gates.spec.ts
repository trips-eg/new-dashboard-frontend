import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { NavigationItem } from 'src/app/theme/layout/admin/navigation/navigation';
import { StaffSession } from '../core/session';
import { BookingsApi } from '../bookings/bookings-api';
import { ProductsApi } from '../products/products-api';
import { VendorCommsApi } from '../vendor-comms/vendor-comms.component';
import { VendorMoreComponent, VendorNotificationsComponent } from './more.component';

/** The vendor permissions switches on the vendor's More page and notifications. */
describe('Vendor More and notifications gates', () => {
  let permissions: string[];
  let bookingsList: jasmine.Spy;

  beforeEach(async () => {
    permissions = [];
    bookingsList = jasmine.createSpy('list').and.returnValue(
      of({ page: { data: [{ id: 9, reference: 'B9', createDate: '2026-11-09T10:00:00Z', customer: { name: 'C' }, items: [{ name: 'Trip', adults: 2, childs: 0 }] }] } })
    );
    await TestBed.configureTestingModule({
      imports: [VendorMoreComponent, VendorNotificationsComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: StaffSession, useValue: { can: (p: string) => permissions.includes(p), username: 'v', roles: ['Vendor.Admin'], acceptsCustomTrips: false } },
        { provide: NavigationItem, useValue: { legacyScreens: () => [] } },
        { provide: ConfigureService, useValue: {} },
        { provide: ToastrService, useValue: jasmine.createSpyObj('ToastrService', ['success', 'error']) },
        { provide: BookingsApi, useValue: { list: bookingsList } },
        { provide: ProductsApi, useValue: { approvals: () => of({ data: [] }) } },
        {
          provide: VendorCommsApi,
          useValue: {
            myNotifications: () =>
              of({ data: [{ bookingId: 5, bookingReference: 'R5', createDate: '2026-11-09T09:00:00Z', message: 'x', readAt: null }] })
          }
        }
      ]
    }).compileComponents();
  });

  function moreRoutes(): string[] {
    const fixture = TestBed.createComponent(VendorMoreComponent);
    fixture.detectChanges();
    return fixture.componentInstance.body.groups.flatMap((g: any) => g.entries.map((e: any) => e.route));
  }

  it('hides settlements without CompanyWallet.View and reviews without Reviews.View', () => {
    const routes = moreRoutes();
    expect(routes).not.toContain('/v/more/settlements');
    expect(routes).not.toContain('/v/more/reviews');
    expect(routes).not.toContain('/v/scanner/history');
    // Always there: reports and notifications
    expect(routes).toContain('/v/more/analytics');
    expect(routes).toContain('/v/notifications');
  });

  it('shows settlements, reviews and scan history with their permissions', () => {
    permissions = ['Permissions.CompanyWallet.View', 'Permissions.Reviews.View', 'Permissions.Scanner.View'];
    const routes = moreRoutes();
    expect(routes).toContain('/v/more/settlements');
    expect(routes).toContain('/v/more/reviews');
    expect(routes).toContain('/v/scanner/history');
  });

  it('notifications: without Booking.View, no bookings request and no booking links', () => {
    const fixture = TestBed.createComponent(VendorNotificationsComponent);
    fixture.detectChanges();
    expect(bookingsList).not.toHaveBeenCalled();
    const events = fixture.componentInstance.events!;
    expect(events.length).toBe(1);
    expect(events[0].kind).toBe('confirmed');
    expect(events[0].route).toBeNull();
  });

  it('notifications: with Booking.View, the bookings and their links are there', () => {
    permissions = ['Permissions.Booking.View'];
    const fixture = TestBed.createComponent(VendorNotificationsComponent);
    fixture.detectChanges();
    expect(bookingsList).toHaveBeenCalled();
    const routes = fixture.componentInstance.events!.map((e) => e.route);
    expect(routes).toContain('/v/bookings/5');
    expect(routes).toContain('/v/bookings/9');
  });
});
