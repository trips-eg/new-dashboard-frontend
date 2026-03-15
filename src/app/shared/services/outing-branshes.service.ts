import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class OutingBranshesService {
  endPoints = APIs.Outing;

  constructor(private apiCaller: ApiCallerService) {}

  addOutingBranches(data: any): Observable<any> {
    return this.apiCaller.post(`${this.endPoints.addOutingBranches}`, data);
  }

  getAllOutingBranches(filter: any): Observable<any> {
    return this.apiCaller.post(this.endPoints.getAllOutingBranches, filter);
  }

  getOutingBranchesById(id: number): Observable<any> {
    return this.apiCaller.get(`${this.endPoints.getOutingBranchesById}${id}`);
  }

  updateOutingBranches(data: any): Observable<any> {
    return this.apiCaller.put(`${this.endPoints.updateOutingBranches}`, data);
  }

  deleteOutingBranches(id: number): Observable<any> {
    return this.apiCaller.delete(`${this.endPoints.deleteOutingBranches}${id}`);
  }
}
