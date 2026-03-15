import { TestBed } from '@angular/core/testing';

import { CompaniesWalletService } from './companies-wallet.service';

describe('CompaniesWalletService', () => {
  let service: CompaniesWalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompaniesWalletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
