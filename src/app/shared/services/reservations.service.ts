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
  constructor(private ApiCallerService: ApiCallerService) {}
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
}
