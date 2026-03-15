import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  endPoints = APIs.countries;

  constructor(private _apiCaller: ApiCallerService) {}

  getAllCountries(criteria: any): Observable<any> {
    return this._apiCaller.post(this.endPoints.GetAllCountries, criteria);
  }

  getCountries(FilterMap?: FilterMap): Observable<any> {
    const queryParams = [
      FilterMap?.pageIndex ? `pageIndex=${FilterMap?.pageIndex}` : null,
      FilterMap?.pageSize ? `pageSize=${FilterMap?.pageSize}` : null,
      FilterMap?.sort ? `sort=${FilterMap?.sort}` : null,
      FilterMap?.Search ? `Search=${FilterMap?.Search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');

    const query = `?${queryParams}`;
    return this._apiCaller.get(`${this.endPoints.GetAllCountries}${query}`);
  }
  setCountry(countryData): Observable<any> {
    return this._apiCaller.post(this.endPoints.setCountries, countryData);
  }
  deletCountry(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteCountry}?id=${id}`);
  }
  editStatus(data): Observable<any> {
    return this._apiCaller.put(this.endPoints.editStatus, data);
  }
}
