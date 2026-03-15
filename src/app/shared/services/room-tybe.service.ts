import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomTybeService {
  endPoints = APIs.RoomTybies;

  constructor(private _ApiCallerService: ApiCallerService) {}

  getAllRoomTybes(filter: any): Observable<any> {
    return this._ApiCallerService.post(this.endPoints.GetAllRoomTybe, filter);
  }
  deleteRoomTybe(id: number): Observable<any> {
    return this._ApiCallerService.delete(`${this.endPoints.deleteRoomTybe}${id}`);
  }
  updateRoomTybe(data: { id: number; name: string; maxOccupancy: number }): Observable<any> {
    return this._ApiCallerService.put(`${this.endPoints.updateRoomtybe}`, data);
  }
  setRoomTybe(data: any): Observable<any> {
    return this._ApiCallerService.post(`${this.endPoints.setRoomTybe}`, data);
  }
}
