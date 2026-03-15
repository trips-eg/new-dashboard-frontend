import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertisingsFormComponent } from './advertisings-form.component';

describe('AdvertisingsFormComponent', () => {
  let component: AdvertisingsFormComponent;
  let fixture: ComponentFixture<AdvertisingsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvertisingsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvertisingsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
