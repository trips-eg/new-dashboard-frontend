import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManasikBookingInfoComponent } from './manasik-booking-info.component';

describe('ManasikBookingInfoComponent', () => {
  let component: ManasikBookingInfoComponent;
  let fixture: ComponentFixture<ManasikBookingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManasikBookingInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManasikBookingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
