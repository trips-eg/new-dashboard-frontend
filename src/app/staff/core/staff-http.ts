import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { SKIP_SPINNER } from 'src/app/shared/interceptors/http.interceptor';

/** ApiException of the app: the backend's message and error code, or a network/timeout failure. */
export class ApiError extends Error {
  constructor(
    readonly status: number | null,
    readonly code: string | null,
    message: string | null,
    readonly data: unknown = null
  ) {
    super(message ?? '');
  }
}

/** The message of an error body: our ApiResponse `message`, or ASP.NET ProblemDetails (`errors`, `title`). */
export function errorMessageOf(body: any): string | null {
  if (!body || typeof body !== 'object') return null;
  if (typeof body.message === 'string' && body.message.trim()) return body.message;
  if (body.errors && typeof body.errors === 'object') {
    const parts = Object.entries(body.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
    if (parts.length) return parts.join('\n');
  }
  return body.title ?? body.detail ?? null;
}

export type Query = Record<string, string | number | boolean | null | undefined | (string | number)[]>;

/**
 * The Dio of the app: every /api call, unwrapping ApiResponse<T> ({ success, data, message, errorCode }).
 * success decides, not the status alone (the backend sometimes answers 2xx with success: false).
 * Backend messages come in the screen's language (ar-EG / en-US); forms send en-US because the server binds
 * form numbers with the request culture ("1000.0" is not a number in ar-EG).
 */
@Injectable({ providedIn: 'root' })
export class StaffHttp {
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);
  private readonly base = environment.apiUrl.replace(/\/api\/?$/, '');

  get arabic(): boolean {
    return (this.translate.currentLang ?? 'ar') !== 'en';
  }

  private url(path: string): string {
    return this.base + (path.startsWith('/') ? path : '/' + path);
  }

  private headers(form = false): HttpHeaders {
    // Each screen shows its own loading state, so the full-screen spinner stays off
    return new HttpHeaders({ 'Accept-Language': form ? 'en-US' : this.arabic ? 'ar-EG' : 'en-US', [SKIP_SPINNER]: '1' });
  }

  private params(q?: Query): HttpParams {
    let p = new HttpParams();
    for (const [k, v] of Object.entries(q ?? {})) {
      if (v === null || v === undefined || v === '') continue;
      if (Array.isArray(v)) v.forEach((x) => (p = p.append(k, String(x))));
      else p = p.set(k, String(v));
    }
    return p;
  }

  private unwrap<T>(source: Observable<any>): Observable<T> {
    return source.pipe(
      catchError((e: HttpErrorResponse) => throwError(() => this.toError(e))),
      map((body) => {
        if (!body || typeof body !== 'object') throw new ApiError(null, 'UNEXPECTED', null);
        if (body.success === false) throw new ApiError(null, body.errorCode ?? null, errorMessageOf(body), body.data);
        return body.data as T;
      })
    );
  }

  toError(e: unknown): ApiError {
    if (e instanceof ApiError) return e;
    if (e instanceof HttpErrorResponse) {
      if (e.status === 0) return new ApiError(0, 'NETWORK', null);
      const body = e.error;
      if (body && typeof body === 'object' && !(body instanceof Blob)) {
        return new ApiError(e.status, body.errorCode ?? null, errorMessageOf(body), body.data ?? null);
      }
      return new ApiError(e.status, e.status === 401 ? 'UNAUTHORIZED' : 'UNEXPECTED', null);
    }
    return new ApiError(null, 'UNEXPECTED', null);
  }

  get<T>(path: string, query?: Query): Observable<T> {
    return this.unwrap<T>(this.http.get(this.url(path), { params: this.params(query), headers: this.headers() }));
  }

  post<T>(path: string, body: unknown = {}, query?: Query): Observable<T> {
    return this.unwrap<T>(this.http.post(this.url(path), body, { params: this.params(query), headers: this.headers() }));
  }

  put<T>(path: string, body: unknown = {}, query?: Query): Observable<T> {
    return this.unwrap<T>(this.http.put(this.url(path), body, { params: this.params(query), headers: this.headers() }));
  }

  patch<T>(path: string, body: unknown = {}, query?: Query): Observable<T> {
    return this.unwrap<T>(this.http.patch(this.url(path), body, { params: this.params(query), headers: this.headers() }));
  }

  delete<T>(path: string, query?: Query): Observable<T> {
    return this.unwrap<T>(this.http.delete(this.url(path), { params: this.params(query), headers: this.headers() }));
  }

  /** A JSON POST with an Idempotency-Key: the backend answers a repeated key with the first result, so a double tap counts once. */
  postIdempotent<T>(path: string, body: unknown, key: string): Observable<T> {
    return this.unwrap<T>(this.http.post(this.url(path), body, { headers: this.headers().set('Idempotency-Key', key) }));
  }

  /** JSON bodies of the product forms, also sent with en-US so decimal numbers bind. */
  postEn<T>(path: string, body: unknown = {}, query?: Query): Observable<T> {
    return this.unwrap<T>(this.http.post(this.url(path), body, { params: this.params(query), headers: this.headers(true) }));
  }

  putEn<T>(path: string, body: unknown = {}, query?: Query): Observable<T> {
    return this.unwrap<T>(this.http.put(this.url(path), body, { params: this.params(query), headers: this.headers(true) }));
  }

  /** multipart/form-data, always with en-US (see the class comment). */
  form<T>(method: 'POST' | 'PUT', path: string, data: FormData, query?: Query): Observable<T> {
    return this.unwrap<T>(this.http.request(method, this.url(path), { body: data, params: this.params(query), headers: this.headers(true) }));
  }

  /** multipart/form-data with extra headers (the Idempotency-Key of a payment). */
  formWithHeaders<T>(method: 'POST' | 'PUT', path: string, data: FormData, extra: HttpHeaders): Observable<T> {
    let headers = this.headers(true);
    for (const k of extra.keys()) headers = headers.set(k, extra.get(k) ?? '');
    return this.unwrap<T>(this.http.request(method, this.url(path), { body: data, headers }));
  }

  /**
   * For the endpoints that answer the object itself, not wrapped in ApiResponse (and the older ones that wrap it
   * only sometimes). [en] sends en-US, for forms with decimal numbers.
   */
  raw<T>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: unknown, query?: Query, en = false): Observable<T> {
    return this.http
      .request<T>(method, this.url(path), { body, params: this.params(query), headers: this.headers(en) })
      .pipe(catchError((e) => throwError(() => this.toError(e))));
  }

  /** A file (xlsx/pdf); errors come back as ApiResponse JSON inside a Blob. */
  blob(path: string, query?: Query): Observable<Blob> {
    return this.http.get(this.url(path), { params: this.params(query), headers: this.headers(), responseType: 'blob' }).pipe(
      catchError((e) => throwError(() => this.toError(e)))
    );
  }
}

/** The server stores images as paths on its own host ("/images/Travel/x.jpg"): this makes them full URLs. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path || !path.trim()) return null;
  const p = path.trim();
  if (/^https?:\/\//i.test(p)) return p;
  const root = environment.imgUrl.replace(/\/$/, '');
  return p.startsWith('/') ? root + p : `${root}/${p}`;
}
