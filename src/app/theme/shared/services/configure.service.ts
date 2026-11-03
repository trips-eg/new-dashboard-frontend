import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigureService {
  // BehaviorSubject to track user state changes
  private userStateSubject = new BehaviorSubject<any>(null);
  public userState$ = this.userStateSubject.asObservable();

  private _http: HttpClient | null = null;
  private refreshing: Observable<string | null> | null = null;

  constructor(
    private router: Router,
    private injector: Injector
  ) {
    // The old login kept the password itself in the browser; it is never read and is removed here
    localStorage.removeItem('savedCredentials');
    // Initialize with current user state
    this.updateUserState();
  }

  /** Without the interceptor: renewing the session must not wait on, or retry through, itself. Made when first needed. */
  private get http(): HttpClient {
    return (this._http ??= new HttpClient(this.injector.get(HttpBackend)));
  }

  /** "Remember me" keeps the session in localStorage; without it the session is in sessionStorage and ends with the browser. */
  private read(key: string): string | null {
    return sessionStorage.getItem(key) ?? localStorage.getItem(key);
  }

  /** Whether this session was kept with "remember me". */
  isRemembered(): boolean {
    return !sessionStorage.getItem('token');
  }

  // Method to update user state and notify subscribers
  private updateUserState() {
    const user = this.User();
    console.log('ConfigureService: Updating user state', user);
    this.userStateSubject.next(user);
  }

  // Method to notify components that user state has changed
  public notifyUserStateChange() {
    console.log('ConfigureService: Notifying user state change');
    this.updateUserState();
  }

  /** remember: the choice at sign-in; a renewed session keeps the choice it was made with. */
  public setUser(user: any, remember: boolean = this.isRemembered()) {
    const [keep, drop] = remember ? [localStorage, sessionStorage] : [sessionStorage, localStorage];
    drop.removeItem('user');
    drop.removeItem('token');
    keep.setItem('user', JSON.stringify(user));
    keep.setItem('token', user.token);
    this.notifyUserStateChange(); // ده بيشغّل next() بعد ما القيم تحفظت
  }

  /**
   * A new access token from the saved refresh token (each refresh token works once, and the answer carries the next).
   * Requests that fail together share one renewal. Emits the new token, or null when the session can't be renewed.
   */
  refreshSession(): Observable<string | null> {
    const refreshToken = this.User()?.refreshToken;
    if (!refreshToken) return of(null);
    this.refreshing ??= this.http.post<any>(`${environment.apiUrl}Authentication/WebRefreshToken/`, { token: refreshToken }).pipe(
      map((res) => {
        if (!res?.success || !res.data?.token) return null;
        this.setUser(res.data);
        return res.data.token as string;
      }),
      catchError(() => of(null)),
      finalize(() => (this.refreshing = null)),
      shareReplay(1)
    );
    return this.refreshing;
  }

  // FIXED: Make parsedUser a getter so it always returns the latest user
  get parsedUser() {
    const userStr = this.read('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user:', e);
        return null;
      }
    }
    return null;
  }

  UserName() {
    const user = this.User();
    if (user) {
      return user.username;
    }
    return null;
  }

  vendorId() {
    const user = this.User();
    if (user) {
      return user.companyId;
    }
    return null;
  }

  UserEmail() {
    const user = this.User();
    if (user) {
      return user.email;
    }
    return null;
  }

  UserActivation() {
    return localStorage.getItem('isAuthenticated');
  }

  User() {
    const userStr = this.read('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  UserId() {
    const user = this.User();
    if (user) {
      return user.id;
    }
    return null;
  }

  UserToken() {
    return this.read('token');
  }

  userRoles(): string[] {
    const userStr = this.read('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user?.roles ?? [];
      } catch (err) {
        return [];
      }
    }
    return [];
  }

  userPermissions(): string[] {
    const user = this.User();
    return user?.permissions || [];
  }

  IsAuthentecated() {
    if (!this.UserToken() || !this.UserName()) {
      this.Logout();
    }
  }

  Logout() {
    console.log('ConfigureService: Logging out user');
    // The saved refresh token stops working on the server too; signing out never waits for it
    const refreshToken = this.User()?.refreshToken;
    if (refreshToken) this.http.post(`${environment.apiUrl}Authentication/RevokeToken/`, { token: refreshToken }).subscribe({ error: () => {} });
    localStorage.clear();
    sessionStorage.clear();
    this.notifyUserStateChange(); // Notify components of user state change
    this.router.navigateByUrl('/login');
  }
}