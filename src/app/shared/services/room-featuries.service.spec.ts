import { TestBed } from '@angular/core/testing';

import { RoomFeaturiesService } from './room-featuries.service';

describe('RoomFeaturiesService', () => {
  let service: RoomFeaturiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomFeaturiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
