import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UmmrahFormComponent } from './ummrah-form.component';

describe('UmmrahFormComponent', () => {
  let component: UmmrahFormComponent;
  let fixture: ComponentFixture<UmmrahFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UmmrahFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UmmrahFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
