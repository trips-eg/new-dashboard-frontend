import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiCallerService {

   private apiUrl = environment.apiUrl;
   constructor(private _http: HttpClient) {

   }
   private  setRequiredHeaders() {
       const token = localStorage.getItem('token');
        let headers = {};
       if (token) {
           headers = { token: token };
       }
       return headers;

   }

   public createWebApiUrl(url) {
     return this.apiUrl + url;
   }

   public get(url,responseType?,query?,obj?) {
       const headers = this.setRequiredHeaders();
       const ops = { headers};
       ops['params'] = query;
        ops['body'] = obj;
        ops['responseType'] = responseType;
        // headers["mode"] = "no-cors"
       return this._http.get(this.createWebApiUrl(url), ops);
   }

   public getWithbody(url,option?) {
       const headers = this.setRequiredHeaders();
       option.headers= headers;

       return this._http.get(this.createWebApiUrl(url), option);
   }


   public post(url, data) {
       const headers = this.setRequiredHeaders();
    //    headers["mode"] = "no-cors"
    //    headers["Accept-Language"] ="ar"

       return this._http.post(this.createWebApiUrl(url), data, { headers });
   }


   public patch(url, data) {
    const headers = this.setRequiredHeaders();
    return this._http.patch(this.createWebApiUrl(url), data, { headers });
}


   public put(url, data) {
       const headers = this.setRequiredHeaders();
    //    headers["mode"] = "no-cors"
       return this._http.put(this.createWebApiUrl(url), data, { headers });
   }


   public delete(url) {
       const headers = this.setRequiredHeaders();
       return this._http.delete(this.createWebApiUrl(url), { headers });
   }


   public deleteWithbodyData(url, option) {
       const headers = this.setRequiredHeaders();
       option.headers = headers;
       return this._http.delete(this.createWebApiUrl(url), option);
   }



   public handleError(event) {
   }
   public postWithAttachment(
       url: string,
       formData: any,
   ) {
       const headers = this.setRequiredHeaders();
    //    headers["mode"] = "no-cors"
       return this._http.post(this.createWebApiUrl(url), formData, { headers });
   }

   public puttWithAttachment(
       url: string,
       formData: any,
   ) {
       const headers = this.setRequiredHeaders();
       return this._http.put(this.createWebApiUrl(url), formData, { headers });
   }
}
