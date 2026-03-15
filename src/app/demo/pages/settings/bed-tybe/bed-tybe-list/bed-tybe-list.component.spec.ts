import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedTybeListComponent } from './bed-tybe-list.component';

describe('BedTybeListComponent', () => {
  let component: BedTybeListComponent;
  let fixture: ComponentFixture<BedTybeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedTybeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedTybeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
