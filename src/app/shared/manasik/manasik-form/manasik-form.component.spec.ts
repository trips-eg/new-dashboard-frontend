import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManasikFormComponent } from './manasik-form.component';

describe('ManasikFormComponent', () => {
  let component: ManasikFormComponent;
  let fixture: ComponentFixture<ManasikFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManasikFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManasikFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
