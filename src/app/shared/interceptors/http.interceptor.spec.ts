import { HttpErrorResponse, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { HttpInterceptorInterceptor } from './http.interceptor';

describe('HttpInterceptorInterceptor', () => {
  it('attaches a Bearer token to both protected customer dashboard endpoints', () => {
    const interceptor = new HttpInterceptorInterceptor(
      { UserToken: () => 'dashboard-jwt' } as any,
      { currentLang: 'en' } as any,
      {} as any,
      { show: () => {}, hide: () => {} } as any,
      {} as any
    );
    const headers: (string | null)[] = [];
    const handler: HttpHandler = {
      handle: (request) => {
        headers.push(request.headers.get('Authorization'));
        return of(new HttpResponse({ status: 200 }));
      }
    };
    for (const endpoint of ['GetCustomerAnalytics', 'GetCustomersByAnalyticsType']) {
      interceptor.intercept(new HttpRequest('POST', `/api/Dashboard/${endpoint}/`, {}), handler).subscribe();
    }
    expect(headers).toEqual(['Bearer dashboard-jwt', 'Bearer dashboard-jwt']);
  });
  it('preserves the backend status and body for feature-level handling', () => {
    const config = { UserToken: () => null } as any;
    const translation = { currentLang: 'en' } as any;
    const spinner = { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') } as any;
    const interceptor = new HttpInterceptorInterceptor(config, translation, {} as any, spinner, {} as any);
    const failure = new HttpErrorResponse({ status: 403, error: { message: 'Forbidden' } });
    const handler: HttpHandler = { handle: () => throwError(() => failure) };

    interceptor.intercept(new HttpRequest('GET', '/api/TripStar/GetAllTripStars/'), handler).subscribe({
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(403);
        expect(error.error.message).toBe('Forbidden');
      }
    });
    expect(spinner.hide).toHaveBeenCalled();
  });
  it('sends the documented TripStar language header while keeping other requests unchanged', () => {
    const config = { UserToken: () => 'jwt' } as any;
    const translation = { currentLang: 'ar' } as any;
    const interceptor = new HttpInterceptorInterceptor(
      config,
      translation,
      {} as any,
      { show: () => {}, hide: () => {} } as any,
      {} as any
    );
    const languages: string[] = [];
    const handler: HttpHandler = {
      handle: (request) => {
        languages.push(request.headers.get('Accept-Language') || '');
        return of(new HttpResponse({ status: 200 }));
      }
    };

    interceptor.intercept(new HttpRequest('GET', '/api/TripStar/GetAllTripStars/'), handler).subscribe();
    interceptor.intercept(new HttpRequest('GET', '/api/Room/GetAllRooms'), handler).subscribe();
    expect(languages).toEqual(['ar-EG', 'ar']);
  });
});
