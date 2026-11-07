import { HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { throwError } from 'rxjs';

import { HttpInterceptorInterceptor } from './http.interceptor';

describe('HttpInterceptorInterceptor', () => {
  let logouts: number;
  let interceptor: HttpInterceptorInterceptor;

  beforeEach(() => {
    logouts = 0;
    const config = { UserToken: () => 'tok', Logout: () => logouts++ } as any;
    const translate = { currentLang: 'ar' } as any;
    const spinner = { show: () => {}, hide: () => {} } as any;
    interceptor = new HttpInterceptorInterceptor(config, translate, {} as any, spinner, {} as any);
  });

  function fail(url: string, status: number) {
    const next: HttpHandler = { handle: () => throwError(() => new HttpErrorResponse({ status, url })) };
    interceptor.intercept(new HttpRequest('GET', url), next).subscribe({ error: () => {} });
  }

  it('logs out when an API call answers 401', () => {
    fail('https://web-api.trips.eg/api/Booking/GetAll', 401);
    expect(logouts).toBe(1);
  });

  it('does not log out when the login call itself answers 401', () => {
    fail('https://web-api.trips.eg/api/Authentication/Webtoken/', 401);
    expect(logouts).toBe(0);
  });

  it('does not log out on 403', () => {
    fail('https://web-api.trips.eg/api/Booking/GetAll', 403);
    expect(logouts).toBe(0);
  });
});
