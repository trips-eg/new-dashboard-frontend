import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingDetailsComponent } from './outing-details.component';

describe('OutingDetailsComponent', () => {
  let component: OutingDetailsComponent;
  let fixture: ComponentFixture<OutingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
