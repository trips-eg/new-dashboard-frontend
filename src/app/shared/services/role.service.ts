import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
engPoints = APIs.roles;
  constructor( private ApiCallerService:ApiCallerService) { }
  getAllRoles():Observable<any> {
    return this.ApiCallerService.get(this.engPoints.getAllRoles);
  }
}
