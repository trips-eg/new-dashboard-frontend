import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, of } from 'rxjs';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { StaffAnalyticsService, presetRange } from './staff-analytics.service';
import { StaffHomeComponent } from './staff-home/staff-home.component';
import { StaffAnalyticsComponent } from './analytics/staff-analytics.component';

/** The vendor permissions switches on the vendor's home and reports: their shortcuts hide without them. */
describe('Vendor home and reports gates', () => {
  let permissions: string[];

  const today = { kpis: [], today: { bookings: 3, departingToday: 1, remainingDue: 1500, rating: 4.5, ratingsCount: 8 } };

  beforeEach(async () => {
    permissions = [];
    await TestBed.configureTestingModule({
      imports: [StaffHomeComponent, StaffAnalyticsComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        {
          provide: ConfigureService,
          useValue: { userRoles: () => ['Vendor.Admin'], userPermissions: () => permissions, vendorId: () => 12, UserName: () => 'vendor' }
        },
        {
          provide: StaffAnalyticsService,
          useValue: {
            range$: new BehaviorSubject(presetRange('last28')),
            overview: () => of(today),
            departuresToday: () => of([])
          }
        },
        { provide: ActivatedRoute, useValue: { data: of({}) } },
        { provide: ToastrService, useValue: jasmine.createSpyObj('ToastrService', ['success', 'error']) }
      ]
    }).compileComponents();
  });

  function home(): HTMLElement {
    const fixture = TestBed.createComponent(StaffHomeComponent);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  const links = (el: HTMLElement) => Array.from(el.querySelectorAll('a')).map((a) => a.getAttribute('href'));

  it('home: no scan button, no "see all" bookings link and no settlements number without the permissions', () => {
    const el = home();
    expect(links(el)).not.toContain('/v/scanner');
    expect(links(el)).not.toContain('/v/bookings');
    expect(links(el)).not.toContain('/v/more/settlements');
    expect(el.textContent).not.toContain('STAFF_UI.REMAINING_FOR_ME');
    // The bookings numbers themselves stay
    expect(el.textContent).toContain('STAFF_UI.BOOKINGS_TODAY');
  });

  it('home: each shortcut comes back with its permission', () => {
    permissions = ['Permissions.Scanner.View', 'Permissions.Booking.View', 'Permissions.CompanyWallet.View'];
    const el = home();
    expect(links(el)).toContain('/v/scanner');
    expect(links(el)).toContain('/v/bookings');
    expect(links(el)).toContain('/v/more/settlements');
    expect(el.textContent).toContain('STAFF_UI.REMAINING_FOR_ME');
  });

  it('reports: the bookings drill-down opens /v/bookings only with Booking.View', () => {
    const without = TestBed.createComponent(StaffAnalyticsComponent).componentInstance;
    expect(without.kpiLink({ key: 'bookings' } as any)).toBeNull();
    expect(without.kpiLink({ key: 'cancelRatePct' } as any)).toBeNull();

    permissions = ['Permissions.Booking.View'];
    const withIt = TestBed.createComponent(StaffAnalyticsComponent).componentInstance;
    expect(withIt.kpiLink({ key: 'bookings' } as any)).toBe('/v/bookings');
    expect(withIt.kpiLink({ key: 'revenue' } as any)).toBeNull();
  });
});
