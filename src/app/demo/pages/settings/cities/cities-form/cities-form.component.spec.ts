import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitiesFormComponent } from './cities-form.component';

describe('CitiesFormComponent', () => {
  let component: CitiesFormComponent;
  let fixture: ComponentFixture<CitiesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitiesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
