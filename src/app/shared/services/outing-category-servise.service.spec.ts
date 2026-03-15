import { TestBed } from '@angular/core/testing';

import { OutingCategoryServiseService } from './outing-category-servise.service';

describe('OutingCategoryServiseService', () => {
  let service: OutingCategoryServiseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutingCategoryServiseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
