import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { FilterMap } from '../mapping/filterMap';
import { an } from '@fullcalendar/core/internal-common';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  endPoints = APIs.Room;

  constructor(private _apiCaller: ApiCallerService) {}

  // ////  ----------------Room Type ----------------------// ////

  getAllRoomTypes(FilterMap: FilterMap): Observable<any> {
    const queryParams = [
      FilterMap.pageIndex ? `pageIndex=${FilterMap.pageIndex}` : null,
      FilterMap.pageSize ? `pageSize=${FilterMap.pageSize}` : null,
      FilterMap.sort ? `sort=${FilterMap.sort}` : null,
      FilterMap.search ? `Search=${FilterMap.search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');

    const query = `?${queryParams}`;
    return this._apiCaller.get(`${this.endPoints.getAllRoomTypes}${query}`);
  }

  getRoomTypeById(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getRoomTypeById}${id}`);
  }
  addRoomType(model: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addRoomType}`, model);
  }
  updateRoomType(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateRoomType}`, model);
  }
  deleteRoomType(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteRoomType}${id}`);
  }

  // ////  ----------------Room  ----------------------// ////

  getAllRooms(filter: any): Observable<any> {
    return this._apiCaller.post(this.endPoints.getAllRooms, filter);
  }

  getRoomById(id): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getRoomById}${id}`);
  }
  addRoom(model: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addRoom}`, model);
  }
  updateRoom(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateRoom}`, model);
  }
  deleteRoom(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteRoom}${id}`);
  }
  toggleBlock(id): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.toggleBlockRoom}${id}`, {});
  }

  // ////  ----------------Room Images ----------------------// ////

  getAllRoomgetAllRoomImages(FilterMap: FilterMap): Observable<any> {
    const queryParams = [
      FilterMap.roomId ? `roomId=${FilterMap.roomId}` : null,
      FilterMap.pageIndex ? `pageIndex=${FilterMap.pageIndex}` : null,
      FilterMap.pageSize ? `pageSize=${FilterMap.pageSize}` : null,
      FilterMap.sort ? `sort=${FilterMap.sort}` : null,
      FilterMap.search ? `Search=${FilterMap.search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');

    const query = `?${queryParams}`;
    return this._apiCaller.get(`${this.endPoints.getAllRoomImages}${query}`);
  }

  getRoomImageById(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getRoomImageById}${id}`);
  }
  addRoomImage(model: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addRoomImage}`, model);
  }
  updateRoomImage(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateRoomImage}`, model);
  }
  deleteRoomImage(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteRoomImage}${id}`);
  }

  // ////  ----------------Room Feature ----------------------// ////

  getAllRoomFeatures(FilterMap: FilterMap): Observable<any> {
    const queryParams = [
      FilterMap.pageIndex ? `pageIndex=${FilterMap.pageIndex}` : null,
      FilterMap.pageSize ? `pageSize=${FilterMap.pageSize}` : null,
      FilterMap.sort ? `sort=${FilterMap.sort}` : null,
      FilterMap.search ? `Search=${FilterMap.search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');

    const query = `?${queryParams}`;
    return this._apiCaller.get(`${this.endPoints.getAllRoomFeatures}${query}`);
  }

  getRoomFeatureById(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getRoomFeatureById}${id}`);
  }
  addRoomFeature(model: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addRoomFeature}`, model);
  }
  updateRoomFeature(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateRoomFeature}`, model);
  }
  deleteRoomFeature(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteRoomFeature}${id}`);
  }

  // ////  ----------------Room Feature Mapping ----------------------// ////

  getAllRoomFeaturesMapping(FilterMap: FilterMap): Observable<any> {
    const queryParams = [
      FilterMap.pageIndex ? `pageIndex=${FilterMap.pageIndex}` : null,
      FilterMap.pageSize ? `pageSize=${FilterMap.pageSize}` : null,
      FilterMap.sort ? `sort=${FilterMap.sort}` : null,
      FilterMap.search ? `Search=${FilterMap.search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');

    const query = `?${queryParams}`;
    return this._apiCaller.get(`${this.endPoints.getAllRoomFeaturesMapping}${query}`);
  }

  getRoomFeatureMappingById(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getRoomFeatureMappingById}${id}`);
  }
  addRoomFeatureMapping(model: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addRoomFeatureMapping}`, model);
  }
  updateRoomFeatureMapping(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateRoomFeatureMapping}`, model);
  }
  deleteRoomFeatureMapping(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteRoomFeatureMapping}${id}`);
  }
}
