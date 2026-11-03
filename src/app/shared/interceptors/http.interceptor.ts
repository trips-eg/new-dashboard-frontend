import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { ConfigureService } from '../../theme/shared/services/configure.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner'; // Import NgxSpinnerService
import { Router } from '@angular/router';

/** Header a request sets to skip the full-screen spinner; removed before the request leaves. */
export const SKIP_SPINNER = 'X-Skip-Spinner';

@Injectable()
export class HttpInterceptorInterceptor implements HttpInterceptor {
  constructor(
    private _configService: ConfigureService,
    private _translation: TranslateService,
    private toast: ToastrService,
    private spinner: NgxSpinnerService, // Inject NgxSpinnerService
    private router: Router // Import Router to navigate on error
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Requests that show their own loading state (the TRIPS Staff screens) skip the full-screen spinner
    const quiet = req.headers.has(SKIP_SPINNER);
    if (quiet) req = req.clone({ headers: req.headers.delete(SKIP_SPINNER) });
    // Show spinner when request starts
    if (!quiet) this.spinner.show();

    let authReq = req;
    const token = this._configService.UserToken();
    let Lang = this._translation.currentLang;
    Lang = Lang === 'ar' ? 'ar' : 'en';
    // A request that chose its language keeps it (forms send en-US so the server reads decimal numbers)
    const languageHeader =
      req.headers.get('Accept-Language') ?? (/\/TripStar\//i.test(req.url) ? (Lang === 'ar' ? 'ar-EG' : 'en-US') : Lang);

    if (token !== null && token !== undefined && token !== '') {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          token: `Bearer ${token}`,
          // withCredentials: 'true',
          //  cookies: `Bearer ${token}`,

          'Accept-Language': languageHeader
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((err) => {
        // An expired access token: renew it with the saved refresh token and send the request once more.
        // When the session can't be renewed, sign in again.
        if (err instanceof HttpErrorResponse && err.status === 401 && token) {
          return this._configService.refreshSession().pipe(
            switchMap((fresh) => {
              if (!fresh) {
                this._configService.Logout();
                return throwError(() => err);
              }
              return next.handle(authReq.clone({ setHeaders: { Authorization: `Bearer ${fresh}`, token: `Bearer ${fresh}` } }));
            })
          );
        }
        return throwError(() => err);
      }),
      // Hide spinner when request finishes (success or error)
      finalize(() => {
        if (!quiet) this.spinner.hide();
      })
    );
  }
}
