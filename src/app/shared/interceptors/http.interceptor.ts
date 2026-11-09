import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ConfigureService } from '../../theme/shared/services/configure.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner'; // Import NgxSpinnerService
import { Router } from '@angular/router';

@Injectable()
export class HttpInterceptorInterceptor implements HttpInterceptor {
  constructor(
    private _configService: ConfigureService,
    private _translation: TranslateService,
    private toast: ToastrService,
    private spinner: NgxSpinnerService , // Inject NgxSpinnerService
    private router: Router // Import Router to navigate on error
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Show spinner when request starts
    this.spinner.show();

    let authReq = req;
    const token = this._configService.UserToken();
    let Lang = this._translation.currentLang;
    Lang = Lang === 'ar' ? 'ar' : 'en';

    if (token !== null && token !== undefined && token !== '') {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          token: `Bearer ${token}`,
          // withCredentials: 'true',
          //  cookies: `Bearer ${token}`,
          
          'Accept-Language': `${Lang}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((err) => {
        // An expired or revoked session goes back to the login page (not for the login call itself)
        if (err && err.status === 401 && !/Authentication\//i.test(req.url)) {
          this._configService.Logout();
        }
        if ((err && err.status === 403) || err.status === 0) {
          err.error = { Message: '', status: 0 };
          err.error.status = 401;
          // this._configService.Logout();
          // this.toast.error('Unauthorized access', 'Error');
           //this.router.navigate(['/unauthorized']);
        }
        const error = err.error.message || err.statusText;
        return throwError(err);
      }),
      // Hide spinner when request finishes (success or error)
      finalize(() => this.spinner.hide())
    );
  }
}
