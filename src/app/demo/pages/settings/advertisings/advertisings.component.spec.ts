import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertisingsComponent } from './advertisings.component';

describe('AdvertisingsComponent', () => {
  let component: AdvertisingsComponent;
  let fixture: ComponentFixture<AdvertisingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvertisingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvertisingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
