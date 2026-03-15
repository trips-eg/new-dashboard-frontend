import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertisingsListComponent } from './advertisings-list.component';

describe('AdvertisingsListComponent', () => {
  let component: AdvertisingsListComponent;
  let fixture: ComponentFixture<AdvertisingsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvertisingsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvertisingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
