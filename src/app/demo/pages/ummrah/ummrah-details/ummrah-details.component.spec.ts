import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UmmrahDetailsComponent } from './ummrah-details.component';

describe('UmmrahDetailsComponent', () => {
  let component: UmmrahDetailsComponent;
  let fixture: ComponentFixture<UmmrahDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UmmrahDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UmmrahDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
