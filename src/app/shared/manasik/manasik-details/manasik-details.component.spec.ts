import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManasikDetailsComponent } from './manasik-details.component';

describe('ManasikDetailsComponent', () => {
  let component: ManasikDetailsComponent;
  let fixture: ComponentFixture<ManasikDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManasikDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManasikDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
