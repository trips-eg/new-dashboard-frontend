import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';
export enum SideBarItemType {
  Room = 1,
  Outing = 2,
  Hajj = 3,
  Trip = 4
}

export interface MobSideBarItem {
  id?: number;
  squence: number;
  sideBarItemType: SideBarItemType;
  outingId?: number;
  hajjId?: number;
  tripId?: number;
  roomId?: number;
  // Nested item details returned by the API
  outing?: any;
  hajj?: any;
  trip?: any;
  room?: any;
}

export interface MobSideBar {
  id?: number;
  title: string;
  color: string;
  squence: number;
  isActive: boolean;
  sideBarItems: MobSideBarItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MobSideBarService {
  endPoints = APIs.mobileSideBar;

  constructor(private _apiCaller: ApiCallerService) {}

  getAllMobileSideBar(criteria: any): Observable<any> {
    return this._apiCaller.post(this.endPoints.GetAllMobileSideBar, criteria);
  }

  getMobileSideBarById(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.GetMobileSideBarById}${id}`);
  }

  addMobileSideBar(mobileSideBar: MobSideBar): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.AddMobileSideBar}`, mobileSideBar);
  }

  updateMobileSideBar(id: number, mobileSideBar: MobSideBar): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateMobileSideBar}`, mobileSideBar); // Fixed endpoint usage usually update takes body, check helper if ID is in URL or body. Helper says 'SideBars/UpdateSideBar'. Usually PUT sends body.
  }

  deleteMobileSideBar(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteMobileSideBar}${id}`);
  }
  //Coupon Side Bar
  getCouponSideBar(): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.GetCouponSideBar}`);
  }
  editCouponSideBar(id: number, couponSideBar: MobSideBar): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.editCouponSideBar}`, couponSideBar);
  }
}
