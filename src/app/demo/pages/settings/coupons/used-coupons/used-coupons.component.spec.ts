import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsedCouponsComponent } from './used-coupons.component';

describe('UsedCouponsComponent', () => {
  let component: UsedCouponsComponent;
  let fixture: ComponentFixture<UsedCouponsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsedCouponsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsedCouponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
