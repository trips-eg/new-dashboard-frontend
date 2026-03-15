import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManasikComponent } from './manasik.component';

describe('ManasikComponent', () => {
  let component: ManasikComponent;
  let fixture: ComponentFixture<ManasikComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManasikComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManasikComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
