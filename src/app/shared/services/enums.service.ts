import { inject, Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnumsService {
  endPoints = APIs.enums;
  ApiCallerService = inject(ApiCallerService);
  getUserLimit(): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.GetUserLimit}`);
  }
  getPaymentStatus():Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.getPaymentStatus}`);
  }
  getBoardingTypes():Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.getRoomBoardingsTypes}`);
  }

  constructor() {}
}
