import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class SalesAganciesService {
  constructor(private ApiCallerService: ApiCallerService) {}
  endPoints = APIs.salesAgancies;
  getSalesAgancies(FilterMap: FilterMap): Observable<any> {
    const queryParams = [
      FilterMap?.pageIndex ? `pageIndex=${FilterMap?.pageIndex}` : null,
      FilterMap?.pageSize ? `pageSize=${FilterMap?.pageSize}` : null,
      FilterMap?.sort ? `sort=${FilterMap?.sort}` : null,
      FilterMap?.Search ? `Search=${FilterMap?.Search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');

    const query = `?${queryParams}`;
    return this.ApiCallerService.get(`${this.endPoints.getsalesAgancies}${query}`);
  }
  setSalesAgancy(formData): Observable<any> {
    return this.ApiCallerService.post(`${this.endPoints.setSalesAgancy}`, formData);
  }
  getSalesAgancyById(id): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.getSalesAgancyById}${id}`);
  }
  updateSalesAgancy(formData): Observable<any> {
    return this.ApiCallerService.put(`${this.endPoints.updateSalesAgancy}`, formData);
  }
  deleteSalesAgancy(id): Observable<any> {
    return this.ApiCallerService.delete(`${this.endPoints.deleteSalesAgancy}${id}`);
  }
}
