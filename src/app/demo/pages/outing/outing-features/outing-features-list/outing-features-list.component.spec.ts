import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingFeaturesListComponent } from './outing-features-list.component';

describe('OutingFeaturesListComponent', () => {
  let component: OutingFeaturesListComponent;
  let fixture: ComponentFixture<OutingFeaturesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingFeaturesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingFeaturesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
