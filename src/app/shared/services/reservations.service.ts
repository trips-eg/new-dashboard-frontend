//reservations.service. === CustomerBooking in swagger
import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  endPoints = APIs.reservations;
  bookingEndPoints = APIs.Booking;

  constructor(private ApiCallerService: ApiCallerService) {}

  // ── Customer Bookings (Admin Table) ──
  getAllCustomerBookings(filterMap: any): Observable<any> {
    return this.ApiCallerService.post(this.bookingEndPoints.getAllBooking, filterMap);
  }

  getReservationById(id: number): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.getReservationById}?id=${id}`);
  }

  getTravelReservationDetail(id: number): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.getTravelReservationDetail}?BookingId=${id}`);
  }

  getRoomReservationDetail(id: number): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.getroomReservationDetail}?BookingId=${id}`);
  }

  getOutingReservationDetail(id: number): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.getOutingReservationDetail}?BookingId=${id}`);
  }

  getManasikReservationDetail(id: number): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.getManasikReservationDetail}?BookingId=${id}`);
  }

  getBookingByRefrance(Refrance: string): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.getReservationByRef}${Refrance}`);
  }

  RefundRoomBookingById(id: number): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.RefundRoomBookingById}${id}`);
  }

  RefundTravelBookingById(id: number): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.RefundTripBookingById}${id}`);
  }

  RefundOutingBookingById(id: number): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.RefundOutingBookingById}${id}`);
  }

  RefundManasikBookingById(id: number): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.RefundManasikBookingById}${id}`);
  }

  getRoomReservationForVendor(filterMap: any): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.getRoomReservationForVendor, filterMap);
  }

  getTravelReservationForVendor(filterMap: any): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.getTravelReservationForVendor, filterMap);
  }

  getOutingReservationForVendor(filterMap: any): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.getOutingReservationForVendor, filterMap);
  }

  getManasikReservationForVendor(filterMap: any): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.getManasikReservationForVendor, filterMap);
  }

  cancelBooking(id: number): Observable<any> {
    return this.ApiCallerService.put(`CustomerBooking/ManualCancel/?id=${id}`, {});
  }

  // ── InstaPay Admin Actions ──
  confirmInstaPayBooking(id: number): Observable<any> {
    return this.ApiCallerService.put(`${this.endPoints.confirmInstaPayBooking}${id}`, {});
  }

  cancelInstaPayBooking(id: number): Observable<any> {
    return this.ApiCallerService.put(`${this.endPoints.cancelInstaPayBooking}${id}`, {});
  }

  // ── Mark Vendor Settled Actions ──
  markTripVendorSettled(payload: { reservationId: number; settledAmount: number }): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.markTripVendorSettled, payload);
  }

  markOutingVendorSettled(payload: { reservationId: number; settledAmount: number }): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.markOutingVendorSettled, payload);
  }

  markManasikVendorSettled(payload: { reservationId: number; settledAmount: number }): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.markManasikVendorSettled, payload);
  }

  markVendorSettledByModule(moduleType: number, payload: { reservationId: number; settledAmount: number }): Observable<any> {
    switch (moduleType) {
      case 1: // Travel / Trip
        return this.markTripVendorSettled(payload);
      case 3: // Outing
        return this.markOutingVendorSettled(payload);
      case 4: // Manasik / Hajj
        return this.markManasikVendorSettled(payload);
      default:
        return this.markTripVendorSettled(payload);
    }
  }
}

