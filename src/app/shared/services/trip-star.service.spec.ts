import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TripStarService } from './trip-star.service';

describe('TripStarService', () => {
  let service: TripStarService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(TripStarService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('uses the documented GET query parameters', () => {
    service.list({ pageIndex: 2, pageSize: 20, IsActive: false, Search: 'summer', SortDirection: 'Asc' }).subscribe();
    const request = http.expectOne((r) => r.url.endsWith('/TripStar/GetAllTripStars/'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('pageIndex')).toBe('2');
    expect(request.request.params.get('IsActive')).toBe('false');
    expect(request.request.params.get('Search')).toBe('summer');
    request.flush({ success: true, data: { data: [] }, message: null });
  });

  it('uses path ids and exact bodies for create, replace, toggle and reorder', () => {
    const form = new FormData();
    service.create(form).subscribe();
    let request = http.expectOne((r) => r.url.endsWith('/TripStar/AddTripStar/'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe(form);
    request.flush({ success: true, data: null, message: null });

    service.replace(4, form).subscribe();
    request = http.expectOne((r) => r.url.endsWith('/TripStar/UpdateTripStar/4'));
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toBe(form);
    request.flush({ success: true, data: null, message: null });

    service.toggle(4).subscribe();
    request = http.expectOne((r) => r.url.endsWith('/TripStar/ToggleTripStarStatus/4'));
    expect(request.request.method).toBe('PUT');
    request.flush({ success: true, data: null, message: null });

    service.reorderCards([{ id: 4, displayOrder: 0 }]).subscribe();
    request = http.expectOne((r) => r.url.endsWith('/TripStar/ReorderTripStars/'));
    expect(request.request.body).toEqual([{ id: 4, displayOrder: 0 }]);
    request.flush({ success: true, data: null, message: null });

    service.reorderItems(4, [{ id: 99, displayOrder: 0 }]).subscribe();
    request = http.expectOne((r) => r.url.endsWith('/TripStar/ReorderTripStarItems/4'));
    expect(request.request.body).toEqual([{ id: 99, displayOrder: 0 }]);
    request.flush({ success: true, data: null, message: null });
  });
  it('gets and deletes a card using the documented ids', () => {
    service.get(4).subscribe();
    let request = http.expectOne((r) => r.url.endsWith('/TripStar/GetTripStarById/') && r.params.get('id') === '4');
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, data: { id: 4, items: [] }, message: null });

    service.delete(4).subscribe();
    request = http.expectOne((r) => r.url.endsWith('/TripStar/DeleteTripStar/4'));
    expect(request.request.method).toBe('DELETE');
    request.flush({ success: true, data: null, message: null });
  });
});
