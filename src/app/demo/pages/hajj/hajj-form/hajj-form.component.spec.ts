import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HajjFormComponent } from './hajj-form.component';

describe('HajjFormComponent', () => {
  let component: HajjFormComponent;
  let fixture: ComponentFixture<HajjFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HajjFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HajjFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
