import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingComponent } from './outing.component';

describe('OutingComponent', () => {
  let component: OutingComponent;
  let fixture: ComponentFixture<OutingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
