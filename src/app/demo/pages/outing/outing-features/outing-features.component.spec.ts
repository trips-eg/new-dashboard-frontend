import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingFeaturesComponent } from './outing-features.component';

describe('OutingFeaturesComponent', () => {
  let component: OutingFeaturesComponent;
  let fixture: ComponentFixture<OutingFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingFeaturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
