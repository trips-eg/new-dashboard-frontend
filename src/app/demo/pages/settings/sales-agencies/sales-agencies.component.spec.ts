import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgenciesComponent } from './sales-agencies.component';

describe('SalesAgenciesComponent', () => {
  let component: SalesAgenciesComponent;
  let fixture: ComponentFixture<SalesAgenciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgenciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAgenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
