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
    private spinner: NgxSpinnerService, // Inject NgxSpinnerService
    private router: Router // Import Router to navigate on error
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Show spinner when request starts
    this.spinner.show();

    let authReq = req;
    const token = this._configService.UserToken();
    let Lang = this._translation.currentLang;
    Lang = Lang === 'ar' ? 'ar' : 'en';
    const languageHeader = /\/TripStar\//i.test(req.url) ? (Lang === 'ar' ? 'ar-EG' : 'en-US') : Lang;

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
        return throwError(() => err);
      }),
      // Hide spinner when request finishes (success or error)
      finalize(() => this.spinner.hide())
    );
  }
}
