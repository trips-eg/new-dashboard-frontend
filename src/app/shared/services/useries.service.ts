import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { Observable } from 'rxjs';
import { BaseSearchCriteria } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class UseriesService {
  endPoints = APIs.useries;
  constructor(private ApiCallerService: ApiCallerService) {}
  createUser(model: any): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.createUser, model);
  }
  getAllUsers(criteria: BaseSearchCriteria): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.getAllUser, criteria);
  }
  getUserById(id: string): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.GetUserInfoById}?UserId=${id}`);
  }
  updateUser(model: any): Observable<any> {
    return this.ApiCallerService.put(this.endPoints.updateUser, model);
  }
  deleteUser(id: string): Observable<any> {
    return this.ApiCallerService.delete(`${this.endPoints.deleteUser}?UserId=${id}`);
  }
  resetPassword(data: { id: number; newPassword: string }): Observable<any> {
    return this.ApiCallerService.put(`${this.endPoints.resetPassword}`, data);
  }
}
