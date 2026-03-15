import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class CitiesService {
  endPoints = APIs.cities;
  constructor(private _ApiCallerService: ApiCallerService) {}
  getAllCities(criteria: any): Observable<any> {
    return this._ApiCallerService.post(this.endPoints.GetAllCities, criteria);
  }
  getCities(FilterMap?: FilterMap): Observable<any> {
    const queryParams = [
      FilterMap?.pageIndex ? `pageIndex=${FilterMap?.pageIndex}` : null,
      FilterMap?.pageSize ? `pageSize=${FilterMap?.pageSize}` : null,
      FilterMap?.sort ? `sort=${FilterMap?.sort}` : null,
      FilterMap?.CountryId != null ? `CountryId=${FilterMap?.CountryId}` : null, // 👈 هنا التعديل
      FilterMap?.CountryCode !== undefined ? `CountryCode=${FilterMap?.CountryCode}` : null,
      FilterMap?.search ? `Search=${FilterMap?.search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');

    const query = `?${queryParams}`;
    return this._ApiCallerService.get(`${this.endPoints.GetAllCities}${query}`);
  }
  setCity(cityData): Observable<any> {
    return this._ApiCallerService.post(this.endPoints.setCities, cityData);
  }
  editStatus(payload): Observable<any> {
    return this._ApiCallerService.put(this.endPoints.editStatus, payload);
  }
}
