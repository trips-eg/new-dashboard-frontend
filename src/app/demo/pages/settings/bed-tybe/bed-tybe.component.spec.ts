import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedTybeComponent } from './bed-tybe.component';

describe('BedTybeComponent', () => {
  let component: BedTybeComponent;
  let fixture: ComponentFixture<BedTybeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedTybeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedTybeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
