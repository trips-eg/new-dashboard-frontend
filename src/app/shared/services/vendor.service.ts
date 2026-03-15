import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  endPoints = APIs.Vendors;

  constructor(private _apiCaller: ApiCallerService) {}

  getAllVendors(criteria: any): Observable<any> {
    return this._apiCaller.post(this.endPoints.getAllCompanies, criteria);
  }

  getVendorById(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getCompanyById}${id}`);
  }
  getVendorStatistics(id: number): Observable<any> {
    if (!id) {
      return this._apiCaller.get(`${this.endPoints.getStatistics}`);
    } else {
      return this._apiCaller.get(`${this.endPoints.getStatistics}=${id}`);
    }
  }
  getVendorTravelStatistics(data): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.getTravelStatistics}`, data);
  }
  getVendorRoomStatistics(data): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.getRoomStatistics}`, data);
  }
  getVendorOutingStatistics(data): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.getOutingStatistics}`, data);
  }
  getVendorHajjStatistics(data): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.getHajjStatistics}`, data);
  }
  addVendor(model: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addCompany}`, model);
  }
  updateVendor(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateCompany}`, model);
  }
  deleteVendor(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteCompany}${id}`);
  }
  deleteLisenceDocument(id): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteCompanyImage}${id}`);
  }
  toggleVendorStatus(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.toggleCompanyStatus}${id}`);
  }
}
