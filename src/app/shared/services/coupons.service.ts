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
  getAllSettings(): Observable<any> {
    return this.ApiCallerService.get(this.ensPoints.getAllSettings);
  }
  updateSettings(settings: any[]): Observable<any> {
    return this.ApiCallerService.post(this.ensPoints.updateSettings, settings);
  }
  getWeekendSettings(): Observable<any> {
    return this.ApiCallerService.get(this.ensPoints.getWeekend);
  }
  updateWeekendSettings(data: any): Observable<any> {
    return this.ApiCallerService.post(this.ensPoints.updateWeekend, data);
  }
  getBirthdaySettings(): Observable<any> {
    return this.ApiCallerService.get(this.ensPoints.getBirthday);
  }
  updateBirthdaySettings(data: any): Observable<any> {
    return this.ApiCallerService.post(this.ensPoints.updateBirthday, data);
  }
  getRecoverySettings(): Observable<any> {
    return this.ApiCallerService.get(this.ensPoints.getRecovery);
  }
  updateRecoverySettings(data: any): Observable<any> {
    return this.ApiCallerService.post(this.ensPoints.updateRecovery, data);
  }
  getWeekendItems(): Observable<any> {
    return this.ApiCallerService.get(this.ensPoints.getWeekendItems);
  }
  updateWeekendItems(data: any): Observable<any> {
    return this.ApiCallerService.post(this.ensPoints.updateWeekendItems, data);
  }
  getBirthdayItems(): Observable<any> {
    return this.ApiCallerService.get(this.ensPoints.getBirthdayItems);
  }
  updateBirthdayItems(data: any): Observable<any> {
    return this.ApiCallerService.post(this.ensPoints.updateBirthdayItems, data);
  }
  constructor() {}
}
