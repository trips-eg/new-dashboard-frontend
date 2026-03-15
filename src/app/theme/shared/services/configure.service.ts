import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigureService {
  // BehaviorSubject to track user state changes
  private userStateSubject = new BehaviorSubject<any>(null);
  public userState$ = this.userStateSubject.asObservable();

  constructor(private router: Router) {
    // Initialize with current user state
    this.updateUserState();
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

  public setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', user.token);
    this.notifyUserStateChange(); // ده بيشغّل next() بعد ما القيم تحفظت
  }

  // FIXED: Make parsedUser a getter so it always returns the latest user
  get parsedUser() {
    const userStr = localStorage.getItem('user');
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
    const userStr = localStorage.getItem('user');
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
    return localStorage.getItem('token');
  }

  userRoles(): string[] {
    const userStr = localStorage.getItem('user');
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
    localStorage.clear();
    sessionStorage.clear();
    this.notifyUserStateChange(); // Notify components of user state change
    this.router.navigateByUrl('/login');
  }
}