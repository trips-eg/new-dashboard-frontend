import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OutingService {
  endPoints = APIs.Outing;
  baseUrl = environment.apiUrl;

  constructor(private _apiCaller: ApiCallerService) {}

  // getAllOutings(FilterMap?: FilterMap): Observable<any> {
  //   const queryParams = [
  //     FilterMap?.pageIndex ? `pageIndex=${FilterMap.pageIndex}` : null,
  //     FilterMap?.pageSize ? `pageSize=${FilterMap.pageSize}` : null,
  //     FilterMap?.sort ? `sort=${FilterMap.sort}` : null,
  //     FilterMap?.Search ? `Search=${FilterMap.Search}` : null,
  //     FilterMap?.VendorId ? `VendorId=${FilterMap.VendorId}` : null,
  //     FilterMap?.cityId !== undefined && FilterMap.cityId >= 0 ? `CityId=${FilterMap.cityId}` : null,
  //     FilterMap?.countryId !== undefined && FilterMap.countryId >= 0 ? `CountryId=${FilterMap.countryId}` : null,
  //     FilterMap?.rating ? `Rating=${FilterMap.rating}` : null,
  //     FilterMap?.fromDate ? `FromDate=${FilterMap.fromDate}` : null,
  //     FilterMap?.toDate ? `ToDate=${FilterMap.toDate}` : null
  //   ]
  //     .filter((param) => param !== null)
  //     .join('&');

  //   const query = queryParams ? `?${queryParams}` : '';
  //   return this._apiCaller.get(`${this.endPoints.getAllOutings}${query}`);
  // }
  getAllOutings(criteria: any): Observable<any> {
    return this._apiCaller.post(this.endPoints.getAllOutings, criteria);
  }

  getOutingById(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getOutingById}${id}`);
  }

  addOutingOnly(data: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.AddOutingOnly}`, data);
  }

  addOutingAddOns(data: any): Observable<any> {
    return this._apiCaller.post('OutingAddOns/AddOutingAddOns', data);
  }

  deleteOutingAddOns(id: any): Observable<any> {
    return this._apiCaller.delete(`OutingAddOns/DeleteOutingAddOns?id=${id}`);
  }
  addOutingOffers(data: any): Observable<any> {
    return this._apiCaller.post('OutingOffers/AddOutingOffers', data);
  }
  deleteOutingOffers(id: any): Observable<any> {
    return this._apiCaller.delete(`OutingOffers/DeleteOutingOffers?id=${id}`);
  }

  addOutingTickets(data: any): Observable<any> {
    return this._apiCaller.post('OutingTickets/AddOutingTickets', data);
  }

  deleteOutingTicket(id: any): Observable<any> {
    return this._apiCaller.delete(`OutingTickets/DeleteOutingTickets?id=${id}`);
  }
  getOutingSchedulesByOutingId(id: any): Observable<any> {
    const criteria = {
      outingId: id,
      isPagingEnabled: false
    };
    return this._apiCaller.post('OutingSchedules/GetAllOutingSchedules', criteria);
  }
  addOutingSchedules(data: any): Observable<any> {
    return this._apiCaller.post('OutingSchedules/AddOutingSchedules', data);
  }
  updateOutingSchedules(data: any): Observable<any> {
    return this._apiCaller.put('OutingSchedules/UpdateListOutingSchedule', data);
  }
  deleteOutingSchedules(id: any): Observable<any> {
    return this._apiCaller.delete(`OutingSchedules/DeleteOutingSchedules?id=${id}`);
  }

  deleteOuting(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteOuting}${id}`);
  }

  deleteOutingImage(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteOutingImage}${id}`);
  }

  toggleBlock(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.updateOutingBlockStatus}${id}`);
  }
  updateOutingStatus(id: number): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.updateOutinStatus}${id}`, null);
  }
  updateOutingOnly(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateOuting}`, model);
  }
  updateOutingAddOns(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.UpdateListOutingAddOn}`, model);
  }
  updateOutingOffers(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateOutingOffers}`, model);
  }
  updateOutingTickets(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateOutingTickets}`, model);
  }

  updateOutingTicket(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateOutingTicket}`, model);
  }
  addTicketExel(data: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addTicketExel}`, data);
  }

  getOutingBookingById(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getOutingBookingById}${id}`);
  }
  useTicketSerialNumber(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.UseTicketSerialNumber}${id}`);
  }
}
