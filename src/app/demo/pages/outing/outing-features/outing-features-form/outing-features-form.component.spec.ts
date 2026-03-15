import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingFeaturesFormComponent } from './outing-features-form.component';

describe('OutingFeaturesFormComponent', () => {
  let component: OutingFeaturesFormComponent;
  let fixture: ComponentFixture<OutingFeaturesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingFeaturesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingFeaturesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
