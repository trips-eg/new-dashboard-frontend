import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';
@Injectable({
  providedIn: 'root'
})
export class EmailsService {
  endPoints = APIs.emails;

  constructor(private _apiCaller: ApiCallerService) {}

  getAllEmails(criteria: any): Observable<any> {
    return this._apiCaller.post(this.endPoints.getAllEmails, criteria);
  }

  GetSendEmailLogByIdAsync(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getEmailById}${id}`);
  }

  sendEmail(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.sendEmail}${id}`);
  }

  getAllEmailsTrackers(filter: FilterMap): Observable<any> {
    const queryParams = [
      filter.pageIndex ? `pageIndex=${filter.pageIndex}` : null,
      filter.pageSize ? `pageSize=${filter.pageSize}` : null,
      filter.UserId ? `UserId=${filter.UserId}` : null,
      filter.LogId ? `LogId=${filter.LogId}` : null,
      filter.sort ? `sort=${filter.sort}` : null,
      filter.Search ? `Search=${filter.Search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');
    const query = `?${queryParams}`;
    return this._apiCaller.get(`${this.endPoints.getAllEmailsTrackers}${query}`);
  }
}
