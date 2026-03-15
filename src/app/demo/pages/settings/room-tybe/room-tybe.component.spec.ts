import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomTybeComponent } from './room-tybe.component';

describe('RoomTybeComponent', () => {
  let component: RoomTybeComponent;
  let fixture: ComponentFixture<RoomTybeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomTybeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomTybeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
