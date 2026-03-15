import { TestBed } from '@angular/core/testing';

import { OutingBranshesService } from './outing-branshes.service';

describe('OutingBranshesService', () => {
  let service: OutingBranshesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutingBranshesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
