import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelBookingInfoComponent } from './travel-booking-info.component';

describe('TravelBookingInfoComponent', () => {
  let component: TravelBookingInfoComponent;
  let fixture: ComponentFixture<TravelBookingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelBookingInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelBookingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
