import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  endPoints = APIs.roles;
  constructor(private ApiCallerService:ApiCallerService) { }
  getAllRoles() :Observable<any> {
    return this.ApiCallerService.get(this.endPoints.getAllRoles);
  }
  addRole(data: any): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.addRole, data);
  }
  deleteRole(roleId: number): Observable<any> {
    return this.ApiCallerService.delete(`${this.endPoints.deleteRole}?id=${roleId}`);
  }
}
