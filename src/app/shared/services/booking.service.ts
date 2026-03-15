import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  endPoints = APIs.Booking;

  constructor(private _apiCaller: ApiCallerService) {}

  getAllBooking(criteria: any): Observable<any> {
    return this._apiCaller.post(this.endPoints.getAllBooking, criteria);
  }

  getBookingById(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getBookingById}${id}`);
  }

  addBooking(model: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addBooking}`, model);
  }
  updateBooking(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateBooking}`, model);
  }
  deleteBooking(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteBooking}${id}`);
  }
}
