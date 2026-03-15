import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomFeaturesListComponent } from './room-features-list.component';

describe('RoomFeaturesListComponent', () => {
  let component: RoomFeaturesListComponent;
  let fixture: ComponentFixture<RoomFeaturesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomFeaturesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomFeaturesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
