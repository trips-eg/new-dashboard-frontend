import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingBranchesComponent } from './outing-branches.component';

describe('OutingBranchesComponent', () => {
  let component: OutingBranchesComponent;
  let fixture: ComponentFixture<OutingBranchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingBranchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingBranchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
