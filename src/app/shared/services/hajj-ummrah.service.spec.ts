import { TestBed } from '@angular/core/testing';

import { HajjUmmrahService } from './hajj-ummrah.service';

describe('HajjUmmrahService', () => {
  let service: HajjUmmrahService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HajjUmmrahService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
