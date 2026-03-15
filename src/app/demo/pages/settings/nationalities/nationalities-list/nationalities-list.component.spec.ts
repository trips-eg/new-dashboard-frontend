import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalitiesListComponent } from './nationalities-list.component';

describe('NationalitiesListComponent', () => {
  let component: NationalitiesListComponent;
  let fixture: ComponentFixture<NationalitiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NationalitiesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NationalitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
