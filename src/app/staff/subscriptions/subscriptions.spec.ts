import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { Sub, SubscriptionsApi, SubscriptionsComponent } from './subscriptions.component';

/** 19 Nov 2026: the subscriptions page: renewal wording, a payment in pounds at its rate, and the form it sends. */
describe('subscriptions page', () => {
  const sub = (x: Partial<Sub>): Sub =>
    ({ id: 1, name: 'Contabo', category: 'server', plan: null, cost: 30, currency: 'EUR', billingCycle: 'monthly', nextRenewal: '2026-11-22T00:00:00',
       autoRenew: true, remindDaysBefore: 7, paymentMethod: null, accountEmail: null, billingUrl: null, status: 'active', notes: null,
       daysLeft: 3, state: 'soon', monthlyEgp: null, lastPaidOn: null, paidThisYearEgp: 0, ...x }) as Sub;
  let sent: FormData | null;

  beforeEach(() => {
    sent = null;
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: ToastrService, useValue: { error: () => undefined, success: () => undefined } },
        { provide: SubscriptionsApi, useValue: {
          overview: () => of({ items: [] }), details: () => of({ subscription: sub({}), payments: [] }),
          addPayment: (_: number, f: FormData) => { sent = f; return of(null); } } }
      ]
    });
  });

  it('works out a foreign payment in pounds and sends its rate', async () => {
    const c = TestBed.runInInjectionContext(() => new SubscriptionsComponent());
    expect(c.pillTone(sub({ state: 'overdue' }))).toBe('danger');
    c.sel = { subscription: sub({}), payments: [] };
    c.openPayment();
    expect(c.canMove()).toBeTrue();
    c.pay.amount = '30';
    c.pay.rate = '55.5';
    expect(c.payInEgp()).toBe(1665);
    await c.savePayment();
    expect(sent!.get('ExchangeRate')).toBe('55.5');
    expect(sent!.get('Currency')).toBe('EUR');
    expect(sent!.get('MoveRenewal')).toBe('true');
    c.sel = { subscription: sub({ currency: 'EGP' }), payments: [] };
    c.openPayment();
    c.pay.amount = '200';
    expect(c.payEgp()).toBeTrue();
    expect(c.payInEgp()).toBe(200);
  });
});
