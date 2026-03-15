import { Injectable } from '@angular/core';
import { CanActivate} from '@angular/router';
import { ConfigureService } from '../../theme/shared/services/configure.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private _configService:ConfigureService ) {} // Inject ConfigureService here

  canActivate(): boolean {
    const currentUser = this._configService.UserName();
    if (currentUser) {
      return true;
    } else {
      this._configService.Logout();
      return false;
    }
  }

}
