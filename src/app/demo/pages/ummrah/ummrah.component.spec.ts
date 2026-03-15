import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UmmrahComponent } from './ummrah.component';

describe('UmmrahComponent', () => {
  let component: UmmrahComponent;
  let fixture: ComponentFixture<UmmrahComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UmmrahComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UmmrahComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
