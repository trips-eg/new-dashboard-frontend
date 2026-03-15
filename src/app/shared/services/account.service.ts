import { Injectable } from '@angular/core';

import { ApiCallerService } from '../../theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  apiUrl = APIs.Account;
  envUrl = environment.apiUrl;

  constructor(
    private _httpCaller: ApiCallerService,
    private http: HttpClient
  ) {}

  login(model) {
    let url = `${this.envUrl}${this.apiUrl.login}`;
    return this.http.post(url, model);
    //return this._httpCaller.post(url,model)
  }

  sendOtp(email: string) {
    return this.http.post(`${this.envUrl}${this.apiUrl.forgetPassword}`, { email });
  }

  verifyOtp(model: any) {
    return this.http.post(`${this.envUrl}${this.apiUrl.verifyCode}`, model);
  }

  resetPassword(model: any) {
    return this.http.post(`${this.envUrl}${this.apiUrl.resetPassword}`, model);
  }
}
