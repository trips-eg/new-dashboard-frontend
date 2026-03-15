import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgenciesDetailsComponent } from './sales-agencies-details.component';

describe('SalesAgenciesDetailsComponent', () => {
  let component: SalesAgenciesDetailsComponent;
  let fixture: ComponentFixture<SalesAgenciesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgenciesDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAgenciesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
