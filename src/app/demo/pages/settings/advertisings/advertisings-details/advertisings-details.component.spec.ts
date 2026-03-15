import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertisingsDetailsComponent } from './advertisings-details.component';

describe('AdvertisingsDetailsComponent', () => {
  let component: AdvertisingsDetailsComponent;
  let fixture: ComponentFixture<AdvertisingsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvertisingsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvertisingsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
