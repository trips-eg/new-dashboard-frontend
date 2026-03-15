import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomFeaturesFormComponent } from './room-features-form.component';

describe('RoomFeaturesFormComponent', () => {
  let component: RoomFeaturesFormComponent;
  let fixture: ComponentFixture<RoomFeaturesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomFeaturesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomFeaturesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
