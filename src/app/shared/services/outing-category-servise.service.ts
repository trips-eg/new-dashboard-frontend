import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class OutingCategoryServiseService {
  endPoints = APIs.outingCategoty;
  getAlloutingCategoty(filter: any): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.GetAllOutingCategories, filter);
  }
  getOutingCategoryById(id: number): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.GetOutingCategoryById}${id}`);
  }
  setOutingCategory(data): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.AddOutingCategory, data);
  }
  updateOutingCategory(data: FormData): Observable<any> {
    return this.ApiCallerService.put(this.endPoints.update, data);
  }

  deleteOutingCategory(id: number): Observable<any> {
    return this.ApiCallerService.delete(`${this.endPoints.delete}${id}`);
  }

  toggleStatus(id: number): Observable<any> {
    return this.ApiCallerService.patch(`${this.endPoints.toggleStatus}${id}`,null);
  }

  constructor(private ApiCallerService: ApiCallerService) {}
}
