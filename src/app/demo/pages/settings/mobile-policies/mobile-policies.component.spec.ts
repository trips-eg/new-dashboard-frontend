import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobilePoliciesComponent } from './mobile-policies.component';

describe('MobilePoliciesComponent', () => {
  let component: MobilePoliciesComponent;
  let fixture: ComponentFixture<MobilePoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobilePoliciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobilePoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
