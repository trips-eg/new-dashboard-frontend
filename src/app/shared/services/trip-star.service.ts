import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { ApiEnvelope, TripStarDto, TripStarFilter, TripStarPage, TripStarReorderItem } from '../model/trip-star.model';

@Injectable({ providedIn: 'root' })
export class TripStarService {
  private readonly endpoints = APIs.tripStars;

  constructor(private readonly api: ApiCallerService) {}

  list(filter: TripStarFilter = {}): Observable<ApiEnvelope<TripStarPage>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    }
    return this.api.get(this.endpoints.list, undefined, params) as Observable<ApiEnvelope<TripStarPage>>;
  }

  get(id: number): Observable<ApiEnvelope<TripStarDto>> {
    return this.api.get(this.endpoints.get, undefined, new HttpParams().set('id', String(id))) as Observable<ApiEnvelope<TripStarDto>>;
  }

  create(form: FormData): Observable<ApiEnvelope<null>> {
    return this.api.post(this.endpoints.create, form) as Observable<ApiEnvelope<null>>;
  }

  replace(id: number, form: FormData): Observable<ApiEnvelope<null>> {
    return this.api.put(`${this.endpoints.replace}/${id}`, form) as Observable<ApiEnvelope<null>>;
  }

  delete(id: number): Observable<ApiEnvelope<null>> {
    return this.api.delete(`${this.endpoints.delete}/${id}`) as Observable<ApiEnvelope<null>>;
  }

  toggle(id: number): Observable<ApiEnvelope<null>> {
    return this.api.put(`${this.endpoints.toggle}/${id}`, null) as Observable<ApiEnvelope<null>>;
  }

  reorderCards(items: TripStarReorderItem[]): Observable<ApiEnvelope<null>> {
    return this.api.put(this.endpoints.reorderCards, items) as Observable<ApiEnvelope<null>>;
  }

  reorderItems(cardId: number, items: TripStarReorderItem[]): Observable<ApiEnvelope<null>> {
    return this.api.put(`${this.endpoints.reorderItems}/${cardId}`, items) as Observable<ApiEnvelope<null>>;
  }
}
