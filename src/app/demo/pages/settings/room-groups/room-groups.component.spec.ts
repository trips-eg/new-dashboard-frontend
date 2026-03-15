import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomGroupsComponent } from './room-groups.component';

describe('RoomGroupsComponent', () => {
  let component: RoomGroupsComponent;
  let fixture: ComponentFixture<RoomGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomGroupsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
