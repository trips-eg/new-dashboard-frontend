// Angular import
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit, OnDestroy {
  currentLang: string;
  username: string;
  userID: string;
  userEmail: string;
  userRole: string[];
  notificationsList: any;
  selectedNotification: any;
  unreadCount: number;
  vendorId
  private userStateSubscription: Subscription;

  constructor(
    private translationService: TranslateService,
    private _configSer: ConfigureService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.currentLang = this.translationService.getDefaultLang();
    this.refreshUserData();

    // Subscribe to user state changes
    this.userStateSubscription = this._configSer.userState$.subscribe(() => {
      this.refreshUserData();
    });
  }

  ngOnInit(): void {
    // Refresh user data on component initialization
    this.refreshUserData();
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.userStateSubscription) {
      this.userStateSubscription.unsubscribe();
    }
  }

  // Method to refresh user data - call this when user state changes
  refreshUserData() {
    this.username = this._configSer.UserName();
    this.userID = this._configSer.UserId();
    this.vendorId = this._configSer.vendorId();
    this.userEmail = this._configSer.UserEmail();
    this.userRole = this._configSer.userRoles();
  }

  changeLanguage(lang: string) {
    this.currentLang = lang;
    localStorage.setItem('Language', this.currentLang);
    this.translationService.use(this.currentLang);
    // Update the direction
    const dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.lang = this.currentLang;
    this.document.documentElement.dir = dir;
  }

  logout() {
    // Use the ConfigureService logout method which handles notifications
    this._configSer.Logout();
  }

//is vendor or admin //
 isVendor(): boolean {
    const roles = this._configSer.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }

}
