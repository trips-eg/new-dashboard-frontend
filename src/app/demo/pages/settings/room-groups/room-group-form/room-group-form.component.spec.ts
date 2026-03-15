import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomGroupFormComponent } from './room-group-form.component';

describe('RoomGroupFormComponent', () => {
  let component: RoomGroupFormComponent;
  let fixture: ComponentFixture<RoomGroupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomGroupFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomGroupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
