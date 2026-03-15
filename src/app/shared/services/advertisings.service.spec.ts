import { TestBed } from '@angular/core/testing';

import { AdvertisingsService } from './advertisings.service';

describe('AdvertisingsService', () => {
  let service: AdvertisingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvertisingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
