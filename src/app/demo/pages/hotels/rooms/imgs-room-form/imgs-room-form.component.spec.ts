import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgsRoomFormComponent } from './imgs-room-form.component';

describe('ImgsRoomFormComponent', () => {
  let component: ImgsRoomFormComponent;
  let fixture: ComponentFixture<ImgsRoomFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImgsRoomFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImgsRoomFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
