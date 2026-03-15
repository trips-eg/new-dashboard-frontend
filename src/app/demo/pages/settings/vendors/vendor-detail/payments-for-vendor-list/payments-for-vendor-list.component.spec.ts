import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsForVendorListComponent } from './payments-for-vendor-list.component';

describe('PaymentsForVendorListComponent', () => {
  let component: PaymentsForVendorListComponent;
  let fixture: ComponentFixture<PaymentsForVendorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsForVendorListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsForVendorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
