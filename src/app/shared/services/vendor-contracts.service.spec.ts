import { TestBed } from '@angular/core/testing';

import { VendorContractsService } from './vendor-contracts.service';

describe('VendorContractsService', () => {
  let service: VendorContractsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VendorContractsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
