import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { FilterMap } from '../mapping/filterMap';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NationalitiesService {
  endPoints = APIs.nationalities;
  getAllNationalities(criteria: any): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.GetAllNationalitys, criteria);
  }
  setNationalities(data): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.AddNationality, data);
  }
  updateNationality(id: number, data): Observable<any> {
    return this.ApiCallerService.put(`${this.endPoints.update}`, { id, ...data });
  }
  deleteNationality(id: number): Observable<any> {
    return this.ApiCallerService.delete(`${this.endPoints.delete}${id}`);
  }

  constructor(private ApiCallerService: ApiCallerService) {}
}
