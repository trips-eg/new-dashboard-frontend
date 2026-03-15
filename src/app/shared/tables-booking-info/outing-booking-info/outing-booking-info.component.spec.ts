import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingBookingInfoComponent } from './outing-booking-info.component';

describe('OutingBookingInfoComponent', () => {
  let component: OutingBookingInfoComponent;
  let fixture: ComponentFixture<OutingBookingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingBookingInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingBookingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
