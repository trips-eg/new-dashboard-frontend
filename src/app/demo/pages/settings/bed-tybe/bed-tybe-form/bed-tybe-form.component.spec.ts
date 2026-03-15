import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedTybeFormComponent } from './bed-tybe-form.component';

describe('BedTybeFormComponent', () => {
  let component: BedTybeFormComponent;
  let fixture: ComponentFixture<BedTybeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedTybeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedTybeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
