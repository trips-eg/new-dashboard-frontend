import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelsReservationDetailsComponent } from './travels-reservation-details.component';

describe('TravelsReservationDetailsComponent', () => {
  let component: TravelsReservationDetailsComponent;
  let fixture: ComponentFixture<TravelsReservationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelsReservationDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelsReservationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
