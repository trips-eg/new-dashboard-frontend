import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { FilterMap } from '../mapping/filterMap';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { Country } from '../model/travelDto';

interface ApiResponse {
  data: {
    data: Country[];
    total: number;
  };
}
@Injectable({
  providedIn: 'root'
})
export class LookupsService {

  endPoints = APIs;

   constructor(private _apiCaller: ApiCallerService,private translate:TranslateService) {}


   getCountries(FilterMap?:FilterMap): Observable<{ label: string, value: number }[]>{

       const queryParams = [
         FilterMap?.pageIndex ?`pageIndex=${FilterMap?.pageIndex}`: null,
         FilterMap?.pageSize ? `pageSize=${FilterMap?.pageSize}`:null,
         FilterMap?.sort ? `sort=${FilterMap?.sort}` : null,
         FilterMap?.Search ? `Search=${FilterMap?.Search}` : null
       ].filter(param => param !== null).join('&');

       const query = `?${queryParams}`;

     return this._apiCaller.get(`${this.endPoints.countries.GetAllCountries}${query}`).pipe(
    map((response: ApiResponse) => response?.data?.data.map(country => ({
      label: country.name,
      value: country.id
    })))
  );
   }
   getCities(FilterMap?: FilterMap){
       const queryParams = [
         FilterMap?.pageIndex ? `pageIndex=${FilterMap?.pageIndex}` : null,
         FilterMap?.pageSize ? `pageSize=${FilterMap?.pageSize}` : null,
         FilterMap?.sort ? `sort=${FilterMap?.sort}` : null,
         FilterMap?.CountryId !== undefined ? `CountryId=${FilterMap?.CountryId}` : null,
         FilterMap?.search ? `Search=${FilterMap?.search}` : null
       ]
         .filter((param) => param !== null)
         .join('&');

       const query = `?${queryParams}`;

     return this._apiCaller.get(`${this.endPoints.cities.GetAllCities}${query}`).pipe(
    map((response: ApiResponse) => response?.data?.data.map(city => ({
      label: city.name,
      value: city.id
    })))
  );
     }
      getRating(){
 const Options = [{
      label: 1,
      value: 1
 },{
      label: 2,
      value: 2
 },{
      label: 3,
      value: 3
 },{
      label: 4,
      value: 4
 },{
      label: 5,
      value: 5
 }];
    return Options
     }

getTravelType(){
 const Options = [{
      label: this.translate.instant('Internal'),
      value: false
 },{
      label:  this.translate.instant('External'),
      value: true
 }];
    return Options
     }

     mapping(obj){
       const Options = Object.values(obj).map((value) => ({
      label: value,
      value: value
    }));
    return Options
     }
}
