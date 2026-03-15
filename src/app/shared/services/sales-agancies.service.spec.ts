import { TestBed } from '@angular/core/testing';

import { SalesAganciesService } from './sales-agancies.service';

describe('SalesAganciesService', () => {
  let service: SalesAganciesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesAganciesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
