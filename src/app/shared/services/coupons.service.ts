import { inject, Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { FilterMap } from '../mapping/filterMap';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CouponsService {
  ensPoints = APIs.coupons;
  ApiCallerService = inject(ApiCallerService);
  getCoupons(criteria: any): Observable<any> {
    return this.ApiCallerService.post(this.ensPoints.GetAllcoupons, criteria);
  }
  getCouponById(id: number): Observable<any> {
    return this.ApiCallerService.get(`${this.ensPoints.getcouponById}${id}`);
  }
  addCoupons(data: any): Observable<any> {
    return this.ApiCallerService.post(this.ensPoints.setcoupons, data);
  }
  deleteCoupon(id: number): Observable<any> {
    return this.ApiCallerService.delete(`${this.ensPoints.deletecoupons}${id}`);
  }
  getUsedCoupons(criteria: any): Observable<any> {
    return this.ApiCallerService.post(this.ensPoints.getusedcoupons, criteria);
  }
  constructor() {}
}
