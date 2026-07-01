import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';

export enum PricingModel {
  Percentage = 1,
  FixedAmount = 2,
  CommittedPrice = 3
}

export enum CommissionItemType {
  Travel = 1,
  Outing = 5,
  Hajj = 4
}

export interface CommissionPolicy {
  id?: number;
  itemId: number;
  itemType: CommissionItemType;
  pricingModel: PricingModel;
  tripsCommissionValue: number;
  companyNetPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class PricingService {
  endPoints = APIs.Pricing;

  constructor(private _apiCaller: ApiCallerService) {}

  getCommissionPolicy(itemId: number, itemType: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.GetCommissionPolicy}?itemId=${itemId}&itemType=${itemType}`);
  }

  saveCommissionPolicy(data: CommissionPolicy): Observable<any> {
    return this._apiCaller.post(this.endPoints.SaveCommissionPolicy, data);
  }

  getPricingPolicyStatistics(): Observable<any> {
    return this._apiCaller.get(this.endPoints.GetPricingPolicyStatistics);
  }
}
