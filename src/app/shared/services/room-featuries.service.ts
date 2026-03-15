import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomFeaturiesService {
  endPoints = APIs.Room;
  constructor(private _ApiCallerService: ApiCallerService) {}
  sendRoomFeature(data: any): Observable<any> {
    return this._ApiCallerService.post(this.endPoints.addRoomFeature, data);
  }
  getAllRoomFeaturies(filter: any): Observable<any> {
    return this._ApiCallerService.post(this.endPoints.getAllRoomFeatures, filter);
  }
  deleteRoomFeature(id: number): Observable<any> {
    return this._ApiCallerService.delete(`${this.endPoints.deleteRoomFeature}${id}`);
  }

  updateRoomFeature(id: number, name: any): Observable<any> {
    return this._ApiCallerService.put(`${this.endPoints.updateRoomFeature}`, { id, name });
  }
}
