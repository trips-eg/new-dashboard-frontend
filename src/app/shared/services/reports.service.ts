import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { OutingSummaryRequest, TravelSummaryRequest, HotelSummaryRequest, HajjSummaryRequest } from '../model/reports.model';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  constructor(private _apiCaller: ApiCallerService) {}

  // ============================================
  // OUTING REPORTS
  // ============================================

  getOutingSummary(criteria: OutingSummaryRequest): Observable<any> {
    return this._apiCaller.post(APIs.Reports.getOutingSummary, criteria);
  }

  // ============================================
  // TRAVEL REPORTS (Future)
  // ============================================

  getTravelSummary(criteria: TravelSummaryRequest): Observable<any> {
    return this._apiCaller.post(APIs.Reports.getTravelSummary, criteria);
  }

  // ============================================
  // HOTEL REPORTS (Future)
  // ============================================

  getHotelSummary(criteria: HotelSummaryRequest): Observable<any> {
    return this._apiCaller.post(APIs.Reports.getHotelSummary, criteria);
  }

  // ============================================
  // HAJJ/UMMRAH REPORTS (Future)
  // ============================================

  getHajjSummary(criteria: HajjSummaryRequest): Observable<any> {
    return this._apiCaller.post(APIs.Reports.getHajjSummary, criteria);
  }
}
