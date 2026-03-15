import { TestBed } from '@angular/core/testing';

import { RoomGroupsService } from './room-groups.service';

describe('RoomGroupsService', () => {
  let service: RoomGroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomGroupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
