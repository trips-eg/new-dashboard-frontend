import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchDynamicComponent } from './search-dynamic.component';

describe('SearchDynamicComponent', () => {
  let component: SearchDynamicComponent;
  let fixture: ComponentFixture<SearchDynamicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchDynamicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchDynamicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
