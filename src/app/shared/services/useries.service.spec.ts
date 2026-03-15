import { TestBed } from '@angular/core/testing';

import { UseriesService } from './useries.service';

describe('UseriesService', () => {
  let service: UseriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UseriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
