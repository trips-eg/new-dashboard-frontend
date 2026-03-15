import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingCategoryformComponent } from './outing-categoryform.component';

describe('OutingCategoryformComponent', () => {
  let component: OutingCategoryformComponent;
  let fixture: ComponentFixture<OutingCategoryformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingCategoryformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingCategoryformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
