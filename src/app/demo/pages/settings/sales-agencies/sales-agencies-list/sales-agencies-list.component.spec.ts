import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgenciesListComponent } from './sales-agencies-list.component';

describe('SalesAgenciesListComponent', () => {
  let component: SalesAgenciesListComponent;
  let fixture: ComponentFixture<SalesAgenciesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgenciesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAgenciesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
