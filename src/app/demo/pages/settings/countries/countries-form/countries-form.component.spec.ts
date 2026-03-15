import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountriesFormComponent } from './countries-form.component';

describe('CountriesFormComponent', () => {
  let component: CountriesFormComponent;
  let fixture: ComponentFixture<CountriesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountriesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountriesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
