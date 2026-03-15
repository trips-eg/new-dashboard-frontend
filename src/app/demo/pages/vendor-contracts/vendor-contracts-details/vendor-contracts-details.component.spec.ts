import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorContractsDetailsComponent } from './vendor-contracts-details.component';

describe('VendorContractsDetailsComponent', () => {
  let component: VendorContractsDetailsComponent;
  let fixture: ComponentFixture<VendorContractsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorContractsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorContractsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
