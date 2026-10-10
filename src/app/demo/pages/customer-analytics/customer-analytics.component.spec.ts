import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { CustomerAnalyticsComponent } from './customer-analytics.component';
import { CustomerAnalyticsService } from 'src/app/shared/services/customer-analytics.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsCustomer } from 'src/app/shared/model/customer-analytics.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('CustomerAnalyticsComponent financial period', () => {
  let component: CustomerAnalyticsComponent;
  let service: jasmine.SpyObj<CustomerAnalyticsService>;
  const result = { success: true, data: { financials: { tripsCommissionNet: -5 } } };

  beforeEach(() => {
    service = jasmine.createSpyObj('CustomerAnalyticsService', ['getCustomerAnalytics', 'getCustomersByAnalyticsType']);
    service.getCustomerAnalytics.and.returnValue(of(result));
    service.getCustomersByAnalyticsType.and.returnValue(of({ success: true, data: { data: [], itemsCount: 0 } }));
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: TranslateService, useValue: { currentLang: 'en' } },
        { provide: CustomerAnalyticsService, useValue: service },
        { provide: ConfigureService, useValue: { userRoles: () => [] } },
        { provide: Router, useValue: { navigateByUrl: () => {} } }
      ]
    });
    component = TestBed.runInInjectionContext(() => new CustomerAnalyticsComponent());
    component.ngOnInit();
  });

  afterEach(() => component.ngOnDestroy());

  it('switches dialog stages while retaining the applied period and resetting pagination and expanded rows', () => {
    component.dialogPageIndex = 4;
    component.dialogFirst = 30;
    component.dialogExpandedRows = { 'old-customer': true };
    const period = { ...component.appliedPeriod! };
    component.openCustomerDialog({ key: 'paid', label: 'Paid', icon: '', colorClass: '', count: 10 });
    expect(service.getCustomersByAnalyticsType.calls.mostRecent().args[0]).toEqual(
      jasmine.objectContaining({ ...period, type: 'paid', pageIndex: 1 })
    );
    expect(component.dialogFirst).toBe(0);
    expect(component.dialogExpandedRows).toEqual({});
    expect(component.dialogVisible).toBeTrue();
  });

  it('expands only the customers loaded on the current page and clears expansion on paging', () => {
    component.dialogCustomers = [{ id: '12' }, { id: '13' }] as AnalyticsCustomer[];
    component.expandDialogPage();
    expect(component.dialogExpandedRows).toEqual({ '12': true, '13': true });
    component.onDialogPageChange({ first: 10, rows: 10 });
    expect(component.dialogExpandedRows).toEqual({});
    expect(service.getCustomersByAnalyticsType.calls.mostRecent().args[0].pageIndex).toBe(2);
  });

  it('uses the local month start and reloads analytics when applying the month shortcut', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 3, 14, 30));
    try {
      component.applyDatePreset('thisMonth');
      const from = component.filterForm.value.fromDate as Date;
      expect(from.getDate()).toBe(1);
      expect(from.getHours()).toBe(0);
      expect(component.appliedPeriod?.from).toBe(from.toISOString());
      expect(component.datePreset).toBe('thisMonth');
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('signals unapplied dates without changing the financial reporting period', () => {
    const period = component.appliedPeriod;
    expect(component.filtersChanged).toBeFalse();
    component.filterForm.patchValue({ fromDate: new Date(2020, 0, 1) });
    expect(component.filtersChanged).toBeTrue();
    expect(component.appliedPeriod).toBe(period);
  });

  it('keeps customer drill-downs on the period of the displayed analytics until search is applied', () => {
    const period = { ...component.appliedPeriod! };
    component.filterForm.patchValue({ fromDate: new Date(2020, 0, 1), toDate: new Date(2020, 0, 2) });
    component.loadDialogCustomers();
    expect(service.getCustomersByAnalyticsType.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining(period));
    expect(component.analyticsData?.financials?.tripsCommissionNet).toBe(-5);
  });

  it('clears old financial results when a refresh fails', () => {
    spyOn(console, 'error');
    service.getCustomerAnalytics.and.returnValue(throwError(() => ({ status: 401 })));
    component.loadAnalytics();
    expect(component.analyticsData).toBeNull();
    expect(component.appliedPeriod).toBeNull();
    expect(component.analyticsError).toBe('CustomerFinancials.sessionExpired');
    expect(component.isLoading).toBeFalse();
  });

  it('cancels superseded requests so older financials cannot replace newer results', () => {
    const first = new Subject<any>();
    const second = new Subject<any>();
    service.getCustomerAnalytics.and.returnValues(first, second);
    component.loadAnalytics();
    component.loadAnalytics();
    second.next(result);
    first.next({ success: true, data: { financials: { tripsCommissionNet: 999 } } });
    expect(component.analyticsData?.financials?.tripsCommissionNet).toBe(-5);
  });

  it('rejects a reversed period before issuing a request', () => {
    service.getCustomerAnalytics.calls.reset();
    component.filterForm.patchValue({ fromDate: new Date(2026, 9, 3), toDate: new Date(2026, 9, 1) });
    component.loadAnalytics();
    expect(service.getCustomerAnalytics).not.toHaveBeenCalled();
    expect(component.analyticsError).toBe('CustomerFinancials.invalidPeriod');
  });
});

