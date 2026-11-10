import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';

// "ادعُ صحابك" (app 1.0.51): the amounts and rules, and who invited whom.

export interface ReferralSettings {
  enabled: boolean;
  /** Cash for the customer who invited, once the friend's first booking is paid. */
  inviterAmount: number;
  /** What the new customer gets when they enter the code. */
  inviteeAmount: number;
  /** 1 the welcome bonus, 2 cash. */
  inviteeCreditType: number;
  minFirstBookingAmount: number;
  maxRewardsPerMonth: number;
  applyWithinDays: number;
}

export interface ReferralRow {
  id: number;
  inviterName: string;
  inviterPhone: string | null;
  inviteeName: string;
  inviteePhone: string | null;
  code: string;
  createdAt: string;
  inviteeAmount: number;
  inviterAmount: number | null;
  rewardedAt: string | null;
}

export interface ReferralAdmin {
  settings: ReferralSettings;
  count: number;
  rewarded: number;
  paidOut: number;
  rows: ReferralRow[];
  pageIndex: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class ReferralService {
  private endPoints = APIs.Referrals;

  constructor(private api: ApiCallerService) {}

  get(pageIndex = 1, pageSize = 20): Observable<ReferralAdmin> {
    const params = new HttpParams().set('pageIndex', String(pageIndex)).set('pageSize', String(pageSize));
    return this.api.get(this.endPoints.get, undefined, params).pipe(map((res: any) => res?.data as ReferralAdmin));
  }

  saveSettings(settings: ReferralSettings): Observable<ReferralSettings> {
    return this.api.put(this.endPoints.settings, settings).pipe(map((res: any) => res?.data as ReferralSettings));
  }
}
