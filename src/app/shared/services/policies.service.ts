import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PoliciesService {
  endPoints = APIs.policies;
  constructor(private ApiCallerService: ApiCallerService) {}
  getPolicies(): Observable<any> {
    return this.ApiCallerService.get(this.endPoints.getPolicies);
  }
  updatePolicies(data): Observable<any> {
    return this.ApiCallerService.put(this.endPoints.editPolicies, data);
  }
}
