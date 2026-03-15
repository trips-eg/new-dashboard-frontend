import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  endPoints = APIs.transactions;


  constructor(private _apiCaller: ApiCallerService) { }
  getTransactions(filterMap?: FilterMap): Observable<any> {
    const queryParams = [
      filterMap?.pageIndex ? `pageIndex=${filterMap.pageIndex}` : null,
      filterMap?.pageSize ? `pageSize=${filterMap.pageSize}` : null,
      filterMap?.sort ? `sort=${filterMap.sort}` : null,
      filterMap?.UserId ? `UserId=${filterMap.UserId}` : null,
      filterMap?.search ? `search=${filterMap.search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');

    const query = queryParams ? `?${queryParams}` : '';
    return this._apiCaller.get(`${this.endPoints.getTransactions}${query}`);
  }
  getWalletChargeTransaction(filterMap?: FilterMap): Observable<any> {
    const queryParams = [
      filterMap?.pageIndex ? `pageIndex=${filterMap.pageIndex}` : null,
      filterMap?.pageSize ? `pageSize=${filterMap.pageSize}` : null,
      filterMap?.sort ? `sort=${filterMap.sort}` : null,
      filterMap?.UserId ? `UserId=${filterMap.UserId}` : null,
      filterMap?.search ? `search=${filterMap.search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');

    const query = queryParams ? `?${queryParams}` : '';
    return this._apiCaller.get(`${this.endPoints.getWalletChargeTransaction}${query}`);
  }
}
