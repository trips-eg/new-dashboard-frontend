import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HajjComponent } from './hajj.component';

describe('HajjComponent', () => {
  let component: HajjComponent;
  let fixture: ComponentFixture<HajjComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HajjComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HajjComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
