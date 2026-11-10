import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';

// The customer app's rating popup (app 1.0.51): when it asks, and what customers rated.

export interface AppRatingSettings {
  enabled: boolean;
  /** Days after the app was installed before the first ask. */
  daysAfterInstall: number;
  /** After "مش دلوقتي": days before asking again. */
  snoozeDays: number;
  /** From this many stars the app opens Google Play / the App Store. */
  storeMinStars: number;
}

export interface AppRatingRow {
  id: number;
  stars: number;
  comment: string | null;
  sentToStore: boolean;
  platform: string | null;
  appVersion: string | null;
  createdAt: string;
  userId: number | null;
  customerName: string | null;
  phone: string | null;
}

export interface AppRatingAdmin {
  settings: AppRatingSettings;
  summary: { count: number; average: number; perStar: number[]; sentToStore: number };
  ratings: { pageIndex: number; pageSize: number; count: number; itemsCount: number; data: AppRatingRow[] };
}

@Injectable({ providedIn: 'root' })
export class AppRatingService {
  private endPoints = APIs.AppRating;

  constructor(private api: ApiCallerService) {}

  get(pageIndex = 1, pageSize = 20, stars: number | null = null): Observable<AppRatingAdmin> {
    let params = new HttpParams().set('pageIndex', String(pageIndex)).set('pageSize', String(pageSize));
    if (stars) params = params.set('stars', String(stars));
    return this.api.get(this.endPoints.get, undefined, params).pipe(map((res: any) => res?.data as AppRatingAdmin));
  }

  saveSettings(settings: AppRatingSettings): Observable<AppRatingSettings> {
    return this.api.put(this.endPoints.settings, settings).pipe(map((res: any) => res?.data as AppRatingSettings));
  }
}
