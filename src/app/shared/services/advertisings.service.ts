import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { FilterMap } from '../mapping/filterMap';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdvertisingsService {
  endPoints = APIs.advertisings;
  constructor(private ApiCallerService: ApiCallerService) {}
  getAllAdvertisings(FilterMap: FilterMap): Observable<any> {
    const queryParams = [
      FilterMap.pageIndex ? `pageIndex=${FilterMap.pageIndex}` : null,
      FilterMap.pageSize ? `pageSize=${FilterMap.pageSize}` : null,
      FilterMap.sort ? `sort=${FilterMap.sort}` : null,
      FilterMap.search ? `Search=${FilterMap.search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');
    const query = `?${queryParams}`;
    return this.ApiCallerService.get(`${this.endPoints.getAlladvertisings}${query}`);
  }
  setAdvertising(model):Observable<any>{
    return this.ApiCallerService.post(this.endPoints.Addadvertisings ,model)
  }
  deleteAdvertising(id):Observable<any>{
    return this.ApiCallerService.delete(`${this.endPoints.deleteadvertisings}${id}`)
  }
  getAddById(id):Observable<any>{
    return this.ApiCallerService.get(`${this.endPoints.getadvertisingsById}${id}`)
  }
  updateAdd(model):Observable<any>{
    return this.ApiCallerService.put(this.endPoints.updateadvertisings ,model )
  }

}