describe('CustomerAnalyticsComponent customer dialog rendering', () => {
  const customer = {
    id: '12',
    name: 'Ahmed Khaled',
    email: 'ahmed@example.test',
    imageUrl: '',
    totalCompletedReservations: 2,
    financials: {
      tripsCommissionTotal: 80,
      couponDeduction: 120,
      bonusDeduction: 35.25,
      tripsCommissionNet: -75.25,
      totalPaidByCustomers: 0,
      vendorPendingSettlement: 1480.75
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerAnalyticsComponent, NoopAnimationsModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: ConfigureService, useValue: { userRoles: () => [] } },
        {
          provide: CustomerAnalyticsService,
          useValue: {
            getCustomerAnalytics: () =>
              of({
                success: true,
                data: {
                  registeredCount: 10,
                  loggedInCount: 8,
                  searchedCount: 5,
                  bookedCount: 3,
                  paidCount: 2,
                  financials: customer.financials
                }
              }),
            getCustomersByAnalyticsType: () => of({ success: true, data: { data: [customer], itemsCount: 1 } })
          }
        }
      ]
    }).compileComponents();
    TestBed.inject(TranslateService).setTranslation('en', {
      'Registered → Booked': 'Registered to booked',
      'Booked → Paid': 'Booked to paid'
    });
    TestBed.inject(TranslateService).use('en');
  });

  it('opens the funnel dialog with inline financial figures and a valid accessible title', async () => {
    const fixture = TestBed.createComponent(CustomerAnalyticsComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.insight-strip').textContent).toContain('Registered to booked');
    expect(fixture.nativeElement.querySelector('.insight-strip').textContent).toContain('Booked to paid');
    (fixture.nativeElement.querySelector('.step-booked') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    const titleId = dialog.getAttribute('aria-labelledby');
    expect(dialog.querySelector(`[id="${titleId}"]`)?.textContent).toContain('Booked');
    const money = Array.from(dialog.querySelectorAll('td.money-column')) as HTMLElement[];
    expect(money.length).toBe(3);
    expect(money[0].textContent).toContain('0.00');
    expect(money[1].textContent).toContain('-75.25');
    expect(money[1].querySelector('.net-loss')).toBeTruthy();
    fixture.destroy();
  });

  it('expands a customer from the row control and renders the full financial breakdown', async () => {
    const fixture = TestBed.createComponent(CustomerAnalyticsComponent);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.step-paid') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.row-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    const expansion = fixture.nativeElement.querySelector('.financial-expansion') as HTMLElement;
    expect(expansion).toBeTruthy();
    expect(expansion.querySelectorAll('dd').length).toBe(6);
    expect(expansion.textContent).toContain('35.25');
    expect(expansion.textContent).toContain('Ahmed Khaled');
    fixture.destroy();
  });
});
