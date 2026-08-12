import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';

@Injectable({
  providedIn: 'root'
})
export class HajjCategoryService {
  endPoints = APIs.hajjCategories;

  constructor(private apiCallerService: ApiCallerService) {}

  getAllHajjCategories(filter: any): Observable<any> {
    return this.apiCallerService.post(this.endPoints.GetAllHajjCategories, filter);
  }

  getHajjCategoryById(id: number): Observable<any> {
    return this.apiCallerService.get(`${this.endPoints.GetHajjCategoryById}${id}`);
  }

  addHajjCategory(data: FormData): Observable<any> {
    return this.apiCallerService.post(this.endPoints.AddHajjCategory, data);
  }

  updateHajjCategory(data: FormData): Observable<any> {
    return this.apiCallerService.put(this.endPoints.UpdateHajjCategory, data);
  }

  toggleStatus(id: number): Observable<any> {
    return this.apiCallerService.patch(`${this.endPoints.ToggleStatus}${id}`, null);
  }

  deleteHajjCategory(id: number): Observable<any> {
    return this.apiCallerService.delete(`${this.endPoints.DeleteHajjCategory}${id}`);
  }
}