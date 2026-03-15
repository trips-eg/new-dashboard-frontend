import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelReservationFormComponent } from './travel-reservation-form.component';

describe('TravelReservationFormComponent', () => {
  let component: TravelReservationFormComponent;
  let fixture: ComponentFixture<TravelReservationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelReservationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelReservationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
