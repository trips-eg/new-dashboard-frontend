import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class RoomGroupsService {
  endPointts = APIs.roomGroups;
  constructor(private ApiCallerService: ApiCallerService) {}
  getAllRoomGroups(FilterMap: FilterMap): Observable<any> {
    const queryParams = [
      FilterMap.pageIndex ? `pageIndex=${FilterMap.pageIndex}` : null,
      FilterMap.pageSize ? `pageSize=${FilterMap.pageSize}` : null,
      FilterMap.sort ? `sort=${FilterMap.sort}` : null,
      FilterMap.search ? `Search=${FilterMap.search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');

    const query = `?${queryParams}`;
    return this.ApiCallerService.get(`${this.endPointts.GetAllroomGroups}${query}`);
  }

  setGroupOfRooms(data): Observable<any> {
    return this.ApiCallerService.post(this.endPointts.setGroupOfRooms, data);
  }
   getRoomTypeById(id: number): Observable<any> {
    return this.ApiCallerService.get(`${this.endPointts.getRoomGroupById}${id}`);
  }

  updateRoomGroup(data): Observable<any> {
    return this.ApiCallerService.put(this.endPointts.updateGroup, data);
  }



}
