import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { CustomerAnalyticsRequest, CustomersByTypeRequest } from '../model/customer-analytics.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerAnalyticsService {
  constructor(private apiCaller: ApiCallerService) {}

  getCustomerAnalytics(request: CustomerAnalyticsRequest): Observable<any> {
    return this.apiCaller.post(APIs.CustomerAnalytics.getCustomerAnalytics, request);
  }

  getCustomersByAnalyticsType(request: CustomersByTypeRequest): Observable<any> {
    return this.apiCaller.post(APIs.CustomerAnalytics.getCustomersByAnalyticsType, request);
  }
}
