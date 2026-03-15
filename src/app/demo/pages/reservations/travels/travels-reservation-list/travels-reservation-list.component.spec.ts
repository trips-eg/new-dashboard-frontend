import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelsReservationListComponent } from './travels-reservation-list.component';

describe('TravelsReservationListComponent', () => {
  let component: TravelsReservationListComponent;
  let fixture: ComponentFixture<TravelsReservationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelsReservationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelsReservationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
