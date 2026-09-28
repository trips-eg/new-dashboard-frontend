import { inject, Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { Observable } from 'rxjs';
import { ICustomTripSetting, ICustomTripSettingUpdate, ICreateVendorTripOffer, IVendorTripRequestsQuery } from '../model/icustom-trip';

@Injectable({
  providedIn: 'root'
})
export class CustomTripsService {
  endPoints = APIs.customTrips;
  ApiCallerService = inject(ApiCallerService);

  getSettings(): Observable<any> {
    return this.ApiCallerService.get(this.endPoints.getSettings);
  }

  updateSettings(settings: ICustomTripSettingUpdate[]): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.updateSettings, settings);
  }

  getAllRequests(query: IVendorTripRequestsQuery): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.allRequests, query);
  }

  getRequestById(id: number): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.requestById}${id}`);
  }

  submitOffer(offer: ICreateVendorTripOffer): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.submitOffer, offer);
  }

  getMySubmittedOffers(query: IVendorTripRequestsQuery): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.mySubmittedOffers, query);
  }

  getAdminAllRequests(query: IVendorTripRequestsQuery): Observable<any> {
    return this.ApiCallerService.post(this.endPoints.adminAllRequests, query);
  }
}
