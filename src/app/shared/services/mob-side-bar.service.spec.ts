import { TestBed } from '@angular/core/testing';

import { MobSideBarService } from './mob-side-bar.service';

describe('MobSideBarService', () => {
  let service: MobSideBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MobSideBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
