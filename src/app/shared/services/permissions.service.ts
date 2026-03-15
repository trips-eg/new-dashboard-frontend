import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  endPoints = APIs.permissions;

  constructor(private ApiCallerService: ApiCallerService) {}
  getAllPermissionsForRole(roleId: number):Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.getAllPermissionsForROle}/${roleId}`);
  }
  addPermissionToRole(data): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.AddPermissionsToRole, data);
  }

}
