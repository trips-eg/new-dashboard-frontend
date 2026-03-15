import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomBookingInfoComponent } from './room-booking-info.component';

describe('RoomBookingInfoComponent', () => {
  let component: RoomBookingInfoComponent;
  let fixture: ComponentFixture<RoomBookingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomBookingInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomBookingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
