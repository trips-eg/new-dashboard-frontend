import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationRoomFormComponent } from './reservation-room-form.component';

describe('ReservationRoomFormComponent', () => {
  let component: ReservationRoomFormComponent;
  let fixture: ComponentFixture<ReservationRoomFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationRoomFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationRoomFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
