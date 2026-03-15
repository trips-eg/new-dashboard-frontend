import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeTransactionsComponent } from './charge-transactions.component';

describe('ChargeTransactionsComponent', () => {
  let component: ChargeTransactionsComponent;
  let fixture: ComponentFixture<ChargeTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargeTransactionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChargeTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
