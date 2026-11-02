import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { StaffHttp } from '../core/staff-http';
import { ApiPage, ListResult, StaffQuery, asPage, queryJson } from '../core/query';

/** StaffBookingCustomerDto. */
export interface BookingCustomer {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  bookingsCount: number;
  completedCount: number;
  cancelledCount?: number | null;
}

/** StaffBookingItemDto: one reservation inside a booking. */
export interface BookingItem {
  itemType: number;
  itemId: number;
  name: string;
  vendorName?: string | null;
  travelDate?: string | null;
  from?: string | null;
  adults: number;
  childs: number;
  childAges?: number[];
  ticketName?: string | null;
  quantity?: number | null;
  gatheringPoint?: { name?: string } | null;
  productPrice: number;
  clientPaid: number;
}

/** StaffBookingRowDto (bookings list). */
export interface BookingRow {
  id: number;
  reference: string;
  createDate: string;
  status: number;
  statusName: string;
  payMethod?: number | null;
  payMethodName?: string | null;
  /** easykash · instapay · wallet · none (computed by the backend). */
  payChannel: string;
  hasPaymentProof: boolean;
  customer: BookingCustomer;
  items: BookingItem[];
  coupon?: { code?: string } | null;
  subtotal: number;
  couponDiscount: number;
  paidFromBonus: number;
  paidFromWallet: number;
  netTotal: number;
}

/** StaffBookingDetailsDto. */
export interface BookingDetails {
  id: number;
  reference: string;
  createDate: string;
  status: number;
  statusName: string;
  payMethod?: number | null;
  payChannel: string;
  paymentProofImageUrl?: string | null;
  instaPay?: { expectedAmount?: number; accountNumber?: string; waitingMinutes?: number } | null;
  customer: BookingCustomer;
  items: BookingItem[];
  money: {
    lines?: { label: string; amount: number }[];
    fees?: number;
    coupon?: { code?: string; discount?: number } | null;
    paidFromBonus?: number;
    paidFromWallet?: number;
    netTotal?: number;
  };
  emails: { to?: string; date?: string; isSend?: boolean }[];
  actions: { canConfirmInstaPay?: boolean; canCancelInstaPay?: boolean; canResendEmail?: boolean };
}

/** StaffItemType → the BookingType numbers CheckoutSummaryRequest.itemType uses (Travel 2, Hajj 3, Outing 4). */
export function checkoutType(staffType: number): number {
  return staffType === 1 ? 2 : staffType === 2 ? 4 : staffType === 4 ? 3 : 1;
}

/** The staff bookings endpoints (StaffBookingsController) and the InstaPay review (CustomerBookingController). */
@Injectable({ providedIn: 'root' })
export class BookingsApi {
  private readonly http = inject(StaffHttp);

  list(q: StaffQuery): Observable<ListResult<BookingRow>> {
    return this.http.post<any>('/api/staff/bookings/list', queryJson(q)).pipe(map((d) => ({ page: asPage<BookingRow>(d) })));
  }

  details(id: number): Observable<BookingDetails> {
    return this.http.get<BookingDetails>(`/api/staff/bookings/${id}`);
  }

  resendEmail(id: number, toVendor = true): Observable<unknown> {
    return this.http.post(`/api/staff/bookings/${id}/resend-email`, { toCustomer: true, toVendor });
  }

  /** PUT /api/CustomerBooking/ConfirmInstaPayBooking/?id= (Booking.Edit). Confirms and emails customer and vendor. */
  confirmInstaPay(id: number): Observable<unknown> {
    return this.http.put('/api/CustomerBooking/ConfirmInstaPayBooking/', {}, { id });
  }

  cancelInstaPay(id: number): Observable<unknown> {
    return this.http.put('/api/CustomerBooking/CancelInstaPayBooking/', {}, { id });
  }

  /** POST /api/staff/bookings/quote: runs the customer checkout for that customer. Every amount comes from it. */
  quote(body: unknown): Observable<any> {
    return this.http.post('/api/staff/bookings/quote', body);
  }

  /** POST /api/staff/bookings/pay (multipart). The same Idempotency-Key is sent again on a retry. */
  pay(o: { customerId: number; bookingId: number; channel: string; payMethod?: number | null; receipt?: File | null; idempotencyKey: string }): Observable<any> {
    const form = new FormData();
    form.append('CustomerId', String(o.customerId));
    form.append('BookingId', String(o.bookingId));
    form.append('Channel', o.channel);
    if (o.payMethod != null) form.append('PayMethod', String(o.payMethod));
    if (o.receipt) form.append('File', o.receipt, o.receipt.name);
    return this.http.formWithHeaders('POST', '/api/staff/bookings/pay', form, new HttpHeaders({ 'Idempotency-Key': o.idempotencyKey }));
  }

  /** Product details for the booking wizard (dates, tickets, rooms). */
  product(staffType: number, id: number): Observable<any> {
    const path = staffType === 1 ? '/api/Travels/GetTravelById/' : staffType === 2 ? '/api/Outings/GetOutingById/' : '/api/Hajj/GetHajjById/';
    return this.http.get(path, { id });
  }

  gatheringPoints(staffType: number, id: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/staff/items/${staffType}/${id}/gathering-points`).pipe(map((d) => d ?? []));
  }

  searchUsers(q: string): Observable<any[]> {
    return this.http.get<any[]>('/api/staff/users/search', { q, take: 20 }).pipe(map((d) => d ?? []));
  }
}

export type { ApiPage };

/** A link to the bookings list showing exactly the bookings behind a number (openBookings in the app). */
export function bookingsLink(title: string, filters: { field: string; op: string; values: string[] }[], vendor = false): any[] {
  return [vendor ? '/v/bookings' : '/a/bookings', { t: title, f: JSON.stringify(filters) }];
}
