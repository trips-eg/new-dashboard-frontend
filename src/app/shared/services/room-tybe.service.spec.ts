import { TestBed } from '@angular/core/testing';

import { RoomTybeService } from './room-tybe.service';

describe('RoomTybeService', () => {
  let service: RoomTybeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomTybeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
