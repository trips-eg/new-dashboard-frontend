import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsForVendorFormComponent } from './payments-for-vendor-form.component';

describe('PaymentsForVendorFormComponent', () => {
  let component: PaymentsForVendorFormComponent;
  let fixture: ComponentFixture<PaymentsForVendorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsForVendorFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsForVendorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
