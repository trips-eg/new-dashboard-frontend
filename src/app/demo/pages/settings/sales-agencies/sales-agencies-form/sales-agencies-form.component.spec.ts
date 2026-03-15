import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgenciesFormComponent } from './sales-agencies-form.component';

describe('SalesAgenciesFormComponent', () => {
  let component: SalesAgenciesFormComponent;
  let fixture: ComponentFixture<SalesAgenciesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgenciesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAgenciesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
