import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { FilterMap } from '../mapping/filterMap';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HajjUmmrahService {
  endPoints = APIs.manasik;
  constructor(private _apiCaller: ApiCallerService) {}
  getAllManasik(criteria: any): Observable<any> {
    return this._apiCaller.post(this.endPoints.GetAllManasik, criteria);
  }
  updateManasikInfo(data: FormData): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateManasikInfo}`, data);
  }

  getManasikById(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.GetManasikById}${id}`);
  }
  deleteManasik(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteManasik}${id}`);
  }
  addManasik(data: FormData): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addManasikFirstStep}`, data);
  }
  addManasikProgram(data): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addManasikProgramStep}`, data);
  }
  updateManasikProgram(data): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.UpdateProgramStep}`, data);
  }
  addManasikTicket(data): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addManasikTicketStep}`, data);
  }
  deleteManasikTicket(id: any): Observable<any> {
    return this._apiCaller.delete(`HajjTickets/DeleteHajjTickets?id=${id}`);
  }
  updateManasikTicket(data): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.UpdateManasikTicketStep}`, data);
  }
  toggleBlock(id: number): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.toggleManasikBlockStatus}${id}`, null);
  }
  toggleStatus(id: number): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.toggleManasikStatus}${id}`, null);
  }
}
