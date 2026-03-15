import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomTybiesListComponent } from './room-tybies-list.component';

describe('RoomTybiesListComponent', () => {
  let component: RoomTybiesListComponent;
  let fixture: ComponentFixture<RoomTybiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomTybiesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomTybiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
