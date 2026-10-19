import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ReviewsService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  for (const type of ['Trip', 'Outing', 'HajjUmrah'] as const) {
    it('lists ' + type + ' reviews with the verified named enum', () => {
      let result: any;
      service.list(type, 42).subscribe((value) => (result = value));
      const request = http.expectOne((r) => r.url.endsWith('/Reviews/' + type + '/42'));
      expect(request.request.method).toBe('GET');
      request.flush({ success: true, count: 1, data: [{ id: 7, stars: 5 }] });
      expect(result).toEqual([{ id: 7, stars: 5 }]);
    });
  }
  it('sends the create body unchanged and accepts a direct ReviewDto', () => {
    const body = { customerName: 'Customer', stars: 5, comment: null, tripId: 42 };
    let complete = false;
    service.create(body).subscribe(() => (complete = true));
    const request = http.expectOne((r) => r.url.endsWith('/Reviews'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 7, customerName: 'Customer', stars: 5, userId: null });
    expect(complete).toBeTrue();
  });
  it('updates by review ID and allows clearing the comment', () => {
    let complete = false;
    service.update(7, { comment: '', stars: 4 }).subscribe(() => (complete = true));
    const request = http.expectOne((r) => r.url.endsWith('/Reviews/7'));
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ comment: '', stars: 4 });
    request.flush({ success: true, data: { id: 7 } });
    expect(complete).toBeTrue();
  });
  it('does not treat a failed 200 response as a successful delete', () => {
    let error: Error;
    service.delete(7).subscribe({ next: () => fail('Unexpected success'), error: (value) => (error = value) });
    const request = http.expectOne((r) => r.url.endsWith('/Reviews/7'));
    expect(request.request.method).toBe('DELETE');
    request.flush({ success: false, message: 'Review not found' });
    expect(error.message).toBe('Review not found');
  });
  it('rejects malformed mutation responses', () => {
    service
      .create({ customerName: 'Customer', stars: 5, comment: null, outingId: 42 })
      .subscribe({ next: () => fail('Unexpected success'), error: (value) => expect(value.message).toBe('REVIEWS.SAVE_ERROR') });
    http.expectOne((r) => r.url.endsWith('/Reviews')).flush({});
  });
  it('surfaces list failure instead of an empty success state', () => {
    service
      .list('Trip', 42)
      .subscribe({ next: () => fail('Unexpected success'), error: (value) => expect(value.message).toBe('REVIEWS.LOAD_ERROR') });
    http.expectOne((r) => r.url.endsWith('/Reviews/Trip/42')).flush({ success: false, data: [] });
  });
});
