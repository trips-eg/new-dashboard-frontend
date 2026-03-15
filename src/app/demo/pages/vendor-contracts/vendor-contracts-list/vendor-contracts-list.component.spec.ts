import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorContractsListComponent } from './vendor-contracts-list.component';

describe('VendorContractsListComponent', () => {
  let component: VendorContractsListComponent;
  let fixture: ComponentFixture<VendorContractsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorContractsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorContractsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
