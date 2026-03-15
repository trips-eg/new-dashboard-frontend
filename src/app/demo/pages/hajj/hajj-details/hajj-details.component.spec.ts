import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HajjDetailsComponent } from './hajj-details.component';

describe('HajjDetailsComponent', () => {
  let component: HajjDetailsComponent;
  let fixture: ComponentFixture<HajjDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HajjDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HajjDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
