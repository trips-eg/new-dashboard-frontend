import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallReservationsComponent } from './overall-reservations.component';

describe('OverallReservationsComponent', () => {
  let component: OverallReservationsComponent;
  let fixture: ComponentFixture<OverallReservationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverallReservationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverallReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
