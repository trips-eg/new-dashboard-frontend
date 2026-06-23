import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  endPoints = APIs.customeries;
  constructor(private ApiCallerService: ApiCallerService) {}
  getAllCustomers(criteria: any): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.getAllCustomeries, criteria);
  }
  updateCustomerStatus(data: { id: number; iActive: boolean }) {
    return this.ApiCallerService.put(`${this.endPoints.updateCustomerStatus}`, data);
  }
  getCustomerById(id: number): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.getCustomerById}?id=${id}`);
  }
  
}
