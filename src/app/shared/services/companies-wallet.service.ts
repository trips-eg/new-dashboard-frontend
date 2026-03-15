import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class CompaniesWalletService {
  endPoints = APIs.companyWallet;
  constructor(private ApiCallerService: ApiCallerService) {}
  setPayMentToVendor(model): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.AddToCompanyWallet, model);
  }
  CallculateSattlements(model): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.CallculateSattlements, model);
  }

  getCompanyWallet(FilterMap: any): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.getCompanyWallet, FilterMap);
  }
}
