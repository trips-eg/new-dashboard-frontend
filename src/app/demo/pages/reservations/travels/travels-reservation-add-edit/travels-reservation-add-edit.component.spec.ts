import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelsReservationAddEditComponent } from './travels-reservation-add-edit.component';

describe('TravelsReservationAddEditComponent', () => {
  let component: TravelsReservationAddEditComponent;
  let fixture: ComponentFixture<TravelsReservationAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelsReservationAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelsReservationAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
