import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchesFormComponent } from './branches-form.component';

describe('BranchesFormComponent', () => {
  let component: BranchesFormComponent;
  let fixture: ComponentFixture<BranchesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
