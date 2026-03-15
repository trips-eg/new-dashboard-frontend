import { TestBed } from '@angular/core/testing';

import { BedTybeService } from './bed-tybe.service';

describe('BedTybeService', () => {
  let service: BedTybeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BedTybeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
