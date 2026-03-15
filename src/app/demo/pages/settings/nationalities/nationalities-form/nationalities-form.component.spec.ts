import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalitiesFormComponent } from './nationalities-form.component';

describe('NationalitiesFormComponent', () => {
  let component: NationalitiesFormComponent;
  let fixture: ComponentFixture<NationalitiesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NationalitiesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NationalitiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
