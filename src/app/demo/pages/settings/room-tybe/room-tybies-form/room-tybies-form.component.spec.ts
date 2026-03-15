import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomTybiesFormComponent } from './room-tybies-form.component';

describe('RoomTybiesFormComponent', () => {
  let component: RoomTybiesFormComponent;
  let fixture: ComponentFixture<RoomTybiesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomTybiesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomTybiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
