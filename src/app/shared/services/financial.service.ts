import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  endPoints = APIs.financialSettings;

  constructor(private ApiCallerService: ApiCallerService) {}

  // ── Financial Settings ──
  getAllFinancialSettings(): Observable<any> {
    return this.ApiCallerService.get(this.endPoints.getAllFinancialSettings);
  }

  updateFinancialSetting(data: any[]): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.editFinancialSettings, data);
  }

  // ── User / Bonus Settings ──
  getUserSettings(): Observable<any> {
    return this.ApiCallerService.get(this.endPoints.getUserSettings);
  }

  updateUserSettings(data: any[]): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.updateUserSettings, data);
  }

  // ── InstaPay Details ──
  getInstaPayDetails(): Observable<any> {
    return this.ApiCallerService.get(this.endPoints.getInstaPayDetails);
  }
}
