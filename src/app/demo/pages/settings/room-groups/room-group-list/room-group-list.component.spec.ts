import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomGroupListComponent } from './room-group-list.component';

describe('RoomGroupListComponent', () => {
  let component: RoomGroupListComponent;
  let fixture: ComponentFixture<RoomGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomGroupListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
