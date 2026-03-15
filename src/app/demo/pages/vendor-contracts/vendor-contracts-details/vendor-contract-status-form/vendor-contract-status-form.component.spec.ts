import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorContractStatusFormComponent } from './vendor-contract-status-form.component';

describe('VendorContractStatusFormComponent', () => {
  let component: VendorContractStatusFormComponent;
  let fixture: ComponentFixture<VendorContractStatusFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorContractStatusFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorContractStatusFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
