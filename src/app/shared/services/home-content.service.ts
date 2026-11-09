import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { environment } from 'src/environments/environment';
import { APIs } from '../model/helpers';

// The customer app's home content (docs/redesign/PHASE3_SPEC.md sections 2, 3 and 6).

export type HomeStatMode = 'auto' | 'manual';
export type HomeIconGroup = 'sections' | 'home' | 'trust' | 'nav' | 'topBar';

export interface HomeTrustStat {
  key: string;
  label: string;
  value: string | null;
  mode: HomeStatMode;
  iconKey: string | null;
  /** The uploaded icon of slot trust.stat.{key}. Ignored by the server on save. */
  iconUrl?: string | null;
  color: string | null;
  tint: string | null;
}

export interface HomeTrustBadge {
  text: string;
  iconKey: string | null;
  /** The uploaded icon of slot trust.badge.{n}. Ignored by the server on save. */
  iconUrl?: string | null;
}

export interface HomeTrust {
  isVisible: boolean;
  kicker: string | null;
  title: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  stats: HomeTrustStat[];
  badges: HomeTrustBadge[];
}

export interface HomeIconSlot {
  key: string;
  labelAr: string;
  group: HomeIconGroup | string;
}

export interface HomeAutoValues {
  companies: number;
  customers: number;
  products: number;
}

export interface HomeContentAdmin {
  trust: HomeTrust;
  /** Slot key -> relative icon URL (/images/HomeContent/...), or null for the app's built-in icon. */
  icons: Record<string, string | null>;
  iconSlots: HomeIconSlot[];
  autoValues: HomeAutoValues;
  version: number;
}

export interface HomeIconResult {
  slot: string;
  url: string | null;
  version: number;
}

/** What went wrong with a call, in the terms the editor reacts to. */
export interface HomeContentError {
  kind: 'validation' | 'conflict' | 'forbidden' | 'notFound' | 'other';
  messages: string[];
}

@Injectable({
  providedIn: 'root'
})
export class HomeContentService {
  endPoints = APIs.HomeContent;

  constructor(private _apiCaller: ApiCallerService) {}

  getContent(): Observable<HomeContentAdmin> {
    return this._apiCaller.get(this.endPoints.get).pipe(map((res: any) => res?.data as HomeContentAdmin));
  }

  saveTrust(trust: HomeTrust): Observable<HomeContentAdmin> {
    return this._apiCaller.put(this.endPoints.saveTrust, trust).pipe(map((res: any) => res?.data as HomeContentAdmin));
  }

  uploadIcon(slot: string, file: File): Observable<HomeIconResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this._apiCaller
      .postWithAttachment(this.endPoints.icon + encodeURIComponent(slot), formData)
      .pipe(map((res: any) => res?.data as HomeIconResult));
  }

  resetIcon(slot: string): Observable<HomeIconResult> {
    return this._apiCaller.delete(this.endPoints.icon + encodeURIComponent(slot)).pipe(map((res: any) => res?.data as HomeIconResult));
  }

  /** Icon URLs come back relative (/images/HomeContent/x.svg); they live on the same host as the other images. */
  static imageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const base = (environment.imgUrl || '').replace(/\/+$/, '');
    return `${base}/${url.replace(/^\/+/, '')}`;
  }

  /** Reads the app's ApiResponse error ({ message, errorCode, data: { errors } }) into something the editor can show. */
  static parseError(err: HttpErrorResponse | any): HomeContentError {
    const body = err?.error ?? {};
    const status = err?.status;
    const message: string | undefined = body.message || body.Message || undefined;
    const errors: string[] = Array.isArray(body?.data?.errors) ? body.data.errors.filter((e: any) => typeof e === 'string' && e) : [];

    if (status === 409 || body.errorCode === 'CONFLICT') {
      return { kind: 'conflict', messages: [message || 'حد تاني حفظ تعديل في نفس الوقت؛ حمّل الصفحة تاني وجرّب'] };
    }
    if (status === 400 || body.errorCode === 'VALIDATION_FAILED') {
      return { kind: 'validation', messages: errors.length ? errors : [message || 'البيانات مش صحيحة'] };
    }
    // The app's interceptor rewrites 403 bodies, so the status is all there is
    if (status === 403) {
      return { kind: 'forbidden', messages: ['مالكش صلاحية تعمل ده'] };
    }
    if (status === 404) {
      return { kind: 'notFound', messages: [message || 'الخانة دي مش موجودة'] };
    }
    if (status === 0) {
      return { kind: 'other', messages: ['مفيش اتصال بالسيرفر، جرّب تاني'] };
    }
    return { kind: 'other', messages: [message || 'حصلت مشكلة، جرّب تاني'] };
  }
}
