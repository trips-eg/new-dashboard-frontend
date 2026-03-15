import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingCategoryListComponent } from './outing-category-list.component';

describe('OutingCategoryListComponent', () => {
  let component: OutingCategoryListComponent;
  let fixture: ComponentFixture<OutingCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingCategoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
