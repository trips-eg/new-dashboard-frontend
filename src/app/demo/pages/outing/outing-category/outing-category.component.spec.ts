import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingCategoryComponent } from './outing-category.component';

describe('OutingCategoryComponent', () => {
  let component: OutingCategoryComponent;
  let fixture: ComponentFixture<OutingCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
