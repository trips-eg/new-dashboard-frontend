import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomerFinancialSummaryComponent } from './customer-financial-summary.component';
import { BookingFinancialsDto } from '../../model/booking-financials.model';

describe('CustomerFinancialSummaryComponent', () => {
  let fixture: ComponentFixture<CustomerFinancialSummaryComponent>;
  const financials: BookingFinancialsDto = {
    tripsCommissionTotal: 100,
    couponDeduction: 120,
    bonusDeduction: 5.25,
    tripsCommissionNet: -25.25,
    totalPaidByCustomers: 0,
    vendorPendingSettlement: 500.75
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerFinancialSummaryComponent, TranslateModule.forRoot()]
    }).compileComponents();
    TestBed.inject(TranslateService).use('en');
    fixture = TestBed.createComponent(CustomerFinancialSummaryComponent);
  });

  it('preserves the backend net amount, decimals, and genuine zero values', () => {
    fixture.componentRef.setInput('financials', { ...financials, tripsCommissionNet: -30.5 });
    fixture.detectChanges();
    const values = Array.from(fixture.nativeElement.querySelectorAll('dd')) as HTMLElement[];
    expect(values.length).toBe(6);
    expect(fixture.componentInstance.amount('tripsCommissionNet')).toBe(-30.5);
    expect(values[0].textContent).toContain('-');
    expect(values[0].textContent).toContain('30.50');
    expect(values[1].textContent).toContain('0.00');
    expect(values[2].textContent).toContain('500.75');
    expect(fixture.nativeElement.querySelector('.highlight--negative')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.negative-note')).toBeTruthy();
  });

  it('shows an unavailable state rather than manufacturing financial zeros', () => {
    fixture.componentRef.setInput('financials', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('CustomerFinancials.unavailable');
    expect(fixture.nativeElement.querySelector('dd')).toBeNull();
  });

  it('handles missing fields and non-finite numbers as unavailable amounts', () => {
    fixture.componentRef.setInput('financials', { ...financials, couponDeduction: undefined, bonusDeduction: NaN });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.missing-amount').length).toBe(2);
    expect(fixture.nativeElement.textContent).not.toContain('NaN');
  });

  it('renders Arabic currency and period dates without locale errors', () => {
    TestBed.inject(TranslateService).use('ar');
    fixture.componentRef.setInput('financials', financials);
    fixture.componentRef.setInput('period', { from: '2026-10-01T00:00:00Z', to: '2026-10-03T00:00:00Z' });
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelector('.period').textContent).toContain('أكتوبر');
    expect(fixture.nativeElement.querySelectorAll('dd').length).toBe(6);
  });

  it('hides financial figures while loading or when the parent reports an error', () => {
    fixture.componentRef.setInput('financials', financials);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('dd')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-busy="true"]')).toBeTruthy();
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('error', 'CustomerFinancials.profileError');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('dd')).toBeNull();
  });
});
