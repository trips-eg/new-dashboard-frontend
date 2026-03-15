import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelationComponent } from './delation.component';

describe('DelationComponent', () => {
  let component: DelationComponent;
  let fixture: ComponentFixture<DelationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DelationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DelationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
