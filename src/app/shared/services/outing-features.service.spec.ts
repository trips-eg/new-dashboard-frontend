import { TestBed } from '@angular/core/testing';

import { OutingFeaturesService } from './outing-features.service';

describe('OutingFeaturesService', () => {
  let service: OutingFeaturesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutingFeaturesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
