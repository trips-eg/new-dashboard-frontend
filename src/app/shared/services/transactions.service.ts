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

  constructor(private _apiCaller: ApiCallerService) {}

  getTransactions(filterMap?: FilterMap): Observable<any> {
    const query = this.buildQuery(filterMap);
    return this._apiCaller.get(`${this.endPoints.getTransactions}${query}`);
  }

  getWalletChargeTransaction(filterMap?: FilterMap): Observable<any> {
    const query = this.buildQuery(filterMap);
    return this._apiCaller.get(`${this.endPoints.getWalletChargeTransaction}${query}`);
  }

  // ── Wallets list (admin — includes bonus details) ──
  getAllWallets(filterMap?: FilterMap): Observable<any> {
    const query = this.buildQuery(filterMap);
    return this._apiCaller.get(`${this.endPoints.getAllWallets}${query}`);
  }

  adjustWalletBalance(customerId: number, amount: number): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.adjustWalletBalance}/${customerId}?amount=${amount}`, {});
  }

  private buildQuery(filterMap?: FilterMap): string {
    const params = [
      filterMap?.pageIndex ? `pageIndex=${filterMap.pageIndex}` : null,
      filterMap?.pageSize  ? `pageSize=${filterMap.pageSize}`   : null,
      filterMap?.sort      ? `sort=${filterMap.sort}`           : null,
      filterMap?.UserId    ? `UserId=${filterMap.UserId}`       : null,
      filterMap?.search    ? `search=${filterMap.search}`       : null
    ]
      .filter((p) => p !== null)
      .join('&');

    return params ? `?${params}` : '';
  }
}
