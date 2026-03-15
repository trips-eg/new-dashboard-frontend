import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BedTybeService {
  endPoints = APIs.BedTybies;
  constructor(private _ApiCallerService: ApiCallerService) {}
  sendBedTybe(data: any): Observable<any> {
    return this._ApiCallerService.post(this.endPoints.setBedTybe, data);
  }
  getAllBedTybies(criteria: any): Observable<any> {
    return this._ApiCallerService.post(this.endPoints.GetAllBedTybies, criteria);
  }
  updateBedTybe(id: number, name: any): Observable<any> {
    return this._ApiCallerService.put(`${this.endPoints.updateBedTybe}`, { id, name });
  }
  deleteBedTybe(id: number): Observable<any> {
    return this._ApiCallerService.delete(`${this.endPoints.deleteBedTybe}${id}`);
  }
}
