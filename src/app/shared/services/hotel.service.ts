import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  endPoints = APIs.Hotel;

  constructor(private _apiCaller: ApiCallerService) {}

  // ////  ----------------Hotel ----------------------// ////

  getAllHotels(criteria: any): Observable<any> {
    return this._apiCaller.post(this.endPoints.getAllHotels, criteria);
  }

  getHotelById(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getHotelById}${id}`);
  }
  addHotel(model: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addHotel}`, model);
  }
  updateHotel(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateHotel}`, model);
  }
  updateHotelStatus(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateHotelStatus}`, model);
  }
  deleteHotel(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteHotel}${id}`);
  }

  // ////  ----------------Hotel Address  ----------------------// ////

  getAllHotelAddresses(FilterMap: FilterMap): Observable<any> {
    const queryParams = [
      FilterMap.pageIndex ? `pageIndex=${FilterMap.pageIndex}` : null,
      FilterMap.pageSize ? `pageSize=${FilterMap.pageSize}` : null,
      FilterMap.sort ? `sort=${FilterMap.sort}` : null,
      FilterMap.search ? `Search=${FilterMap.search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');

    const query = `?${queryParams}`;
    return this._apiCaller.get(`${this.endPoints.getAllHotelAddresses}${query}`);
  }

  getHotelAddressById(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getHotelAddressById}${id}`);
  }
  addHotelAddress(model: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addHotelAddress}`, model);
  }
  updateHotelAddress(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateHotelAddress}`, model);
  }
  deleteHotelAddress(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteHotelAddress}${id}`);
  }

  // ////  ----------------Hotel Feature ----------------------// ////

  getAllHotelFeatures(FilterMap: FilterMap): Observable<any> {
    const queryParams = [
      FilterMap.pageIndex ? `pageIndex=${FilterMap.pageIndex}` : null,
      FilterMap.pageSize ? `pageSize=${FilterMap.pageSize}` : null,
      FilterMap.sort ? `sort=${FilterMap.sort}` : null,
      FilterMap.search ? `Search=${FilterMap.search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');

    const query = `?${queryParams}`;
    return this._apiCaller.get(`${this.endPoints.getAllHotelFeatures}${query}`);
  }

  getHotelFeatureById(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getHotelFeatureById}${id}`);
  }
  addHotelFeature(model: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addHotelFeature}`, model);
  }
  updateHotelFeature(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateHotelFeature}`, model);
  }
  deleteHotelFeature(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteHotelFeature}${id}`);
  }
}
