import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  endPoints = APIs.notifications;
  constructor(private ApiCallerService: ApiCallerService) {}

  addNotification(notification) {
    return this.ApiCallerService.post(`${this.endPoints.AddNotification}`, notification);
  }
  updateNotification(notification) {
    return this.ApiCallerService.post(`${this.endPoints.update}`, notification);
  }
  getAllNotifications(criteria: any) {
    return this.ApiCallerService.post(this.endPoints.GetAllNotifications, criteria);
  }
  getNotificationById(id: number) {
    return this.ApiCallerService.get(`${this.endPoints.GetNotificationById}${id}`);
  }
  deleteNotification(id: number) {
    return this.ApiCallerService.delete(`${this.endPoints.delete}${id}`);
  }
}
