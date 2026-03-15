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
  getAllFinancialSettings(): Observable<any> {
    return this.ApiCallerService.get(this.endPoints.getAllFinancialSettings);
  }
  updateFinancialSetting(data):Observable<any>{
    return this.ApiCallerService.post(this.endPoints.editFinancialSettings,data)
  }
}
