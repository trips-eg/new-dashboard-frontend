import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { scannerGuard } from './scanner.guard';

describe('scannerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => scannerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
