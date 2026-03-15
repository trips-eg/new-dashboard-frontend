import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { Observable } from 'rxjs';
import { FilterMap, FilterTravelMap } from '../mapping/filterMap';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TravelTripsService {
  endPoints = APIs.TravelTrips;
  baseUrl = environment.apiUrl;

  constructor(
    private _apiCaller: ApiCallerService,
    private HttpClient: HttpClient
  ) {}

  getAllTravels(criteria: any): Observable<any> {
    return this._apiCaller.post(this.endPoints.getAllTravels, criteria);
  }

  getTravelById(id: number): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getTravelById}${id}`);
  }
  addTravel(model: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addTravel}`, model);
  }
  updateTravel(model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateTravel}`, model);
  }

  deleteTravel(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteTravel}${id}`);
  }

  deleteTravelImage(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteTravelImage}${id}`);
  }
  updateTravelStatus(tripId: number, isActive: boolean): Observable<any> {
    const params = new HttpParams().set('tripId', tripId.toString()).set('isActive', isActive.toString());
    return this.HttpClient.patch(`${this.baseUrl}${this.endPoints.updateTravelStatus}`, {}, { params });
  }
  toggleBlock(id): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.updateTravelBlockStatus}${id}`, {});
  }

  //////// ----------------- program steps ----------////////////////
  getProgramStepType(): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getProgramStepType}`);
  }

  getProgramStepsByTripId(tripId: any): Observable<any> {
    return this._apiCaller.get(`${this.endPoints.getProgramStepsByTripId}${tripId}`);
  }
  addProgramSteps(model: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addProgramSteps}`, model);
  }
  updateProgramSteps(tripId: any, model: any): Observable<any> {
    return this._apiCaller.put(`${this.endPoints.updateProgramSteps}${tripId}`, model);
  }

  deleteProgramStep(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteProgramStep}${id}`);
  }

  ///////////////////////// Trip Reservation ///////////////////////////

  getAllTripReservation(FilterMap: FilterTravelMap): Observable<any> {
    const queryParams = [
      FilterMap.pageIndex ? `pageIndex=${FilterMap.pageIndex}` : null,
      FilterMap.pageSize ? `pageSize=${FilterMap.pageSize}` : null,
      FilterMap.sort ? `sort=${FilterMap.sort}` : null,
      FilterMap.Search ? `Search=${FilterMap.Search}` : null,
      FilterMap.CityId !== undefined ? `CityId=${FilterMap.CityId}` : null,
      FilterMap.CountryId !== undefined ? `CountryId=${FilterMap.CountryId}` : null,
      FilterMap.Rating ? `Rating=${FilterMap.Rating}` : null,
      FilterMap.FromDate ? `FromDate=${FilterMap.FromDate}` : null,
      FilterMap.ToDate ? `ToDate=${FilterMap.ToDate}` : null,
      FilterMap.IsExternalTrip !== undefined ? `IsExternalTrip=${FilterMap.IsExternalTrip}` : null,
      FilterMap.FromLocation ? `FromLocation=${FilterMap.FromLocation}` : null,
      FilterMap.ToLocation ? `ToLocation=${FilterMap.ToLocation}` : null,
      FilterMap.isPagingEnabled !== undefined ? `isPagingEnabled=${FilterMap.isPagingEnabled}` : null,
      FilterMap.CountryCode ? `CountryCode=${FilterMap.CountryCode}` : null,
      FilterMap.SeatsCount ? `SeatsCount=${FilterMap.SeatsCount}` : null,
      FilterMap.NumberOfDays ? `NumberOfDays=${FilterMap.NumberOfDays}` : null
    ]
      .filter((param) => param !== null)
      .join('&');

    const query = `?${queryParams}`;
    return this._apiCaller.get(`${this.endPoints.getAllTripReservation}${query}`);
  }
  reserveTrip(model: any): Observable<any> {
    return this._apiCaller.post(`${this.endPoints.addTripReservation}`, model);
  }

  cancelTripReservation(id: number): Observable<any> {
    return this._apiCaller.delete(`${this.endPoints.deleteReservation}${id}`);
  }
}
