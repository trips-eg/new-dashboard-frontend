import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { StaffHttp } from '../core/staff-http';
import { ApiPage, ListResult, StaffQuery, asPage, queryJson } from '../core/query';

/** Product rows of POST /api/staff/lists/{trips|outings|hajj} (StaffTripRowDto / StaffOutingRowDto / StaffHajjRowDto). */
export interface ProductRow {
  id: number;
  name: string;
  vendorName?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  minPrice?: number | null;
  nextDate?: string | null;
  lifecycle: number;
  isActive: boolean;
  isBlocked: boolean;
  /** "pendingReview" / "rejected" while a vendor product waits for approval, else the backend's status word. */
  status: string;
  sold?: number | null;
  booked?: number | null;
  soldToday?: number | null;
  capacity?: number | null;
  categoryName?: string | null;
}

export function rowPrice(p: ProductRow): number | null {
  return p.price ?? p.minPrice ?? null;
}

export function rowSold(p: ProductRow): number | null {
  return p.sold ?? p.booked ?? p.soldToday ?? null;
}

/** StaffProductsController + the existing per-type endpoints (status, block, details). */
@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(StaffHttp);

  list(listKey: string, q: StaffQuery): Observable<ListResult<ProductRow>> {
    return this.http.post<any>(`/api/staff/lists/${listKey}`, queryJson(q)).pipe(map((d) => ({ page: asPage<ProductRow>(d) })));
  }

  /** ExpirySummaryDto per type the caller may view. */
  expirySummary(type?: number): Observable<any[]> {
    return this.http.get<any[]>('/api/staff/products/expiry-summary', { type }).pipe(map((d) => d ?? []));
  }

  expiring(type: number, window: string, page = 1): Observable<ApiPage<any>> {
    return this.http.post<any>('/api/staff/products/expiring', { itemType: type, window, pageIndex: page, pageSize: 50 }).pipe(map((d) => asPage(d)));
  }

  bulkDeactivate(type: number, ids: number[]): Observable<any> {
    return this.http.post('/api/staff/products/bulk-deactivate', { itemType: type, itemIds: ids });
  }

  details(type: number, id: number): Observable<any> {
    const path = type === 1 ? '/api/Travels/GetTravelById/' : type === 2 ? '/api/Outings/GetOutingById/' : '/api/Hajj/GetHajjById/';
    return this.http.get(path, { id });
  }

  analytics(type: number, id: number): Observable<any> {
    return this.http.get(`/api/staff/analytics/products/${type}/${id}`);
  }

  /** Publish or hide. Trips take the wanted state; outings and Hajj toggle. */
  setActive(type: number, id: number, active: boolean): Observable<unknown> {
    if (type === 1) return this.http.patch('/api/Travels/UpdateTravelStatus/', {}, { tripId: id, isActive: active });
    if (type === 2) return this.http.post('/api/Outings/ActiveUnActiveOuting/', {}, { id });
    return this.http.post('/api/Hajj/ActiveUnActiveHajj/', {}, { id });
  }

  /** Admin block (hides it from customers whatever the vendor does). Toggles. */
  toggleBlock(type: number, id: number): Observable<unknown> {
    if (type === 1) return this.http.post('/api/Travels/BlockUnBlockTravels/', {}, { id });
    if (type === 2) return this.http.get('/api/Outings/BlockUnBlockOutings/', { id });
    return this.http.post('/api/Hajj/BlockUnBlockHajj/', {}, { id });
  }

  /** DELETE products/{type}/{id}?confirm=احذف. Refused with ITEM_HAS_ACTIVE_BOOKINGS (data: activeBookings) when booked. */
  delete(type: number, id: number, confirm: string): Observable<unknown> {
    return this.http.delete(`/api/staff/products/${type}/${id}`, { confirm });
  }

  approvals(status = 1): Observable<ApiPage<any>> {
    return this.http.get<any>('/api/staff/products/approvals', { status, pageSize: 50 }).pipe(map((d) => asPage(d)));
  }

  approve(type: number, id: number, note?: string): Observable<unknown> {
    return this.http.post(`/api/staff/products/${type}/${id}/approve`, { note: note ?? null });
  }

  reject(type: number, id: number, note: string): Observable<unknown> {
    return this.http.post(`/api/staff/products/${type}/${id}/reject`, { note });
  }

  foreignPrice(type: number, id: number): Observable<any> {
    return this.http.get(`/api/staff/items/${type}/${id}/foreign-price`);
  }

  saveForeignPrice(type: number, id: number, price: number, child: number | null): Observable<unknown> {
    return this.http.put(`/api/staff/items/${type}/${id}/foreign-price`, { price, childPrice: child, isActive: true });
  }

  deleteForeignPrice(type: number, id: number): Observable<unknown> {
    return this.http.delete(`/api/staff/items/${type}/${id}/foreign-price`);
  }

  bookingRule(type: number, id: number): Observable<any> {
    return this.http.get(`/api/staff/items/${type}/${id}/booking-rule`);
  }

  saveBookingRule(type: number, id: number, min: number, max: number | null): Observable<unknown> {
    return this.http.put(`/api/staff/items/${type}/${id}/booking-rule`, { minQuantity: min, maxQuantity: max });
  }

  gatheringPoints(type: number, id: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/staff/items/${type}/${id}/gathering-points`).pipe(map((d) => d ?? []));
  }

  saveGatheringPoints(type: number, id: number, points: any[]): Observable<unknown> {
    return this.http.put(`/api/staff/items/${type}/${id}/gathering-points`, { points });
  }

  dateSeats(hajjId: number): Observable<any> {
    return this.http.get(`/api/staff/hajj/${hajjId}/date-seats`);
  }

  saveDateSeats(hajjId: number, dates: { hajjDateId: number; seats: number | null }[]): Observable<unknown> {
    return this.http.put(`/api/staff/hajj/${hajjId}/date-seats`, { dates });
  }

  /** Hotels: the existing web endpoints. */
  hotels(search: string | null | undefined, page = 1): Observable<ApiPage<any>> {
    return this.http
      .post<any>('/api/Hotel/GetAllHotelsWeb/', { pageIndex: page, pageSize: 20, ...(search ? { search } : {}) })
      .pipe(map((d) => asPage(d)));
  }

  hotel(id: number): Observable<any> {
    return this.http.get('/api/Hotel/GetHotelById/', { id });
  }

  /** ItemPricingPolicy of an item (pricingModel 1 percent, 2 fixed amount, 3 committed net price). */
  commission(itemType: number, itemId: number): Observable<any> {
    return this.http.get('/api/Pricing/GetCommissionPolicy', { itemId, itemType });
  }

  saveCommission(body: { itemId: number; itemType: number; pricingModel: number; tripsCommissionValue: number; companyNetPrice: number | null }): Observable<unknown> {
    return this.http.post('/api/Pricing/SaveCommissionPolicy', body);
  }
}
